# Host sign-in with signed assertions

> Sign visitors who are already signed in on your site in to the website widget, with a short-lived assertion your backend signs.

With **Host sign-in**, your website vouches for its own signed-in user. When the widget needs to know who the visitor is, it asks your page for a token; your page asks your backend, which checks its own session and signs a short **assertion** naming the customer. Caplo checks the signature against the public key you registered and verifies the visitor. The visitor clicks nothing, and Caplo never sees your passwords, cookies or private keys.

In order:

1. The widget gets a one-time `nonce` from Caplo and calls your page’s `getToken` with it.
2. Your page posts the nonce to your backend.
3. Your backend checks its own session and returns an assertion for the signed-in customer, signed with your private key and valid for about a minute.
4. The widget sends the assertion to Caplo, which checks the signature, issuer, audience, nonce and times, and verifies the visitor as that customer.

## Before you start

* The Owner or Admin role, to manage **Customer identity**.
* A website channel whose widget runs on pages where your customers are signed in. See [Install the website widget](/channels/website-widget/install/).
* The [caplo CLI](/cli/install/), for generating keys and testing assertions. Nothing in `caplo identity` talks to your workspace.

## Set it up

1. **Generate a signing key.** Run this where your backend’s secrets live:

   ```plaintext
   caplo identity keygen --alg ES256 --kid 2026-11 --out ./caplo-keys
   ```

   It writes `2026-11.private.jwk.json` and `2026-11.private.pem` (readable only by you) and `2026-11.public.jwk.json`. The key ID defaults to the key’s thumbprint when you leave out `--kid`. Other algorithms are `ES384`, `PS256`, `RS256` and `EdDSA`. Store the private key in your backend’s secret store; it never goes to Caplo.

2. **Create the connection.** In the console, go to **Settings**, **Customer identity**, and select **Add connection**:

   | Field                     | What to enter                                                                                                                                                                                                    |
   | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Connection type**       | **Host sign-in**.                                                                                                                                                                                                |
   | **Connection name**       | Up to 80 characters, shown in the console.                                                                                                                                                                       |
   | **Subject namespace**     | Optional. Leave it empty to use the issuer. Connections that share a namespace identify the same customers. Fixed once created.                                                                                  |
   | **Issuer (iss)**          | The exact value your backend puts in `iss`, for example `https://www.example.com`.                                                                                                                               |
   | **Public keys**           | **JWKS URL (recommended for rotation)**: an HTTPS URL that serves your public keys as a JWK Set. Or **Paste public JWKs (up to 4)**: the contents of `2026-11.public.jwk.json`. Every key needs `kid` and `alg`. |
   | **Allowed algorithms**    | The algorithms your keys use. A key whose `alg` is not allowed is refused.                                                                                                                                       |
   | **Assurance mapping**     | Each `acr` value you send and its level, and the level **When acr is absent**. See [Assurance levels](/identity/#assurance-levels).                                                                              |
   | **Claims and attributes** | The profile claims (`name`, `email`, `email_verified`, `locale`) and typed attributes you will send. Anything not listed is refused.                                                                             |

   Select **Create connection**, then open it again with **Configure** and copy the **Audience (aud)**. It looks like `urn:caplo:customer-identity:<CONNECTION_ID>` and never changes.

3. **Add it to the policy.** In **Verification policy**, turn on **Verify customers in support conversations**, add the connection under **Connections, in order**, make sure **Allowed scopes** includes `identity:bind`, and select **Save policy**.

4. **Add a token endpoint to your backend.** See [Write the token endpoint](#write-the-token-endpoint). The connection editor also shows ready-made Node.js, Python and Go examples filled in with your issuer and audience.

5. **Register a token provider on your page** with the widget’s JavaScript API:

   ```plaintext
   window.CaploWidget.get('<WIDGET_ID>').identity.configure({
     when: 'open',
     getToken: async ({ nonce, requirement }) => {
       const response = await fetch('/support/caplo-token', {
         method: 'POST',
         headers: { 'content-type': 'application/json', 'x-caplo-token-request': '1' },
         body: JSON.stringify({ nonce, requirement }),
       });
       return response.status === 200 ? response.text() : null;
     },
   });
   ```

   Return `null` when nobody is signed in on your page. `when` decides when the widget asks; call `identity.refresh()` after your user signs in or switches account and `identity.signOut()` after they sign out. See [Sign visitors in from your page](/channels/website-widget/javascript-api/#sign-visitors-in-from-your-page).

6. **Turn it on for the channel.** Open the website channel, select **Configure & install**, and go to the **Conversation** tab. Set **Customer verification** to **Visitors may verify who they are** or **Visitors must verify before chatting**, select **Choose sign-in methods and consent for this channel**, add the connection as a sign-in method, set **Consent mode** to **Show a notice after verification**, write the **Consent text** (16 to 4096 characters), and select **Save entry point**.

Caution

Host sign-in runs only with the consent mode **Show a notice after verification**. With **Ask for agreement before the first verification**, or without channel sign-in settings at all, the widget never asks your page for a token, and a channel that requires verification leaves the visitor unable to chat.

## Write the token endpoint

The endpoint is yours, on your own domain. It must:

* Accept only `POST` requests from your own site, and check the `Origin` header.
* Require a custom header, such as `x-caplo-token-request: 1`, so a form on another site cannot call it.
* Identify the visitor from your own session cookie (`SameSite`), never from the request body.
* Take the issuer and audience from server configuration, never from the request.
* Sign only the `nonce` and `requirement` it is given.
* Answer `Cache-Control: no-store`, and `401` when nobody is signed in.

```plaintext
// npm install jose
import { SignJWT, importPKCS8 } from "jose";


const ISSUER = "https://www.example.com";                       // the connection's Issuer (iss)
const AUDIENCE = "urn:caplo:customer-identity:<CONNECTION_ID>"; // the connection's Audience (aud)
const SITE_ORIGIN = "https://www.example.com";
const privateKey = await importPKCS8(process.env.CAPLO_SIGNING_KEY, "ES256"); // 2026-11.private.pem


// Express: app.post("/support/caplo-token", express.json(), caploToken)
export async function caploToken(req, res) {
  res.set("Cache-Control", "no-store");
  if (req.get("origin") !== SITE_ORIGIN || req.get("x-caplo-token-request") !== "1") return res.sendStatus(403);
  const user = req.session?.user;
  if (!user) return res.sendStatus(401);
  const { nonce, requirement } = req.body ?? {};
  if (typeof nonce !== "string") return res.sendStatus(400);
  if (requirement && !meets(user, requirement)) return res.sendStatus(401);
  const token = await new SignJWT({ nonce, acr: user.mfa ? "mfa" : "pwd", auth_time: user.authTime })
    .setProtectedHeader({ alg: "ES256", kid: "2026-11", typ: "caplo-customer+jwt" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(user.customerId) // stable and opaque, never an email or phone number
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(privateKey);
  res.type("text/plain").send(token);
}


// A step-up asks for a level, a recent sign-in, or both. Sign only when this session meets it.
function meets(user, { level, maxAuthAgeSeconds }) {
  if (level === "high" && !user.mfa) return false;
  if (maxAuthAgeSeconds !== undefined && Date.now() / 1000 - user.authTime > maxAuthAgeSeconds) return false;
  return true;
}
```

This example assumes the connection maps `acr` `mfa` to **High** and `pwd` to **Standard**.

### Assertion format

The assertion is a compact JWS of at most 16 KiB. Its header has `typ` `caplo-customer+jwt`, an `alg` that matches the key’s `alg` and is allowed on the connection, and a `kid` that names an unrevoked key. Headers `crit`, `jku`, `jwk`, `x5u`, `x5c` and `x5t` are refused.

| Claim                                       | Required | Rules                                                                                                                                                                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iss`                                       | Yes      | Exactly the connection’s issuer.                                                                                                                                                                        |
| `aud`                                       | Yes      | Exactly the connection’s audience, as a string or a one-value list.                                                                                                                                     |
| `sub`                                       | Yes      | Your stable, opaque customer ID, up to 255 characters. This is the ID tools receive.                                                                                                                    |
| `nonce`                                     | Yes      | The `nonce` the widget passed to `getToken`, unchanged. Each nonce works once.                                                                                                                          |
| `iat`, `exp`                                | Yes      | `exp` at most 300 seconds after `iat`; 60 is recommended. Mint the assertion when asked: one issued before the widget’s request is refused. Caplo allows 60 seconds of clock skew.                      |
| `nbf`                                       | No       | Not before; must not be in the future.                                                                                                                                                                  |
| `acr`                                       | No       | Mapped to a level through **Assurance mapping**. An unmapped value is refused.                                                                                                                          |
| `auth_time`                                 | No       | When the customer last authenticated, in seconds. Needed to meet a freshness requirement. Must not be after `iat`.                                                                                      |
| `amr`                                       | No       | Authentication methods, such as `["pwd","otp"]`, up to 16.                                                                                                                                              |
| `sid`                                       | No       | A non-secret ID of the customer’s session on your site, so a [back-channel logout](/identity/account-links-and-revocation/#back-channel-logout) can end it.                                             |
| `jti`                                       | No       | A unique ID, up to 255 characters.                                                                                                                                                                      |
| `name`, `email`, `email_verified`, `locale` | No       | Only those allowed under **Accepted profile claims**. The widget shows `name` as “Signed in as”.                                                                                                        |
| `attributes`                                | No       | An object of declared attributes, such as `{"tier":"gold"}`, checked against each attribute’s type. Up to 20.                                                                                           |
| `act_for`                                   | No       | `{"sub": "<PRINCIPAL_ID>", "relationship": "caregiver"}` when a person acts for another customer. The relationship must be listed under **Delegation relationships**. Tools then act for the principal. |

Any other claim is refused, so a mistake shows up as a failed verification in **Activity** instead of passing silently.

## Renewal and step-up

A host sign-in lasts 15 minutes and is renewed in the background: while the page is open, the widget calls `getToken` again about every 10 minutes, with a new nonce and `requirement` `null`. After a page reload, the widget hides the transcript until your page confirms the same person with a fresh token. If `getToken` returns `null`, the visitor is signed out. If it returns an assertion for a different `sub`, the conversation ends and the new person starts a fresh one.

When an operation needs more than the current sign-in, the widget shows **Confirm it’s you**. When the visitor selects it, `getToken` receives a `requirement` with `level`, optionally `maxAuthAgeSeconds`, and for a specific action an `action` with its `id`, `summary` and `digest`. Your page can run its own multi-factor prompt before calling your backend: the widget waits up to 5 minutes. Sign only when the session meets the requirement, with an `acr` that maps to the level and an `auth_time` within `maxAuthAgeSeconds`, and for the same `sub`.

## Test it

Before you put it on a live site, test your assertions with the CLI and in the console.

1. Sign an assertion locally, as your backend would:

   ```plaintext
   caplo identity sign-assertion --key ./caplo-keys/2026-11.private.pem --kid 2026-11 \
     --iss https://www.example.com --aud urn:caplo:customer-identity:<CONNECTION_ID> \
     --sub cus_1234 --nonce test-nonce-0123456789 --acr mfa --auth-time now --ttl 60
   ```

2. Check an assertion, from the CLI or from your own endpoint, against your public key:

   ```plaintext
   caplo identity verify-assertion - --jwks ./caplo-keys/2026-11.public.jwk.json \
     --iss https://www.example.com --aud urn:caplo:customer-identity:<CONNECTION_ID> \
     --nonce test-nonce-0123456789 < assertion.txt
   ```

   It prints each check as `PASS`, `FAIL` or `SKIP` and exits with status 3 when one fails. `--jwks` also takes your HTTPS JWKS URL. The connection’s own rules (acr mapping, allowed claims, attributes) are skipped locally.

3. In the console, select **Test assertion** on the connection and paste an assertion your servers signed. Every check runs, including the connection’s rules, except the nonce, and nothing is created.

4. Open the widget on a test channel while signed in to your site. Failed attempts appear under **Activity**, **Failures by reason**.

See the [`caplo identity` reference](/reference/cli/identity/) for every flag.

## Rotate keys

With a **JWKS URL**, Caplo caches your key set for its `Cache-Control` max-age, between 5 minutes and 24 hours, and fetches it again (at most once a minute) when an assertion names a key ID it does not know. To rotate:

1. Generate a new key and publish its public JWK in your JWKS alongside the old one.
2. Start signing with the new key.
3. Remove the old key from your JWKS once nothing signs with it. Select **Flush keys** on the connection to make Caplo drop its cached copy at once.

With pasted keys, add the new public JWK to the connection (up to 4), switch your backend to it, then remove the old one. Each edit is a trust change and may need a second approver.

Caution

If a private key may have leaked, select **Revoke key** on the connection. The key is refused from then on, whatever any cache holds, and every verification made with it is revoked. Then publish a new key.

AI prompt

Sign my signed-in users in to the Caplo widget

Adds a token endpoint that signs Caplo host sign-in assertions, wires identity.configure on my pages, and tests it with the caplo CLI.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20visitors%20who%20are%20signed%20in%20on%20my%20website%20are%20verified%20in%20the%20Caplo%20website%20widget%20automatically%2C%20through%20a%20Caplo%20%22Host%20sign-in%22%20connection.%20My%20backend%20signs%20a%20short-lived%20assertion%20for%20the%20signed-in%20user%3B%20the%20browser%20never%20holds%20the%20signing%20key.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fsigned-assertions.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%0A-%20Issuer%20my%20backend%20will%20use%20\(the%20connection's%20Issuer\)%3A%20%3CISSUER%3E%0A-%20The%20connection's%20Audience%2C%20from%20the%20console%3A%20%3CCONNECTION_AUDIENCE%3E%0A-%20Key%20ID%3A%20%3CKEY_ID%3E%0A-%20Where%20my%20backend%20reads%20secrets%20from%3A%20%3CSECRET_STORE%3E%0A-%20How%20my%20backend%20knows%20the%20signed-in%20user%20and%20their%20stable%20customer%20ID%3A%20%3CSESSION_SOURCE%3E%0A-%20The%20acr%20values%20my%20sign-in%20produces%20and%20the%20Caplo%20level%20each%20maps%20to%3A%20%3CACR_MAPPING%3E%0A%0ASteps%3A%0A1.%20If%20I%20have%20no%20key%20yet%2C%20tell%20me%20to%20run%20%60caplo%20identity%20keygen%20--kid%20%3CKEY_ID%3E%20--out%20.%2Fcaplo-keys%60%20myself%2C%20store%20the%20private%20key%20in%20%3CSECRET_STORE%3E%2C%20and%20paste%20the%20public%20JWK%20\(or%20my%20JWKS%20URL\)%20into%20the%20connection.%20Never%20read%2C%20print%20or%20commit%20the%20private%20key%20file.%0A2.%20Add%20a%20%60POST%60%20token%20endpoint%20on%20my%20own%20domain%20\(for%20example%20%60%2Fsupport%2Fcaplo-token%60\)%20in%20my%20backend's%20framework.%20It%20must%20check%20the%20%60Origin%60%20header%20against%20my%20site%2C%20require%20the%20header%20%60x-caplo-token-request%3A%201%60%2C%20identify%20the%20user%20only%20from%20%3CSESSION_SOURCE%3E%2C%20answer%20%60Cache-Control%3A%20no-store%60%2C%20and%20return%20%60401%60%20when%20nobody%20is%20signed%20in.%0A3.%20Sign%20a%20compact%20JWS%20with%20header%20%60typ%60%20%60caplo-customer%2Bjwt%60%2C%20%60alg%60%20matching%20the%20key%2C%20and%20%60kid%60%20%3CKEY_ID%3E.%20Claims%3A%20%60iss%60%20%3CISSUER%3E%20and%20%60aud%60%20%3CCONNECTION_AUDIENCE%3E%20from%20server%20configuration%20\(never%20from%20the%20request\)%2C%20%60sub%60%20the%20stable%20opaque%20customer%20ID%20\(never%20an%20email%20or%20phone%20number\)%2C%20%60nonce%60%20exactly%20as%20received%2C%20%60iat%60%20now%2C%20%60exp%60%2060%20seconds%20later%2C%20and%20%60acr%60%20and%20%60auth_time%60%20per%20%3CACR_MAPPING%3E.%20Add%20no%20other%20claims%20unless%20the%20connection%20allows%20them.%20Return%20the%20token%20as%20%60text%2Fplain%60.%0A4.%20If%20the%20request%20body%20has%20a%20non-null%20%60requirement%60%2C%20sign%20only%20when%20the%20session%20meets%20its%20%60level%60%20and%20%60maxAuthAgeSeconds%60%3B%20otherwise%20return%20%60401%60.%0A5.%20On%20every%20page%20that%20shows%20the%20widget%2C%20call%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\).identity.configure\(%7B%20when%3A%20'open'%2C%20getToken%20%7D\)%60%2C%20where%20%60getToken%60%20posts%20%60%7B%20nonce%2C%20requirement%20%7D%60%20to%20the%20endpoint%20with%20the%20custom%20header%20and%20returns%20the%20response%20text%20on%20%60200%60%2C%20or%20%60null%60.%20Wait%20for%20the%20loader%20script's%20%60load%60%20event%20if%20%60window.CaploWidget%60%20is%20not%20defined%20yet.%0A6.%20Call%20%60identity.refresh\(\)%60%20after%20my%20user%20signs%20in%20or%20switches%20account%2C%20and%20%60identity.signOut\(\)%60%20after%20they%20sign%20out.%20Listen%20for%20%60caplo%3Aidentity-signout-requested%60%20on%20the%20control%20and%20sign%20the%20user%20out%20of%20my%20site%20when%20it%20fires.%0A7.%20Add%20a%20test%20that%20signs%20an%20assertion%20with%20a%20test%20key%20and%20checks%20it%20with%20%60caplo%20identity%20verify-assertion%20-%20--jwks%20%3CPUBLIC_JWK_FILE%3E%20--iss%20%3CISSUER%3E%20--aud%20%3CCONNECTION_AUDIENCE%3E%60.%0A%0AVerify%3A%0A-%20%60caplo%20identity%20verify-assertion%60%20passes%20every%20check%20for%20a%20token%20from%20the%20endpoint.%0A-%20In%20the%20console%2C%20**Test%20assertion**%20on%20the%20connection%20passes%20for%20a%20token%20from%20the%20endpoint.%0A-%20Remind%20me%20that%20the%20channel%20needs%20**Show%20a%20notice%20after%20verification**%20as%20its%20consent%20mode%2C%20the%20connection%20under%20its%20sign-in%20methods%2C%20and%20the%20connection%20in%20the%20verification%20policy.%20Then%2C%20on%20a%20test%20channel%2C%20the%20widget%20shows%20me%20as%20signed%20in%20when%20I%20open%20it%20while%20signed%20in%20to%20my%20site.%0A%0ARules%3A%0A-%20Never%20put%20the%20private%20key%2C%20assertions%20or%20session%20cookies%20in%20front-end%20code%2C%20URLs%2C%20logs%2C%20browser%20storage%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20deploying.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20visitors%20who%20are%20signed%20in%20on%20my%20website%20are%20verified%20in%20the%20Caplo%20website%20widget%20automatically%2C%20through%20a%20Caplo%20%22Host%20sign-in%22%20connection.%20My%20backend%20signs%20a%20short-lived%20assertion%20for%20the%20signed-in%20user%3B%20the%20browser%20never%20holds%20the%20signing%20key.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fsigned-assertions.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%0A-%20Issuer%20my%20backend%20will%20use%20\(the%20connection's%20Issuer\)%3A%20%3CISSUER%3E%0A-%20The%20connection's%20Audience%2C%20from%20the%20console%3A%20%3CCONNECTION_AUDIENCE%3E%0A-%20Key%20ID%3A%20%3CKEY_ID%3E%0A-%20Where%20my%20backend%20reads%20secrets%20from%3A%20%3CSECRET_STORE%3E%0A-%20How%20my%20backend%20knows%20the%20signed-in%20user%20and%20their%20stable%20customer%20ID%3A%20%3CSESSION_SOURCE%3E%0A-%20The%20acr%20values%20my%20sign-in%20produces%20and%20the%20Caplo%20level%20each%20maps%20to%3A%20%3CACR_MAPPING%3E%0A%0ASteps%3A%0A1.%20If%20I%20have%20no%20key%20yet%2C%20tell%20me%20to%20run%20%60caplo%20identity%20keygen%20--kid%20%3CKEY_ID%3E%20--out%20.%2Fcaplo-keys%60%20myself%2C%20store%20the%20private%20key%20in%20%3CSECRET_STORE%3E%2C%20and%20paste%20the%20public%20JWK%20\(or%20my%20JWKS%20URL\)%20into%20the%20connection.%20Never%20read%2C%20print%20or%20commit%20the%20private%20key%20file.%0A2.%20Add%20a%20%60POST%60%20token%20endpoint%20on%20my%20own%20domain%20\(for%20example%20%60%2Fsupport%2Fcaplo-token%60\)%20in%20my%20backend's%20framework.%20It%20must%20check%20the%20%60Origin%60%20header%20against%20my%20site%2C%20require%20the%20header%20%60x-caplo-token-request%3A%201%60%2C%20identify%20the%20user%20only%20from%20%3CSESSION_SOURCE%3E%2C%20answer%20%60Cache-Control%3A%20no-store%60%2C%20and%20return%20%60401%60%20when%20nobody%20is%20signed%20in.%0A3.%20Sign%20a%20compact%20JWS%20with%20header%20%60typ%60%20%60caplo-customer%2Bjwt%60%2C%20%60alg%60%20matching%20the%20key%2C%20and%20%60kid%60%20%3CKEY_ID%3E.%20Claims%3A%20%60iss%60%20%3CISSUER%3E%20and%20%60aud%60%20%3CCONNECTION_AUDIENCE%3E%20from%20server%20configuration%20\(never%20from%20the%20request\)%2C%20%60sub%60%20the%20stable%20opaque%20customer%20ID%20\(never%20an%20email%20or%20phone%20number\)%2C%20%60nonce%60%20exactly%20as%20received%2C%20%60iat%60%20now%2C%20%60exp%60%2060%20seconds%20later%2C%20and%20%60acr%60%20and%20%60auth_time%60%20per%20%3CACR_MAPPING%3E.%20Add%20no%20other%20claims%20unless%20the%20connection%20allows%20them.%20Return%20the%20token%20as%20%60text%2Fplain%60.%0A4.%20If%20the%20request%20body%20has%20a%20non-null%20%60requirement%60%2C%20sign%20only%20when%20the%20session%20meets%20its%20%60level%60%20and%20%60maxAuthAgeSeconds%60%3B%20otherwise%20return%20%60401%60.%0A5.%20On%20every%20page%20that%20shows%20the%20widget%2C%20call%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\).identity.configure\(%7B%20when%3A%20'open'%2C%20getToken%20%7D\)%60%2C%20where%20%60getToken%60%20posts%20%60%7B%20nonce%2C%20requirement%20%7D%60%20to%20the%20endpoint%20with%20the%20custom%20header%20and%20returns%20the%20response%20text%20on%20%60200%60%2C%20or%20%60null%60.%20Wait%20for%20the%20loader%20script's%20%60load%60%20event%20if%20%60window.CaploWidget%60%20is%20not%20defined%20yet.%0A6.%20Call%20%60identity.refresh\(\)%60%20after%20my%20user%20signs%20in%20or%20switches%20account%2C%20and%20%60identity.signOut\(\)%60%20after%20they%20sign%20out.%20Listen%20for%20%60caplo%3Aidentity-signout-requested%60%20on%20the%20control%20and%20sign%20the%20user%20out%20of%20my%20site%20when%20it%20fires.%0A7.%20Add%20a%20test%20that%20signs%20an%20assertion%20with%20a%20test%20key%20and%20checks%20it%20with%20%60caplo%20identity%20verify-assertion%20-%20--jwks%20%3CPUBLIC_JWK_FILE%3E%20--iss%20%3CISSUER%3E%20--aud%20%3CCONNECTION_AUDIENCE%3E%60.%0A%0AVerify%3A%0A-%20%60caplo%20identity%20verify-assertion%60%20passes%20every%20check%20for%20a%20token%20from%20the%20endpoint.%0A-%20In%20the%20console%2C%20**Test%20assertion**%20on%20the%20connection%20passes%20for%20a%20token%20from%20the%20endpoint.%0A-%20Remind%20me%20that%20the%20channel%20needs%20**Show%20a%20notice%20after%20verification**%20as%20its%20consent%20mode%2C%20the%20connection%20under%20its%20sign-in%20methods%2C%20and%20the%20connection%20in%20the%20verification%20policy.%20Then%2C%20on%20a%20test%20channel%2C%20the%20widget%20shows%20me%20as%20signed%20in%20when%20I%20open%20it%20while%20signed%20in%20to%20my%20site.%0A%0ARules%3A%0A-%20Never%20put%20the%20private%20key%2C%20assertions%20or%20session%20cookies%20in%20front-end%20code%2C%20URLs%2C%20logs%2C%20browser%20storage%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20deploying.)

Show prompt

```
Goal: visitors who are signed in on my website are verified in the Caplo website widget automatically, through a Caplo "Host sign-in" connection. My backend signs a short-lived assertion for the signed-in user; the browser never holds the signing key.

Read these pages first:
- https://docs.caplo.si/identity/signed-assertions.md
- https://docs.caplo.si/channels/website-widget/javascript-api.md
- https://docs.caplo.si/identity.md

Values I will give you:
- Widget ID: <WIDGET_ID>
- Issuer my backend will use (the connection's Issuer): <ISSUER>
- The connection's Audience, from the console: <CONNECTION_AUDIENCE>
- Key ID: <KEY_ID>
- Where my backend reads secrets from: <SECRET_STORE>
- How my backend knows the signed-in user and their stable customer ID: <SESSION_SOURCE>
- The acr values my sign-in produces and the Caplo level each maps to: <ACR_MAPPING>

Steps:
1. If I have no key yet, tell me to run `caplo identity keygen --kid <KEY_ID> --out ./caplo-keys` myself, store the private key in <SECRET_STORE>, and paste the public JWK (or my JWKS URL) into the connection. Never read, print or commit the private key file.
2. Add a `POST` token endpoint on my own domain (for example `/support/caplo-token`) in my backend's framework. It must check the `Origin` header against my site, require the header `x-caplo-token-request: 1`, identify the user only from <SESSION_SOURCE>, answer `Cache-Control: no-store`, and return `401` when nobody is signed in.
3. Sign a compact JWS with header `typ` `caplo-customer+jwt`, `alg` matching the key, and `kid` <KEY_ID>. Claims: `iss` <ISSUER> and `aud` <CONNECTION_AUDIENCE> from server configuration (never from the request), `sub` the stable opaque customer ID (never an email or phone number), `nonce` exactly as received, `iat` now, `exp` 60 seconds later, and `acr` and `auth_time` per <ACR_MAPPING>. Add no other claims unless the connection allows them. Return the token as `text/plain`.
4. If the request body has a non-null `requirement`, sign only when the session meets its `level` and `maxAuthAgeSeconds`; otherwise return `401`.
5. On every page that shows the widget, call `window.CaploWidget.get('<WIDGET_ID>').identity.configure({ when: 'open', getToken })`, where `getToken` posts `{ nonce, requirement }` to the endpoint with the custom header and returns the response text on `200`, or `null`. Wait for the loader script's `load` event if `window.CaploWidget` is not defined yet.
6. Call `identity.refresh()` after my user signs in or switches account, and `identity.signOut()` after they sign out. Listen for `caplo:identity-signout-requested` on the control and sign the user out of my site when it fires.
7. Add a test that signs an assertion with a test key and checks it with `caplo identity verify-assertion - --jwks <PUBLIC_JWK_FILE> --iss <ISSUER> --aud <CONNECTION_AUDIENCE>`.

Verify:
- `caplo identity verify-assertion` passes every check for a token from the endpoint.
- In the console, **Test assertion** on the connection passes for a token from the endpoint.
- Remind me that the channel needs **Show a notice after verification** as its consent mode, the connection under its sign-in methods, and the connection in the verification policy. Then, on a test channel, the widget shows me as signed in when I open it while signed in to my site.

Rules:
- Never put the private key, assertions or session cookies in front-end code, URLs, logs, browser storage or chat.
- Do not change anything in the Caplo console yourself; list the console changes for me.
- Ask me before deploying.
```
