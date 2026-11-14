# caplo auth

> Log in, log out, and show the session.

Generated reference

Generated from `caplo` v0.4.0, the latest release. `caplo auth --help` prints the same text.

Log in, log out, and show the session.

```sh
caplo auth
```

A login session authenticates a person. CI and automation use an API client’s key in CAPLO_API_KEY instead; see caplo workspace api-client.

**Examples**

```sh
caplo auth login
caplo auth status
```

**Commands**

* [`caplo auth login`](#caplo-auth-login)
* [`caplo auth logout`](#caplo-auth-logout)
* [`caplo auth status`](#caplo-auth-status)

## caplo auth login

Log in through the browser, or with –device on a machine without one.

```sh
caplo auth login [flags]
```

Logs in with the caplo-cli OpenID client: in the browser with the authorization code flow and PKCE, answered on a 127.0.0.1 port, or with –device through the device authorization grant. The refresh token is stored in the OS keychain, or with –insecure-storage (or credential-storage file) in a 0600 file in the configuration directory; access tokens stay in memory. Refresh tokens rotate on every use, and caplo processes share a lock so that none reuses a token another has used.

The API and issuer are –api-url and –issuer, else CAPLO_API_URL and CAPLO_ISSUER, else the saved settings, else production (<https://api.caplo.si> and <https://auth.caplo.si/realms/caplo>). A successful login saves them, so the variables affect login only and never redirect an existing session. Login keeps the selected workspace while you still belong to it, and otherwise selects your only workspace.

**Examples**

```sh
caplo auth login
caplo auth login --device
caplo auth login --api-url https://api.staging.example.com --issuer https://auth.staging.example.com/realms/caplo
```

**Flags**

| Flag                 | Value  | Default | Description                                                                                              |
| -------------------- | ------ | ------- | -------------------------------------------------------------------------------------------------------- |
| `--api-url`          | string |         | Caplo API URL, for example <https://api.caplo.si>                                                        |
| `--device`           |        |         | use the device authorization grant                                                                       |
| `--insecure-storage` |        |         | keep the refresh token in a 0600 file instead of the OS keychain (default: the saved credential-storage) |
| `--issuer`           | string |         | OpenID issuer URL, for example <https://auth.caplo.si/realms/caplo>                                      |
| `--no-browser`       |        |         | print the login URL without opening a browser                                                            |

## caplo auth logout

Revoke the session and delete the stored refresh token.

```sh
caplo auth logout
```

Deletes the stored refresh token, then revokes the session at the issuer. When the revocation fails, the local token is deleted all the same and the command reports the failure.

**Examples**

```sh
caplo auth logout
```

## caplo auth status

Show the logged-in user, API, and selected workspace.

```sh
caplo auth status [flags]
```

Shows the logged-in user, the API and issuer, where the credentials are stored, and the selected workspace. With CAPLO_API_KEY it shows the API client, its workspace, and its scopes instead.

**Examples**

```sh
caplo auth status
caplo auth status -o json
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
