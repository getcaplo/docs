---
title: "caplo tool"
description: "Build, test, publish, and run tool packages."
editUrl: false
sidebar:
  order: 10
  label: "tool"
---

:::note[Generated reference]
Generated from `caplo` v0.4.1, the latest release. `caplo tool --help` prints the same text.
:::

Build, test, publish, and run tool packages.

```sh
caplo tool
```

A tool package is a TypeScript package of tools that agents call, of type function or mcp. Its caplo.yaml names it and declares its tools' policy, egress, secrets, and fixtures. caplo tool init creates one, caplo tool test runs its fixtures locally, caplo tool push uploads and builds its workspace draft, and caplo tool publish makes a build a version that agents can use. Writing tools is covered at https://docs.caplo.si/tools/.

Commands that act on a workspace package take its name, or read caplo.yaml in --dir (default: the current directory). Inside a project, caplo push and caplo publish handle its packages.

**Examples**

```sh
caplo tool init orders --type mcp
cd orders && npm install
caplo tool test
caplo tool push && caplo tool publish
```

**Commands**

- [`caplo tool archive`](#caplo-tool-archive)
- [`caplo tool build`](#caplo-tool-build)
- [`caplo tool delete`](#caplo-tool-delete)
- [`caplo tool dev`](#caplo-tool-dev)
- [`caplo tool get`](#caplo-tool-get)
- [`caplo tool init`](#caplo-tool-init)
- [`caplo tool list`](#caplo-tool-list)
- [`caplo tool logs`](#caplo-tool-logs)
- [`caplo tool publish`](#caplo-tool-publish)
- [`caplo tool pull`](#caplo-tool-pull)
- [`caplo tool push`](#caplo-tool-push)
- [`caplo tool restore`](#caplo-tool-restore)
- [`caplo tool secret`](#caplo-tool-secret)
- [`caplo tool test`](#caplo-tool-test)
- [`caplo tool version`](#caplo-tool-version)

## caplo tool archive

Archive a package: no more pushes, builds, or publishes; its versions stay live until revoked.

```sh
caplo tool archive [package] [flags]
```

Archives a package: it can no longer be pushed, built, or published. Its published versions stay live for the agents that use them until they are revoked with caplo tool version revoke. caplo tool restore undoes it. It asks first; --yes skips the question.

**Examples**

```sh
caplo tool archive orders --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo tool build

Show, follow, and cancel builds.

```sh
caplo tool build
```

A build is named by its ID; [package] defaults to the one caplo.yaml in --dir names.

**Examples**

```sh
caplo tool build list orders
caplo tool build logs orders 5e0c8a3d-7b21-4f6e-8c90-3a1d2b4c5e6f
```

**Commands**

- [`caplo tool build cancel`](#caplo-tool-build-cancel)
- [`caplo tool build get`](#caplo-tool-build-get)
- [`caplo tool build list`](#caplo-tool-build-list)
- [`caplo tool build logs`](#caplo-tool-build-logs)

## caplo tool build cancel

Cancel a queued or running build.

```sh
caplo tool build cancel [package] <build> [flags]
```

**Examples**

```sh
caplo tool build cancel orders 5e0c8a3d-7b21-4f6e-8c90-3a1d2b4c5e6f
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |

## caplo tool build get

Show a build: status, bundle, tools, and diagnostics.

```sh
caplo tool build get [package] <build> [flags]
```

**Examples**

```sh
caplo tool build get orders 5e0c8a3d-7b21-4f6e-8c90-3a1d2b4c5e6f
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo tool build list

List a package's builds, newest first.

```sh
caplo tool build list [package] [flags]
```

**Examples**

```sh
caplo tool build list orders
caplo tool build list orders --status failed -n 5
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--limit`, `-n` | int | `20` | most builds to show (at most 100) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
| `--status` | string |  | only builds with this status, for example failed |

## caplo tool build logs

Print a build's log, following it until the build finishes.

```sh
caplo tool build logs [package] <build> [flags]
```

**Examples**

```sh
caplo tool build logs orders 5e0c8a3d-7b21-4f6e-8c90-3a1d2b4c5e6f
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |

## caplo tool delete

Delete a package that was never published; archive a published one instead.

```sh
caplo tool delete [package] [flags]
```

Deletes a package that has never published a version, with its draft and builds. A package with versions can only be archived. It asks first; --yes skips the question.

**Examples**

```sh
caplo tool delete orders-draft --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo tool dev

Run the package over stdio in MCP Inspector, or for another MCP client with --no-inspector.

```sh
caplo tool dev [flags]
```

Runs the package's src/stdio.ts with Node 24 in MCP Inspector, started with npx, to call its tools by hand. The secrets caplo.yaml declares are read from environment variables of the same name. With --no-inspector the server speaks MCP on this process's standard input and output, so another MCP client can start it.

**Examples**

```sh
caplo tool dev
ORDERS_API_KEY=test caplo tool dev --no-inspector --dir ~/src/orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--no-inspector` |  |  | serve MCP on stdio instead of opening MCP Inspector |

## caplo tool get

Show a package, its latest build, and the tools of its latest active version.

```sh
caplo tool get [package] [flags]
```

**Examples**

```sh
caplo tool get orders
caplo tool get -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo tool init

Create a function or mcp package from the SDK templates.

```sh
caplo tool init <directory> [flags]
```

Creates a package in directory, which must be missing or empty, from the function or mcp template of the @caplo/tools SDK, which is embedded in the CLI at build time. --type is required. The package is named after the directory unless --name is given. Run npm install in it before testing it.

**Examples**

```sh
caplo tool init orders --type mcp
caplo tool init tools/weather --type function
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--name` | string |  | package name (default: the directory name) |
| `--type`, `-t` | string |  | package type: function or mcp |

## caplo tool list

List the workspace's tool packages.

```sh
caplo tool list [flags]
```

Lists the packages with their type, latest active version, latest build, and draft revision. Remote MCP servers are packages of type remote_mcp.

**Examples**

```sh
caplo tool list
caplo tool list --type mcp --archived
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--archived` |  |  | include archived packages |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
| `--type`, `-t` | string |  | only packages of this type: function, mcp, or remote_mcp |

## caplo tool logs

Show recent live invocations of the package with their log lines; the runners keep the last hour.

```sh
caplo tool logs [package] [flags]
```

Prints the package's recent live invocations with each tool's status, timing, error, egress denials, and log lines. -n sets how many come first, and -f keeps streaming new ones.

**Examples**

```sh
caplo tool logs orders
caplo tool logs orders -n 50 -f
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--follow`, `-f` |  |  | keep streaming new invocations |
| `--tail`, `-n` | int | `20` | recent invocations to show first (at most 200) |

## caplo tool publish

Publish the latest succeeded build, or --build &lt;id&gt;, as a new version.

```sh
caplo tool publish [package] [flags]
```

Publishes the package's latest succeeded build, or the build --build names, as its next version. An agent pins its tools' versions when it is published, so agents use the new version from their next release.

**Examples**

```sh
caplo tool publish
caplo tool publish orders --build 5e0c8a3d-7b21-4f6e-8c90-3a1d2b4c5e6f
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--build` | string |  | build ID to publish |
| `--dir`, `-C` | string | `.` | package directory |

## caplo tool pull

Download the draft, or the exact source of a published version, to run it locally.

```sh
caplo tool pull <package>[@version] [flags]
```

Writes the package's draft, or with @version the exact source of the build that version was published from, into an empty or new directory (default: ./&lt;package&gt;). Every file is downloaded and checked against its listed SHA-256 before anything is written, so all files or none are written. Listed paths outside the package are refused, and files under .git or node_modules are left out. Run the package locally with caplo tool dev --no-inspector.

**Examples**

```sh
caplo tool pull orders
caplo tool pull orders@3 --dir /tmp/orders-v3
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string |  | directory to write, which must be empty or missing (default: ./&lt;package&gt;) |

## caplo tool push

Upload the package as the workspace draft, build it, and stream the build log.

```sh
caplo tool push [flags]
```

Uploads the package directory as its workspace draft, creating the package on its first push, then builds the draft and streams the build log. node_modules, .git, and what git ignores are left out, by the .gitignore files from the enclosing git repository, else the project, down through the package; symlinks and other special files are refused. The builder installs dependencies from the lockfile. Publish the build with caplo tool publish.

**Examples**

```sh
caplo tool push
caplo tool push --dir tools/orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |

## caplo tool restore

Restore an archived package.

```sh
caplo tool restore [package] [flags]
```

Restores an archived package, so it can be pushed, built, and published again.

**Examples**

```sh
caplo tool restore orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |

## caplo tool secret

Manage the secret values live calls receive.

```sh
caplo tool secret
```

A package's live calls receive the secrets its caplo.yaml declares, by name. Each one is the package's own value, set with caplo tool secret set, or is bound to a workspace secret that several packages can share (caplo secret). Values are never shown again, and live calls use a change within a minute. The commands act on the package -p names, else the one caplo.yaml in --dir names.

**Examples**

```sh
caplo tool secret list orders
caplo tool secret bind ORDERS_API_KEY orders-api-key -p orders
```

**Commands**

- [`caplo tool secret bind`](#caplo-tool-secret-bind)
- [`caplo tool secret list`](#caplo-tool-secret-list)
- [`caplo tool secret set`](#caplo-tool-secret-set)
- [`caplo tool secret unbind`](#caplo-tool-secret-unbind)
- [`caplo tool secret unset`](#caplo-tool-secret-unset)

## caplo tool secret bind

Fill a secret from a workspace secret, replacing the package's own value.

```sh
caplo tool secret bind <NAME> <workspace-secret> [flags]
```

**Examples**

```sh
caplo tool secret bind ORDERS_API_KEY orders-api-key -p orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--package`, `-p` | string |  | package name (default: the one caplo.yaml in --dir names) |

## caplo tool secret list

List the secrets the latest active version declares and where each value comes from.

```sh
caplo tool secret list [package] [flags]
```

Lists the names the package's latest active version declares, and any other name that is set or bound, with the source of each value: workspace: &lt;secret&gt;, package, or none.

**Examples**

```sh
caplo tool secret list orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo tool secret set

Set a secret from a hidden prompt, or from stdin when it is not a terminal.

```sh
caplo tool secret set <NAME> [flags]
```

Sets the package's own value of a secret for live calls. The value comes from a hidden prompt, or from standard input without its final newline when that is not a terminal, and is 1 to 8192 bytes. Names match [A-Z][A-Z0-9_]{0,63}. A name bound to a workspace secret must be unbound first.

**Examples**

```sh
caplo tool secret set ORDERS_API_KEY -p orders
printf %s "$ORDERS_API_KEY" | caplo tool secret set ORDERS_API_KEY -p orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--package`, `-p` | string |  | package name (default: the one caplo.yaml in --dir names) |

## caplo tool secret unbind

Remove a secret's workspace secret binding; live calls that need it fail until it is bound or set.

```sh
caplo tool secret unbind <NAME> [flags]
```

Removes the binding and leaves the secret unset. It asks first; --yes skips the question.

**Examples**

```sh
caplo tool secret unbind ORDERS_API_KEY -p orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--package`, `-p` | string |  | package name (default: the one caplo.yaml in --dir names) |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo tool secret unset

Remove a secret; live calls that need it fail.

```sh
caplo tool secret unset <NAME> [flags]
```

Removes the package's own value of a secret. It asks first; --yes skips the question.

**Examples**

```sh
caplo tool secret unset ORDERS_API_KEY -p orders --yes
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--package`, `-p` | string |  | package name (default: the one caplo.yaml in --dir names) |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo tool test

Bundle the package like the builder and run its fixtures in local Node 24, or with --remote on Caplo's test runner.

```sh
caplo tool test [flags]
```

Bundles the package with the builder's esbuild version, options, and rejection rules, loads it through the @caplo/tools host harness from an empty directory with no environment, checks the tool policy in caplo.yaml, and runs the fixtures (tests/*.json unless caplo.yaml sets tests) in local Node 24. It prints the capabilities the builder records from the installed @caplo/tools release beside the ones the running server advertises; the runner requires both. Run npm install first. Local tests run on macOS and Linux; on Windows, use WSL. The server build stays authoritative, since local dependencies may differ from the lockfile.

--remote instead pushes and builds the draft like caplo tool push and runs the fixtures on the workspace's test runner. It exits 3 when a fixture fails.

**Examples**

```sh
caplo tool test
caplo tool test -v
caplo tool test --remote
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--remote` |  |  | push, build, and run the fixtures on the workspace's test runner |
| `--verbose`, `-v` |  |  | print log lines for passing fixtures too |

## caplo tool version

Show and revoke published versions.

```sh
caplo tool version
```

**Examples**

```sh
caplo tool version list orders
caplo tool version revoke orders@3 --reason "leaks order notes"
```

**Commands**

- [`caplo tool version get`](#caplo-tool-version-get)
- [`caplo tool version list`](#caplo-tool-version-list)
- [`caplo tool version revoke`](#caplo-tool-version-revoke)

## caplo tool version get

Show a published version and its tools.

```sh
caplo tool version get [<package>@]<version> [flags]
```

Shows a published version: its status, build, bundle digest, egress, declared secrets, and tools. Without &lt;package&gt;@ the package is the one caplo.yaml in --dir names.

**Examples**

```sh
caplo tool version get orders@3
caplo tool version get 3 --dir tools/orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo tool version list

List a package's published versions.

```sh
caplo tool version list [package] [flags]
```

**Examples**

```sh
caplo tool version list orders
caplo tool version list -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo tool version revoke

Revoke a published version so agents stop resolving it.

```sh
caplo tool version revoke [<package>@]<version> [flags]
```

Revokes a published version so agents stop resolving it. It needs --reason and asks first; --yes skips the question.

**Examples**

```sh
caplo tool version revoke orders@3 --reason "leaks order notes"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | package directory |
| `--reason` | string |  | why the version is revoked (required) |
| `--yes`, `-y` |  |  | do not ask for confirmation |
