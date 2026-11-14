---
title: Move a console agent into this repository
description: Pulls an agent built in the Caplo console, with its sub-agents, eval cases and tool packages, into a caplo project and checks it matches the workspace.
---
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
