---
title: Write eval cases for a Caplo agent
description: Adds focused eval cases to an agent file in this repository and runs them with caplo eval until they pass.
---
Goal: give the Caplo agent in <AGENT_FILE> (for example agents/support.yaml) a set of eval cases that cover its main jobs, its tools, its sub-agents and the mistakes it must not make, then run them until they pass.

Read these pages first:
- https://docs.caplo.si/agents/evals.md
- https://docs.caplo.si/agents/sub-agents-and-routing.md (if the agent has sub-agents)
- https://docs.caplo.si/reference/agent-yaml.md

Steps:
1. Read <AGENT_FILE>: its instructions, `tools`, `knowledgeBases`, `subAgents` and `routing`, and any existing `evals`. Read the tool packages it uses under the project's tools directory to learn what each tool returns.
2. Draft 5 to 15 cases under `evals:` as a YAML list (the CLI form, no `id` fields). Each case has a unique `name` (up to 80 characters), one customer message in `input`, and a `desiredOutcome` that states the correct decision or next step and the evidence it needs. A grader model judges every run against `desiredOutcome`, so make it specific and checkable.
3. Add automatic checks where they fit: `answerContains` or `answerExcludes` for a phrase that must or must not appear, `tool` (named as in the agent's `tools` list) for a tool the agent must call, `subAgent` and `avoidSubAgent` (file keys) for routing. Do not rely on `uncertainty` or `prohibitedAction`; runs do not check them, so put those expectations in `desiredOutcome` or `answerExcludes`.
4. Cover: each main task, each tool, a question the agent must decline or cannot answer, a request it must not fulfil (for example promising a refund), and a request for a person if `actions` includes `transfer`.
5. If `routing.mode` is `fast`, add at least two cases per sub-agent with `routedBy: fast` and `subAgent` naming it.
6. Validate offline: `caplo validate` in a project, or `caplo agent validate -f <AGENT_FILE>` for a single file. Fix every problem.
7. Show me the cases. After I approve them, run `caplo eval agent/<AGENT_KEY>`. This pushes the agent's draft and replaces its eval cases in the workspace, so ask before running it.
8. For each failing case, decide with me whether the agent or the case is wrong. Fix the instructions or the case, then run `caplo eval agent/<AGENT_KEY>` again.

Verify:
- `caplo eval agent/<AGENT_KEY>` exits with status 0 and prints ok for every case.

Rules:
- Never paste secrets, API keys or customer data into cases or this chat. Use made-up order numbers and names.
- Do not run `caplo publish` or `caplo agent publish`; ask me before anything that publishes.
- Do not weaken a case only to make it pass; tell me when a case exposes a real problem in the agent.
