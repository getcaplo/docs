# caplo knowledge

> Manage knowledge bases and their files, and search them.

Generated reference

Generated from `caplo` v0.6.0, the latest release. `caplo knowledge --help` prints the same text.

Manage knowledge bases and their files, and search them.

```plaintext
caplo knowledge
```

Aliases: `kb`

A knowledge base holds files an agent answers from. An uploaded file is published: it is read, cut into passages and indexed, and then goes live by itself, so from the next question on every agent using the knowledge base can find it. Unpublishing a file takes it out of agents’ answers at once and keeps it stored and indexed, so publishing it again is instant. Replacing a file keeps its old content answering until the new content is live; if the new content cannot be read, the old content stays live and the file says why. Deleting a file removes it from search at once. Agent files name knowledge bases by name or ID, and so do these commands.

When the knowledge service refuses a change, such as deleting a knowledge base agents use or going over one of the workspace’s limits, the command prints the service’s sentence saying what to do and exits 1.

**Examples**

```plaintext
caplo knowledge create "Returns policy" --description "Return and refund rules"
caplo knowledge files upload "Returns policy" ./refunds.pdf --wait
caplo knowledge search "Returns policy" "How long do I have to return a jacket?"
```

**Commands**

* [`caplo knowledge create`](#caplo-knowledge-create)
* [`caplo knowledge delete`](#caplo-knowledge-delete)
* [`caplo knowledge files`](#caplo-knowledge-files)
* [`caplo knowledge get`](#caplo-knowledge-get)
* [`caplo knowledge list`](#caplo-knowledge-list)
* [`caplo knowledge search`](#caplo-knowledge-search)
* [`caplo knowledge sync`](#caplo-knowledge-sync)
* [`caplo knowledge update`](#caplo-knowledge-update)

## caplo knowledge create

Create a knowledge base.

```plaintext
caplo knowledge create <name> [flags]
```

Creates a knowledge base. –description says what it covers; an agent’s model reads it to decide when searching is worth it. –audience verified_customer limits its content to customers who signed in; the default is public.

**Examples**

```plaintext
caplo knowledge create "Returns policy" --description "Return and refund rules"
caplo knowledge create "Account help" --audience verified_customer
```

**Flags**

| Flag            | Value  | Default | Description                                                                                |
| --------------- | ------ | ------- | ------------------------------------------------------------------------------------------ |
| `--audience`    | string |         | public, or verified_customer for content only signed-in customers may get (default public) |
| `--description` | string |         | what the knowledge base covers                                                             |

## caplo knowledge delete

Delete a knowledge base and all its files.

```plaintext
caplo knowledge delete <kb> [flags]
```

Deletes the knowledge base with its files and passages. A knowledge base that agents use cannot be deleted: the command prints which agents use it, and you remove it from them first. It asks for confirmation; –yes skips it.

**Examples**

```plaintext
caplo knowledge delete "Returns policy" --yes
```

**Flags**

| Flag          | Value | Default | Description           |
| ------------- | ----- | ------- | --------------------- |
| `--yes`, `-y` |       |         | delete without asking |

## caplo knowledge files

List, upload, replace, publish, unpublish, and delete a knowledge base’s files.

```plaintext
caplo knowledge files
```

**Commands**

* [`caplo knowledge files delete`](#caplo-knowledge-files-delete)
* [`caplo knowledge files list`](#caplo-knowledge-files-list)
* [`caplo knowledge files passages`](#caplo-knowledge-files-passages)
* [`caplo knowledge files publish`](#caplo-knowledge-files-publish)
* [`caplo knowledge files replace`](#caplo-knowledge-files-replace)
* [`caplo knowledge files unpublish`](#caplo-knowledge-files-unpublish)
* [`caplo knowledge files upload`](#caplo-knowledge-files-upload)

## caplo knowledge files delete

Delete a file from a knowledge base.

```plaintext
caplo knowledge files delete <kb> <file-id> [flags]
```

Deletes the file, with content still processing for it; agents stop finding it at once. It asks for confirmation; –yes skips it.

**Examples**

```plaintext
caplo knowledge files delete "Returns policy" 3f9a1c2e-... --yes
```

**Flags**

| Flag          | Value | Default | Description           |
| ------------- | ----- | ------- | --------------------- |
| `--yes`, `-y` |       |         | delete without asking |

## caplo knowledge files list

List a knowledge base’s files, newest first.

```plaintext
caplo knowledge files list <kb> [flags]
```

**Examples**

```plaintext
caplo knowledge files list "Returns policy"
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge files passages

Print the passages of a file’s live content, as agents read them.

```plaintext
caplo knowledge files passages <kb> <file-id> [flags]
```

**Examples**

```plaintext
caplo knowledge files passages "Returns policy" 3f9a1c2e-...
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge files publish

Publish a file, so agents answer from it.

```plaintext
caplo knowledge files publish <kb> <file-id>
```

Publishes an unpublished file. Agents answer from it at once if its content is live, else as soon as it is processed. Publishing a published file changes nothing.

**Examples**

```plaintext
caplo knowledge files publish "Returns policy" 3f9a1c2e-...
```

## caplo knowledge files replace

Replace a file’s content.

```plaintext
caplo knowledge files replace <kb> <file-id> <path> [flags]
```

Uploads new content for a file. Its current content keeps answering until the new content is live; if the new content cannot be read, the current content stays live and the file says why. An unpublished file stays unpublished. –wait waits until it is live or failed, and exits 3 with the reason when it failed.

**Examples**

```plaintext
caplo knowledge files replace "Returns policy" 3f9a1c2e-... ./refunds-2027.pdf --wait
```

**Flags**

| Flag        | Value    | Default | Description                           |
| ----------- | -------- | ------- | ------------------------------------- |
| `--timeout` | duration | `15m0s` | how long –wait waits                  |
| `--wait`    |          |         | wait until the file is live or failed |

## caplo knowledge files unpublish

Unpublish a file, so agents stop answering from it.

```plaintext
caplo knowledge files unpublish <kb> <file-id>
```

Takes a file out of agents’ answers at once. The file stays in the knowledge base, stored and indexed, so caplo knowledge files publish makes it answer again at once. Replacing an unpublished file keeps it unpublished. Unpublishing an unpublished file changes nothing.

**Examples**

```plaintext
caplo knowledge files unpublish "Returns policy" 3f9a1c2e-...
```

## caplo knowledge files upload

Upload a file to a knowledge base.

```plaintext
caplo knowledge files upload <kb> <path> [flags]
```

Uploads and publishes a file, which goes live by itself once it is read and indexed. –wait waits until it is live or failed, and exits 3 with the reason when it failed. A file whose content is already in the knowledge base is refused, and so is a file over one of the workspace’s limits: files per knowledge base, stored bytes, and files waiting to be processed. Supported types, up to 25 MiB: .txt .md .markdown .html .htm .pdf .docx .png .jpg .jpeg .webp.

**Examples**

```plaintext
caplo knowledge files upload "Returns policy" ./refunds.pdf --wait
```

**Flags**

| Flag        | Value    | Default | Description                           |
| ----------- | -------- | ------- | ------------------------------------- |
| `--timeout` | duration | `15m0s` | how long –wait waits                  |
| `--wait`    |          |         | wait until the file is live or failed |

## caplo knowledge get

Show a knowledge base.

```plaintext
caplo knowledge get <kb> [flags]
```

**Examples**

```plaintext
caplo knowledge get "Returns policy"
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge list

List the workspace’s knowledge bases.

```plaintext
caplo knowledge list [flags]
```

**Examples**

```plaintext
caplo kb list
```

**Flags**

| Flag             | Value  | Default | Description                         |
| ---------------- | ------ | ------- | ----------------------------------- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo knowledge search

Search a knowledge base’s live files as an agent would.

```plaintext
caplo knowledge search <kb> <question> [flags]
```

Prints the coverage, good, partial or none, and the passages an agent would get, each with its file, section, page and relevance.

**Examples**

```plaintext
caplo knowledge search "Returns policy" "How much is delivery to Lahore?"
```

**Flags**

| Flag             | Value  | Default | Description                            |
| ---------------- | ------ | ------- | -------------------------------------- |
| `--limit`        | int    | `0`     | passages to return, 1 to 8 (default 6) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml    |

## caplo knowledge sync

Make a knowledge base’s files match a directory.

```plaintext
caplo knowledge sync <kb> <dir> [flags]
```

Uploads the directory’s new files, replaces the files whose content changed, and deletes the files whose name is gone from the directory. Files are matched by name, so two files in the tree may not share one; an unchanged file is not uploaded again. A replaced file keeps answering with its previous content until the new content is live. Supported types, up to 25 MiB each: .txt .md .markdown .html .htm .pdf .docx .png .jpg .jpeg .webp. Other files are skipped, and so are hidden files and directories.

It asks for confirmation before deleting files; –yes skips it. –wait waits until every uploaded file is live or failed, and exits 3 with the reasons when any failed. –dry-run prints the changes only.

When the knowledge service refuses a file over one of the workspace’s limits (files per knowledge base, stored bytes, files waiting to be processed), the sync stops there before deleting anything: the files already uploaded stay, and it prints the refusal and how many files were not uploaded. Any other refusal, such as a file whose content is already in the knowledge base, is printed for that file and the sync goes on with the rest; it then deletes nothing and exits 1, saying how many files were refused.

**Examples**

```plaintext
caplo knowledge sync "Returns policy" ./docs/returns --dry-run
caplo knowledge sync "Returns policy" ./docs/returns --yes --wait
```

**Flags**

| Flag          | Value    | Default | Description                                      |
| ------------- | -------- | ------- | ------------------------------------------------ |
| `--dry-run`   |          |         | show the changes without making them             |
| `--timeout`   | duration | `15m0s` | how long –wait waits                             |
| `--wait`      |          |         | wait until every uploaded file is live or failed |
| `--yes`, `-y` |          |         | delete files without asking                      |

## caplo knowledge update

Rename a knowledge base, or change its description or audience.

```plaintext
caplo knowledge update <kb> [flags]
```

Changes the flags given and keeps the rest. Agent releases copy a knowledge base’s name and description when they are published, so publish the agents that use it for their model to see the change.

**Examples**

```plaintext
caplo knowledge update "Returns policy" --name Returns --description "Return, refund and exchange rules"
```

**Flags**

| Flag            | Value  | Default | Description                                                               |
| --------------- | ------ | ------- | ------------------------------------------------------------------------- |
| `--audience`    | string |         | public, or verified_customer for content only signed-in customers may get |
| `--description` | string |         | what the knowledge base covers                                            |
| `--name`        | string |         | new name                                                                  |
