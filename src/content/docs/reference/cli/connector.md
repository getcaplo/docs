---
title: "caplo connector"
description: "Let agents use your connected accounts, such as a Google, Outlook, or Calendly calendar."
editUrl: false
sidebar:
  order: 7
  label: "connector"
---

:::note[Generated reference]
Generated from `caplo` v0.8.0, the latest release. `caplo connector --help` prints the same text.
:::

Let agents use your connected accounts, such as a Google, Outlook, or Calendly calendar.

```sh
caplo connector
```

A connector gives agents ready-made tools for an account you connect, such as a calendar: checking when you are free, suggesting open times, and, for Calendly, booking appointments. You sign in to the account in the Caplo console, which caplo connector add opens; the connector's tools are then published, ready to add to agents.

Agent files name a connector's tools &lt;connector&gt;/&lt;tool&gt;, or the connector alone for all its tools, just like a remote MCP server's. A connector is named by its name or ID; caplo connector list shows them. Choose which tools agents may use with caplo connector tools --enable, and stop agents using an account with caplo connector remove.

**Examples**

```sh
caplo connector add --open
caplo connector list
caplo connector tools sales-calendar --enable check_availability,find_slots
```

**Commands**

- [`caplo connector add`](#caplo-connector-add)
- [`caplo connector get`](#caplo-connector-get)
- [`caplo connector list`](#caplo-connector-list)
- [`caplo connector remove`](#caplo-connector-remove)
- [`caplo connector tools`](#caplo-connector-tools)

## caplo connector add

Show where to connect an account, such as a calendar, in the Caplo console.

```sh
caplo connector add [flags]
```

Accounts are connected in the browser, where you sign in to them yourself, so this command prints the Connectors page of the Caplo console for the workspace; --open opens it. There, choose the kind of account, sign in to it, and add it as a connector. Its tools are published at once; caplo connector list then shows it.

The page is on the console the CLI is set up for: https://app.caplo.si, or the console-url setting (caplo config set console-url) for another Caplo installation.

**Examples**

```sh
caplo connector add
caplo connector add --open
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--open` |  |  | open the page in the default browser |

## caplo connector get

Show a connector and its tools.

```sh
caplo connector get <name|id> [flags]
```

Shows a connector's account type and account ID, its published version, and its tools: what each does, whether agents may use it, whether it only reads or also makes changes, and whether the customer must confirm it first.

**Examples**

```sh
caplo connector get sales-calendar
caplo connector get sales-calendar -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo connector list

List the workspace's connectors.

```sh
caplo connector list [flags]
```

Lists each connector with its account type, how many of its tools agents may use, and its published version.

**Examples**

```sh
caplo connector list
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo connector remove

Remove a connector: agents can no longer use its tools.

```sh
caplo connector remove <name|id> [flags]
```

Removes a connector. Its tools stop working for every agent that uses them. The account itself stays connected in the console and can be added as a connector again later; the connector's name stays reserved. It asks first; --yes skips the question.

**Examples**

```sh
caplo connector remove sales-calendar --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo connector tools

List a connector's tools, or choose which ones agents may use.

```sh
caplo connector tools <name|id> [flags]
```

Lists a connector's tools. With --enable, agents may use exactly the tools it names, and no others: the connector publishes a new version with them. Agents switch to the new version when they are published again. Name at least one tool; to stop agents using the account altogether, remove the connector.

**Examples**

```sh
caplo connector tools sales-calendar
caplo connector tools sales-calendar --enable check_availability,find_slots
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--enable` | stringSlice |  | the tools agents may use, comma-separated or repeated; all others are turned off |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
