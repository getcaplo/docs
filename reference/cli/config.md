# caplo config

> Show and change CLI settings.

Generated reference

Generated from `caplo` v0.6.0, the latest release. `caplo config --help` prints the same text.

Show and change CLI settings.

```plaintext
caplo config
```

Settings are saved in config.yaml in the configuration directory: CAPLO_CONFIG_DIR, else \~/.config/caplo ($XDG_CONFIG_HOME/caplo), or %AppData%\caplo on Windows. caplo workspace use saves the selected workspace there too.

**Examples**

```plaintext
caplo config list
caplo config set credential-storage file
```

**Commands**

* [`caplo config get`](#caplo-config-get)
* [`caplo config list`](#caplo-config-list)
* [`caplo config set`](#caplo-config-set)

## caplo config get

Show one setting.

```plaintext
caplo config get <key>
```

**Examples**

```plaintext
caplo config get api-url
```

## caplo config list

Show every setting.

```plaintext
caplo config list [flags]
```

Shows the saved settings, the production defaults for those not saved, and the selected workspace. Defaults are not saved.

**Examples**

```plaintext
caplo config list
caplo config list -o json
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo config set

Change one setting: api-url, issuer, client-id, credential-storage.

```plaintext
caplo config set <key> <value>
```

Changes a saved setting: api-url, issuer, client-id (the OAuth client, caplo-cli by default), or credential-storage (keychain or file). Changing api-url clears the selected workspace. Run caplo auth login afterwards to start a session with the new setting.

**Examples**

```plaintext
caplo config set credential-storage file
caplo config set api-url https://api.staging.example.com
```
