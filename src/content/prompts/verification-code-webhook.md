---
title: Build my Caplo verification code webhook
description: Adds the webhook that checks Caplo's signature, matches the visitor to a customer and sends the one-time code to their contact details on file.
---
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
