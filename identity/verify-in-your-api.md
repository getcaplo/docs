# Verify customers in your API

> Check Caplo's customer context token in your own API with verifyCustomerContext, refuse replays, and ask the customer for a stronger sign-in.

When a [customer-aware tool](/tools/customer-aware-tools/) calls your API, the API should not take the customer’s ID on trust from the tool. A **customer context token** lets the API check for itself that Caplo verified this customer, for this API, moments ago. The token is a JWT signed by your workspace’s own issuer. It lasts 60 seconds and is issued for one call.

## Before you start

1. On the connection your customers verify through (**Settings**, **Customer identity**, **Configure**), list your API under **API audiences**: one HTTPS URL per line, up to 8. Tokens are only issued for these audiences.
2. Copy the **Issuer** and **JWKS URL** from **Customer context tokens** on the **Customer identity** page. The issuer looks like `https://api.caplo.si/v1/identity/workspaces/<WORKSPACE_ID>`.
3. On the website channel, under **Verified tool operations**, choose your API as the operation’s **customer token audience**. Adding operations to a channel is not self-serve yet; see [Customer identity](/identity/#how-the-customer-reaches-your-tools).
4. In the tool, send `ctx.subject.customerToken` as `Authorization: Bearer`. See [Build customer-aware tools](/tools/customer-aware-tools/#customer-context-tokens).

## Verify with `@caplo/tools/verify`

`verifyCustomerContext` is part of the `@caplo/tools` package on npm. It has no runtime dependencies: it uses only `fetch` and WebCrypto. The package targets Node.js 24.

```plaintext
npm install @caplo/tools
```

```plaintext
import { CustomerContextError, verifyCustomerContext } from "@caplo/tools/verify";


const ISSUER = process.env.CAPLO_ISSUER!;      // Issuer from Settings, Customer identity
const AUDIENCE = "https://api.shop.example";   // this API, as listed under API audiences


export async function verifiedCustomer(request: Request) {
  const token = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return null;
  try {
    return await verifyCustomerContext(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      replayStore,                             // see below
      requiredScope: "tools:write:change_address",
    });
  } catch (error) {
    if (error instanceof CustomerContextError) return null; // answer 401
    throw error;
  }
}
```

Then act only for `claims.sub`, the customer’s ID in your system. Never read the customer from the request body or query: that is what a model or a tampered request could change.

### Options

| Option                  | Required | Notes                                                                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `issuer`                | Yes      | The exact issuer from the console. Keys are fetched from `<issuer>/.well-known/jwks.json`.                             |
| `audience`              | Yes      | This API’s audience, exactly as listed on the connection.                                                              |
| `replayStore`           | No       | Refuses a token whose `jti` was already used. Use one for every API that changes data.                                 |
| `requiredScope`         | No       | A scope the token must carry: the operation’s scope, such as `tools:read:list_orders` or `tools:write:change_address`. |
| `clockToleranceSeconds` | No       | Allowed clock skew, default 0.                                                                                         |

Missing `issuer` or `audience` throws a plain `Error`, since that is a configuration mistake, not a bad token.

### What it checks

A token is accepted only when all of these hold:

* It is a compact JWS of at most 8 KiB, with header `typ` `at+jwt`, `alg` `ES256`, a `kid` and no `crit`.
* `iss` equals your issuer, and the signature verifies with the key named by `kid` from the issuer’s key set.
* `aud` equals your audience.
* The required claims are present and well formed.
* It lives at most 60 seconds (`exp` minus `iat`), has not expired, and was not issued in the future.
* With `requiredScope`, `scope` contains it. With `replayStore`, its `jti` has not been used.

The key set is cached for its `Cache-Control` max-age (5 minutes), and an unknown `kid` triggers a refetch at most every 30 seconds, so Caplo’s key rotation needs nothing from you.

### Errors

Every refusal throws `CustomerContextError` with a `reason`:

| `reason`                               | Meaning                                                                    | Answer                            |
| -------------------------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| `malformed`, `typ`, `alg`, `claims`    | Not a Caplo customer context token.                                        | `401`                             |
| `issuer`, `audience`                   | Issued by another workspace or for another API.                            | `401`                             |
| `kid_unknown`, `signature`             | Not signed by your workspace’s current keys.                               | `401`                             |
| `expired`, `not_yet_valid`, `lifetime` | Outside its 60-second window. Check your server clock if this is frequent. | `401`                             |
| `scope`                                | The token is for a different operation.                                    | `403`                             |
| `replayed`                             | The token was already used.                                                | `401`                             |
| `jwks_unavailable`                     | The key set could not be fetched.                                          | `503`, so the call can be retried |

## Claims

| Claim                                | Meaning                                                                                                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sub`                                | The customer’s ID in your system, as your sign-in asserted it.                                                                                                                                  |
| `acr`                                | The verification level: `low`, `standard` or `high`.                                                                                                                                            |
| `auth_time`                          | When the customer last authenticated, in seconds, when known.                                                                                                                                   |
| `scope`                              | The operation’s scope, such as `tools:write:change_address`.                                                                                                                                    |
| `act`                                | The acting agent, `{ "sub": "caplo:agent:<AGENT_ID>" }`. When a person acts for another customer, `act.act` names that person and their `relationship`, and `sub` is the customer they act for. |
| `attributes`                         | Attributes from the sign-in that the connection makes visible to **Tools**.                                                                                                                     |
| `caplo.namespace`                    | The subject namespace the customer verified in.                                                                                                                                                 |
| `caplo.conversation`                 | The conversation the call belongs to.                                                                                                                                                           |
| `caplo.action`, `caplo.actionDigest` | For a write, the action the customer confirmed and a digest of it. Record them with the change.                                                                                                 |
| `client_id`                          | `caplo:workspace:<WORKSPACE_ID>`.                                                                                                                                                               |
| `iss`, `aud`, `jti`, `iat`, `exp`    | Standard JWT claims.                                                                                                                                                                            |

## Refuse replays across instances

`MemoryReplayStore` remembers token IDs in one process. When your API runs on more than one instance, give it a shared store: an object whose `use(jti, expiresAt)` returns `true` the first time it sees an ID and `false` after that. With Redis:

```plaintext
import { createClient } from "redis";
import type { ReplayStore } from "@caplo/tools/verify";


const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();


export const replayStore: ReplayStore = {
  async use(jti, expiresAt) {
    const result = await redis.set(`caplo:jti:${jti}`, "1", { NX: true, PXAT: expiresAt.getTime() });
    return result === "OK";
  },
};
```

## Verify without the SDK

Any JWT library works. Accept the token only when the header has `typ` `at+jwt` and `alg` `ES256`; verify it with the key from `<issuer>/.well-known/jwks.json` whose `kid` matches; require `iss` and `aud` to equal your values exactly, `exp` in the future and `exp - iat` at most 60; and record each `jti` until its `exp`.

## Ask for a stronger sign-in

When an operation needs a higher level or a more recent sign-in than the token shows, refuse it with an RFC 9470 challenge, using Caplo’s level names in `acr_values` and seconds in `max_age`:

```plaintext
const fresh = claims.auth_time !== undefined && Date.now() / 1000 - claims.auth_time <= 300;
if (claims.acr !== "high" || !fresh) {
  return new Response(null, {
    status: 401,
    headers: { "WWW-Authenticate": 'Bearer error="insufficient_user_authentication", acr_values="high", max_age="300"' },
  });
}
```

In the tool, turn the challenge into a step-up with `stepUpFromChallenge`, or ask for one directly with `stepUpRequired`:

```plaintext
import { stepUpFromChallenge, stepUpRequired } from "@caplo/tools";


const stepUp = stepUpFromChallenge(response.headers.get("www-authenticate"));
if (stepUp) return stepUp;


// or, without a challenge from the API:
return stepUpRequired({ level: "high", maxAuthAgeSeconds: 300 });
```

`stepUpFromChallenge` returns `undefined` for any other header. When `acr_values` lists several levels, it requires the weakest one listed; `max_age` above 86400 is capped. Caplo then asks the customer to **Confirm it’s you**. A write runs again with the same arguments once they have; for a read, the customer asks again. See [Ask the customer to verify again](/tools/write-tools/#ask-the-customer-to-verify-again) and the [SDK reference](/reference/sdk/).

Note

Only host sign-in and provider sign-in can step up inside the chat. A customer verified with a [verification code](/identity/verification-codes/) is told the request cannot be confirmed there.

AI prompt

Verify Caplo customer context tokens in my API

Adds verifyCustomerContext to my API's routes that Caplo tools call, with replay protection, scope checks and step-up challenges.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20my%20API%20accepts%20calls%20from%20Caplo%20customer-aware%20tools%20only%20with%20a%20valid%20Caplo%20customer%20context%20token%2C%20and%20acts%20only%20for%20the%20customer%20the%20token%20names.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fverify-in-your-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fcustomer-aware-tools.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20The%20Issuer%20from%20Settings%2C%20Customer%20identity%3A%20%3CCAPLO_ISSUER%3E%20\(read%20it%20from%20configuration%2C%20not%20code\)%0A-%20This%20API's%20audience%2C%20as%20listed%20under%20API%20audiences%20on%20the%20connection%3A%20%3CAPI_AUDIENCE%3E%0A-%20The%20routes%20Caplo%20tools%20call%2C%20and%20the%20operation%20scope%20each%20needs%20\(for%20example%20tools%3Awrite%3Achange_address\)%3A%20%3CROUTES_AND_SCOPES%3E%0A-%20How%20my%20API%20finds%20a%20customer%20by%20their%20ID%3A%20%3CCUSTOMER_LOOKUP%3E%0A-%20A%20shared%20store%20my%20API%20instances%20can%20use%20for%20replay%20protection%2C%20if%20more%20than%20one%20instance%20runs%3A%20%3CSHARED_STORE%3E%0A-%20Operations%20that%20need%20a%20stronger%20or%20recent%20sign-in%2C%20with%20level%20and%20maximum%20age%20in%20seconds%3A%20%3CSTEP_UP_RULES%3E%0A%0ASteps%3A%0A1.%20Add%20%60%40caplo%2Ftools%60%20to%20the%20API%20\(%60npm%20install%20%40caplo%2Ftools%60\)%20and%20import%20%60verifyCustomerContext%60%2C%20%60CustomerContextError%60%20and%2C%20for%20a%20single%20instance%2C%20%60MemoryReplayStore%60%20from%20%60%40caplo%2Ftools%2Fverify%60.%0A2.%20Write%20one%20middleware%20that%20reads%20%60Authorization%3A%20Bearer%20%3Ctoken%3E%60%20and%20calls%20%60verifyCustomerContext\(token%2C%20%7B%20issuer%2C%20audience%2C%20replayStore%2C%20requiredScope%20%7D\)%60%20with%20the%20route's%20scope%20from%20%3CROUTES_AND_SCOPES%3E.%20With%20several%20instances%2C%20implement%20a%20%60ReplayStore%60%20on%20%3CSHARED_STORE%3E%20whose%20%60use\(jti%2C%20expiresAt\)%60%20sets%20the%20key%20only%20if%20absent%2C%20expiring%20at%20%60expiresAt%60.%0A3.%20Map%20%60CustomerContextError%60%20reasons%3A%20%60scope%60%20to%20403%2C%20%60jwks_unavailable%60%20to%20503%2C%20everything%20else%20to%20401.%20Rethrow%20other%20errors.%20Never%20log%20the%20token.%0A4.%20In%20each%20route%2C%20load%20the%20customer%20with%20%3CCUSTOMER_LOOKUP%3E%20using%20%60claims.sub%60%20only.%20Remove%20any%20customer%20ID%20taken%20from%20the%20body%2C%20query%20or%20path%20for%20these%20routes%2C%20or%20check%20it%20equals%20%60claims.sub%60.%0A5.%20For%20operations%20in%20%3CSTEP_UP_RULES%3E%2C%20when%20%60claims.acr%60%20is%20below%20the%20level%20or%20%60claims.auth_time%60%20is%20older%20than%20the%20maximum%20age%2C%20answer%20401%20with%20%60WWW-Authenticate%3A%20Bearer%20error%3D%22insufficient_user_authentication%22%2C%20acr_values%3D%22%3CLEVEL%3E%22%2C%20max_age%3D%22%3CSECONDS%3E%22%60.%0A6.%20In%20the%20Caplo%20tool%20package%20that%20calls%20these%20routes%2C%20if%20it%20is%20in%20this%20repository%2C%20send%20%60ctx.subject.customerToken%60%20as%20the%20bearer%20token%20and%20return%20%60stepUpFromChallenge\(response.headers.get\(%22www-authenticate%22\)\)%60%20when%20it%20is%20defined.%0A7.%20Add%20tests%3A%20a%20valid%20token%20\(sign%20test%20tokens%20with%20your%20own%20P-256%20key%20and%20serve%20a%20test%20JWKS%20at%20%60%3Cissuer%3E%2F.well-known%2Fjwks.json%60\)%2C%20a%20wrong%20audience%2C%20an%20expired%20token%2C%20a%20replayed%20token%2C%20a%20missing%20scope%2C%20and%20a%20step-up%20challenge.%0A%0AVerify%3A%0A-%20The%20tests%20pass%2C%20and%20no%20route%20in%20%3CROUTES_AND_SCOPES%3E%20can%20act%20for%20a%20customer%20without%20a%20valid%20token.%0A-%20After%20I%20list%20%3CAPI_AUDIENCE%3E%20on%20the%20connection%20and%20the%20operation's%20customer%20token%20audience%20is%20set%20on%20the%20channel%2C%20a%20call%20from%20the%20tool%20on%20a%20test%20channel%20succeeds%20for%20the%20signed-in%20customer%20only.%0A%0ARules%3A%0A-%20No%20secrets%20or%20tokens%20in%20code%2C%20logs%2C%20test%20snapshots%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20publishing%20tool%20packages%20or%20deploying%20the%20API.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20my%20API%20accepts%20calls%20from%20Caplo%20customer-aware%20tools%20only%20with%20a%20valid%20Caplo%20customer%20context%20token%2C%20and%20acts%20only%20for%20the%20customer%20the%20token%20names.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fidentity%2Fverify-in-your-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fcustomer-aware-tools.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20The%20Issuer%20from%20Settings%2C%20Customer%20identity%3A%20%3CCAPLO_ISSUER%3E%20\(read%20it%20from%20configuration%2C%20not%20code\)%0A-%20This%20API's%20audience%2C%20as%20listed%20under%20API%20audiences%20on%20the%20connection%3A%20%3CAPI_AUDIENCE%3E%0A-%20The%20routes%20Caplo%20tools%20call%2C%20and%20the%20operation%20scope%20each%20needs%20\(for%20example%20tools%3Awrite%3Achange_address\)%3A%20%3CROUTES_AND_SCOPES%3E%0A-%20How%20my%20API%20finds%20a%20customer%20by%20their%20ID%3A%20%3CCUSTOMER_LOOKUP%3E%0A-%20A%20shared%20store%20my%20API%20instances%20can%20use%20for%20replay%20protection%2C%20if%20more%20than%20one%20instance%20runs%3A%20%3CSHARED_STORE%3E%0A-%20Operations%20that%20need%20a%20stronger%20or%20recent%20sign-in%2C%20with%20level%20and%20maximum%20age%20in%20seconds%3A%20%3CSTEP_UP_RULES%3E%0A%0ASteps%3A%0A1.%20Add%20%60%40caplo%2Ftools%60%20to%20the%20API%20\(%60npm%20install%20%40caplo%2Ftools%60\)%20and%20import%20%60verifyCustomerContext%60%2C%20%60CustomerContextError%60%20and%2C%20for%20a%20single%20instance%2C%20%60MemoryReplayStore%60%20from%20%60%40caplo%2Ftools%2Fverify%60.%0A2.%20Write%20one%20middleware%20that%20reads%20%60Authorization%3A%20Bearer%20%3Ctoken%3E%60%20and%20calls%20%60verifyCustomerContext\(token%2C%20%7B%20issuer%2C%20audience%2C%20replayStore%2C%20requiredScope%20%7D\)%60%20with%20the%20route's%20scope%20from%20%3CROUTES_AND_SCOPES%3E.%20With%20several%20instances%2C%20implement%20a%20%60ReplayStore%60%20on%20%3CSHARED_STORE%3E%20whose%20%60use\(jti%2C%20expiresAt\)%60%20sets%20the%20key%20only%20if%20absent%2C%20expiring%20at%20%60expiresAt%60.%0A3.%20Map%20%60CustomerContextError%60%20reasons%3A%20%60scope%60%20to%20403%2C%20%60jwks_unavailable%60%20to%20503%2C%20everything%20else%20to%20401.%20Rethrow%20other%20errors.%20Never%20log%20the%20token.%0A4.%20In%20each%20route%2C%20load%20the%20customer%20with%20%3CCUSTOMER_LOOKUP%3E%20using%20%60claims.sub%60%20only.%20Remove%20any%20customer%20ID%20taken%20from%20the%20body%2C%20query%20or%20path%20for%20these%20routes%2C%20or%20check%20it%20equals%20%60claims.sub%60.%0A5.%20For%20operations%20in%20%3CSTEP_UP_RULES%3E%2C%20when%20%60claims.acr%60%20is%20below%20the%20level%20or%20%60claims.auth_time%60%20is%20older%20than%20the%20maximum%20age%2C%20answer%20401%20with%20%60WWW-Authenticate%3A%20Bearer%20error%3D%22insufficient_user_authentication%22%2C%20acr_values%3D%22%3CLEVEL%3E%22%2C%20max_age%3D%22%3CSECONDS%3E%22%60.%0A6.%20In%20the%20Caplo%20tool%20package%20that%20calls%20these%20routes%2C%20if%20it%20is%20in%20this%20repository%2C%20send%20%60ctx.subject.customerToken%60%20as%20the%20bearer%20token%20and%20return%20%60stepUpFromChallenge\(response.headers.get\(%22www-authenticate%22\)\)%60%20when%20it%20is%20defined.%0A7.%20Add%20tests%3A%20a%20valid%20token%20\(sign%20test%20tokens%20with%20your%20own%20P-256%20key%20and%20serve%20a%20test%20JWKS%20at%20%60%3Cissuer%3E%2F.well-known%2Fjwks.json%60\)%2C%20a%20wrong%20audience%2C%20an%20expired%20token%2C%20a%20replayed%20token%2C%20a%20missing%20scope%2C%20and%20a%20step-up%20challenge.%0A%0AVerify%3A%0A-%20The%20tests%20pass%2C%20and%20no%20route%20in%20%3CROUTES_AND_SCOPES%3E%20can%20act%20for%20a%20customer%20without%20a%20valid%20token.%0A-%20After%20I%20list%20%3CAPI_AUDIENCE%3E%20on%20the%20connection%20and%20the%20operation's%20customer%20token%20audience%20is%20set%20on%20the%20channel%2C%20a%20call%20from%20the%20tool%20on%20a%20test%20channel%20succeeds%20for%20the%20signed-in%20customer%20only.%0A%0ARules%3A%0A-%20No%20secrets%20or%20tokens%20in%20code%2C%20logs%2C%20test%20snapshots%20or%20chat.%0A-%20Do%20not%20change%20anything%20in%20the%20Caplo%20console%20yourself%3B%20list%20the%20console%20changes%20for%20me.%0A-%20Ask%20me%20before%20publishing%20tool%20packages%20or%20deploying%20the%20API.)

Show prompt

```
Goal: my API accepts calls from Caplo customer-aware tools only with a valid Caplo customer context token, and acts only for the customer the token names.

Read these pages first:
- https://docs.caplo.si/identity/verify-in-your-api.md
- https://docs.caplo.si/tools/customer-aware-tools.md

Values I will give you:
- The Issuer from Settings, Customer identity: <CAPLO_ISSUER> (read it from configuration, not code)
- This API's audience, as listed under API audiences on the connection: <API_AUDIENCE>
- The routes Caplo tools call, and the operation scope each needs (for example tools:write:change_address): <ROUTES_AND_SCOPES>
- How my API finds a customer by their ID: <CUSTOMER_LOOKUP>
- A shared store my API instances can use for replay protection, if more than one instance runs: <SHARED_STORE>
- Operations that need a stronger or recent sign-in, with level and maximum age in seconds: <STEP_UP_RULES>

Steps:
1. Add `@caplo/tools` to the API (`npm install @caplo/tools`) and import `verifyCustomerContext`, `CustomerContextError` and, for a single instance, `MemoryReplayStore` from `@caplo/tools/verify`.
2. Write one middleware that reads `Authorization: Bearer <token>` and calls `verifyCustomerContext(token, { issuer, audience, replayStore, requiredScope })` with the route's scope from <ROUTES_AND_SCOPES>. With several instances, implement a `ReplayStore` on <SHARED_STORE> whose `use(jti, expiresAt)` sets the key only if absent, expiring at `expiresAt`.
3. Map `CustomerContextError` reasons: `scope` to 403, `jwks_unavailable` to 503, everything else to 401. Rethrow other errors. Never log the token.
4. In each route, load the customer with <CUSTOMER_LOOKUP> using `claims.sub` only. Remove any customer ID taken from the body, query or path for these routes, or check it equals `claims.sub`.
5. For operations in <STEP_UP_RULES>, when `claims.acr` is below the level or `claims.auth_time` is older than the maximum age, answer 401 with `WWW-Authenticate: Bearer error="insufficient_user_authentication", acr_values="<LEVEL>", max_age="<SECONDS>"`.
6. In the Caplo tool package that calls these routes, if it is in this repository, send `ctx.subject.customerToken` as the bearer token and return `stepUpFromChallenge(response.headers.get("www-authenticate"))` when it is defined.
7. Add tests: a valid token (sign test tokens with your own P-256 key and serve a test JWKS at `<issuer>/.well-known/jwks.json`), a wrong audience, an expired token, a replayed token, a missing scope, and a step-up challenge.

Verify:
- The tests pass, and no route in <ROUTES_AND_SCOPES> can act for a customer without a valid token.
- After I list <API_AUDIENCE> on the connection and the operation's customer token audience is set on the channel, a call from the tool on a test channel succeeds for the signed-in customer only.

Rules:
- No secrets or tokens in code, logs, test snapshots or chat.
- Do not change anything in the Caplo console yourself; list the console changes for me.
- Ask me before publishing tool packages or deploying the API.
```
