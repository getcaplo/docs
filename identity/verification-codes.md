# Verification codes

> Let visitors verify with a one-time code that your own webhook sends to the email address or phone number you have on file.

With a **Verification code** connection, the visitor enters their email address, phone number or account number in the widget. Caplo generates a 6-digit code and asks your webhook whether that identifier belongs to one of your customers. If it does, your webhook sends the code to the contact details you already hold for that customer and tells Caplo their ID. The visitor types the code into the widget and is verified as that customer.

Caplo never sends the code itself and never learns your customers’ contact details. Your webhook decides who matches and where the code goes.

Note

Codes always verify at the `low` level. A code proves the visitor can read a message sent to contact details you hold, not that they know a password. By default, tool writes need `standard`, and a code-verified visitor cannot step up from inside the chat. Offer [host sign-in](/identity/signed-assertions/) or [provider sign-in](/identity/oidc/) as well if your tools need more.

## Set it up

1. Build the webhook described below and deploy it at a public HTTPS URL.

2. In the console, go to **Settings**, **Customer identity**, select **Add connection**, and choose **Verification code**. Enter:

   * **Connection name**: shown on the widget’s button unless the channel sets a button label.
   * **Subject namespace**: if customers also verify through host or provider sign-in, enter the same namespace as that connection (by default, its issuer), so a customer is the same person whichever way they verify. Left empty, the connection gets a namespace of its own. You cannot change it later.
   * **Delivery webhook URL**: your webhook’s HTTPS URL.
   * **Accepted identifiers**: **Email**, **Phone** and **Account number**, as your webhook supports them.

   Select **Create connection**.

3. Copy the **JWKS URL** under **Customer context tokens** on the same page. Your webhook uses it to check Caplo’s signature.

4. In **Verification policy**, turn on **Verify customers in support conversations**, add the connection, make sure **Allowed scopes** includes `identity:bind`, and select **Save policy**.

5. On the website channel’s **Conversation** tab, allow verification, add the connection as a sign-in method, and select **Save entry point**.

## What visitors see

1. They select the button and see **Verify with a code**, then choose **Send the code using** (when you accept more than one identifier type) and enter the value.
2. After **Send code**, the widget always says “If that matches an account, we’ve sent a code. It expires in 10 minutes.”, whether or not the identifier matched, so nobody can use the widget to find out who your customers are.
3. They enter the **6-digit code** and select **Verify code**. **Use different details** starts again.

Visitors must enter phone numbers in international format, such as `+15551234567`. Email addresses must be a plain address. Account numbers are 1 to 64 letters, digits, `.`, `_` or `-`, starting with a letter or digit.

## The webhook contract

### Request

Caplo sends one `POST` to the webhook URL for each code:

```plaintext
POST /caplo/verification-codes HTTP/1.1
Host: hooks.example.com
Content-Type: application/json
Content-Digest: sha-256=:<BASE64_SHA256_OF_BODY>:
Signature-Input: caplo=("@method" "@target-uri" "content-digest" "content-type");created=1763200800;keyid="<KEY_ID>";alg="ecdsa-p256-sha256"
Signature: caplo=:<BASE64_SIGNATURE>:


{"challengeId":"5f0c2a9e-0b7e-4f7e-9a51-3f4d8f0c1d2e","identifier":{"type":"email","value":"ada@example.com"},"code":"482913","locale":"en-GB","expiresAt":"2026-11-15T10:10:00Z"}
```

| Field              | Meaning                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `challengeId`      | The verification attempt. Each one gets one request; you can use it to ignore duplicates. |
| `identifier.type`  | `email`, `phone` or `account_number`.                                                     |
| `identifier.value` | What the visitor entered, trimmed. Phone numbers are in E.164 form.                       |
| `code`             | The 6-digit code to send.                                                                 |
| `locale`           | The visitor’s language, as a BCP 47 tag, for the message you send.                        |
| `expiresAt`        | When the code stops working, 10 minutes after it was made.                                |

### Signature

Every request is signed with your workspace’s key under HTTP Message Signatures (RFC 9421). The signature covers the method, the full webhook URL, `Content-Digest` (a SHA-256 of the body) and `Content-Type`. The algorithm is ECDSA P-256 with SHA-256, and `keyid` names a key in your workspace’s JWKS, the **JWKS URL** in **Settings**, **Customer identity**. Keys rotate every 90 days, so look the key up by `keyid` and fetch the JWKS again when you see a new one.

Check, in order, before you look up anyone:

1. `Signature-Input` and `Signature` have the label `caplo` and exactly the components above.
2. `created` is within a few minutes of now.
3. `Content-Digest` matches the SHA-256 of the raw body you received.
4. The signature verifies over the signature base, built from your webhook URL as you entered it in Caplo (not the `Host` header your proxy passes on).

### Response

Answer `200` with JSON within 5 seconds:

| Field      | When                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `matched`  | Required. `true` when the identifier belongs to a customer and you sent the code; `false` otherwise.                                                                           |
| `sub`      | Required when matched. The customer’s stable ID in your system, up to 255 characters. It becomes the verified customer’s `sub`, so use the same ID your other connections use. |
| `delivery` | Optional. How you sent the code, such as `email` or `sms`: lowercase letters, digits and `_`. `sms` is recorded as an SMS one-time code.                                       |

```plaintext
{ "matched": true, "sub": "cus_1234", "delivery": "email" }
```

### Timeouts and retries

Caplo calls the webhook once, after it has already answered the visitor, and never retries. A timeout after 5 seconds, a status other than `200`, a body over 16 KiB, invalid JSON or a missing `sub` all count as a failed delivery: the code never verifies, and the visitor can ask for a new one. The URL must be HTTPS on a public address, and redirects are not followed.

### Example

```plaintext
// Express, Node.js 20 or later
import express from "express";
import { createHash } from "node:crypto";


const WEBHOOK_URL = "https://hooks.example.com/caplo/verification-codes"; // exactly as entered in Caplo
const JWKS_URL = process.env.CAPLO_JWKS_URL; // Settings, Customer identity, JWKS URL


let jwks = { fetchedAt: 0, keys: [] };
async function caploKey(kid) {
  if (!jwks.keys.some((k) => k.kid === kid) && Date.now() - jwks.fetchedAt > 30_000) {
    const response = await fetch(JWKS_URL, { redirect: "error" });
    if (!response.ok) throw new Error(`Caplo JWKS answered ${response.status}`);
    jwks = { fetchedAt: Date.now(), keys: (await response.json()).keys };
  }
  const jwk = jwks.keys.find((k) => k.kid === kid && k.kty === "EC" && k.crv === "P-256");
  if (!jwk) return null;
  return crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y }, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
}


async function verifyCaploRequest(headers, rawBody) {
  const input = /^caplo=(\("@method" "@target-uri" "content-digest" "content-type"\);created=(\d+);keyid="([^"]+)";alg="ecdsa-p256-sha256")$/.exec(headers["signature-input"] ?? "");
  const signature = /^caplo=:([A-Za-z0-9+/]+={0,2}):$/.exec(headers["signature"] ?? "");
  if (!input || !signature || headers["content-type"] !== "application/json") return false;
  const [, params, created, kid] = input;
  if (Math.abs(Date.now() / 1000 - Number(created)) > 300) return false;
  const digest = `sha-256=:${createHash("sha256").update(rawBody).digest("base64")}:`;
  if (headers["content-digest"] !== digest) return false;
  const key = await caploKey(kid);
  if (!key) return false;
  const base = [
    `"@method": POST`,
    `"@target-uri": ${WEBHOOK_URL}`,
    `"content-digest": ${digest}`,
    `"content-type": application/json`,
    `"@signature-params": ${params}`,
  ].join("\n");
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, Buffer.from(signature[1], "base64"), new TextEncoder().encode(base));
}


const app = express();
app.post("/caplo/verification-codes", express.raw({ type: "application/json", limit: "16kb" }), async (req, res) => {
  if (!(await verifyCaploRequest(req.headers, req.body))) return res.sendStatus(401);
  const { identifier, code, locale, expiresAt } = JSON.parse(req.body);
  const customer = await findCustomer(identifier.type, identifier.value); // your lookup
  if (!customer) return res.json({ matched: false });
  const delivery = identifier.type === "phone" ? "sms" : "email";
  await sendCode(customer, delivery, code, locale, expiresAt); // to the contact details on file
  res.json({ matched: true, sub: customer.id, delivery });
});
```

## Security rules

* Send the code only to contact details you already hold for the customer. For an account number, use the email address or phone number on that account, never one the visitor typed.
* Never put the code in the response, a log or an analytics event, and never send it anywhere except the customer.
* Treat a request with a bad signature, digest or timestamp as hostile: answer `401` and send nothing.
* Answer `matched: false` the same way for “no such customer” and “customer has no usable contact details”.
* Rate-limit your own sending too. Caplo already limits codes to 3 per identifier and 10 per visitor address every 15 minutes, 60 per widget per hour, and 1000 per workspace per day.

Each code works once, for 10 minutes, and allows 5 attempts; wrong codes count whether or not the identifier matched. Caplo stores codes and identifiers only as keyed hashes and deletes them after 24 hours.

AI prompt

Build my Caplo verification code webhook

Adds the webhook that checks Caplo's signature, matches the visitor to a customer and sends the one-time code to their contact details on file.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20add%20an%20HTTPS%20endpoint%20to%20my%20backend%20that%20Caplo's%20%22Verification%20code%22%20connection%20calls.%20It%20verifies%20Caplo's%20RFC%209421%20signature%2C%20looks%20the%20identifier%20up%20among%20my%20customers%2C%20sends%20the%20code%20to%20the%20contact%20details%20I%20already%20hold%2C%20and%20answers%20whether%20it%20matched.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fverification-codes.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20The%20public%20webhook%20URL%2C%20exactly%20as%20I%20will%20enter%20it%20in%20Caplo%3A%20%3CWEBHOOK_URL%3E%0A-%20The%20JWKS%20URL%20from%20Settings%2C%20Customer%20identity%3A%20%3CCAPLO_JWKS_URL%3E%20\(read%20it%20from%20configuration%2C%20not%20code\)%0A-%20Identifier%20types%20I%20accept%20\(email%2C%20phone%2C%20account_number\)%3A%20%3CIDENTIFIER_TYPES%3E%0A-%20How%20to%20find%20a%20customer%20by%20each%20identifier%20type%2C%20and%20their%20stable%20customer%20ID%3A%20%3CCUSTOMER_LOOKUP%3E%0A-%20How%20my%20system%20sends%20email%20and%20SMS%3A%20%3CSENDER%3E%0A%0ASteps%3A%0A1.%20Add%20a%20%60POST%60%20route%20at%20the%20path%20of%20%3CWEBHOOK_URL%3E%20that%20reads%20the%20raw%20body%20\(at%20most%2016%20KiB\)%20before%20parsing%20it.%0A2.%20Verify%20the%20request%20before%20anything%20else%3A%20%60Signature-Input%60%20must%20be%20%60caplo%3D\(%22%40method%22%20%22%40target-uri%22%20%22content-digest%22%20%22content-type%22\)%3Bcreated%3D%3Cn%3E%3Bkeyid%3D%22%3Ckid%3E%22%3Balg%3D%22ecdsa-p256-sha256%22%60%3B%20%60created%60%20within%20300%20seconds%20of%20now%3B%20%60Content-Type%60%20%60application%2Fjson%60%3B%20%60Content-Digest%60%20equal%20to%20%60sha-256%3D%3A%3Cbase64%20SHA-256%20of%20the%20raw%20body%3E%3A%60.%20Build%20the%20signature%20base%20from%20the%20method%20%60POST%60%2C%20%3CWEBHOOK_URL%3E%20as%20configured%20\(never%20the%20Host%20header\)%2C%20the%20digest%2C%20the%20content%20type%20and%20the%20signature%20parameters%2C%20exactly%20as%20the%20docs%20page%20shows%2C%20and%20verify%20the%20raw%20r%7C%7Cs%20ECDSA%20P-256%20SHA-256%20signature%20with%20the%20JWK%20whose%20%60kid%60%20matches%2C%20fetched%20from%20%3CCAPLO_JWKS_URL%3E%20and%20cached%2C%20refetching%20at%20most%20every%2030%20seconds%20for%20an%20unknown%20kid.%20Answer%20%60401%60%20on%20any%20failure.%0A3.%20Parse%20%60%7B%20challengeId%2C%20identifier%3A%20%7B%20type%2C%20value%20%7D%2C%20code%2C%20locale%2C%20expiresAt%20%7D%60.%20Ignore%20a%20repeated%20%60challengeId%60.%0A4.%20Find%20the%20customer%20with%20%3CCUSTOMER_LOOKUP%3E.%20If%20there%20is%20none%2C%20or%20they%20have%20no%20usable%20contact%20details%2C%20answer%20%60200%60%20%60%7B%22matched%22%3A%20false%7D%60%20and%20send%20nothing.%0A5.%20Otherwise%20send%20%60code%60%20with%20%3CSENDER%3E%20to%20the%20contact%20details%20on%20file%20\(never%20to%20a%20value%20the%20visitor%20typed%20for%20an%20account%20number\)%2C%20in%20%60locale%60%20where%20possible%2C%20mentioning%20it%20expires%20at%20%60expiresAt%60.%20Then%20answer%20%60200%60%20%60%7B%22matched%22%3A%20true%2C%20%22sub%22%3A%20%22%3Cstable%20customer%20ID%3E%22%2C%20%22delivery%22%3A%20%22email%22%7D%60%20or%20%60%22sms%22%60.%0A6.%20Make%20the%20whole%20handler%20finish%20within%205%20seconds%3B%20Caplo%20calls%20once%20and%20does%20not%20retry.%0A7.%20Add%20tests%20that%20sign%20requests%20with%20a%20test%20P-256%20key%2C%20including%20a%20tampered%20body%2C%20a%20wrong%20digest%2C%20an%20old%20%60created%60%20and%20an%20unknown%20%60kid%60.%0A%0AVerify%3A%0A-%20The%20tests%20pass%2C%20and%20a%20tampered%20or%20unsigned%20request%20gets%20%60401%60%20without%20a%20lookup.%0A-%20After%20I%20create%20the%20connection%2C%20add%20it%20to%20the%20verification%20policy%20and%20the%20channel%2C%20requesting%20a%20code%20in%20the%20widget%20on%20a%20test%20channel%20delivers%20it%20and%20verifies%20me.%0A%0ARules%3A%0A-%20Never%20log%2C%20return%20or%20store%20the%20code%2C%20and%20never%20log%20full%20identifiers.%0A-%20No%20secrets%20or%20customer%20data%20in%20code%2C%20logs%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20deploying.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20add%20an%20HTTPS%20endpoint%20to%20my%20backend%20that%20Caplo's%20%22Verification%20code%22%20connection%20calls.%20It%20verifies%20Caplo's%20RFC%209421%20signature%2C%20looks%20the%20identifier%20up%20among%20my%20customers%2C%20sends%20the%20code%20to%20the%20contact%20details%20I%20already%20hold%2C%20and%20answers%20whether%20it%20matched.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fverification-codes.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20The%20public%20webhook%20URL%2C%20exactly%20as%20I%20will%20enter%20it%20in%20Caplo%3A%20%3CWEBHOOK_URL%3E%0A-%20The%20JWKS%20URL%20from%20Settings%2C%20Customer%20identity%3A%20%3CCAPLO_JWKS_URL%3E%20\(read%20it%20from%20configuration%2C%20not%20code\)%0A-%20Identifier%20types%20I%20accept%20\(email%2C%20phone%2C%20account_number\)%3A%20%3CIDENTIFIER_TYPES%3E%0A-%20How%20to%20find%20a%20customer%20by%20each%20identifier%20type%2C%20and%20their%20stable%20customer%20ID%3A%20%3CCUSTOMER_LOOKUP%3E%0A-%20How%20my%20system%20sends%20email%20and%20SMS%3A%20%3CSENDER%3E%0A%0ASteps%3A%0A1.%20Add%20a%20%60POST%60%20route%20at%20the%20path%20of%20%3CWEBHOOK_URL%3E%20that%20reads%20the%20raw%20body%20\(at%20most%2016%20KiB\)%20before%20parsing%20it.%0A2.%20Verify%20the%20request%20before%20anything%20else%3A%20%60Signature-Input%60%20must%20be%20%60caplo%3D\(%22%40method%22%20%22%40target-uri%22%20%22content-digest%22%20%22content-type%22\)%3Bcreated%3D%3Cn%3E%3Bkeyid%3D%22%3Ckid%3E%22%3Balg%3D%22ecdsa-p256-sha256%22%60%3B%20%60created%60%20within%20300%20seconds%20of%20now%3B%20%60Content-Type%60%20%60application%2Fjson%60%3B%20%60Content-Digest%60%20equal%20to%20%60sha-256%3D%3A%3Cbase64%20SHA-256%20of%20the%20raw%20body%3E%3A%60.%20Build%20the%20signature%20base%20from%20the%20method%20%60POST%60%2C%20%3CWEBHOOK_URL%3E%20as%20configured%20\(never%20the%20Host%20header\)%2C%20the%20digest%2C%20the%20content%20type%20and%20the%20signature%20parameters%2C%20exactly%20as%20the%20docs%20page%20shows%2C%20and%20verify%20the%20raw%20r%7C%7Cs%20ECDSA%20P-256%20SHA-256%20signature%20with%20the%20JWK%20whose%20%60kid%60%20matches%2C%20fetched%20from%20%3CCAPLO_JWKS_URL%3E%20and%20cached%2C%20refetching%20at%20most%20every%2030%20seconds%20for%20an%20unknown%20kid.%20Answer%20%60401%60%20on%20any%20failure.%0A3.%20Parse%20%60%7B%20challengeId%2C%20identifier%3A%20%7B%20type%2C%20value%20%7D%2C%20code%2C%20locale%2C%20expiresAt%20%7D%60.%20Ignore%20a%20repeated%20%60challengeId%60.%0A4.%20Find%20the%20customer%20with%20%3CCUSTOMER_LOOKUP%3E.%20If%20there%20is%20none%2C%20or%20they%20have%20no%20usable%20contact%20details%2C%20answer%20%60200%60%20%60%7B%22matched%22%3A%20false%7D%60%20and%20send%20nothing.%0A5.%20Otherwise%20send%20%60code%60%20with%20%3CSENDER%3E%20to%20the%20contact%20details%20on%20file%20\(never%20to%20a%20value%20the%20visitor%20typed%20for%20an%20account%20number\)%2C%20in%20%60locale%60%20where%20possible%2C%20mentioning%20it%20expires%20at%20%60expiresAt%60.%20Then%20answer%20%60200%60%20%60%7B%22matched%22%3A%20true%2C%20%22sub%22%3A%20%22%3Cstable%20customer%20ID%3E%22%2C%20%22delivery%22%3A%20%22email%22%7D%60%20or%20%60%22sms%22%60.%0A6.%20Make%20the%20whole%20handler%20finish%20within%205%20seconds%3B%20Caplo%20calls%20once%20and%20does%20not%20retry.%0A7.%20Add%20tests%20that%20sign%20requests%20with%20a%20test%20P-256%20key%2C%20including%20a%20tampered%20body%2C%20a%20wrong%20digest%2C%20an%20old%20%60created%60%20and%20an%20unknown%20%60kid%60.%0A%0AVerify%3A%0A-%20The%20tests%20pass%2C%20and%20a%20tampered%20or%20unsigned%20request%20gets%20%60401%60%20without%20a%20lookup.%0A-%20After%20I%20create%20the%20connection%2C%20add%20it%20to%20the%20verification%20policy%20and%20the%20channel%2C%20requesting%20a%20code%20in%20the%20widget%20on%20a%20test%20channel%20delivers%20it%20and%20verifies%20me.%0A%0ARules%3A%0A-%20Never%20log%2C%20return%20or%20store%20the%20code%2C%20and%20never%20log%20full%20identifiers.%0A-%20No%20secrets%20or%20customer%20data%20in%20code%2C%20logs%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20deploying.)

Show prompt

```
Goal: add an HTTPS endpoint to my backend that Caplo's "Verification code" connection calls. It verifies Caplo's RFC 9421 signature, looks the identifier up among my customers, sends the code to the contact details I already hold, and answers whether it matched.

Read these pages first:
- https://docs.caplo.si/identity/verification-codes.md
- https://docs.caplo.si/identity.md

Values I will give you:
- The public webhook URL, exactly as I will enter it in Caplo: <WEBHOOK_URL>
- The JWKS URL from Settings, Customer identity: <CAPLO_JWKS_URL> (read it from configuration, not code)
- Identifier types I accept (email, phone, account_number): <IDENTIFIER_TYPES>
- How to find a customer by each identifier type, and their stable customer ID: <CUSTOMER_LOOKUP>
- How my system sends email and SMS: <SENDER>

Steps:
1. Add a `POST` route at the path of <WEBHOOK_URL> that reads the raw body (at most 16 KiB) before parsing it.
2. Verify the request before anything else: `Signature-Input` must be `caplo=("@method" "@target-uri" "content-digest" "content-type");created=<n>;keyid="<kid>";alg="ecdsa-p256-sha256"`; `created` within 300 seconds of now; `Content-Type` `application/json`; `Content-Digest` equal to `sha-256=:<base64 SHA-256 of the raw body>:`. Build the signature base from the method `POST`, <WEBHOOK_URL> as configured (never the Host header), the digest, the content type and the signature parameters, exactly as the docs page shows, and verify the raw r||s ECDSA P-256 SHA-256 signature with the JWK whose `kid` matches, fetched from <CAPLO_JWKS_URL> and cached, refetching at most every 30 seconds for an unknown kid. Answer `401` on any failure.
3. Parse `{ challengeId, identifier: { type, value }, code, locale, expiresAt }`. Ignore a repeated `challengeId`.
4. Find the customer with <CUSTOMER_LOOKUP>. If there is none, or they have no usable contact details, answer `200` `{"matched": false}` and send nothing.
5. Otherwise send `code` with <SENDER> to the contact details on file (never to a value the visitor typed for an account number), in `locale` where possible, mentioning it expires at `expiresAt`. Then answer `200` `{"matched": true, "sub": "<stable customer ID>", "delivery": "email"}` or `"sms"`.
6. Make the whole handler finish within 5 seconds; Caplo calls once and does not retry.
7. Add tests that sign requests with a test P-256 key, including a tampered body, a wrong digest, an old `created` and an unknown `kid`.

Verify:
- The tests pass, and a tampered or unsigned request gets `401` without a lookup.
- After I create the connection, add it to the verification policy and the channel, requesting a code in the widget on a test channel delivers it and verifies me.

Rules:
- Never log, return or store the code, and never log full identifiers.
- No secrets or customer data in code, logs or chat.
- Do not change anything in the Caplo console yourself; list the console changes for me.
- Ask me before deploying.
```
