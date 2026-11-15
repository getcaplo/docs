# Agent YAML

> Every field of an agent file (apiVersion v2.0.0), generated from the schema the CLI and console validate against.

Generated reference

Generated from the schema in `caplo` v0.4.1. Guide: [Agent YAML](/agents/agent-yaml/).

For validation and completion in your editor, add this first line to the file (YAML language server, used by VS Code and others):

```plaintext
# yaml-language-server: $schema=https://docs.caplo.si/schemas/agent-2.0.0.json
```

The schema is also published at [/schemas/agent-2.0.0.json](/schemas/agent-2.0.0.json).

## Agent file

A file with `kind: Agent` edits or creates one agent.

| Field              | Type                           | Required | Description                                                                                                                                                                               |
| ------------------ | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiVersion`       | string                         | Yes      | Pattern `^v2(?:\.0(?:\.0)?)?$`.                                                                                                                                                           |
| `kind`             | `"Agent"`                      | Yes      |                                                                                                                                                                                           |
| `evals`            | object                         |          | See [`evals`](#evals).                                                                                                                                                                    |
| `name`             | string                         | Yes      | Agent name shown throughout the workspace. At most 80 characters.                                                                                                                         |
| `description`      | string                         |          | Short explanation of what the agent helps with. At most 240 characters.                                                                                                                   |
| `instructions`     | string                         | Yes      | Reusable behavior, tone, and boundaries. No voice or channel settings.                                                                                                                    |
| `greeting`         | string                         | Yes      | Opening message when this agent serves a channel.                                                                                                                                         |
| `model`            | object                         | Yes      | Language model and response limits for this agent. See [`model`](#model).                                                                                                                 |
| `tools`            | array of string                |          | Stable IDs of workspace tools.                                                                                                                                                            |
| `knowledgeBases`   | array of string                |          | IDs of ready workspace knowledge bases referenced by this agent.                                                                                                                          |
| `actions`          | array of `"transfer"`, `"end"` |          | Agent-level conversation actions. Channel-specific workflows stay on the entry point.                                                                                                     |
| `subAgents`        | array of object                |          | Links to reusable agents. A linked agent may have sub-agents of its own. See [`subAgents`](#subagents).                                                                                   |
| `routing`          | object                         |          | How this agent picks a sub-agent. Omitted means model. See [`routing`](#routing).                                                                                                         |
| `policy`           | object                         |          | How the agent loop runs. Omitted fields take the platform defaults; an empty guidance or style turns that block off. See [`policy`](#policy).                                             |
| `suggestedReplies` | object                         |          | Short next messages offered under the replies this agent writes itself, on channels that can show them. Omit to turn them off. See [`suggestedReplies`](#suggestedreplies).               |
| `visitorFeedback`  | boolean                        |          | Let website visitors rate this agent’s replies with a thumbs up or down and an optional reason; operators see the ratings in Conversations and the agent never does. Omit to turn it off. |

Other fields are refused.

### `evals`

| Field   | Type            | Required | Description                                          |
| ------- | --------------- | -------- | ---------------------------------------------------- |
| `cases` | array of object | Yes      | At most 100 items. See [`evals.cases`](#evalscases). |

Other fields are refused.

#### `evals.cases`

| Field              | Type                         | Required | Description                                                                              |
| ------------------ | ---------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `id`               | string                       | Yes      | Pattern `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`. |
| `name`             | string                       | Yes      | At most 80 characters.                                                                   |
| `input`            | string                       | Yes      | At most 8000 characters.                                                                 |
| `desiredOutcome`   | string                       | Yes      | At most 4000 characters.                                                                 |
| `uncertainty`      | string                       |          |                                                                                          |
| `prohibitedAction` | string                       |          |                                                                                          |
| `toolFailure`      | string                       |          |                                                                                          |
| `answerContains`   | string                       |          |                                                                                          |
| `answerExcludes`   | string                       |          |                                                                                          |
| `subAgent`         | string                       |          |                                                                                          |
| `avoidSubAgent`    | string                       |          |                                                                                          |
| `tool`             | string                       |          |                                                                                          |
| `routedBy`         | `"fast"`, `"model"`, `"any"` |          |                                                                                          |

Other fields are refused.

### `model`

Language model and response limits for this agent.

| Field           | Type    | Required | Description                                                                                                                                    |
| --------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`      | string  | Yes      | Provider configured in this workspace. Example: OpenAI.                                                                                        |
| `name`          | string  | Yes      | Model ID or display name from this workspace’s catalog.                                                                                        |
| `temperature`   | number  |          | Lower values produce more consistent responses. From 0 to 1. Default `0.4`.                                                                    |
| `responseLimit` | integer |          | Maximum response tokens; the model’s tested maximum output bounds it when the agent is tested or published. From 64 to 128000. Default `1024`. |

Other fields are refused.

### `subAgents`

A reusable agent this agent may call. Use agentId for an existing agent or local for another agent in this bundle. The linked agent runs with its release’s own tools and knowledge.

| Field          | Type                                   | Required | Description                                                                                                                              |
| -------------- | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `agentId`      | string                                 |          | Stable ID of an existing workspace agent.                                                                                                |
| `local`        | string                                 |          | Key of an agent defined in this bundle.                                                                                                  |
| `release`      | string                                 |          | ‘latest’ resolves to a fixed child release when the parent publishes; or choose a fixed semantic version now. Default `"latest"`.        |
| `useWhen`      | string                                 | Yes      | When the parent should call this agent.                                                                                                  |
| `doNotUseWhen` | string                                 |          | Requests that should stay with the parent or another agent.                                                                              |
| `mode`         | `"task_tool"`, `"active_conversation"` |          | task_tool: this agent asks it in plain words and hears back. active_conversation: it takes over the conversation. Default `"task_tool"`. |

Other fields are refused.

### `routing`

How this agent picks a sub-agent. Omitted means model.

| Field           | Type                | Required | Description                                                                                                                                                                |
| --------------- | ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`          | `"model"`, `"fast"` | Yes      | model: the agent’s model decides. fast: a decision service picks a sub-agent in about 0.3 s and the model decides when unsure. fast needs doNotUseWhen on every sub-agent. |
| `minConfidence` | number              |          | Lowest decision confidence fast routing accepts before the model decides. From 0.6 to 0.99. Default `0.85`.                                                                |

Other fields are refused.

### `policy`

How the agent loop runs. Omitted fields take the platform defaults; an empty guidance or style turns that block off.

| Field               | Type    | Required | Description                                                               |
| ------------------- | ------- | -------- | ------------------------------------------------------------------------- |
| `guidance`          | string  |          | Platform guidance that follows the instructions. At most 4000 characters. |
| `chatStyle`         | string  |          | Reply style for chat turns. At most 2000 characters.                      |
| `voiceStyle`        | string  |          | Reply style for voice calls. At most 2000 characters.                     |
| `history`           | object  |          | See [`policy.history`](#policyhistory).                                   |
| `knowledgePassages` | integer |          | Passages one knowledge search returns. Default 6. From 1 to 8.            |
| `maxModelCalls`     | integer |          | Model calls of the whole agent graph per turn. Default 16. From 1 to 48.  |
| `maxReads`          | integer |          | Tool lookups per turn. Default 8. From 1 to 32.                           |
| `maxSearches`       | integer |          | Knowledge searches per turn. Default 4. From 1 to 16.                     |
| `maxDepth`          | integer |          | Linked agent depth. Default 3. From 1 to 4.                               |
| `maxParallelReads`  | integer |          | Lookups run at once. Default 4. From 1 to 8.                              |
| `reasoning`         | object  |          | See [`policy.reasoning`](#policyreasoning).                               |

Other fields are refused.

#### `policy.history`

| Field       | Type    | Required | Description                                                          |
| ----------- | ------- | -------- | -------------------------------------------------------------------- |
| `maxTokens` | integer | Yes      | Tokens of earlier conversation each turn reads. From 2000 to 400000. |

Other fields are refused.

#### `policy.reasoning`

| Field                  | Type                          | Required | Description                                                                    |
| ---------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------ |
| `effort`               | `"low"`, `"medium"`, `"high"` |          |                                                                                |
| `thinkingBudgetTokens` | integer                       |          | Extended thinking tokens; smaller than the response limit. From 1024 to 32000. |

Other fields are refused.

### `suggestedReplies`

Short next messages offered under the replies this agent writes itself, on channels that can show them. Omit to turn them off.

| Field      | Type    | Required | Description                                                                                                      |
| ---------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `maxCount` | integer |          | Most suggestions under one reply; 3 when omitted. WhatsApp, Messenger and Instagram show at most 3. From 1 to 4. |

Other fields are refused.

## Bundle file

A bundle holds several agents in one file, as the console exports them.

| Field        | Type            | Required | Description                                                                                                          |
| ------------ | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `apiVersion` | string          | Yes      | Pattern `^v2(?:\.0(?:\.0)?)?$`.                                                                                      |
| `kind`       | `"AgentBundle"` | Yes      |                                                                                                                      |
| `agents`     | array of object | Yes      | Agents to create together. Sub-agent links may refer to their local keys. At least 1 items. See [`agents`](#agents). |

Other fields are refused.

### `agents`

| Field              | Type                           | Required | Description                                                                                                                                                                               |
| ------------------ | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`              | string                         | Yes      | Local key used by other agents in this bundle. Pattern `^[a-z][a-z0-9-]*$`.                                                                                                               |
| `name`             | string                         | Yes      | Agent name shown throughout the workspace. At most 80 characters.                                                                                                                         |
| `description`      | string                         |          | Short explanation of what the agent helps with. At most 240 characters.                                                                                                                   |
| `instructions`     | string                         | Yes      | Reusable behavior, tone, and boundaries. No voice or channel settings.                                                                                                                    |
| `greeting`         | string                         | Yes      | Opening message when this agent serves a channel.                                                                                                                                         |
| `model`            | object                         | Yes      | Language model and response limits for this agent. See [`agents.model`](#agentsmodel).                                                                                                    |
| `tools`            | array of string                |          | Stable IDs of workspace tools.                                                                                                                                                            |
| `knowledgeBases`   | array of string                |          | IDs of ready workspace knowledge bases referenced by this agent.                                                                                                                          |
| `actions`          | array of `"transfer"`, `"end"` |          | Agent-level conversation actions. Channel-specific workflows stay on the entry point.                                                                                                     |
| `subAgents`        | array of object                |          | Links to reusable agents. A linked agent may have sub-agents of its own. See [`agents.subAgents`](#agentssubagents).                                                                      |
| `routing`          | object                         |          | How this agent picks a sub-agent. Omitted means model. See [`agents.routing`](#agentsrouting).                                                                                            |
| `evals`            | object                         |          | See [`agents.evals`](#agentsevals).                                                                                                                                                       |
| `policy`           | object                         |          | How the agent loop runs. Omitted fields take the platform defaults; an empty guidance or style turns that block off. See [`agents.policy`](#agentspolicy).                                |
| `suggestedReplies` | object                         |          | Short next messages offered under the replies this agent writes itself, on channels that can show them. Omit to turn them off. See [`agents.suggestedReplies`](#agentssuggestedreplies).  |
| `visitorFeedback`  | boolean                        |          | Let website visitors rate this agent’s replies with a thumbs up or down and an optional reason; operators see the ratings in Conversations and the agent never does. Omit to turn it off. |

Other fields are refused.

#### `agents.model`

Language model and response limits for this agent.

| Field           | Type    | Required | Description                                                                                                                                    |
| --------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`      | string  | Yes      | Provider configured in this workspace. Example: OpenAI.                                                                                        |
| `name`          | string  | Yes      | Model ID or display name from this workspace’s catalog.                                                                                        |
| `temperature`   | number  |          | Lower values produce more consistent responses. From 0 to 1. Default `0.4`.                                                                    |
| `responseLimit` | integer |          | Maximum response tokens; the model’s tested maximum output bounds it when the agent is tested or published. From 64 to 128000. Default `1024`. |

Other fields are refused.

#### `agents.subAgents`

A reusable agent this agent may call. Use agentId for an existing agent or local for another agent in this bundle. The linked agent runs with its release’s own tools and knowledge.

| Field          | Type                                   | Required | Description                                                                                                                              |
| -------------- | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `agentId`      | string                                 |          | Stable ID of an existing workspace agent.                                                                                                |
| `local`        | string                                 |          | Key of an agent defined in this bundle.                                                                                                  |
| `release`      | string                                 |          | ‘latest’ resolves to a fixed child release when the parent publishes; or choose a fixed semantic version now. Default `"latest"`.        |
| `useWhen`      | string                                 | Yes      | When the parent should call this agent.                                                                                                  |
| `doNotUseWhen` | string                                 |          | Requests that should stay with the parent or another agent.                                                                              |
| `mode`         | `"task_tool"`, `"active_conversation"` |          | task_tool: this agent asks it in plain words and hears back. active_conversation: it takes over the conversation. Default `"task_tool"`. |

Other fields are refused.

#### `agents.routing`

How this agent picks a sub-agent. Omitted means model.

| Field           | Type                | Required | Description                                                                                                                                                                |
| --------------- | ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`          | `"model"`, `"fast"` | Yes      | model: the agent’s model decides. fast: a decision service picks a sub-agent in about 0.3 s and the model decides when unsure. fast needs doNotUseWhen on every sub-agent. |
| `minConfidence` | number              |          | Lowest decision confidence fast routing accepts before the model decides. From 0.6 to 0.99. Default `0.85`.                                                                |

Other fields are refused.

#### `agents.evals`

| Field   | Type            | Required | Description                                                       |
| ------- | --------------- | -------- | ----------------------------------------------------------------- |
| `cases` | array of object | Yes      | At most 100 items. See [`agents.evals.cases`](#agentsevalscases). |

Other fields are refused.

#### `agents.evals.cases`

| Field              | Type                         | Required | Description                                                                              |
| ------------------ | ---------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `id`               | string                       | Yes      | Pattern `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`. |
| `name`             | string                       | Yes      | At most 80 characters.                                                                   |
| `input`            | string                       | Yes      | At most 8000 characters.                                                                 |
| `desiredOutcome`   | string                       | Yes      | At most 4000 characters.                                                                 |
| `uncertainty`      | string                       |          |                                                                                          |
| `prohibitedAction` | string                       |          |                                                                                          |
| `toolFailure`      | string                       |          |                                                                                          |
| `answerContains`   | string                       |          |                                                                                          |
| `answerExcludes`   | string                       |          |                                                                                          |
| `subAgent`         | string                       |          |                                                                                          |
| `avoidSubAgent`    | string                       |          |                                                                                          |
| `tool`             | string                       |          |                                                                                          |
| `routedBy`         | `"fast"`, `"model"`, `"any"` |          |                                                                                          |

Other fields are refused.

#### `agents.policy`

How the agent loop runs. Omitted fields take the platform defaults; an empty guidance or style turns that block off.

| Field               | Type    | Required | Description                                                               |
| ------------------- | ------- | -------- | ------------------------------------------------------------------------- |
| `guidance`          | string  |          | Platform guidance that follows the instructions. At most 4000 characters. |
| `chatStyle`         | string  |          | Reply style for chat turns. At most 2000 characters.                      |
| `voiceStyle`        | string  |          | Reply style for voice calls. At most 2000 characters.                     |
| `history`           | object  |          | See [`agents.policy.history`](#agentspolicyhistory).                      |
| `knowledgePassages` | integer |          | Passages one knowledge search returns. Default 6. From 1 to 8.            |
| `maxModelCalls`     | integer |          | Model calls of the whole agent graph per turn. Default 16. From 1 to 48.  |
| `maxReads`          | integer |          | Tool lookups per turn. Default 8. From 1 to 32.                           |
| `maxSearches`       | integer |          | Knowledge searches per turn. Default 4. From 1 to 16.                     |
| `maxDepth`          | integer |          | Linked agent depth. Default 3. From 1 to 4.                               |
| `maxParallelReads`  | integer |          | Lookups run at once. Default 4. From 1 to 8.                              |
| `reasoning`         | object  |          | See [`agents.policy.reasoning`](#agentspolicyreasoning).                  |

Other fields are refused.

#### `agents.policy.history`

| Field       | Type    | Required | Description                                                          |
| ----------- | ------- | -------- | -------------------------------------------------------------------- |
| `maxTokens` | integer | Yes      | Tokens of earlier conversation each turn reads. From 2000 to 400000. |

Other fields are refused.

#### `agents.policy.reasoning`

| Field                  | Type                          | Required | Description                                                                    |
| ---------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------ |
| `effort`               | `"low"`, `"medium"`, `"high"` |          |                                                                                |
| `thinkingBudgetTokens` | integer                       |          | Extended thinking tokens; smaller than the response limit. From 1024 to 32000. |

Other fields are refused.

#### `agents.suggestedReplies`

Short next messages offered under the replies this agent writes itself, on channels that can show them. Omit to turn them off.

| Field      | Type    | Required | Description                                                                                                      |
| ---------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `maxCount` | integer |          | Most suggestions under one reply; 3 when omitted. WhatsApp, Messenger and Instagram show at most 3. From 1 to 4. |

Other fields are refused.
