---
title: "caplo agent"
description: "Build, test, evaluate, and publish one agent."
editUrl: false
sidebar:
  order: 2
  label: "agent"
---

:::note[Generated reference]
Generated from `caplo` v0.4.0, the latest release. `caplo agent --help` prints the same text.
:::

Build, test, evaluate, and publish one agent.

```sh
caplo agent
```

Commands for a single agent file or workspace agent. A workspace agent is named by its name or ID. To push and publish the agents of a project together, children first, use caplo push and caplo publish.

**Examples**

```sh
caplo agent init -f support.yaml
caplo agent push -f support.yaml
caplo agent chat "Support"
caplo agent publish "Support"
```

**Commands**

- [`caplo agent chat`](#caplo-agent-chat)
- [`caplo agent eval`](#caplo-agent-eval)
- [`caplo agent get`](#caplo-agent-get)
- [`caplo agent init`](#caplo-agent-init)
- [`caplo agent list`](#caplo-agent-list)
- [`caplo agent publish`](#caplo-agent-publish)
- [`caplo agent pull`](#caplo-agent-pull)
- [`caplo agent push`](#caplo-agent-push)
- [`caplo agent release`](#caplo-agent-release)
- [`caplo agent test`](#caplo-agent-test)
- [`caplo agent validate`](#caplo-agent-validate)

## caplo agent chat

Chat with the agent's saved draft, or a release, in a private test conversation.

```sh
caplo agent chat <agent> [flags]
```

Starts a private test conversation with the agent's saved draft, or with a release named by --release, and reads one message per line from standard input. Each reply is printed with the sub-agents and tools the turn used. End with Ctrl-D, /exit, or /quit; the test session is closed when the chat ends.

A write awaiting a decision is shown as its review, as a review of the whole plan, or as a write that can only be declined: one with no review here, or one waiting for the customer to sign in. /confirm or /cancel decides the write shown last, as the widget's buttons do; ordinary text never approves a write. If the write changed meanwhile, the current one is shown to answer again, and a refused (409) message or decision is reported without ending the chat. A message or decision that was not sent makes the command exit 1 at its end; without a terminal, a failed turn makes it exit 3.

Replies arrive on the agent-test event stream. It resumes after the last event when it reconnects, reloads the history on a reset, reconnects with a fresh token when asked to reauthenticate, and retries network failures, 429, and 5xx, but not an unknown host, a rejected TLS certificate, or another 4xx. When no test session is free, caplo agent test list and caplo agent test close free one.

**Examples**

```sh
caplo agent chat "Shop Concierge"
caplo agent chat "Shop Concierge" --release 2.1.0
printf 'Where is order 1042?\n/confirm\n' | caplo agent chat "Shop Concierge"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--release` | string |  | chat with this release, by number or version, instead of the draft |

## caplo agent eval

Run and inspect an agent's evaluations.

```sh
caplo agent eval
```

**Examples**

```sh
caplo agent eval run "Shop Concierge"
caplo agent eval list "Shop Concierge"
```

**Commands**

- [`caplo agent eval get`](#caplo-agent-eval-get)
- [`caplo agent eval list`](#caplo-agent-eval-list)
- [`caplo agent eval run`](#caplo-agent-eval-run)

## caplo agent eval get

Show an evaluation run and its cases.

```sh
caplo agent eval get <agent> <run> [flags]
```

**Examples**

```sh
caplo agent eval get "Shop Concierge" 0c9e7a52-1d4b-4e8f-a3c6-5b2d9f0e1a47
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent eval list

List the agent's evaluation runs, newest first.

```sh
caplo agent eval list <agent> [flags]
```

**Examples**

```sh
caplo agent eval list "Shop Concierge"
caplo agent eval list "Shop Concierge" -n 5 -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--limit`, `-n` | int | `20` | most runs to show (at most 100) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent eval run

Run the agent's eval cases against its saved draft.

```sh
caplo agent eval run <agent>
```

Runs every case of the agent's eval suite against its saved draft in isolated test conversations, as publishing does, and prints each case with its failed checks and the grader's rationale. A passing run for the same draft and suite is reused. It waits up to 12 minutes for the run and exits 3 when a case fails.

**Examples**

```sh
caplo agent eval run "Shop Concierge"
```

## caplo agent get

Show an agent: draft, model, tools, sub-agents, and latest release.

```sh
caplo agent get <agent> [flags]
```

**Examples**

```sh
caplo agent get "Shop Concierge"
caplo agent get 6f1d2c3b-8a4e-4f0a-9b7c-2d1e0f3a4b5c -o yaml
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent init

Write a new agent file to edit, validate, and push.

```sh
caplo agent init [flags]
```

Writes a starter agent file with one eval case. The file must not exist. Without --name, the agent is named after the file: its first letter capitalized and dashes as spaces.

**Examples**

```sh
caplo agent init
caplo agent init -f agents/help-desk.yaml
caplo agent init -f support.yaml --name "Support Desk"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--file`, `-f` | string | `agent.yaml` | agent file to write |
| `--name` | string |  | agent name (default: from the file name) |

## caplo agent list

List the workspace's agents.

```sh
caplo agent list [flags]
```

Lists the workspace's agents with their latest release, draft revision, and status. Archived agents are left out unless --archived.

**Examples**

```sh
caplo agent list
caplo agent list --archived -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--archived` |  |  | include archived agents |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent publish

Pin tools, run the evals, and publish the agent's saved draft as a release.

```sh
caplo agent publish <agent> [flags]
```

Publishes the saved draft of a workspace agent: it pins the draft's tool versions, checks that the draft is ready, runs its eval cases, and publishes it. The agent needs at least one eval case, and every case must pass. Its sub-agents must have releases already; caplo publish releases a project's agents together.

A released draft is published again only when its packages have newer versions. When its eval cases changed since its release, they run against it and the release is kept.

Without --bump the version follows the console: a first release, or a change of sub-agents, provider, or model, or a removed tool, action, or knowledge base, is major; an added one is minor; anything else is a patch. It asks before publishing; --yes skips the question.

**Examples**

```sh
caplo agent publish "Shop Concierge"
caplo agent publish "Shop Concierge" --bump minor --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--bump` | string |  | version bump: major, minor, or patch (default: suggested from the changes) |
| `--yes`, `-y` |  |  | publish without asking |

## caplo agent pull

Write an agent's draft as the console's Export YAML, to --file or standard output.

```sh
caplo agent pull <agent> [flags]
```

Writes the agent's draft byte for byte as the console's Export YAML. Sub-agents are linked by agentId, and the eval cases are not included; caplo pull writes an agent with its sub-agents and eval cases into a project.

**Examples**

```sh
caplo agent pull "Shop Concierge"
caplo agent pull "Shop Concierge" -f concierge.yaml
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--file`, `-f` | string |  | file to write (default: standard output) |

## caplo agent push

Save an agent file as the agent's draft, creating the agent if needed, and its evals as the eval suite.

```sh
caplo agent push [flags]
```

Saves the file as the draft of the workspace agent with its name, creating the agent when there is none. The file's evals replace the agent's eval suite; without an evals key the suite is left alone. Inside a project, local references resolve, and the sub-agents and packages they name must exist in the workspace already. --dry-run prints the draft diff without saving.

**Examples**

```sh
caplo agent push -f agent.yaml
caplo agent push -f agent.yaml --dry-run
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dry-run` |  |  | show the draft diff without saving |
| `--file`, `-f` | string |  | agent file |

## caplo agent release

List, show, and revoke an agent's releases.

```sh
caplo agent release
```

A release is a published draft revision with its tool versions and sub-agent releases pinned. Channels serve releases, and parents link them. A release is named by its number, its version with or without a leading v, or its ID.

**Examples**

```sh
caplo agent release list "Shop Concierge"
caplo agent release revoke "Shop Concierge" 2.1.0 --reason "wrong refund policy"
```

**Commands**

- [`caplo agent release get`](#caplo-agent-release-get)
- [`caplo agent release list`](#caplo-agent-release-list)
- [`caplo agent release revoke`](#caplo-agent-release-revoke)

## caplo agent release get

Show a release: version, tools, sub-agent releases, and eval gate.

```sh
caplo agent release get <agent> <release> [flags]
```

**Examples**

```sh
caplo agent release get "Shop Concierge" 2.1.0
caplo agent release get "Shop Concierge" 7 -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent release list

List the agent's releases, newest first.

```sh
caplo agent release list <agent> [flags]
```

**Examples**

```sh
caplo agent release list "Shop Concierge"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo agent release revoke

Permanently revoke a release, so channels and parents can no longer run it.

```sh
caplo agent release revoke <agent> <release> [flags]
```

Revokes a release permanently; it cannot be undone. Channels that serve it and parents that link it can no longer run it, and links at release: latest and channel deploys skip it. It needs --reason and asks first; --yes skips the question.

**Examples**

```sh
caplo agent release revoke "Shop Concierge" 2.1.0 --reason "wrong refund policy"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--reason` | string |  | why the release is revoked (required) |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo agent test

Manage your private test sessions.

```sh
caplo agent test
```

Each caplo agent chat runs in a private test session, which holds test capacity until it is closed. The chat closes its session when it ends; list and close find and free sessions left open.

**Examples**

```sh
caplo agent test list
caplo agent test close 4d2f8b1e-6c3a-4f7e-9d05-1a2b3c4d5e6f
```

**Commands**

- [`caplo agent test close`](#caplo-agent-test-close)
- [`caplo agent test list`](#caplo-agent-test-list)

## caplo agent test close

Close one of your private test sessions and release its capacity.

```sh
caplo agent test close <session-id>
```

**Examples**

```sh
caplo agent test close 4d2f8b1e-6c3a-4f7e-9d05-1a2b3c4d5e6f
```

## caplo agent test list

List your open test sessions across agents in this workspace.

```sh
caplo agent test list
```

**Examples**

```sh
caplo agent test list
```

## caplo agent validate

Check an agent file offline: schema, references, and link policies.

```sh
caplo agent validate [flags]
```

Checks the file against the agent schema and its references without calling the workspace. When the file is an agent of a project, by the project's agents glob, local references resolve and the project's problems with the file are reported too. Outside a project, sub-agents are linked by agentId and tools name a package ID or a remote MCP server. Problems are printed and the command exits 3.

**Examples**

```sh
caplo agent validate -f agent.yaml
caplo agent validate -f agents/orders.yaml
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--file`, `-f` | string |  | agent file |
