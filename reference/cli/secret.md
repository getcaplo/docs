# caplo secret

> Manage workspace secrets that package secrets bind to.

Generated reference

Generated from `caplo` v0.4.1, the latest release. `caplo secret --help` prints the same text.

Manage workspace secrets that package secrets bind to.

```plaintext
caplo secret
```

A workspace secret holds one value for many packages: each package secret bound to it with caplo tool secret bind receives its value. Rotating it with caplo secret set changes the value for every bound package within a minute. Values are never shown again. Names match \[a-z]\[a-z0-9-]{1,63}.

**Examples**

```plaintext
caplo secret set orders-api-key
caplo secret usage orders-api-key
```

**Commands**

* [`caplo secret delete`](#caplo-secret-delete)
* [`caplo secret list`](#caplo-secret-list)
* [`caplo secret set`](#caplo-secret-set)
* [`caplo secret usage`](#caplo-secret-usage)

## caplo secret delete

Delete a workspace secret that no package secret binds.

```plaintext
caplo secret delete <name> [flags]
```

Deletes a workspace secret. A secret that package secrets are bound to is not deleted; the command lists the bindings to remove first with caplo tool secret unbind. It asks first; –yes skips the question.

**Examples**

```plaintext
caplo secret delete orders-api-key --yes
```

**Flags**

| Flag          | Value | Default | Description                 |
| ------------- | ----- | ------- | --------------------------- |
| `--yes`, `-y` |       |         | do not ask for confirmation |

## caplo secret list

List the workspace secrets and how many package secrets bind each.

```plaintext
caplo secret list [flags]
```

**Examples**

```plaintext
caplo secret list
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo secret set

Create a workspace secret or rotate its value, from a hidden prompt or from stdin when it is not a terminal.

```plaintext
caplo secret set <name> [flags]
```

Creates a workspace secret, or rotates the value of an existing one for every package secret bound to it. The value comes from a hidden prompt, or from standard input without its final newline when that is not a terminal, and is 1 to 8192 bytes. –description sets what it is for; without it, a rotation keeps the current description.

**Examples**

```plaintext
caplo secret set orders-api-key --description "Orders API key"
printf %s "$ORDERS_API_KEY" | caplo secret set orders-api-key
```

**Flags**

| Flag            | Value  | Default | Description                                            |
| --------------- | ------ | ------- | ------------------------------------------------------ |
| `--description` | string |         | what the secret is for (default: keep the current one) |

## caplo secret usage

List the package secrets bound to a workspace secret.

```plaintext
caplo secret usage <name> [flags]
```

**Examples**

```plaintext
caplo secret usage orders-api-key
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
