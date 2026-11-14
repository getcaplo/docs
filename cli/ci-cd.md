# Publish from CI/CD

> Run caplo in GitHub Actions or GitLab CI with an API key to validate and test every change and publish from your main branch.

Keep your [project](/cli/projects/) in Git and let a pipeline publish it: every pull request is validated and its tool fixtures run, and every merge to `main` is evaluated and published. Nobody publishes from a laptop, and the release history matches your commit history.

In CI there is nobody to log in, so the CLI authenticates with an **API key** instead. See [API keys for automation](/cli/authentication/#api-keys-for-automation) for how keys and scopes work.

## Set up the key

1. Log in as a workspace Owner or Admin, so you can grant agent scopes, and select the workspace you publish to.

2. Create an API client with the scopes a publish needs, and send its key straight into your repository’s secrets without printing it. With the [GitHub CLI](https://cli.github.com):

   ```sh
   caplo workspace api-client create github-deploy \
     --scope agents:write,agents:publish,tools:write,tools:publish \
     | gh secret set CAPLO_API_KEY
   ```

   Add `channels:write` if an [environment](/cli/environments/#deploy-channels) deploys channels. Leave out the `tools` scopes if the project has no tool packages.

3. Store the workspace ID as `CAPLO_WORKSPACE`. It is not secret, but keeping it next to the key keeps them in step:

   ```sh
   caplo workspace get -o json
   gh secret set CAPLO_WORKSPACE --body <WORKSPACE_ID>
   ```

With an API key, the workspace must be given by ID, never by name.

## GitHub Actions

Save this as `.github/workflows/caplo.yml`. It pins the CLI version, so a new CLI release never changes your pipeline until you update the pin.

```yaml
name: Caplo


on:
  pull_request:
  push:
    branches: [main]


permissions:
  contents: read


env:
  CAPLO_VERSION: v0.4.0


jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - name: Install the Caplo CLI
        run: |
          curl -fsSL "https://raw.githubusercontent.com/getcaplo/homebrew-tap/$CAPLO_VERSION/install.sh" | sh
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
      - name: Install tool package dependencies
        run: |
          for dir in tools/*/; do
            if [ -f "$dir/package.json" ]; then npm ci --prefix "$dir"; fi
          done
      - run: caplo validate
      - run: caplo test


  publish:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: check
    runs-on: ubuntu-latest
    concurrency: caplo-publish
    env:
      CAPLO_API_KEY: ${{ secrets.CAPLO_API_KEY }}
      CAPLO_WORKSPACE: ${{ secrets.CAPLO_WORKSPACE }}
    steps:
      - uses: actions/checkout@v4
      - name: Install the Caplo CLI
        run: |
          curl -fsSL "https://raw.githubusercontent.com/getcaplo/homebrew-tap/$CAPLO_VERSION/install.sh" | sh
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
      - run: caplo auth status
      - run: caplo eval
      - run: caplo publish --yes
```

What each part does:

* **`check`** runs on every pull request and push. `caplo validate` and `caplo test` need no key and call no workspace, so they also run for pull requests from forks. `npm ci` needs each package’s `package-lock.json` committed.
* **`publish`** runs only on pushes to `main`. `caplo auth status` prints the API client and its scopes, which makes a wrong key easy to spot in the log. `caplo eval` pushes the drafts and runs every agent’s eval cases, so a failing case stops the job before anything is published. `caplo publish --yes` then publishes bottom up, reusing a passing eval run wherever the draft has not changed since.
* **`--yes`** is required: without a terminal, a publish that would ask for confirmation stops with exit code 2. It also covers the project’s first publish to the workspace.
* **`concurrency`** stops two publishes from running against the same workspace at once.

The install script checks the archive’s SHA-256 checksum before installing. To also gate publishing on a reviewer, put the `publish` job in a [GitHub environment](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment) with required reviewers.

Caution

Do not run `caplo push`, `caplo eval` or `caplo publish` on pull requests against the workspace that serves customers. `push` and `eval` overwrite the workspace drafts with the pull request’s files, and two open pull requests would overwrite each other. Use a separate staging workspace for that, or limit pull requests to `caplo validate`, `caplo test` and `caplo diff`.

### Show the plan on pull requests

To see what a merge would change, add a step to `check` with a key that has only `agents:read` and `tools:read`:

```yaml
      - run: caplo diff
        env:
          CAPLO_API_KEY: ${{ secrets.CAPLO_READ_KEY }}
          CAPLO_WORKSPACE: ${{ secrets.CAPLO_WORKSPACE }}
```

`caplo diff -o json` prints the same plan as one JSON document, to post as a comment or check with a policy; see [Plans as JSON](/cli/scripting/#plans-as-json).

### Staging and production

With [environments](/cli/environments/) in `caplo.yaml`, give each its own API client and secret, and select the environment per job:

```yaml
      - run: caplo publish --env staging --yes
        env:
          CAPLO_STAGING_KEY: ${{ secrets.CAPLO_STAGING_KEY }}
```

For production, run a separate job, for example on `workflow_dispatch` or a tag, that sets both keys. With `promoteFrom: staging`, the CLI reads staging with `CAPLO_STAGING_KEY` and refuses any agent staging has not released from the same source:

```yaml
      - run: caplo publish --env prod --yes
        env:
          CAPLO_PROD_KEY: ${{ secrets.CAPLO_PROD_KEY }}
          CAPLO_STAGING_KEY: ${{ secrets.CAPLO_STAGING_KEY }}
```

Do not also set `CAPLO_WORKSPACE` in these jobs unless it matches the environment’s `workspace` exactly; a different value stops the command with exit code 2.

AI prompt

Publish my Caplo project from GitHub Actions

Adds a GitHub Actions workflow that validates and tests every change and publishes the Caplo project from main with an API key.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20add%20a%20GitHub%20Actions%20workflow%20to%20this%20repository%20that%20runs%20%60caplo%20validate%60%20and%20%60caplo%20test%60%20on%20every%20pull%20request%20and%20push%2C%20and%20runs%20%60caplo%20eval%60%20and%20%60caplo%20publish%20--yes%60%20on%20pushes%20to%20%60main%60%2C%20authenticated%20with%20a%20Caplo%20API%20key.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fci-cd.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fauthentication.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fscripting.md%0A%0ASteps%3A%0A1.%20Find%20the%20Caplo%20project%3A%20the%20%60caplo.yaml%60%20with%20%60kind%3A%20Project%60.%20If%20it%20is%20not%20at%20the%20repository%20root%2C%20run%20every%20%60caplo%60%20command%20in%20the%20workflow%20with%20%60-C%20%3CPROJECT_DIR%3E%60%20and%20adjust%20the%20%60tools%2F*%2F%60%20path.%20Read%20its%20%60tools%60%20glob%20and%20%60environments%60%2C%20if%20any.%0A2.%20Run%20%60caplo%20validate%60%20locally%20and%20fix%20any%20problem%20it%20reports%20before%20you%20write%20the%20workflow.%20Do%20not%20change%20agent%20behavior%20to%20make%20it%20pass%20without%20asking%20me.%0A3.%20Check%20that%20every%20tool%20package%20directory%20has%20a%20committed%20%60package-lock.json%60.%20If%20one%20is%20missing%2C%20run%20%60npm%20install%60%20in%20that%20package%20and%20include%20the%20lock%20file%20in%20your%20change.%0A4.%20Create%20%60.github%2Fworkflows%2Fcaplo.yml%60%20from%20the%20GitHub%20Actions%20example%20on%20the%20CI%2FCD%20page%3A%0A%20%20%20-%20pin%20the%20CLI%20with%20%60CAPLO_VERSION%3A%20%3CCLI_VERSION%3E%60%20and%20install%20it%20with%20the%20install%20script%20from%20that%20version's%20tag%3B%0A%20%20%20-%20a%20%60check%60%20job%20with%20Node.js%2024%20that%20installs%20package%20dependencies%20with%20%60npm%20ci%60%20and%20runs%20%60caplo%20validate%60%20and%20%60caplo%20test%60%3B%0A%20%20%20-%20a%20%60publish%60%20job%20that%20runs%20only%20on%20pushes%20to%20%60main%60%2C%20needs%20%60check%60%2C%20uses%20%60concurrency%3A%20caplo-publish%60%2C%20sets%20%60CAPLO_API_KEY%60%20and%20%60CAPLO_WORKSPACE%60%20from%20repository%20secrets%2C%20and%20runs%20%60caplo%20auth%20status%60%2C%20%60caplo%20eval%60%20and%20%60caplo%20publish%20--yes%60.%0A%20%20%20If%20%60caplo.yaml%60%20defines%20environments%2C%20use%20%60caplo%20publish%20--env%20%3CENVIRONMENT%3E%20--yes%60%20and%20that%20environment's%20%60apiKeyEnv%60%20secret%20instead%2C%20as%20the%20page%20describes.%0A5.%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20on%20pull%20requests.%0A6.%20Tell%20me%20the%20commands%20to%20create%20the%20API%20client%20and%20store%20the%20secrets%20myself%2C%20with%20the%20scopes%20the%20project%20needs%20\(%60agents%3Awrite%60%2C%20%60agents%3Apublish%60%2C%20plus%20%60tools%3Awrite%60%20and%20%60tools%3Apublish%60%20if%20it%20has%20tool%20packages%2C%20plus%20%60channels%3Awrite%60%20if%20an%20environment%20lists%20channels\)%3A%0A%20%20%20%60caplo%20workspace%20api-client%20create%20%3CCLIENT_NAME%3E%20--scope%20%3CSCOPES%3E%20%7C%20gh%20secret%20set%20CAPLO_API_KEY%60%0A%20%20%20and%20%60gh%20secret%20set%20CAPLO_WORKSPACE%20--body%20%3CWORKSPACE_ID%3E%60.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20and%20%60caplo%20test%60%20pass%20locally.%0A-%20The%20workflow%20file%20is%20valid%20YAML%20and%20every%20%60caplo%60%20command%20and%20flag%20in%20it%20appears%20in%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Fcli%2Fproject.md.%0A-%20Open%20a%20pull%20request%20so%20the%20%60check%60%20job%20runs%2C%20and%20report%20its%20result.%0A%0ARules%3A%0A-%20Never%20create%2C%20print%2C%20paste%20or%20commit%20an%20API%20key%2C%20and%20never%20put%20one%20in%20the%20workflow%20file.%20Keys%20go%20only%20into%20GitHub%20secrets%2C%20and%20I%20create%20them.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20yourself%2C%20and%20do%20not%20merge%20to%20%60main%60%2C%20without%20asking%20me%20first%3A%20on%20%60main%60%20the%20workflow%20publishes%20to%20the%20workspace%20customers%20use.%0A-%20Do%20not%20edit%20agent%20files%20or%20tool%20code%20beyond%20what%20validation%20requires%2C%20and%20ask%20before%20any%20such%20change.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20add%20a%20GitHub%20Actions%20workflow%20to%20this%20repository%20that%20runs%20%60caplo%20validate%60%20and%20%60caplo%20test%60%20on%20every%20pull%20request%20and%20push%2C%20and%20runs%20%60caplo%20eval%60%20and%20%60caplo%20publish%20--yes%60%20on%20pushes%20to%20%60main%60%2C%20authenticated%20with%20a%20Caplo%20API%20key.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fci-cd.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fauthentication.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fscripting.md%0A%0ASteps%3A%0A1.%20Find%20the%20Caplo%20project%3A%20the%20%60caplo.yaml%60%20with%20%60kind%3A%20Project%60.%20If%20it%20is%20not%20at%20the%20repository%20root%2C%20run%20every%20%60caplo%60%20command%20in%20the%20workflow%20with%20%60-C%20%3CPROJECT_DIR%3E%60%20and%20adjust%20the%20%60tools%2F*%2F%60%20path.%20Read%20its%20%60tools%60%20glob%20and%20%60environments%60%2C%20if%20any.%0A2.%20Run%20%60caplo%20validate%60%20locally%20and%20fix%20any%20problem%20it%20reports%20before%20you%20write%20the%20workflow.%20Do%20not%20change%20agent%20behavior%20to%20make%20it%20pass%20without%20asking%20me.%0A3.%20Check%20that%20every%20tool%20package%20directory%20has%20a%20committed%20%60package-lock.json%60.%20If%20one%20is%20missing%2C%20run%20%60npm%20install%60%20in%20that%20package%20and%20include%20the%20lock%20file%20in%20your%20change.%0A4.%20Create%20%60.github%2Fworkflows%2Fcaplo.yml%60%20from%20the%20GitHub%20Actions%20example%20on%20the%20CI%2FCD%20page%3A%0A%20%20%20-%20pin%20the%20CLI%20with%20%60CAPLO_VERSION%3A%20%3CCLI_VERSION%3E%60%20and%20install%20it%20with%20the%20install%20script%20from%20that%20version's%20tag%3B%0A%20%20%20-%20a%20%60check%60%20job%20with%20Node.js%2024%20that%20installs%20package%20dependencies%20with%20%60npm%20ci%60%20and%20runs%20%60caplo%20validate%60%20and%20%60caplo%20test%60%3B%0A%20%20%20-%20a%20%60publish%60%20job%20that%20runs%20only%20on%20pushes%20to%20%60main%60%2C%20needs%20%60check%60%2C%20uses%20%60concurrency%3A%20caplo-publish%60%2C%20sets%20%60CAPLO_API_KEY%60%20and%20%60CAPLO_WORKSPACE%60%20from%20repository%20secrets%2C%20and%20runs%20%60caplo%20auth%20status%60%2C%20%60caplo%20eval%60%20and%20%60caplo%20publish%20--yes%60.%0A%20%20%20If%20%60caplo.yaml%60%20defines%20environments%2C%20use%20%60caplo%20publish%20--env%20%3CENVIRONMENT%3E%20--yes%60%20and%20that%20environment's%20%60apiKeyEnv%60%20secret%20instead%2C%20as%20the%20page%20describes.%0A5.%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20on%20pull%20requests.%0A6.%20Tell%20me%20the%20commands%20to%20create%20the%20API%20client%20and%20store%20the%20secrets%20myself%2C%20with%20the%20scopes%20the%20project%20needs%20\(%60agents%3Awrite%60%2C%20%60agents%3Apublish%60%2C%20plus%20%60tools%3Awrite%60%20and%20%60tools%3Apublish%60%20if%20it%20has%20tool%20packages%2C%20plus%20%60channels%3Awrite%60%20if%20an%20environment%20lists%20channels\)%3A%0A%20%20%20%60caplo%20workspace%20api-client%20create%20%3CCLIENT_NAME%3E%20--scope%20%3CSCOPES%3E%20%7C%20gh%20secret%20set%20CAPLO_API_KEY%60%0A%20%20%20and%20%60gh%20secret%20set%20CAPLO_WORKSPACE%20--body%20%3CWORKSPACE_ID%3E%60.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20and%20%60caplo%20test%60%20pass%20locally.%0A-%20The%20workflow%20file%20is%20valid%20YAML%20and%20every%20%60caplo%60%20command%20and%20flag%20in%20it%20appears%20in%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Fcli%2Fproject.md.%0A-%20Open%20a%20pull%20request%20so%20the%20%60check%60%20job%20runs%2C%20and%20report%20its%20result.%0A%0ARules%3A%0A-%20Never%20create%2C%20print%2C%20paste%20or%20commit%20an%20API%20key%2C%20and%20never%20put%20one%20in%20the%20workflow%20file.%20Keys%20go%20only%20into%20GitHub%20secrets%2C%20and%20I%20create%20them.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20yourself%2C%20and%20do%20not%20merge%20to%20%60main%60%2C%20without%20asking%20me%20first%3A%20on%20%60main%60%20the%20workflow%20publishes%20to%20the%20workspace%20customers%20use.%0A-%20Do%20not%20edit%20agent%20files%20or%20tool%20code%20beyond%20what%20validation%20requires%2C%20and%20ask%20before%20any%20such%20change.)

Show prompt

```
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
```

## GitLab CI

Add `CAPLO_API_KEY` and `CAPLO_WORKSPACE` under **Settings**, **CI/CD**, **Variables** in GitLab, masked and protected so only protected branches can read them. Then in `.gitlab-ci.yml`:

```yaml
stages: [check, publish]


variables:
  CAPLO_VERSION: v0.4.0


default:
  image: node:24
  before_script:
    - curl -fsSL "https://raw.githubusercontent.com/getcaplo/homebrew-tap/$CAPLO_VERSION/install.sh" | sh
    - export PATH="$HOME/.local/bin:$PATH"


check:
  stage: check
  script:
    - for dir in tools/*/; do if [ -f "$dir/package.json" ]; then npm ci --prefix "$dir"; fi; done
    - caplo validate
    - caplo test


publish:
  stage: publish
  resource_group: caplo-publish
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  script:
    - caplo eval
    - caplo publish --yes
```

## Exit codes

Pipelines stop on any non-zero exit code. The code tells you where to look:

| Code         | Meaning in CI                                                                                                                                                         | Typical fix                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `0`          | Success, including nothing to publish                                                                                                                                 |                                                                  |
| `1`          | An error, such as a refused API key, a missing scope, a network failure or a failed build                                                                             | Read the error line; check scopes with `caplo auth status`       |
| `2`          | A usage error: a missing `--yes`, a workspace given by name with an API key, `--workspace` disagreeing with `--env`, or `channels:write` missing for a channel deploy | Fix the command or the variables                                 |
| `3`          | A failed gate: validation, tool fixtures, eval cases, or a promotion with no matching release                                                                         | Fix the files, or publish to the `promoteFrom` environment first |
| `130`, `143` | The job was cancelled                                                                                                                                                 | Rerun it                                                         |

A publish that fails partway keeps what it already published, such as tool versions or child agent releases. Fix the cause and run it again; unchanged resources are skipped. See [Scripting](/cli/scripting/) for output formats and environment variables.
