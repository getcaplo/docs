# Secrets and network access

> Declare the secrets a tool package reads, set or bind their values without putting them in code, and allow the hosts the package may call.

A tool package gets nothing it does not declare. It reads only the secrets named in its `caplo.yaml`, and it reaches only the hosts listed there. Both lists are frozen into each published version.

## Declare secrets

List each secret by name in `caplo.yaml`. Names are upper case: a letter, then letters, digits or underscores, up to 64 characters, and at most 50 per package.

```yaml
secrets:
  - SHOP_API_KEY
  - SHOP_WEBHOOK_SECRET
```

Read a value from the [call context](/tools/define-tool-and-context/#the-call-context):

```ts
const apiKey = secrets.get("SHOP_API_KEY");
```

`secrets.get` throws if the call has no value for the name. Secrets are never environment variables on Caplo, and `caplo.yaml` holds only names.

Caution

Never put a secret value in source code, `caplo.yaml`, fixtures you commit, logs or chat. Do not log the value or return it in a result; anything a tool returns can reach the model.

## Provide the values

Each declared name gets its value in one of two ways:

* **A package value**, set for this package only.
* **A workspace secret binding.** A workspace secret is a value stored once and bound to any number of packages, for example one API key that three packages use. Rotating the workspace secret updates every package bound to it.

Binding a name to a workspace secret replaces the package’s own value. Live calls use a new or rotated value within a minute. A live call to a tool whose package declares a secret that has no value fails before the tool runs.

Values are write-only: once saved, neither the console nor the CLI shows them again.

**Console**

**Package value or binding**

1. Open **Tools**. Each tool package has a **Secrets** button; a package whose published version declares secrets without values shows a warning badge such as **1 secret not set**.
2. Select **Secrets**. For each declared name, select **Set value** to store a value for **This package only**, or **Use workspace secret** to choose a workspace secret, then **Save secret** or **Bind secret**.
3. To remove one, select **Unbind** or **Remove**. Live calls that need it fail until it is set or bound again.

The list shows the names your latest published version declares. Setting a package value needs the **Owner**, **Admin** or **Developer** role; binding a workspace secret needs **Owner** or **Admin**.

**Workspace secrets**

Open **Settings**, then **Secrets**, and select **Create secret**. Names are lowercase letters, digits and hyphens, such as `shop-prod`. **Rotate value** replaces the value; **Delete secret** removes it and cannot be undone.

**CLI**

Run these in the package folder, or pass `-p <package>`. Values are read from a hidden prompt, or from standard input when it is not a terminal, so they never appear in your shell history.

```sh
# A value for this package only
caplo tool secret set SHOP_API_KEY


# Or: create a workspace secret once, then bind the package's name to it
caplo secret set shop-prod --description "Shop API production key"
caplo tool secret bind SHOP_API_KEY shop-prod


# Where each declared name gets its value
caplo tool secret list
```

In scripts, pipe the value in, for example from your CI secret store: `printf '%s' "$SHOP_KEY" | caplo secret set shop-prod`.

| Command                                            | What it does                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `caplo tool secret set <NAME>`                     | Sets the package’s own value. Refused while the name is bound to a workspace secret. |
| `caplo tool secret unset <NAME>`                   | Removes the package’s own value.                                                     |
| `caplo tool secret bind <NAME> <workspace-secret>` | Fills the name from a workspace secret, replacing the package’s own value.           |
| `caplo tool secret unbind <NAME>`                  | Removes the binding.                                                                 |
| `caplo secret set <name>`                          | Creates a workspace secret or rotates its value.                                     |
| `caplo secret list`                                | Lists workspace secrets and how many package secrets bind each.                      |
| `caplo secret usage <name>`                        | Lists the package secrets bound to a workspace secret.                               |
| `caplo secret delete <name>`                       | Deletes a workspace secret. Refused while any package secret is bound to it.         |

See the [`caplo tool secret`](/reference/cli/tool/#caplo-tool-secret) and [`caplo secret`](/reference/cli/secret/) references.

### Secrets in development and tests

* `caplo tool dev` reads each declared secret from an environment variable of the same name: `SHOP_API_KEY=test-key caplo tool dev`.
* A fixture can carry test values in its `secrets` field. Use test credentials there, never production ones. See [Test tools with fixtures](/tools/testing/).
* Live calls never use these values; they use only what you set or bind in the workspace.

## Allow network access

A package can make outbound requests only to the hosts in its `egress` list. Without the list, or with an empty one, it has no network access at all.

```yaml
egress:
  - api.shop.example
  - "*.payments.example"
```

* An entry is an exact host name, or `*.` followed by a domain to allow its subdomains. `*.payments.example` allows `eu.payments.example` but not `payments.example` itself; list both if you call both.
* Host names only: no scheme, port or path. Up to 50 entries.
* Even a listed host is refused if it resolves to a private, loopback, link-local or cloud metadata address. Tools cannot reach internal networks this way.

A request to any other host is refused before it leaves Caplo, and your code sees a failed request. The refusal is recorded with the invocation: `caplo tool logs` and remote fixture runs print it as `egress denied <host>: <reason>`.

Egress is enforced when the package runs on Caplo: in live calls and in `caplo tool test --remote`. A local `caplo tool test` uses your machine’s network, so run `--remote` before publishing to catch a missing host.

Note

Changing `egress` or `secrets` means a new build and a new version. Agents keep the old version’s lists until you publish the agent again.
