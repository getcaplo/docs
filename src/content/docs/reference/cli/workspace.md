---
title: "caplo workspace"
description: "List, show, create, and select workspaces."
editUrl: false
sidebar:
  order: 12
  label: "workspace"
---

:::note[Generated reference]
Generated from `caplo` v0.6.0, the latest release. `caplo workspace --help` prints the same text.
:::

List, show, create, and select workspaces.

```sh
caplo workspace
```

Commands act on the workspace that --workspace or CAPLO_WORKSPACE names, by ID or exact name, else on the one selected with caplo workspace use. With an API key the workspace must be named by ID, since a key cannot list workspaces.

**Examples**

```sh
caplo workspace list
caplo workspace use "Shop staging"
```

**Commands**

- [`caplo workspace api-client`](#caplo-workspace-api-client)
- [`caplo workspace create`](#caplo-workspace-create)
- [`caplo workspace get`](#caplo-workspace-get)
- [`caplo workspace list`](#caplo-workspace-list)
- [`caplo workspace use`](#caplo-workspace-use)

## caplo workspace api-client

Manage API clients and their keys for CI and automation.

```sh
caplo workspace api-client
```

An API client authenticates CI and automation without a person's login. Set CAPLO_API_KEY to one of its keys and CAPLO_WORKSPACE (or --workspace, or a project environment's workspace) to its workspace ID, and caplo commands act as the client with its scopes, at CAPLO_API_URL, else the configured API, else production. caplo auth status shows the client and its scopes. A key cannot list workspaces, so a workspace named by name is refused.

Scopes: agents:read, agents:write, agents:publish tools:read, tools:write, tools:publish channels:read, channels:write conversations:read, usage:read endpoints:read, endpoints:write

A write or publish scope includes its read scope, and a member can grant only the actions their own role holds. A CI publish needs agents:write and agents:publish, and tools:write and tools:publish when the project has packages. An environment that deploys channels needs channels:write, which a publish checks before it starts. Channel commands also read agents, and knowledge commands use the agent scopes.

A project environment can name its own key variable with apiKeyEnv; see caplo publish.

**Examples**

```sh
caplo workspace api-client create ci --scope agents:write,agents:publish,tools:write,tools:publish
CAPLO_API_KEY=... CAPLO_WORKSPACE=5b1e9c2a-... caplo publish --yes
```

**Commands**

- [`caplo workspace api-client create`](#caplo-workspace-api-client-create)
- [`caplo workspace api-client list`](#caplo-workspace-api-client-list)
- [`caplo workspace api-client revoke`](#caplo-workspace-api-client-revoke)
- [`caplo workspace api-client rotate`](#caplo-workspace-api-client-rotate)

## caplo workspace api-client create

Create an API client and print its first key.

```sh
caplo workspace api-client create <name> --scope <scope>... [flags]
```

Creates an API client with the scopes and prints its first key on standard output, once; store it at once, for example as the CI secret CAPLO_API_KEY.

Scopes: agents:read, agents:write, agents:publish tools:read, tools:write, tools:publish channels:read, channels:write conversations:read, usage:read endpoints:read, endpoints:write

**Examples**

```sh
caplo workspace api-client create ci --scope agents:write --scope agents:publish
caplo workspace api-client create reports --scope conversations:read,usage:read
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
| `--scope` | stringSlice |  | scope to grant; repeat or separate with commas |

## caplo workspace api-client list

List the workspace's API clients and their keys.

```sh
caplo workspace api-client list [flags]
```

**Examples**

```sh
caplo workspace api-client list
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo workspace api-client revoke

Revoke an API client's active keys, or only the ones --key names.

```sh
caplo workspace api-client revoke <client> [flags]
```

Revokes the API client's active keys: every one, the ones --key names, or all but the one --except names. Keys are named by ID or prefix. Anything using a revoked key stops working. It asks first; --yes skips the question.

**Examples**

```sh
caplo workspace api-client revoke ci --except 9d3e1f20-4b5a-4c6d-8e7f-0a1b2c3d4e5f
caplo workspace api-client revoke ci --key caplo_sk_3f9a6b1c --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--except` | string |  | revoke every active key but this one (ID or prefix), after a rotation |
| `--key` | stringSlice |  | key ID or prefix to revoke (default: every active key) |
| `--yes`, `-y` |  |  | revoke without asking |

## caplo workspace api-client rotate

Add a new key to an API client and print it; its other keys stay active until revoked.

```sh
caplo workspace api-client rotate <client> [flags]
```

Adds a key to the API client and prints it on standard output, once. The client's other keys stay active, so CI keeps working while you replace the key; then revoke the old ones with caplo workspace api-client revoke &lt;client&gt; --except &lt;new key&gt;.

**Examples**

```sh
caplo workspace api-client rotate ci
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo workspace create

Create a workspace you own and select it.

```sh
caplo workspace create <name>
```

**Examples**

```sh
caplo workspace create "Shop staging"
```

## caplo workspace get

Show a workspace, by default the selected one.

```sh
caplo workspace get [name or ID] [flags]
```

**Examples**

```sh
caplo workspace get
caplo workspace get "Shop staging" -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo workspace list

List your workspaces.

```sh
caplo workspace list [flags]
```

Lists the workspaces you belong to with your role; * marks the selected one.

**Examples**

```sh
caplo workspace list
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo workspace use

Select the workspace for later commands.

```sh
caplo workspace use <name or ID>
```

Saves the workspace, by ID or exact name, as the one later commands act on. --workspace or CAPLO_WORKSPACE overrides it for one command.

**Examples**

```sh
caplo workspace use "Shop staging"
```
