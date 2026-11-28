---
title: "caplo mcp"
description: "Connect remote MCP servers and publish their reviewed tools."
editUrl: false
sidebar:
  order: 10
  label: "mcp"
---

:::note[Generated reference]
Generated from `caplo` v0.8.0, the latest release. `caplo mcp --help` prints the same text.
:::

Connect remote MCP servers and publish their reviewed tools.

```sh
caplo mcp
```

A remote MCP server is an MCP server reachable over HTTPS whose tools agents can call. Add it with caplo mcp add, authorize it with caplo mcp connect when it uses OAuth, review its discovered tools with caplo mcp review, and publish them with caplo mcp publish. Agent files then name them &lt;server&gt;/&lt;tool&gt;. A server is named by its name or ID. Secrets are read only from standard input or an environment variable, so they stay out of shell history and process listings, and are never shown again.

**Examples**

```sh
caplo mcp check https://mcp.example.com/mcp
caplo mcp add crm --url https://mcp.example.com/mcp --auth oauth
caplo mcp connect crm --open
caplo mcp review crm --enable search_contacts=read && caplo mcp publish crm
```

**Commands**

- [`caplo mcp add`](#caplo-mcp-add)
- [`caplo mcp check`](#caplo-mcp-check)
- [`caplo mcp connect`](#caplo-mcp-connect)
- [`caplo mcp get`](#caplo-mcp-get)
- [`caplo mcp list`](#caplo-mcp-list)
- [`caplo mcp publish`](#caplo-mcp-publish)
- [`caplo mcp refresh`](#caplo-mcp-refresh)
- [`caplo mcp remove`](#caplo-mcp-remove)
- [`caplo mcp review`](#caplo-mcp-review)
- [`caplo mcp tools`](#caplo-mcp-tools)
- [`caplo mcp update`](#caplo-mcp-update)

## caplo mcp add

Add a remote MCP server; its name prefixes every tool's model name.

```sh
caplo mcp add <name> [flags]
```

Adds a remote MCP server. Its name matches [a-z][a-z0-9-]{1,39}, must differ from every package and server in the workspace, and prefixes every tool's model name. --auth is none, bearer, header (with --header-name), or oauth. A bearer token or header value comes from --secret-stdin or --secret-env.

With --auth oauth the client is registered through a Client ID Metadata Document or dynamic registration, unless --client-id names a pre-registered client; its secret comes from --client-secret-stdin or --client-secret-env, and it must allow the callback URL that caplo mcp get shows. --oauth-grant is authorization_code, authorized with caplo mcp connect, or client_credentials. The command prints the server's status and what to do next.

**Examples**

```sh
caplo mcp add crm --url https://mcp.example.com/mcp --auth oauth
CRM_TOKEN=... caplo mcp add crm --url https://mcp.example.com/mcp --auth bearer --secret-env CRM_TOKEN
caplo mcp add erp --url https://erp.example.com/mcp --auth header --header-name X-Api-Key --secret-stdin
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--auth` | string |  | authentication: none, bearer, header, or oauth |
| `--client-id` | string |  | pre-registered OAuth client ID (default: a Client ID Metadata Document or dynamic registration) |
| `--client-secret-env` | string |  | read the pre-registered client's secret from this environment variable |
| `--client-secret-stdin` |  |  | read the pre-registered client's secret from stdin |
| `--description` | string |  | what the server is for |
| `--display-name` | string |  | name shown in the console (default: the name) |
| `--header-name` | string |  | credential header of --auth header |
| `--oauth-grant` | string | `authorization_code` | OAuth grant: authorization_code or client_credentials; update keeps the current one unless set |
| `--scope` | stringArray |  | OAuth scope to request, repeatable (default: the server's) |
| `--secret-env` | string |  | read the bearer token or header value from this environment variable |
| `--secret-stdin` |  |  | read the bearer token or header value from stdin (a hidden prompt on a terminal) |
| `--token-auth-method` | string |  | token endpoint authentication: none, client_secret_basic, or client_secret_post |
| `--transport` | string |  | auto, streamable_http, or sse (default auto) |
| `--url` | string |  | HTTPS endpoint of the server |

## caplo mcp check

Check a remote MCP server without saving it: transport, protocol, tools, and OAuth discovery.

```sh
caplo mcp check <url> [flags]
```

Has Caplo probe a server URL without saving anything: whether it is reachable, its transport, protocol, and tool count, and, when it needs authorization, what OAuth discovery found. A bearer token or header value for the check is read from standard input and not stored.

**Examples**

```sh
caplo mcp check https://mcp.example.com/mcp
printf %s "$CRM_TOKEN" | caplo mcp check https://mcp.example.com/mcp --bearer-stdin
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--bearer-stdin` |  |  | check with a bearer token read from stdin; it is not stored |
| `--header` | string |  | check with a credential in this header, its value read with --value-stdin |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
| `--transport` | string |  | auto, streamable_http, or sse (default auto) |
| `--value-stdin` |  |  | read the --header value from stdin; it is not stored |

## caplo mcp connect

Authorize a remote MCP server that uses OAuth.

```sh
caplo mcp connect <name|id> [flags]
```

Authorize a remote MCP server that uses OAuth. For the authorization code grant, open the printed URL in a browser signed in to the Caplo console: the authorization server redirects to the console, which completes the authorization. The command waits for it unless --wait is 0, retrying network and 5xx failures while it checks. The client credentials grant completes at once.

**Examples**

```sh
caplo mcp connect crm --open
caplo mcp connect crm --wait 0
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--open` |  |  | open the authorization URL in the default browser |
| `--wait` | duration | `10m0s` | how long to wait for the authorization; 0 returns at once |

## caplo mcp get

Show a remote MCP server: status, authentication, last error, and its discovered tools.

```sh
caplo mcp get <name|id> [flags]
```

Shows the server's status, transport and protocol, authentication without secrets, last error, published version, and its discovered tools with their review, change, and published state. For OAuth it shows the callback URL a pre-registered client must allow.

**Examples**

```sh
caplo mcp get crm
caplo mcp get crm -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo mcp list

List the workspace's remote MCP servers.

```sh
caplo mcp list [flags]
```

**Examples**

```sh
caplo mcp list
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo mcp publish

Pin the enabled tools of the latest tool list as a new version that agents can use.

```sh
caplo mcp publish <name|id>
```

Pins the enabled tools of the latest tool list, as reviewed, as a new version. It fails when the tool list changed since the review; check it with caplo mcp tools, review it again, and publish. Agent files name the tools &lt;server&gt;/&lt;tool&gt;.

**Examples**

```sh
caplo mcp publish crm
```

## caplo mcp refresh

Test a remote MCP server and refresh its tool list against the published version.

```sh
caplo mcp refresh <name|id>
```

Connects to the server, lists its tools again, and marks each new, changed, or removed against the published version. Published tools that changed on the server are blocked until they are reviewed and published again.

**Examples**

```sh
caplo mcp refresh crm
```

## caplo mcp remove

Remove a remote MCP server: its published tools stop working and its credentials are deleted.

```sh
caplo mcp remove <name|id> [flags]
```

Removes a remote MCP server. Its published tools stop working for every agent that uses them, its stored credentials are deleted, and its name stays reserved. It asks first; --yes skips the question.

**Examples**

```sh
caplo mcp remove crm --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo mcp review

Enable, classify, and configure discovered tools; nothing reaches agents until caplo mcp publish.

```sh
caplo mcp review <name|id> [flags]
```

Enable, classify, and configure discovered tools by their remote name. --enable without an effect keeps the tool's effect, or takes the one the server's hints suggest. Write tools ask the customer to confirm unless --confirmation &lt;tool&gt;=none. --timeout takes 1 to 30 seconds. Tools not named keep their review. Nothing reaches agents until caplo mcp publish.

**Examples**

```sh
caplo mcp review crm --enable search_contacts=read --enable create_note=write
caplo mcp review crm --confirmation create_note=none --timeout create_note=20
caplo mcp review crm --disable delete_contact
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--confirmation` | stringArray |  | for a write tool, &lt;remote tool&gt;=required\|none, repeatable |
| `--disable` | stringArray |  | disable a tool by its remote name, repeatable |
| `--enable` | stringArray |  | enable a tool, as &lt;remote tool&gt;[=read\|write], repeatable |
| `--timeout` | stringArray |  | &lt;remote tool&gt;=&lt;seconds from 1 to 30&gt;, repeatable |

## caplo mcp tools

List a remote MCP server's discovered tools with their review and publish state.

```sh
caplo mcp tools <name|id> [flags]
```

**Examples**

```sh
caplo mcp tools crm
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo mcp update

Change a remote MCP server's endpoint, transport, or authentication.

```sh
caplo mcp update <name|id> [flags]
```

Change a remote MCP server's endpoint, transport, or authentication. Authentication flags change the current setup; a stored secret is kept unless a new one is given. A new URL or authentication setup discards stored OAuth tokens and clients, so the server must be authorized again with caplo mcp connect.

**Examples**

```sh
caplo mcp update crm --url https://mcp.example.com/v2/mcp
caplo mcp update crm --scope contacts.read --scope contacts.write
printf %s "$NEW_TOKEN" | caplo mcp update erp --secret-stdin
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--auth` | string |  | authentication: none, bearer, header, or oauth |
| `--client-id` | string |  | pre-registered OAuth client ID (default: a Client ID Metadata Document or dynamic registration) |
| `--client-secret-env` | string |  | read the pre-registered client's secret from this environment variable |
| `--client-secret-stdin` |  |  | read the pre-registered client's secret from stdin |
| `--description` | string |  | what the server is for |
| `--display-name` | string |  | name shown in the console |
| `--header-name` | string |  | credential header of --auth header |
| `--oauth-grant` | string | `authorization_code` | OAuth grant: authorization_code or client_credentials; update keeps the current one unless set |
| `--scope` | stringArray |  | OAuth scope to request, repeatable (default: the server's) |
| `--secret-env` | string |  | read the bearer token or header value from this environment variable |
| `--secret-stdin` |  |  | read the bearer token or header value from stdin (a hidden prompt on a terminal) |
| `--token-auth-method` | string |  | token endpoint authentication: none, client_secret_basic, or client_secret_post |
| `--transport` | string |  | auto, streamable_http, or sse |
| `--url` | string |  | HTTPS endpoint of the server |
