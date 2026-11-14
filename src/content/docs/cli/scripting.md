---
title: Script the CLI
description: Machine-readable output, exit codes, environment variables, non-interactive use and shell completion for the caplo CLI.
sidebar:
  order: 8
---

Everything you need to call `caplo` from scripts, Makefiles and pipelines. For a ready-made pipeline, see [CI/CD](/cli/ci-cd/).

## Output formats

Commands that show data take `--output` (`-o`) with `table` (the default), `json` or `yaml`:

```sh
caplo agent list -o json
caplo workspace get -o yaml
caplo version -o json
```

This covers the `list` and `get` commands, `caplo auth status`, `caplo config list`, `caplo version`, and `caplo workspace api-client` `list`, `create` and `rotate`. With `json` or `yaml`, standard output holds only that document, so you can pipe it straight into `jq`; prompts, warnings and errors go to standard error. Other commands print plain text meant for people. `caplo config get <key>` prints just the value:

```sh
API_URL=$(caplo config get api-url)
```

### Plans as JSON

`caplo diff`, `caplo push --dry-run` and `caplo publish --dry-run` print their plan as one JSON or YAML document with `-o json` or `-o yaml`. `push` and `publish` accept `-o` only together with `--dry-run`, so the output stays a single document; without it they stop with exit code 2.

| Field | Description |
| --- | --- |
| `project` | The project name |
| `workspace` | `id` and `name` of the workspace; with an API key the name is the ID |
| `environment` | The `--env` environment, if any |
| `changes` | `true` if any resource has a step |
| `resources` | One entry per package, agent and channel, in the order the command acts on them |
| `firstPublish` | Publish only: `true` on the project's first publish to this workspace |
| `promotions` | Publish only, with `promoteFrom`: per agent, the environment it promotes `from`, the `source` digest and the matching `release` |

Each entry in `resources` has:

| Field | Description |
| --- | --- |
| `resource` | `tool/<package>`, `agent/<key>` or `channel/<kind>/<name>` |
| `steps` | What the command does, in order, from `create`, `update`, `save-evals`, `build`, `test`, `evaluate`, `publish`, `archive` and `deploy`; empty when unchanged |
| `summary` | The line the table shows |
| `files` | A package's changed files, prefixed `+` added, `-` removed, `~` changed |
| `reasons` | Why an agent publishes or is evaluated |
| `current`, `next` | The current release or package version, and the release a publish makes |
| `diff` | A unified diff of the agent's draft and eval cases |

For example, to run a step only when a publish would change something:

```sh
if caplo publish --dry-run -o json | jq -e '.changes' > /dev/null; then
  echo "Publishing"
fi
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | An error: the API refused the request, a file could not be read, a build failed, or the command failed in another way. |
| `2` | A usage error: an unknown command or flag, a wrong argument, a confirmation that needs `--yes` because there is no terminal, or conflicting settings such as `--workspace` disagreeing with `--env`. |
| `3` | A failed check: project validation, tool fixtures, eval cases, a promotion with no matching release, or a failed `caplo identity verify-assertion` check. |
| `130` | Interrupted with Ctrl-C. A second Ctrl-C ends the process at once. |
| `143` | Ended with SIGTERM. |

Errors are printed to standard error as one line starting with `error:`. For a failed validation, each problem is printed above it with its file.

## Environment variables

| Variable | Effect |
| --- | --- |
| `CAPLO_API_KEY` | Authenticate as an API client with this key instead of your login. See [API keys](/cli/authentication/#api-keys-for-automation). |
| `CAPLO_WORKSPACE` | The workspace for every command, by ID or name, unless `--workspace` is given. With an API key it must be the ID. |
| `CAPLO_ENV` | The project [environment](/cli/environments/) for `validate`, `diff`, `push`, `eval` and `publish`, unless `--env` is given. |
| `CAPLO_API_URL` | The API that `caplo auth login` saves, unless `--api-url` is given, and the API an API key calls. |
| `CAPLO_ISSUER` | The sign-in server that `caplo auth login` uses, unless `--issuer` is given. |
| `CAPLO_CONFIG_DIR` | The configuration directory, instead of the default below. Use a separate one per Caplo login. |
| `XDG_CONFIG_HOME` | On macOS and Linux, the configuration directory is `$XDG_CONFIG_HOME/caplo` when `CAPLO_CONFIG_DIR` is not set; otherwise `~/.config/caplo`. On Windows it is `%AppData%\caplo`. |

An environment's `apiKeyEnv` in `caplo.yaml` names one more variable per environment, such as `CAPLO_PROD_KEY`; see [Environments](/cli/environments/#define-environments).

## Run without a terminal

Commands that change something important ask first: `caplo publish`, `caplo agent publish`, `caplo channel deploy` and `rollback`, `caplo knowledge sync` when it removes documents, release and version revokes, archive, delete and remove commands, and secret unset, unbind and delete. Pass `--yes` (`-y`) to skip the question.

When standard input is not a terminal, these commands do not read an answer from it. Without `--yes` they stop with exit code 2, so piping `y` into them does not work. `caplo publish` also requires `--yes` on a project's first publish to a workspace, even in a terminal.

### Secrets from standard input

Commands that take a secret never accept it as an argument, so it does not end up in your shell history or process list. They read it from a hidden prompt in a terminal, or from standard input otherwise:

```sh
printf %s "$ORDERS_API_KEY" | caplo secret set orders-api-key
printf %s "$ORDERS_API_KEY" | caplo tool secret set ORDERS_API_KEY -p order-desk
```

One trailing newline is removed; `printf %s` avoids adding one in the first place. Values are 1 to 8192 bytes. Remote MCP server credentials come from standard input or from a named environment variable, for example `caplo mcp add` with `--secret-stdin` or `--secret-env <VARIABLE>`. See [Secrets and egress](/tools/secrets-and-egress/) and [Remote MCP servers](/tools/remote-mcp/).

API keys work the other way round: `caplo workspace api-client create` and `rotate` print the new key on standard output once, so you can pipe it into a secret store. With `-o json`, the key is in the `secret` field.

## Shell completion

`caplo completion` prints a completion script for `bash`, `zsh`, `fish` or `powershell`. To try it in the current shell:

```sh
source <(caplo completion zsh)
```

To load it in every new zsh session, add that line to `~/.zshrc`. For bash, install the `bash-completion` package and save the script once:

```sh
# macOS with Homebrew
dir="$(brew --prefix)/etc/bash_completion.d"
caplo completion bash > "$dir/caplo"

# Linux
caplo completion bash | sudo tee /etc/bash_completion.d/caplo > /dev/null
```

For fish, run `caplo completion fish > ~/.config/fish/completions/caplo.fish`. For PowerShell, add `caplo completion powershell | Out-String | Invoke-Expression` to your profile. Homebrew installs do not set up completion for you. The [CLI reference](/reference/cli/#caplo-completion) lists the options.
