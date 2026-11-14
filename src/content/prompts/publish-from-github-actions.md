---
title: Publish my Caplo project from GitHub Actions
description: Adds a GitHub Actions workflow that validates and tests every change and publishes the Caplo project from main with an API key.
---
Goal: add a GitHub Actions workflow to this repository that runs `caplo validate` and `caplo test` on every pull request and push, and runs `caplo eval` and `caplo publish --yes` on pushes to `main`, authenticated with a Caplo API key.

Read these pages first:
- https://docs.caplo.si/cli/ci-cd.md
- https://docs.caplo.si/cli/authentication.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/cli/scripting.md

Steps:
1. Find the Caplo project: the `caplo.yaml` with `kind: Project`. If it is not at the repository root, run every `caplo` command in the workflow with `-C <PROJECT_DIR>` and adjust the `tools/*/` path. Read its `tools` glob and `environments`, if any.
2. Run `caplo validate` locally and fix any problem it reports before you write the workflow. Do not change agent behavior to make it pass without asking me.
3. Check that every tool package directory has a committed `package-lock.json`. If one is missing, run `npm install` in that package and include the lock file in your change.
4. Create `.github/workflows/caplo.yml` from the GitHub Actions example on the CI/CD page:
   - pin the CLI with `CAPLO_VERSION: <CLI_VERSION>` and install it with the install script from that version's tag;
   - a `check` job with Node.js 24 that installs package dependencies with `npm ci` and runs `caplo validate` and `caplo test`;
   - a `publish` job that runs only on pushes to `main`, needs `check`, uses `concurrency: caplo-publish`, sets `CAPLO_API_KEY` and `CAPLO_WORKSPACE` from repository secrets, and runs `caplo auth status`, `caplo eval` and `caplo publish --yes`.
   If `caplo.yaml` defines environments, use `caplo publish --env <ENVIRONMENT> --yes` and that environment's `apiKeyEnv` secret instead, as the page describes.
5. Do not run `caplo push`, `caplo eval` or `caplo publish` on pull requests.
6. Tell me the commands to create the API client and store the secrets myself, with the scopes the project needs (`agents:write`, `agents:publish`, plus `tools:write` and `tools:publish` if it has tool packages, plus `channels:write` if an environment lists channels):
   `caplo workspace api-client create <CLIENT_NAME> --scope <SCOPES> | gh secret set CAPLO_API_KEY`
   and `gh secret set CAPLO_WORKSPACE --body <WORKSPACE_ID>`.

Verify:
- `caplo validate` and `caplo test` pass locally.
- The workflow file is valid YAML and every `caplo` command and flag in it appears in https://docs.caplo.si/reference/cli/project.md.
- Open a pull request so the `check` job runs, and report its result.

Rules:
- Never create, print, paste or commit an API key, and never put one in the workflow file. Keys go only into GitHub secrets, and I create them.
- Do not run `caplo push`, `caplo eval` or `caplo publish` yourself, and do not merge to `main`, without asking me first: on `main` the workflow publishes to the workspace customers use.
- Do not edit agent files or tool code beyond what validation requires, and ask before any such change.
