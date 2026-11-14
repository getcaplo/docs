---
title: Sign my signed-in users in to the Caplo widget
description: Adds a token endpoint that signs Caplo host sign-in assertions, wires identity.configure on my pages, and tests it with the caplo CLI.
---
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
