---
title: "caplo knowledge"
description: "Manage knowledge bases and sync their documents from a directory."
editUrl: false
sidebar:
  order: 7
  label: "knowledge"
---

:::note[Generated reference]
Generated from `caplo` v0.4.0, the latest release. `caplo knowledge --help` prints the same text.
:::

Manage knowledge bases and sync their documents from a directory.

```sh
caplo knowledge
```

Aliases: `kb`

A knowledge base holds documents an agent answers from. Each upload is extracted and waits for review; a person approves it in the console, or caplo knowledge approve does. Publishing snapshots the approved documents into a version, and an agent release pins the newest ready version. Agent files name knowledge bases by name or ID, and so do these commands.

**Examples**

```sh
caplo knowledge create "Returns policy" --owner support
caplo knowledge sync "Returns policy" ./docs/returns --approve --publish --yes
```

**Commands**

- [`caplo knowledge approve`](#caplo-knowledge-approve)
- [`caplo knowledge create`](#caplo-knowledge-create)
- [`caplo knowledge get`](#caplo-knowledge-get)
- [`caplo knowledge list`](#caplo-knowledge-list)
- [`caplo knowledge publish`](#caplo-knowledge-publish)
- [`caplo knowledge sync`](#caplo-knowledge-sync)

## caplo knowledge approve

Wait for extraction and approve documents for the next version, by default every one awaiting review.

```sh
caplo knowledge approve <kb> [document]... [flags]
```

Approving a document skips reviewing its extracted text in the console. It waits for documents still being extracted and fails when one fails to extract. It needs agents:publish.

**Examples**

```sh
caplo knowledge approve "Returns policy"
caplo knowledge approve "Returns policy" refunds.md exchanges.pdf
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--timeout` | duration | `15m0s` | how long to wait for extraction |

## caplo knowledge create

Create a knowledge base.

```sh
caplo knowledge create <name> --owner <team> [flags]
```

Creates a knowledge base. --owner names the team that owns its content. --audience verified_customer limits its content to customers who signed in; the default is public.

**Examples**

```sh
caplo knowledge create "Returns policy" --owner support --description "Return and refund rules"
caplo knowledge create "Account help" --owner support --audience verified_customer
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--audience` | string |  | public (default) or verified_customer, for content only signed-in customers may get |
| `--description` | string |  | what the knowledge base covers |
| `--owner` | string |  | team that owns the content |

## caplo knowledge get

Show a knowledge base, its documents, and its versions.

```sh
caplo knowledge get <kb> [flags]
```

Shows the knowledge base, its newest version, and its documents with their extraction and review state. -o json or yaml includes every version.

**Examples**

```sh
caplo knowledge get "Returns policy"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge list

List the workspace's knowledge bases.

```sh
caplo knowledge list [flags]
```

**Examples**

```sh
caplo kb list
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge publish

Publish a version from the approved documents and wait for it to index.

```sh
caplo knowledge publish <kb> [flags]
```

Publishes a version from the approved documents, unless the newest version holds exactly them, and waits until it is ready. Agent releases published from then on use it. Exits 3 when there are no approved documents or the version does not become ready.

**Examples**

```sh
caplo knowledge publish "Returns policy"
caplo knowledge publish "Returns policy" --timeout 30m
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--timeout` | duration | `15m0s` | how long to wait for indexing |

## caplo knowledge sync

Make a knowledge base's documents match a directory, and optionally approve and publish them.

```sh
caplo knowledge sync <kb> <dir> [flags]
```

Uploads the directory's new and changed documents and removes the ones whose file is gone. The older copy of a changed file is removed once the new copy is approved, so a version never lacks the document; a document a published version holds stays in that version. Files are matched by name and content, so an unchanged file is not uploaded again. Documents are named by file name, so two files in the tree may not share one. Supported types, up to 25 MiB each: .txt .md .markdown .html .pdf .docx .png .jpg .jpeg .webp. Other files are skipped, and so are hidden files and directories.

--approve waits for extraction and approves the directory's documents, which skips reviewing their extracted text in the console; it needs agents:publish. --publish then publishes a version from the approved documents and waits for it to index. It asks for confirmation before removing documents; --yes skips it. --dry-run prints the changes only.

**Examples**

```sh
caplo knowledge sync "Returns policy" ./docs/returns --dry-run
caplo knowledge sync "Returns policy" ./docs/returns --approve --publish --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--approve` |  |  | wait for extraction and approve the directory's documents |
| `--dry-run` |  |  | show the changes without making them |
| `--publish` |  |  | publish a version from the approved documents and wait for it to index |
| `--timeout` | duration | `15m0s` | how long --approve and --publish wait for extraction and indexing |
| `--yes`, `-y` |  |  | remove documents without asking |
