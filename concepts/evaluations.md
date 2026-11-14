# Evaluations

> How eval cases test an agent before it publishes, how the grader decides, and how workspace publication requirements gate releases.

**Eval cases** are example conversations that check an agent behaves as you expect. Each agent has one set of cases, its **eval suite**. Caplo runs the suite against the exact draft you are about to publish, and by default an agent publishes only when every case passes. Evals turn “it seemed fine when I tried it” into a check that runs on every release.

## What a case contains

A case is one customer message plus the checks it must pass. You write cases on the agent’s **Test** tab in the console, or under `evals` in the agent’s YAML file.

| Check           | Console field                                       | What passes                                                                             |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Desired outcome | **Desired customer outcome**                        | A grader model judges that the reply achieved the outcome you describe.                 |
| Answer contains | **Answer must contain**                             | The reply includes this text.                                                           |
| Answer excludes | **Answer must not contain**                         | The reply does not include this text.                                                   |
| Sub-agent       | **Expected sub-agent**, **Must not call sub-agent** | The agent did, or did not, call that sub-agent.                                         |
| Routing         | **Routed by**                                       | For fast routing agents: the route was chosen by fast routing, by the model, or either. |
| Tool            | **Expected tool**                                   | The agent called this tool.                                                             |

A case passes only when every check it sets passes. Good cases target the mistakes that would hurt most: a wrong answer, a missing tool call, a promise the agent must not make, or the wrong specialist.

## How a run works

Each case runs as a single turn in an isolated test conversation, against the exact candidate being published. Read tools run for real and their results count as ground truth. Write actions never run in an eval; an agent that correctly proposes a write is treated as having taken that action.

The **grader** is a model that reads the case’s desired outcome and a record of the turn: the customer’s message, every tool call with its arguments and result, any proposed actions, and the final reply. It judges only against the desired outcome, every requirement in it must hold, and a reply that states facts no tool returned fails. If the grader cannot reach a verdict, the case does not pass. A failed case shows the grader’s short rationale.

You can run the suite while you work: in the console’s publish dialog with **Run tests**, or with `caplo eval` (which pushes the project first) or `caplo agent eval run` for one agent’s saved draft.

## The publication gate

Publishing runs the suite and records the result in the release. The workspace’s **Agent publication requirements**, set by an Owner or Admin under **Settings** > **General**, decide what the result means:

| Setting                                 | Options                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Eval requirement**                    | **Required**: every case must pass, and an agent with no cases cannot publish. This is the default. **Disabled**: results are shown but do not block publishing. |
| **Passing routing cases per sub-agent** | For agents that use fast routing: how many passing cases with a **Routed by** check each sub-agent needs, from 1 to 10. The default is 2.                        |

The requirements apply to every agent in the workspace; there are no per-agent exceptions. Disabling evals does not disable Caplo’s own checks: configuration, tool and knowledge eligibility, and Fast decisions for fast routing still apply. A release keeps the policy it was published under.

Eval cases are not pinned in a release, so you can add or change cases at any time. The next publish runs the current suite.

## Related

* [Write evals](/agents/evals/)
* [Test an agent](/agents/testing/)
* [Publish an agent](/agents/publishing/)
* [Multi-agent](/concepts/multi-agent/): fast routing and its eval coverage.
