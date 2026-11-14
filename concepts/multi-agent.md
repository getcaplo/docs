# Multi-agent

> How one agent delegates to sub-agents, the two ways a sub-agent can work, how child releases are pinned, and how routing chooses a sub-agent.

An agent can link other agents in the workspace as **sub-agents**. The agent a channel serves is the **entry agent**; it decides when to involve a sub-agent and which one. Splitting work this way keeps each agent’s instructions, tools and knowledge small and focused, for example a concierge that routes to separate orders, product and returns specialists.

Each link has a **Use when** description, which tells the parent when this sub-agent is the right choice, and an optional **Do not use when** description, which rules it out for requests that belong elsewhere. Write both as you would brief a colleague.

## Two ways a sub-agent can work

| In the console                        | In agent YAML               | What happens                                                                                                                                                                                                                               |
| ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Answers and returns to this agent** | `mode: task_tool`           | The parent asks the sub-agent in plain words, the sub-agent works with its own tools and knowledge, and returns an answer. The parent then replies to the customer. The sub-agent remembers its earlier requests in the same conversation. |
| **Takes over the conversation**       | `mode: active_conversation` | The entry agent hands the conversation to the sub-agent, which replies to the customer directly from the next message on until it hands the conversation back.                                                                             |

Use **Answers and returns** when the entry agent should stay in charge and combine answers, and **Takes over** when a specialist should run a longer exchange itself. Only the entry agent can hand the conversation over.

Whichever mode you choose, a sub-agent’s write actions are shown to the customer for confirmation in the same way as the entry agent’s. See [Tools and actions](/concepts/tools-and-actions/).

## Child releases are pinned

A link points at a specific published release of the child agent, and the child runs with the tools and knowledge pinned in that release, not its own current draft. A child must have a release before the parent can publish.

Publishing a new child release does not change a published parent. To use it, update the link in the parent’s draft and publish the parent again. In a CLI project, `release: latest` on a link resolves to the child’s newest release whenever you push or publish, and `caplo publish` republishes the parents of a child that changed, children first.

Agents can delegate further, up to a depth limit: by default at most three levels of sub-agents below an agent.

## Routing: the model or fast routing

The parent chooses a sub-agent in one of two ways:

* **The model decides.** The parent’s own model reads the conversation and either answers or calls a sub-agent. This is the default and needs no setup.
* **Fast routing.** A quick decision call picks the sub-agent before the parent’s model runs, in about 0.3 seconds instead of about 2 seconds. When the decision is below the agent’s minimum confidence, the model decides instead.

Fast routing has extra requirements, because a wrong route is costly:

* **Fast decisions** must be enabled for the workspace by an Owner or Admin. It sends the visitor’s recent messages and your sub-agent descriptions to OpenAI to choose a route. See [Fast decisions](/providers/fast-decisions/).
* Every link needs a **Do not use when** description.
* While evals are required, publishing needs passing eval cases that check the route to each sub-agent: two per sub-agent by default. See [Evaluations](/concepts/evaluations/).

## Related

* [Sub-agents and routing](/agents/sub-agents-and-routing/): how to link agents and set up routing.
* [Agents and releases](/concepts/agents-and-releases/)
* [Build your first agent with the CLI](/get-started/quickstart-cli/): a working multi-agent example.
