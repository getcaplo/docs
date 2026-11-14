---
title: Verify Caplo customer context tokens in my API
description: Adds verifyCustomerContext to my API's routes that Caplo tools call, with replay protection, scope checks and step-up challenges.
---
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
