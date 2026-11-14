# Tune the agent loop

> Every policy field of an agent, with its range and default, and when to change it.

An agent’s `policy` controls how its loop runs on each turn: how many model calls, tool lookups and knowledge searches it may make, how much history it reads, and the platform text that follows your instructions. Every field is optional. A field you leave out takes the platform default, and publishing freezes that default into the release, so a release keeps the behavior it was tested with even if the defaults change later.

In the console, these settings are under **Setup > Advanced settings > Agent loop**. In an agent file they are the `policy` block:

```yaml
policy:
  maxModelCalls: 12
  maxReads: 6
  knowledgePassages: 4
  history:
    maxTokens: 24000
  reasoning:
    effort: low
```

## Limits per turn

A turn is one customer message and everything the agent does to answer it.

| Field               | Console label                     | Range   | Default | What it limits                                                                            |
| ------------------- | --------------------------------- | ------- | ------- | ----------------------------------------------------------------------------------------- |
| `maxModelCalls`     | **Model calls per turn**          | 1 to 48 | 16      | Model calls of the whole agent graph in one turn: the agent and every sub-agent it calls. |
| `maxReads`          | **Tool lookups per turn**         | 1 to 32 | 8       | Read tool calls in one turn.                                                              |
| `maxParallelReads`  | **Lookups at once**               | 1 to 8  | 4       | Read tool calls run at the same time.                                                     |
| `maxSearches`       | **Knowledge searches per turn**   | 1 to 16 | 4       | Knowledge searches in one turn.                                                           |
| `knowledgePassages` | **Passages per knowledge search** | 1 to 8  | 6       | Passages one knowledge search returns.                                                    |
| `maxDepth`          | **Linked agent depth**            | 1 to 4  | 3       | Sub-agent links below this agent. Checked when you validate and publish.                  |

When to change them:

* Lower `maxModelCalls` and `maxReads` to cap cost and latency on simple agents, or when an agent loops on a tool. Raise them for agents that need several lookups and sub-agent calls to answer one question.
* Raise `maxParallelReads` when an agent often looks up several independent things at once.
* Raise `knowledgePassages` when answers miss details that are in the documents; lower it when replies drift into unrelated passages. More passages mean more input tokens per search.
* Raise `maxDepth` only when your agent tree needs another level; every level adds latency.

## History

| Field               | Console label      | Range                   | Default                                                            |
| ------------------- | ------------------ | ----------------------- | ------------------------------------------------------------------ |
| `history.maxTokens` | **History budget** | 2,000 to 400,000 tokens | The model’s context window, less the response limit and a reserve. |

`history.maxTokens` is how much earlier conversation each turn reads. Set it to cut the cost of long conversations, at the risk of the agent forgetting what was said early on. Leave it out to use as much history as the model can take.

## Reasoning

| Field                            | Console label        | Values                                                                                                    |
| -------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| `reasoning.effort`               | **Reasoning effort** | `low`, `medium` or `high`. Used by models that take a reasoning effort; others ignore it.                 |
| `reasoning.thinkingBudgetTokens` | **Thinking budget**  | 1,024 to 32,000 tokens of extended thinking on Anthropic models. Must be smaller than the response limit. |

A `reasoning` block needs at least one of the two fields. Leave it out to use the model’s own behavior. See [Set instructions and model](/agents/instructions-and-model/#reasoning-settings).

## Platform text

Caplo adds up to two blocks of text after your instructions on each turn: guidance, and a reply style for the kind of turn (chat or voice). In the console each has a switch (**Platform guidance**, **Platform chat reply style**, **Platform voice reply style**). Turn the switch off to write your own text.

| Field        | Max length       | Default text                                                                                                                                                                                                                                                                                                      |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `guidance`   | 4,000 characters | “Use your tools to look up what you need before you answer. Answer questions about the business only from your instructions, this conversation and what your tools returned; when they do not cover a question, say so.”                                                                                          |
| `chatStyle`  | 2,000 characters | “You are replying in a chat: use short paragraphs, and a short list when it helps.”                                                                                                                                                                                                                               |
| `voiceStyle` | 2,000 characters | “You are speaking on a voice call: use brief, natural spoken sentences without Markdown, lists or visual references. Before you call tools to look something up, first say one short sentence telling the caller what you are checking, without stating any result. When you can answer right away, just answer.” |

* Leave a field out to use the default.
* Set your own text to replace the default.
* Set an empty string (`guidance: ""`) to send no block at all.

Replace the guidance when your agent may answer from general knowledge, for example a writing assistant, since the default tells it to answer only from its instructions, the conversation and its tools. Replace the chat style when your brand needs a different format, for example no lists.

## See also

* [Agent YAML reference](/reference/agent-yaml/) for the schema.
* [Usage and statements](/usage/usage-and-statements/) to see what model calls cost.
