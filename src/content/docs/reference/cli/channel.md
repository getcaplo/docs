---
title: "caplo channel"
description: "List channels and deploy agent releases to them."
editUrl: false
sidebar:
  order: 5
  label: "channel"
---

:::note[Generated reference]
Generated from `caplo` v0.5.1, the latest release. `caplo channel --help` prints the same text.
:::

List channels and deploy agent releases to them.

```sh
caplo channel
```

A channel is a website widget, WhatsApp number, Messenger or Instagram account, Outlook mailbox, or phone number, and serves one agent release. Channels are created in the console; deploy and rollback change the release they serve. New conversations get the new release, and open ones keep the release they started with. A channel is named by its ID, its name, or &lt;kind&gt;/&lt;name&gt;. Every other setting of a channel stays as it is, and its revision guards a deploy against a concurrent change in the console.

**Examples**

```sh
caplo channel list
caplo channel deploy Website --agent "Shop Concierge"
```

**Commands**

- [`caplo channel deploy`](#caplo-channel-deploy)
- [`caplo channel get`](#caplo-channel-get)
- [`caplo channel list`](#caplo-channel-list)
- [`caplo channel rollback`](#caplo-channel-rollback)

## caplo channel deploy

Point channels at an agent release, by default their agent's newest release.

```sh
caplo channel deploy <channel>... [--agent <agent>[@<version>]] [flags]
```

Points each channel at the release: --agent names the agent and, after @, its version (1.4.0) or release number; without a version it is the agent's newest release that is not revoked. Without --agent each channel keeps its agent. A revoked release is never deployed. It asks for confirmation; --yes skips it.

**Examples**

```sh
caplo channel deploy Website
caplo channel deploy Website "twilio/Support line" --agent "Shop Concierge@2.1.0" --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--agent` | string |  | agent name or ID, with @version or @number to pick a release |
| `--yes`, `-y` |  |  | deploy without asking |

## caplo channel get

Show a channel and the release it serves.

```sh
caplo channel get <channel> [flags]
```

**Examples**

```sh
caplo channel get Website
caplo channel get "twilio/Support line"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo channel list

List the workspace's channels and the release each serves.

```sh
caplo channel list [flags]
```

**Examples**

```sh
caplo channel list
caplo channel list --agent "Shop Concierge" -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--agent` | string |  | only the channels serving this agent (name or ID) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo channel rollback

Point channels back at their agent's release before the one they serve.

```sh
caplo channel rollback <channel>... [flags]
```

Points each channel at the newest release of its agent, older than the one it serves, that is not revoked. The release is served as it was published. Publishing never moves a channel; caplo channel deploy points it at a newer release. It asks for confirmation; --yes skips it.

**Examples**

```sh
caplo channel rollback Website --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--yes`, `-y` |  |  | roll back without asking |
