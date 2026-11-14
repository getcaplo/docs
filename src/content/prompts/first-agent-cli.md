---
title: Scaffold and publish a Caplo agent project with the CLI
description: Creates a Caplo project from the summit template, pushes and tests it, then publishes it after asking you.
---
Goal: create a Caplo project in this repository with the `caplo` CLI, push it to my workspace as drafts, test it in a chat, and publish it only after I approve.

Read these pages first:
- https://docs.caplo.si/get-started/quickstart-cli.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/concepts/agents-and-releases.md
- https://docs.caplo.si/concepts/evaluations.md

Inputs:
- Project directory and name: <PROJECT_NAME> (lowercase letters, digits and hyphens, starting with a letter)
- Template: <TEMPLATE> (summit for the multi-agent example with tools, or blank for one agent)
- Workspace: <WORKSPACE_NAME>

Steps:
1. Check the CLI is installed with `caplo version`. If it is missing, tell me to install it (`brew install getcaplo/tap/caplo`) and stop.
2. Run `caplo auth status`. If I am not signed in, ask me to run `caplo auth login` myself, then continue.
3. Run `caplo workspace use "<WORKSPACE_NAME>"`.
4. Run `caplo init <PROJECT_NAME> --template <TEMPLATE>`, then work inside `<PROJECT_NAME>`.
5. If the template is summit, run `npm install` in `tools/order-desk` and in `tools/store-stock`. Keep the generated `package-lock.json` files.
6. Run `caplo validate` and fix any problem it reports in the files you created.
7. If the template is summit, run `caplo test` and report the fixture results.
8. Run `caplo push`. Report each tool package and agent it created or updated.
9. Chat with the entry agent: run `caplo agent chat "<ENTRY_AGENT_NAME>"` (for summit, the entry agent is the project title followed by Concierge, for example "Shop Concierge" for a project named shop; for blank, the title followed by Assistant). Send two or three realistic customer messages, one per line, then `/exit`. If the agent proposes a write, answer `/cancel`; never `/confirm` without asking me.
10. Run `caplo publish --dry-run` and show me the plan.
11. Ask me whether to publish. Only after I say yes, run `caplo publish --yes`.
12. If publishing stops on a failed eval case (exit code 3), show me the case and the grader's reason, propose a fix to the agent file or the case, and wait for my approval before changing anything or publishing again.

Verify:
- `caplo validate` passes.
- `caplo agent list` shows the project's agents, each with a release after publishing.

Rules:
- Never paste, print or commit secrets, tokens or API keys. Tool package secrets are set with `caplo secret set` and bound with `caplo tool secret bind`, never written into code or this chat.
- Never publish, revoke releases or deploy channels without asking me first.
- If publishing fails because Fast decisions are disabled for the workspace, tell me: an Owner or Admin must enable it in the console under Settings, AI providers. Do not remove fast routing to work around it unless I ask.
- Do not edit files outside the project directory.
