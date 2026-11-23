---
title: "caplo identity"
description: "Generate keys and sign or check host sign-in assertions locally."
editUrl: false
sidebar:
  order: 7
  label: "identity"
---

:::note[Generated reference]
Generated from `caplo` v0.5.1, the latest release. `caplo identity --help` prints the same text.
:::

Generate keys and sign or check host sign-in assertions locally.

```sh
caplo identity
```

Local helpers for a host that signs its customers in to Caplo with signed assertions, through a customer identity connection of type signed_assertion. Nothing is sent to Caplo. Only verify-assertion makes a request, to fetch a JWKS from an https URL as Identity does: within 3 seconds, at most 64 KiB, and without redirects.

**Examples**

```sh
caplo identity keygen --out keys
caplo identity sign-assertion --key keys/<kid>.private.jwk.json --iss https://shop.example.com \
  --aud urn:caplo:customer-identity:<id> --sub cust-1042 --nonce <nonce> > assertion.jwt
caplo identity verify-assertion --jwks keys/<kid>.public.jwk.json --iss https://shop.example.com \
  --aud urn:caplo:customer-identity:<id> - < assertion.jwt
```

**Commands**

- [`caplo identity keygen`](#caplo-identity-keygen)
- [`caplo identity sign-assertion`](#caplo-identity-sign-assertion)
- [`caplo identity verify-assertion`](#caplo-identity-verify-assertion)

## caplo identity keygen

Write a new signing key: private JWK and PEM, and the public JWK to give the connection; nothing is sent.

```sh
caplo identity keygen [flags]
```

Writes &lt;kid&gt;.private.jwk.json and &lt;kid&gt;.private.pem, readable only by you, and &lt;kid&gt;.public.jwk.json, with kid, alg, and use sig, into --out. Add the public JWK to the connection's keys or your JWKS, and keep the private key on your server. RSA keys have 3072 bits, and the key ID defaults to the key's RFC 7638 thumbprint. Existing files are never overwritten.

**Examples**

```sh
caplo identity keygen
caplo identity keygen --alg EdDSA --kid shop-2026 --out keys
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--alg` | string | `ES256` | algorithm: ES256, ES384, PS256, RS256, EdDSA; RSA keys have 3072 bits |
| `--kid` | string |  | key ID (default: the RFC 7638 thumbprint) |
| `--out` | string | `.` | directory to write the key files in |

## caplo identity sign-assertion

Print a signed caplo-customer+jwt assertion, as a host backend would make one, for local tests.

```sh
caplo identity sign-assertion [flags]
```

Signs a caplo-customer+jwt assertion with a private JWK or PEM key and prints it as a compact JWS, as a host's backend would for a challenge nonce. --key, --iss, --aud, --sub, and --nonce are required. The assertion lives --ttl seconds, at most 300. An --attr value that is a JSON number, boolean, or quoted string keeps its type; any other value is a string.

**Examples**

```sh
caplo identity sign-assertion --key keys/shop-2026.private.jwk.json --iss https://shop.example.com \
  --aud urn:caplo:customer-identity:<id> --sub cust-1042 --nonce <nonce>
caplo identity sign-assertion --key key.pem --alg PS256 --kid shop-rsa --iss https://shop.example.com \
  --aud urn:caplo:customer-identity:<id> --sub cust-1042 --nonce <nonce> --amr pwd,otp --auth-time now \
  --attr tier=gold --attr orders=12 --act-for cust-7:guardian
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--acr` | string |  | authentication context class, mapped to a level by the connection |
| `--act-for` | string |  | subject the customer acts for, as sub:relationship |
| `--alg` | string |  | algorithm (default: the JWK's alg, or the one an EC or Ed25519 PEM key fits) |
| `--amr` | stringSlice |  | authentication methods, comma separated, e.g. pwd,otp |
| `--attr` | stringArray |  | verified attribute k=v, repeatable; a JSON number, boolean or "quoted string" keeps its type |
| `--aud` | string |  | audience: the connection's urn:caplo:customer-identity:&lt;id&gt; |
| `--auth-time` | string |  | when the customer last authenticated: Unix time or now |
| `--iss` | string |  | issuer: the connection's issuer |
| `--key` | string |  | private key file: JWK or PEM |
| `--kid` | string |  | key ID (default: the JWK's kid) |
| `--name` | string |  | display name |
| `--nonce` | string |  | the challenge nonce |
| `--sid` | string |  | the host's session ID, for back-channel logout |
| `--sub` | string |  | the customer's stable, opaque ID |
| `--ttl` | int64 | `60` | lifetime in seconds, at most 300 |

## caplo identity verify-assertion

Run Identity's assertion checks locally and print each; challenge state and connection policy are skipped.

```sh
caplo identity verify-assertion <token|-> [flags]
```

Runs Identity's checks on an assertion, given as an argument or read from standard input with -, and prints each as pass, fail, or skip: format, typ, key, signature, issuer and audience, nonce, times, subject and the claim allow-list, and claim values such as amr, sid, jti, profile claims, attributes, and act_for. The nonce is compared only with --nonce. Challenge state and the connection's policy (acr mapping, allowed profile claims, declared attributes and their types, and delegation relationships) are Identity's and are skipped. Exits 3 when a check fails.

**Examples**

```sh
caplo identity verify-assertion --jwks keys/shop-2026.public.jwk.json --iss https://shop.example.com \
  --aud urn:caplo:customer-identity:<id> "$ASSERTION"
caplo identity sign-assertion ... | caplo identity verify-assertion --jwks https://shop.example.com/jwks.json \
  --iss https://shop.example.com --aud urn:caplo:customer-identity:<id> --nonce <nonce> -
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--alg` | stringSlice | `[ES256,ES384,PS256,RS256,EdDSA]` | the connection's pinned algorithms |
| `--aud` | string |  | the connection's audience |
| `--iss` | string |  | the connection's issuer |
| `--jwks` | string |  | JWKS or public JWK: a file or an https URL |
| `--nonce` | string |  | the challenge nonce (default: skip the comparison) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
