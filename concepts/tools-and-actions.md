# Tools and actions

> How agents use tool packages and remote MCP servers, the difference between reads and writes, how customers confirm writes, and what each outcome means.

Tools let an agent look things up and take actions in your systems: check an order, find a free appointment slot, create a return. Caplo gets tools from two sources.

| Source                | What it is                                                                                                                                                                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool package**      | Code you write in TypeScript with the `@caplo/tools` SDK, either as a single function or as an MCP server with several tools. Caplo builds it, tests it, and runs it in an isolated sandbox that can reach only the hosts the package declares. Secrets are bound from workspace secrets, never stored in code. |
| **Remote MCP server** | An MCP server you already run, connected by URL with its authorization. You review its tools, classify each as a read or a write, and publish the reviewed set.                                                                                                                                                 |

Both become **immutable versions**. An agent release pins the exact version, so changing a tool’s code has no effect on customers until you publish a new tool version and then a new agent release. See [Agents and releases](/concepts/agents-and-releases/).

## Reads and writes

Every tool declares its **effect**.

* A **read** only looks something up. The agent calls it whenever it needs the information and uses the result straight away.
* A **write** changes something: it books, cancels, refunds or submits. By default (`confirmation: required`) a write never runs on the model’s say-so. The agent proposes the exact call, Caplo shows the customer what will happen, and the call runs only after the customer confirms. If the customer declines, nothing runs.

A write can set `confirmation: none` to run without asking, but use that only for low-risk changes the customer would always expect. Model output, documents and message text never grant permission to run a write.

The effect and confirmation come from your package’s `caplo.yaml`, or from your review of a remote MCP server’s tools, not from hints in the tool’s own code.

## Write outcomes

Once a confirmed write runs, the tool reports one of four outcomes:

| Outcome  | Meaning                                                                                 | What the customer sees                                                    |
| -------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Applied  | The change happened.                                                                    | Confirmation that the request succeeded.                                  |
| Rejected | Your system definitely did not make the change, for example because the slot was taken. | That the request did not go through.                                      |
| Pending  | Your system accepted the request but has not finished it.                               | That the outcome is not confirmed yet, and they should not send it again. |
| Unknown  | Caplo cannot tell whether the change happened, for example after a timeout or an error. | The same as pending.                                                      |

Caplo never retries a write blindly, because a retry could book or charge twice. For pending and unknown outcomes, a tool can provide a status check: Caplo asks it later about the original request and records the real outcome when the tool answers. If the outcome stays unknown, someone on your team should check your own system and follow up with the customer. While a write is unresolved, the agent cannot propose another write in the same conversation.

See [Write tools](/tools/write-tools/) for how to return these outcomes and add a status check.

## Human follow-up

Some requests should go to a person rather than a tool. An agent can hand the conversation to your team when its channel has a handoff destination, and your team can take over any text conversation from the console. See [Conversations and handoff](/concepts/conversations-and-handoff/).

## Related

* [Tools overview](/tools/) and [Write your first tool](/tools/first-tool/)
* [Connect a remote MCP server](/tools/remote-mcp/)
* [Give an agent tools](/agents/tools/)
* [Secrets and egress](/tools/secrets-and-egress/)
