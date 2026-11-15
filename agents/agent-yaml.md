# Define an agent in YAML

> Write an agent as a YAML file, edit it in the console's YAML editor or with caplo agent, and move a console agent into a CLI project.

Everything on an agent’s **Setup**, **Tools & actions**, **Knowledge** and **Sub-agents** tabs can be written as one YAML file. The console’s YAML editor and the `caplo` CLI read the same format, so you can keep agents in a repository, review changes in pull requests, and publish from CI. Every field is listed in the [Agent YAML reference](/reference/agent-yaml/).

## The agent file

An agent file is one YAML document with `apiVersion: "v2.0.0"` (`v2` and `v2.0` also work; `v1` files are refused), `kind: Agent`, and the agent’s fields. This file defines a support agent with two tools, a knowledge base, a returns sub-agent and human handoff:

```plaintext
apiVersion: "v2.0.0"
kind: Agent
name: Support Desk
description: Answers order and returns questions for Northwind customers.
instructions: |-
  You are the Northwind support agent.
  Answer questions about orders, delivery and returns.
  Look orders up with the order tools before you describe their status.
  If you cannot find an answer, say so and offer to connect the customer with a person.
greeting: Hi, I'm the Northwind support agent. How can I help with your order today?
model:
  provider: Anthropic
  name: claude-haiku-4-5-20251001
  temperature: 0.3
  responseLimit: 800
tools:
  - order-desk/lookup_order
  - order-desk/track_shipment
knowledgeBases:
  - Returns policy
actions:
  - transfer
subAgents:
  - agentId: 6f0c2a8e-4b1d-4e7a-9c3f-2d5b8a1e7f40
    release: latest
    useWhen: The customer asks how returns, exchanges or refunds work in general.
    doNotUseWhen: Questions about a specific order.
    mode: task_tool
policy:
  maxModelCalls: 12
  knowledgePassages: 4
  reasoning:
    thinkingBudgetTokens: 2048
suggestedReplies:
  maxCount: 3
visitorFeedback: true
```

| Field                                                      | Guide                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `name`, `description`, `instructions`, `greeting`, `model` | [Set instructions and model](/agents/instructions-and-model/)                |
| `tools`                                                    | [Give an agent tools](/agents/tools/)                                        |
| `knowledgeBases`                                           | [Add knowledge](/agents/knowledge/)                                          |
| `subAgents`, `routing`                                     | [Add sub-agents and routing](/agents/sub-agents-and-routing/)                |
| `actions`                                                  | [Hand off to a person or end a call](/agents/handoff-and-end-actions/)       |
| `policy`                                                   | [Tune the agent loop](/agents/policy-and-limits/)                            |
| `suggestedReplies`, `visitorFeedback`                      | [Offer suggested replies and collect ratings](/agents/replies-and-feedback/) |
| `evals`                                                    | [Write and run evals](/agents/evals/)                                        |

Voice settings are set in the console and are not part of the file; applying or pushing a file keeps the agent’s voice settings as they are.

For validation and completion in your editor, add this first line to the file:

```plaintext
# yaml-language-server: $schema=https://docs.caplo.si/schemas/agent-2.0.0.json
```

## Edit an agent as YAML in the console

1. Open the agent and, next to **Build with**, select **YAML editor**. The editor shows the current draft, with schema suggestions (Ctrl+Space).
2. Edit the YAML, or paste a file over it. The side panel lists **Existing agent IDs** to use in `subAgents`, an **Agent map** of the links, and **Validation** problems.
3. Select **Validate**, then **Review changes**. The review lists the fields that will change.
4. Select **Apply to draft**, then **Save draft**. Save and publish remain separate steps.

**Export YAML** downloads the draft as `<agent-id>.yaml`. While YAML edits are not applied, the agent cannot be saved or published; apply or discard them first.

The console’s YAML includes the agent’s eval cases as `evals: {cases: [...]}`. Applying YAML saves the cases at once, outside the draft: an empty `cases` list deletes every case, and a file without `evals` leaves them unchanged.

## Work with agent files in the CLI

```plaintext
caplo agent init -f support.yaml --name "Support Desk"
caplo agent validate -f support.yaml
caplo agent push -f support.yaml --dry-run
caplo agent push -f support.yaml
caplo agent pull "Support Desk" -f support.yaml
```

| Command                | What it does                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caplo agent init`     | Writes a starter file with one eval case.                                                                                                                                   |
| `caplo agent validate` | Checks the file offline against the schema, its references and the link rules. Exits with status 3 on problems.                                                             |
| `caplo agent push`     | Saves the file as the agent’s draft, creating the agent if no agent has that name, and replaces its eval cases when the file has `evals`. `--dry-run` prints the diff only. |
| `caplo agent pull`     | Writes the draft exactly as the console’s **Export YAML** does, without eval cases.                                                                                         |

To create a new agent from a file, push it with the CLI. In a project, `caplo validate`, `caplo diff`, `caplo push` and `caplo publish` work on all agent files at once; see [Projects](/cli/projects/).

## Console and CLI formats

The two surfaces write some fields differently. A project file is portable across workspaces; a console export names workspace IDs.

| Field            | Console export and `caplo agent pull`                | Project agent file                                                                   |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `tools`          | Package IDs: `<package ID>/<tool>` or `<package ID>` | Names: `<package>/<tool>`, `<package>`, or `<server>/<tool>` for a remote MCP server |
| `subAgents`      | `agentId`                                            | `local: <file key>` for project agents, `agentId` for others                         |
| `knowledgeBases` | IDs                                                  | Names or IDs                                                                         |
| `evals`          | `evals: {cases: [...]}`, each case with an `id`      | A list of cases matched by `name`                                                    |

The CLI accepts both forms. A console export keeps its case IDs when you push it with `caplo agent push`; in a project, the list form matched by name is the convention, and `caplo pull` writes it.

## Move a console agent into a CLI project

`caplo pull` writes a workspace agent, every sub-agent it links, their eval cases, and the tool packages they use into a project:

```plaintext
caplo pull "agent/Support Desk" ./support
cd support
caplo validate
caplo diff
```

* With a directory that has no `caplo.yaml`, it creates a new project there. Without a directory, it uses the project above the current directory, or creates one in it.
* Each agent goes to its own file in the directory the project’s `agents` glob names; an agent the project already defines is written to its existing file.
* Tool packages the project lacks are pulled from their workspace drafts into the directory the `tools` glob names. Remote MCP server tools stay `<server>/<tool>`.
* Sub-agent links name the release the draft pins, since a draft does not record `release: latest`. Change them to `latest` if you want children to follow their newest release.

`caplo diff` should then show no changes. From here, edit the files and use `caplo push` and `caplo publish`; see [The CLI workflow](/cli/workflow/).

AI prompt

Move a console agent into this repository

Pulls an agent built in the Caplo console, with its sub-agents, eval cases and tool packages, into a caplo project and checks it matches the workspace.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20bring%20the%20Caplo%20agent%20%3CAGENT_NAME%3E%2C%20built%20in%20the%20console%2C%20into%20this%20repository%20as%20a%20caplo%20project%20at%20%3CPROJECT_DIR%3E%2C%20so%20the%20team%20can%20review%20and%20publish%20it%20from%20version%20control.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fagents%2Fagent-yaml.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fworkflow.md%0A%0ASteps%3A%0A1.%20Run%20%60caplo%20auth%20status%60.%20If%20it%20is%20not%20signed%20in%20to%20the%20right%20workspace%2C%20ask%20me%20to%20run%20%60caplo%20auth%20login%60%20and%20%60caplo%20workspace%20use%20%3CWORKSPACE%3E%60%3B%20never%20handle%20my%20password.%0A2.%20Run%20%60caplo%20agent%20list%60%20and%20confirm%20the%20exact%20agent%20name%20with%20me.%0A3.%20Pull%20it%3A%20%60caplo%20pull%20%22agent%2F%3CAGENT_NAME%3E%22%20%3CPROJECT_DIR%3E%60.%20This%20writes%20caplo.yaml%20\(if%20the%20directory%20has%20none\)%2C%20one%20file%20per%20agent%20under%20agents%2F%2C%20its%20eval%20cases%2C%20and%20any%20tool%20packages%20the%20agents%20use%20under%20tools%2F.%20Remote%20MCP%20server%20tools%20stay%20as%20%3Cserver%3E%2F%3Ctool%3E.%0A4.%20For%20each%20pulled%20tool%20package%2C%20install%20its%20dependencies%20\(%60npm%20install%60%20in%20its%20directory\)%20and%20run%20%60caplo%20test%60%20from%20the%20project%20root%20to%20run%20the%20package%20fixtures%20locally.%0A5.%20Run%20%60caplo%20validate%60%2C%20then%20%60caplo%20diff%60.%20Right%20after%20a%20pull%2C%20%60caplo%20diff%60%20should%20report%20no%20changes%3B%20if%20it%20does%20not%2C%20show%20me%20the%20diff%20and%20stop.%0A6.%20Review%20the%20sub-agent%20links%3A%20%60caplo%20pull%60%20writes%20the%20exact%20child%20release%20each%20link%20pins.%20Ask%20me%20whether%20any%20link%20should%20follow%20the%20child's%20newest%20release%20with%20%60release%3A%20latest%60%20instead%2C%20and%20change%20only%20the%20ones%20I%20name.%0A7.%20Add%20a%20.gitignore%20that%20excludes%20node_modules%2C%20and%20commit%20the%20project%20on%20a%20new%20branch.%20Do%20not%20push%20or%20open%20a%20pull%20request%20unless%20I%20ask.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20passes%20and%20%60caplo%20diff%60%20shows%20only%20the%20changes%20I%20approved.%0A-%20Every%20agent%20file%20has%20its%20eval%20cases%20under%20%60evals%3A%60.%0A%0ARules%3A%0A-%20Never%20put%20API%20keys%2C%20secrets%20or%20tokens%20in%20files%20or%20this%20chat.%20Tool%20secrets%20stay%20in%20Caplo%20\(%60caplo%20tool%20secret%20set%60\)%3B%20do%20not%20copy%20their%20values%20anywhere.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20publish%60%20or%20%60caplo%20channel%20deploy%60%3B%20they%20change%20the%20workspace.%20Ask%20me%20first.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20bring%20the%20Caplo%20agent%20%3CAGENT_NAME%3E%2C%20built%20in%20the%20console%2C%20into%20this%20repository%20as%20a%20caplo%20project%20at%20%3CPROJECT_DIR%3E%2C%20so%20the%20team%20can%20review%20and%20publish%20it%20from%20version%20control.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fagents%2Fagent-yaml.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fworkflow.md%0A%0ASteps%3A%0A1.%20Run%20%60caplo%20auth%20status%60.%20If%20it%20is%20not%20signed%20in%20to%20the%20right%20workspace%2C%20ask%20me%20to%20run%20%60caplo%20auth%20login%60%20and%20%60caplo%20workspace%20use%20%3CWORKSPACE%3E%60%3B%20never%20handle%20my%20password.%0A2.%20Run%20%60caplo%20agent%20list%60%20and%20confirm%20the%20exact%20agent%20name%20with%20me.%0A3.%20Pull%20it%3A%20%60caplo%20pull%20%22agent%2F%3CAGENT_NAME%3E%22%20%3CPROJECT_DIR%3E%60.%20This%20writes%20caplo.yaml%20\(if%20the%20directory%20has%20none\)%2C%20one%20file%20per%20agent%20under%20agents%2F%2C%20its%20eval%20cases%2C%20and%20any%20tool%20packages%20the%20agents%20use%20under%20tools%2F.%20Remote%20MCP%20server%20tools%20stay%20as%20%3Cserver%3E%2F%3Ctool%3E.%0A4.%20For%20each%20pulled%20tool%20package%2C%20install%20its%20dependencies%20\(%60npm%20install%60%20in%20its%20directory\)%20and%20run%20%60caplo%20test%60%20from%20the%20project%20root%20to%20run%20the%20package%20fixtures%20locally.%0A5.%20Run%20%60caplo%20validate%60%2C%20then%20%60caplo%20diff%60.%20Right%20after%20a%20pull%2C%20%60caplo%20diff%60%20should%20report%20no%20changes%3B%20if%20it%20does%20not%2C%20show%20me%20the%20diff%20and%20stop.%0A6.%20Review%20the%20sub-agent%20links%3A%20%60caplo%20pull%60%20writes%20the%20exact%20child%20release%20each%20link%20pins.%20Ask%20me%20whether%20any%20link%20should%20follow%20the%20child's%20newest%20release%20with%20%60release%3A%20latest%60%20instead%2C%20and%20change%20only%20the%20ones%20I%20name.%0A7.%20Add%20a%20.gitignore%20that%20excludes%20node_modules%2C%20and%20commit%20the%20project%20on%20a%20new%20branch.%20Do%20not%20push%20or%20open%20a%20pull%20request%20unless%20I%20ask.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20passes%20and%20%60caplo%20diff%60%20shows%20only%20the%20changes%20I%20approved.%0A-%20Every%20agent%20file%20has%20its%20eval%20cases%20under%20%60evals%3A%60.%0A%0ARules%3A%0A-%20Never%20put%20API%20keys%2C%20secrets%20or%20tokens%20in%20files%20or%20this%20chat.%20Tool%20secrets%20stay%20in%20Caplo%20\(%60caplo%20tool%20secret%20set%60\)%3B%20do%20not%20copy%20their%20values%20anywhere.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20publish%60%20or%20%60caplo%20channel%20deploy%60%3B%20they%20change%20the%20workspace.%20Ask%20me%20first.)

Show prompt

```
Goal: bring the Caplo agent <AGENT_NAME>, built in the console, into this repository as a caplo project at <PROJECT_DIR>, so the team can review and publish it from version control.

Read these pages first:
- https://docs.caplo.si/agents/agent-yaml.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/cli/workflow.md

Steps:
1. Run `caplo auth status`. If it is not signed in to the right workspace, ask me to run `caplo auth login` and `caplo workspace use <WORKSPACE>`; never handle my password.
2. Run `caplo agent list` and confirm the exact agent name with me.
3. Pull it: `caplo pull "agent/<AGENT_NAME>" <PROJECT_DIR>`. This writes caplo.yaml (if the directory has none), one file per agent under agents/, its eval cases, and any tool packages the agents use under tools/. Remote MCP server tools stay as <server>/<tool>.
4. For each pulled tool package, install its dependencies (`npm install` in its directory) and run `caplo test` from the project root to run the package fixtures locally.
5. Run `caplo validate`, then `caplo diff`. Right after a pull, `caplo diff` should report no changes; if it does not, show me the diff and stop.
6. Review the sub-agent links: `caplo pull` writes the exact child release each link pins. Ask me whether any link should follow the child's newest release with `release: latest` instead, and change only the ones I name.
7. Add a .gitignore that excludes node_modules, and commit the project on a new branch. Do not push or open a pull request unless I ask.

Verify:
- `caplo validate` passes and `caplo diff` shows only the changes I approved.
- Every agent file has its eval cases under `evals:`.

Rules:
- Never put API keys, secrets or tokens in files or this chat. Tool secrets stay in Caplo (`caplo tool secret set`); do not copy their values anywhere.
- Do not run `caplo push`, `caplo publish` or `caplo channel deploy`; they change the workspace. Ask me first.
```

## See also

* [Agent YAML reference](/reference/agent-yaml/)
* [`caplo agent` commands](/reference/cli/agent/)
* [Project commands](/reference/cli/project/)
