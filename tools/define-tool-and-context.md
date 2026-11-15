# Define tools and use the call context

> Write function and MCP packages, design their schemas, read secrets and IDs from the call context, and set each tool's policy in caplo.yaml.

A tool package has two halves. The **code** defines each tool’s name, description and schemas, and does the work. **`caplo.yaml`** sets what Caplo enforces around it: effect, timeout, confirmation, network access and secrets. Caplo reads the tool list from your code when it builds the package and joins it with `caplo.yaml`; a tool without a policy, or a policy for a tool the code does not list, fails the build.

## Function packages

A function package has exactly one tool. Its entry file (`entry` in `caplo.yaml`, `src/tool.ts` by default) default-exports a `defineTool`:

```plaintext
import { defineTool } from "@caplo/tools";


type Input = { orderId: string };
type Output = { orderId: string; status: string; total: number; currency: string };


export default defineTool<Input, Output>({
  name: "get_order",
  description: "Look up an order by its number, for example SO-1002. Returns its status and total.",
  inputSchema: {
    type: "object",
    properties: { orderId: { type: "string", pattern: "^SO-[0-9]{4}$", description: "Order number" } },
    required: ["orderId"],
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    properties: {
      orderId: { type: "string" },
      status: { type: "string", enum: ["processing", "shipped", "delivered", "cancelled"] },
      total: { type: "number" },
      currency: { type: "string" },
    },
    required: ["orderId", "status", "total", "currency"],
  },
  async handler({ orderId }, { secrets, signal, log }) {
    const response = await fetch(`https://api.shop.example/orders/${encodeURIComponent(orderId)}`, {
      headers: { authorization: `Bearer ${secrets.get("SHOP_API_KEY")}` },
      signal,
    });
    if (!response.ok) throw new Error(`order lookup failed with ${response.status}`);
    const order = await response.json();
    log.info("order found", { orderId, status: order.status });
    return { orderId: order.id, status: order.status, total: order.total, currency: order.currency };
  },
});
```

| Field                | Notes                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | Lowercase letters, digits and underscores, starting with a letter, at most 48 characters.                                                                           |
| `description`        | What the tool does and when to use it. The model chooses tools by this text, so be specific.                                                                        |
| `inputSchema`        | A JSON Schema with `type: object`. Caplo validates arguments against it before your handler runs.                                                                   |
| `outputSchema`       | Optional JSON Schema with `type: object`. When set, a result that does not match fails the call. It is required for [result presentation](/tools/present-results/). |
| `handler(args, ctx)` | Receives the validated arguments and the [call context](#the-call-context).                                                                                         |
| `status`             | Optional, for write tools. See [Write tools safely](/tools/write-tools/#answer-status-checks).                                                                      |

What the handler returns becomes the tool result. A plain object becomes the structured result and its JSON text; a string becomes text. If the handler throws, the call returns the error message as an error result, and the model sees it.

Write schemas for the model as much as for validation: describe each property, use `enum` for fixed choices, `pattern` or `maxLength` for identifiers, and `additionalProperties: false` so the model cannot invent arguments. Return only the fields the agent needs; results over 256 KiB fail.

## MCP packages

An MCP package is an MCP server with one or more tools. Its entry file (`src/server.ts` by default) exports `createServer()`, which returns a server from the official MCP TypeScript SDK:

```plaintext
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { context } from "@caplo/tools";
import { z } from "zod";


export function createServer() {
  // The logging capability lets context(extra).log send log lines with each call's result.
  const server = new McpServer({ name: "orders", version: "1.0.0" }, { capabilities: { logging: {} } });


  server.registerTool(
    "get_order",
    {
      description: "Look up an order by its number, for example SO-1002.",
      inputSchema: { orderId: z.string().regex(/^SO-[0-9]{4}$/) },
      outputSchema: { orderId: z.string(), status: z.string() },
    },
    async ({ orderId }, extra) => {
      const { secrets, signal, log } = context(extra);
      const response = await fetch(`https://api.shop.example/orders/${encodeURIComponent(orderId)}`, {
        headers: { authorization: `Bearer ${secrets.get("SHOP_API_KEY")}` },
        signal,
      });
      if (!response.ok) throw new Error(`order lookup failed with ${response.status}`);
      const order = await response.json();
      log.info("order found", { orderId });
      const result = { orderId: order.id, status: order.status };
      return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
    },
  );


  return server;
}
```

Create the server with `capabilities: { logging: {} }`. Without it, log lines are dropped. Caplo ignores MCP tool annotations such as `readOnlyHint`; the effect comes from `caplo.yaml`.

### Run the server in other MCP clients

`caplo tool init` also writes `src/stdio.ts`, which runs the package over standard input and output with `serveStdio`. The same code then works in MCP Inspector, Claude Desktop or any other local MCP client:

```plaintext
import { serveStdio } from "@caplo/tools";
import { createServer } from "./server.ts";


await serveStdio(createServer, { secrets: ["SHOP_API_KEY"] });
```

`serveStdio` reads the listed secrets from environment variables of the same name. That is for local development only; on Caplo, secrets never come from the environment. `caplo tool dev --no-inspector` starts this file with Node 24. For a function package, `src/stdio.ts` calls `serveStdio(() => tool.createServer())`.

## The call context

A function handler receives the context as its second argument. In an MCP package, call `context(extra)` with the handler’s `extra` argument.

| Property                                         | What it is                                                                                                                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secrets.get(name)`                              | The value of a secret declared in `caplo.yaml`. Throws if the call has no value for it. `secrets.has(name)` checks first. See [Secrets and network access](/tools/secrets-and-egress/). |
| `log.debug`, `log.info`, `log.warn`, `log.error` | `(message, data?)`. Lines are kept with the invocation and shown by `caplo tool logs` and in test output. A log call never fails the tool.                                              |
| `signal`                                         | An `AbortSignal` that fires at the deadline or when the call is cancelled. Pass it to `fetch` and other I/O.                                                                            |
| `deadline`                                       | A `Date`: when the call times out.                                                                                                                                                      |
| `idempotencyKey`                                 | Write tools only. The same key for every attempt of one confirmed action. See [Write tools safely](/tools/write-tools/#use-the-idempotency-key).                                        |
| `invocationId`                                   | This call’s ID, also shown in `caplo tool logs`.                                                                                                                                        |
| `conversationId`, `turnId`                       | The conversation and turn the call belongs to.                                                                                                                                          |
| `workspaceId`, `packageVersionId`                | The workspace and the package version running.                                                                                                                                          |
| `subject`, `requireSubject()`                    | The verified customer, for tools that declare `subject`. See [Build customer-aware tools](/tools/customer-aware-tools/).                                                                |
| `canElicit`, `elicit()`                          | Function packages: ask the visitor for missing details. See [Ask for missing details](/tools/present-results/#ask-for-missing-details).                                                 |

Caution

Module-level variables persist between calls that run in the same worker, and those calls can belong to different conversations and customers. Never keep per-customer data in module scope. Caches of public data, such as a parsed price list, are fine.

`console.log` output is not part of your invocation logs. Use `log` from the context.

## caplo.yaml

| Field         | Required | Notes                                                                                                                             |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `apiVersion`  | Yes      | `v1` (also `v1.0` or `v1.0.0`).                                                                                                   |
| `kind`        | Yes      | `ToolPackage`.                                                                                                                    |
| `name`        | Yes      | Lowercase letters, digits and dashes, starting with a letter, 2 to 40 characters. Unique in the workspace and used in tool names. |
| `type`        | Yes      | `function` or `mcp`.                                                                                                              |
| `description` | No       | Up to 500 characters.                                                                                                             |
| `entry`       | Yes      | The entry module, for example `src/tool.ts` or `src/server.ts`.                                                                   |
| `runtime`     | Yes      | `node24`.                                                                                                                         |
| `tools`       | MCP only | One policy entry per tool the server lists, up to 64.                                                                             |
| `egress`      | No       | Hosts the package may call. Empty or absent means no network.                                                                     |
| `secrets`     | No       | Names of secrets the package reads.                                                                                               |
| `tests`       | No       | Glob of fixture files, default `tests/*.json`.                                                                                    |

Each `tools` entry, or for a function package the same fields at the top level:

| Field            | Required | Notes                                                                                                                                      |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`           | MCP only | The tool name as the server lists it.                                                                                                      |
| `effect`         | Yes      | `read` or `write`.                                                                                                                         |
| `timeoutSeconds` | Yes      | 1 to 30.                                                                                                                                   |
| `confirmation`   | No       | Write tools only: `required` (the default) or `none`. A read tool with `confirmation` fails the build.                                     |
| `subject`        | No       | The tool acts for a verified customer. See [Build customer-aware tools](/tools/customer-aware-tools/).                                     |
| `presentation`   | No       | What the customer sees: confirmation fields, receipts, result layouts and files. See [Show results to customers](/tools/present-results/). |
| `progress`       | No       | A status line while the tool runs.                                                                                                         |
| `elicitation`    | No       | Read tools only: fields the tool may ask the visitor for.                                                                                  |

A complete MCP package with a read tool and a write tool:

```plaintext
apiVersion: v1
kind: ToolPackage
name: orders
type: mcp
description: Order lookup and cancellation through the Shop API
entry: src/server.ts
runtime: node24
tools:
  - name: get_order
    effect: read
    timeoutSeconds: 5
    progress:
      label: Looking up your order
      spoken: Let me find that order.
  - name: cancel_order
    effect: write
    timeoutSeconds: 15
    confirmation: required
egress:
  - api.shop.example
secrets:
  - SHOP_API_KEY
tests: tests/*.json
```

For a function package, leave out `tools` and put the policy beside `name`:

```plaintext
apiVersion: v1
kind: ToolPackage
name: order-lookup
type: function
entry: src/tool.ts
runtime: node24
effect: read
timeoutSeconds: 5
egress:
  - api.shop.example
secrets:
  - SHOP_API_KEY
```

Every field is listed in the [caplo.yaml reference](/reference/caplo-yaml/). For completion and validation in your editor, add `# yaml-language-server: $schema=https://docs.caplo.si/schemas/caplo.schema.json` as the first line.

## Tool names

The model sees each tool as `<package>__<tool>`, with dashes in the package name turned into underscores: the `get_order` tool of `orders` is `orders__get_order`. That name must be at most 64 characters, or the build fails with `tool_name_invalid`. Agents and agent YAML refer to the tool as `orders/get_order`.
