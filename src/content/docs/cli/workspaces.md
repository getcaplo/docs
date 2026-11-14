---
title: Choose a workspace
description: List, create and select workspaces with the caplo CLI, and control which workspace each command acts on.
sidebar:
  order: 3
---

Every command that reads or changes agents, tools, channels or knowledge acts on one workspace. The CLI remembers a selected workspace, and you can override it per command or per shell. For what a workspace holds and what each role can do, see [Workspaces and roles](/concepts/workspaces-and-roles/).

## List and inspect

```sh
caplo workspace list
caplo workspace get
caplo workspace get "Acme Support"
```

`caplo workspace list` shows each workspace you belong to with your role, its status and its ID; the selected one is marked with `*`. `caplo workspace get` shows one workspace, by default the selected one. Both take `-o json` or `-o yaml`.

## Select a workspace

```sh
caplo workspace use "Acme Support"
```

You can name a workspace by its exact name or its ID. If two of your workspaces share a name, use the ID. The selection is saved in your [CLI configuration](/cli/authentication/#cli-settings) and applies to every later command.

You rarely need to select one by hand: `caplo auth login` keeps your previous selection if you still belong to it, and selects your only workspace if you belong to exactly one. Changing the `api-url` setting clears the selection.

## Create a workspace

```sh
caplo workspace create "Acme Staging"
```

You become its Owner, and the CLI selects it. Invite teammates in the console under **Settings**, **Members**.

## Which workspace a command uses

For each command, the CLI takes the first of these that is set:

1. The `--workspace` (`-w`) flag, for one command: `caplo agent list -w "Acme Staging"`.
2. The `CAPLO_WORKSPACE` environment variable, for every command in that shell or CI job.
3. The workspace selected with `caplo workspace use`.

Project commands that take `--env` use the [environment's](/cli/environments/) workspace instead. If `--workspace` or `CAPLO_WORKSPACE` names a different workspace, the command stops with a usage error (exit code 2) rather than guess which one you meant. Unset `CAPLO_WORKSPACE`, or set it to exactly the value in `caplo.yaml`, when you use environments.

## With an API key

When `CAPLO_API_KEY` is set, the workspace is always the key's own workspace, and you must name it by ID with `--workspace`, `CAPLO_WORKSPACE` or an environment. A name is refused because a key cannot list workspaces. The `caplo workspace` commands themselves need a person's login. See [API keys for automation](/cli/authentication/#api-keys-for-automation).

API clients are managed under `caplo workspace api-client`; that is covered on the [authentication page](/cli/authentication/#create-a-client).
