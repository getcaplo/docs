# Build tools

> What tools are, the three ways to give agents tools, and how a tool version reaches a published agent.

A tool is a function an agent can call during a conversation: look up an order, check stock, book an appointment, cancel a subscription. Each tool has a name, a description the model reads, an input schema for its arguments and, optionally, an output schema for its result. Caplo runs the tool, checks its result against the schema, and hands the result to the agent.

Every tool also has a policy that you set, not the model:

* **Effect.** A `read` tool only looks things up. A `write` tool changes something, and by default runs only after the customer confirms it.
* **Timeout.** From 1 to 30 seconds.
* **Network and secrets.** A tool package reaches only the hosts it lists and receives only the secrets it declares.

## Three ways to provide tools

| Kind              | What you build                                                                 | Where it runs        | Choose it when                                                                                            |
| ----------------- | ------------------------------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------- |
| Function package  | One tool, written as a TypeScript function with `defineTool`                   | On Caplo, in Node 24 | You need a single tool, or you are wrapping one API call. This is the quickest start.                     |
| MCP package       | An MCP server with several tools, written with the official MCP TypeScript SDK | On Caplo, in Node 24 | You have several related tools that share code, or you want the same server to work in other MCP clients. |
| Remote MCP server | Nothing in Caplo; you connect an MCP server you or a vendor already runs       | On that server       | The tools already exist behind an HTTPS MCP endpoint, or they must run in your own infrastructure.        |

Function and MCP packages are both **tool packages**: a folder with a `caplo.yaml`, a `package.json` with a lockfile, and TypeScript source. You build and publish them with the `caplo` CLI or in Tool Studio, and Caplo hosts them. A remote MCP server stays where it is; Caplo calls it with the credential you configure and only for the tools you review and publish.

## How a tool reaches an agent

1. You publish a tool package build, or a reviewed remote MCP tool list, as a numbered **version**. A version never changes.
2. You select tools on the agent, in the console or in agent YAML as `<package>/<tool>`, for example `orders/get_order`.
3. When you publish the agent, its release **pins** the latest published version of each package it uses.

Publishing a new tool version does not change running agents. They keep calling the pinned version until you publish the agent again, which pins the newest version. Revoking a version is the exception: agents that pin it stop calling its tools at once. See [Give an agent tools](/agents/tools/) and [Agents and releases](/concepts/agents-and-releases/).

The model sees each tool as `<package>__<tool>` (hyphens in the package name become underscores), so tools from different packages never collide.

## Guides

[Build your first tool](/tools/first-tool/)Create, test, push and publish a function package with the CLI or in Tool Studio.

[Define tools and use the call context](/tools/define-tool-and-context/)defineTool, MCP packages, schemas, caplo.yaml and the per-call context.

[Write tools safely](/tools/write-tools/)Effects, customer confirmation, idempotency keys, outcomes and status checks.

[Secrets and network access](/tools/secrets-and-egress/)Declare secrets, set or bind their values, and allow the hosts a package calls.

[Show results to customers](/tools/present-results/)Cards, choices, details, timelines, receipts, files, progress and forms.

[Build customer-aware tools](/tools/customer-aware-tools/)Act for a verified customer and verify customer context tokens in your API.

[Test tools with fixtures](/tools/testing/)Run fixtures locally and on Caplo before you publish.

[Manage versions and read logs](/tools/versions-and-logs/)Builds, versions, revoking, archiving and live invocation logs.

[Connect a remote MCP server](/tools/remote-mcp/)Check, connect, review and publish the tools of an MCP server you already run.

[Tool limits](/tools/limits/)Runtime, timeouts, memory, sizes, network and log retention.
