---
title: "CLI reference"
description: "Every caplo command, flag, environment variable and exit code, generated from the released CLI."
editUrl: false
sidebar:
  order: 0
  label: "Overview"
---

:::note[Generated reference]
Generated from `caplo` v0.4.0, the latest release. `caplo --help` prints the same text.
:::

Install the CLI with the [installation guide](/cli/install/). Task guides are under [CLI](/cli/workflow/).

```sh
caplo [flags]
```

## Commands

### Project

| Command | Description |
| --- | --- |
| [`caplo diff`](/reference/cli/project/#caplo-diff) | Show how the project differs from the workspace drafts |
| [`caplo eval`](/reference/cli/project/#caplo-eval) | Push the selection, then run each selected agent's eval cases against its draft |
| [`caplo init`](/reference/cli/project/#caplo-init) | Create a project: caplo.yaml, agent files, and tool packages |
| [`caplo publish`](/reference/cli/project/#caplo-publish) | Validate, push, test, evaluate, and publish bottom up: tools, then child agents, then parents |
| [`caplo pull`](/reference/cli/project/#caplo-pull) | Write a workspace agent, its sub-agents, and their packages into a project |
| [`caplo push`](/reference/cli/project/#caplo-push) | Create or update the workspace drafts, children first, so you can live test them |
| [`caplo test`](/reference/cli/project/#caplo-test) | Run the selected tool packages' fixtures locally, like caplo tool test |
| [`caplo validate`](/reference/cli/project/#caplo-validate) | Check the project offline: schemas, references, link cycles, and the depth limit |

### Workspace resources

| Command | Description |
| --- | --- |
| [`caplo agent`](/reference/cli/agent/) | Build, test, evaluate, and publish one agent |
| [`caplo channel`](/reference/cli/channel/) | List channels and deploy agent releases to them |
| [`caplo identity`](/reference/cli/identity/) | Generate keys and sign or check host sign-in assertions locally |
| [`caplo knowledge`](/reference/cli/knowledge/) | Manage knowledge bases and sync their documents from a directory |
| [`caplo mcp`](/reference/cli/mcp/) | Connect remote MCP servers and publish their reviewed tools |
| [`caplo secret`](/reference/cli/secret/) | Manage workspace secrets that package secrets bind to |
| [`caplo tool`](/reference/cli/tool/) | Build, test, publish, and run tool packages |

### Account

| Command | Description |
| --- | --- |
| [`caplo auth`](/reference/cli/auth/) | Log in, log out, and show the session |
| [`caplo config`](/reference/cli/config/) | Show and change CLI settings |
| [`caplo workspace`](/reference/cli/workspace/) | List, show, create, and select workspaces |

### Other

| Command | Description |
| --- | --- |
| [`caplo completion`](/reference/cli/#caplo-completion) | Generate the autocompletion script for the specified shell |
| [`caplo version`](/reference/cli/#caplo-version) | Show the caplo version |

## Global flags

These flags work with every command.

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--workspace`, `-w` | string |  | workspace ID or name (default: $CAPLO_WORKSPACE, else the one selected with caplo workspace use) |

## Environment variables

| Variable | Description |
| --- | --- |
| `CAPLO_API_KEY` | Authenticate as an API client instead of the login session, for CI and automation. Create one with caplo workspace api-client. |
| `CAPLO_WORKSPACE` | Workspace ID or name for every command, unless --workspace is given. |
| `CAPLO_ENV` | Project environment from caplo.yaml, unless --env is given. |
| `CAPLO_API_URL` | API base URL used by caplo auth login, unless --api-url is given. |
| `CAPLO_ISSUER` | OpenID issuer used by caplo auth login, unless --issuer is given. |
| `CAPLO_CONFIG_DIR` | Directory for the CLI configuration and session, instead of ~/.config/caplo ($XDG_CONFIG_HOME/caplo), or %AppData%\caplo on Windows. |
| `XDG_CONFIG_HOME` | Base configuration directory when CAPLO_CONFIG_DIR is not set. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | An error: the API refused the request, a file could not be read, or the command failed. |
| `2` | A usage error: an unknown command or flag, a wrong argument, or a publish that needs --yes. |
| `3` | A failed gate: validation, tool fixtures, or eval cases did not pass. |
| `130` | Interrupted with Ctrl-C (SIGINT). A second Ctrl-C ends the process at once. |
| `143` | Terminated with SIGTERM. |

## caplo completion

Generate the autocompletion script for the specified shell.

```sh
caplo completion
```

Generate the autocompletion script for caplo for the specified shell. See each sub-command's help for details on how to use the generated script.

**Commands**

- [`caplo completion bash`](#caplo-completion-bash)
- [`caplo completion fish`](#caplo-completion-fish)
- [`caplo completion powershell`](#caplo-completion-powershell)
- [`caplo completion zsh`](#caplo-completion-zsh)

## caplo completion bash

Generate the autocompletion script for bash.

```sh
caplo completion bash
```

Generate the autocompletion script for the bash shell.

This script depends on the 'bash-completion' package. If it is not installed already, you can install it via your OS's package manager.

To load completions in your current shell session:

```sh
source <(caplo completion bash)
```

To load completions for every new session, execute once:

#### Linux:

```sh
caplo completion bash > /etc/bash_completion.d/caplo
```

#### macOS:

```sh
caplo completion bash > $(brew --prefix)/etc/bash_completion.d/caplo
```

You will need to start a new shell for this setup to take effect.

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--no-descriptions` |  |  | disable completion descriptions |

## caplo completion fish

Generate the autocompletion script for fish.

```sh
caplo completion fish [flags]
```

Generate the autocompletion script for the fish shell.

To load completions in your current shell session:

```sh
caplo completion fish | source
```

To load completions for every new session, execute once:

```sh
caplo completion fish > ~/.config/fish/completions/caplo.fish
```

You will need to start a new shell for this setup to take effect.

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--no-descriptions` |  |  | disable completion descriptions |

## caplo completion powershell

Generate the autocompletion script for powershell.

```sh
caplo completion powershell [flags]
```

Generate the autocompletion script for powershell.

To load completions in your current shell session:

```sh
caplo completion powershell | Out-String | Invoke-Expression
```

To load completions for every new session, add the output of the above command to your powershell profile.

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--no-descriptions` |  |  | disable completion descriptions |

## caplo completion zsh

Generate the autocompletion script for zsh.

```sh
caplo completion zsh [flags]
```

Generate the autocompletion script for the zsh shell.

If shell completion is not already enabled in your environment you will need to enable it. You can execute the following once:

```sh
echo "autoload -U compinit; compinit" >> ~/.zshrc
```

To load completions in your current shell session:

```sh
source <(caplo completion zsh)
```

To load completions for every new session, execute once:

#### Linux:

```sh
caplo completion zsh > "${fpath[1]}/_caplo"
```

#### macOS:

```sh
caplo completion zsh > $(brew --prefix)/share/zsh/site-functions/_caplo
```

You will need to start a new shell for this setup to take effect.

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--no-descriptions` |  |  | disable completion descriptions |

## caplo version

Show the caplo version.

```sh
caplo version [flags]
```

Shows the CLI version, the commit it was built from, and the Go version and platform. caplo --version prints the version alone.

**Examples**

```sh
caplo version
caplo version -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
