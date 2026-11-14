---
title: Add staging and production environments to my Caplo project
description: Adds staging and prod environments to caplo.yaml so production only publishes what staging released from the same source.
---
Goal: add `staging` and `prod` environments to this repository's Caplo project, so `caplo publish --env staging` publishes to the staging workspace and `caplo publish --env prod` publishes only agents that staging already released from the same source.

Read these pages first:
- https://docs.caplo.si/cli/environments.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/cli/authentication.md

Inputs I will give you:
- `<STAGING_WORKSPACE_ID>` and `<PROD_WORKSPACE_ID>`: the workspace IDs (from `caplo workspace list`).
- Which settings, if any, should differ in production, and which channels each environment should deploy.

Steps:
1. Find the project's `caplo.yaml` (the one with `kind: Project`) and read its agent files. Note each agent's file key (its file name without `.yaml`).
2. Add an `environments` map:
   - `staging` with `workspace: <STAGING_WORKSPACE_ID>` and `apiKeyEnv: CAPLO_STAGING_KEY`;
   - `prod` with `workspace: <PROD_WORKSPACE_ID>`, `apiKeyEnv: CAPLO_PROD_KEY` and `promoteFrom: staging`.
3. Only if I asked for different settings, add them under `prod.agents.<AGENT_KEY>` as partial agent fields. Mappings merge, `null` removes a field, and anything else replaces it. Do not copy whole agent files into `caplo.yaml`.
4. Only if I named channels, add them under `<ENVIRONMENT>.channels.<AGENT_KEY>` as a list of channel names, IDs or `<kind>/<name>`.
5. Run `caplo validate`, which checks every environment, and `caplo validate --env prod`. Fix what they report.
6. If the repository has a CI workflow that runs `caplo publish`, show me how to change it to `caplo publish --env staging --yes` with `CAPLO_STAGING_KEY`, and a separate production job with both `CAPLO_STAGING_KEY` and `CAPLO_PROD_KEY`, but do not change it without asking. Remove `CAPLO_WORKSPACE` from jobs that use `--env`.

Verify:
- `caplo validate` and `caplo validate --env prod` exit 0.
- If I am logged in, `caplo diff --env staging` and `caplo diff --env prod` show the plan for each workspace without changing anything.

Rules:
- Never write API keys into `caplo.yaml` or any file. `apiKeyEnv` holds only the name of an environment variable.
- Do not run `caplo push`, `caplo eval` or `caplo publish` for any environment without asking me first.
- Use workspace IDs, not names, so the file also works with API keys in CI.
