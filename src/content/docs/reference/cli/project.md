---
title: "Project commands"
description: "caplo init, validate, diff, push, test, eval, publish and pull: commands that work on a project folder."
editUrl: false
sidebar:
  order: 1
  label: "Project"
---

:::note[Generated reference]
Generated from `caplo` v0.8.0, the latest release. `caplo <command> --help` prints the same text.
:::

These commands work on the project around the current directory, or the one `-C` names. See [Projects](/cli/projects/).

## caplo diff

Show how the project differs from the workspace drafts.

```sh
caplo diff [agent/<name> | tool/<name>]... [flags]
```

Compares each selected package's files with its workspace draft, and each agent file and its evals with the agent's draft and eval suite. It prints the plan, one line per resource, and a unified diff per changed agent; a new agent diffs against nothing. It changes nothing.

Selectors are agent/&lt;file key or name&gt;, where a file key wins over a name, and tool/&lt;package&gt;. An agent brings its project sub-agents and the project packages they use. Without selectors the command acts on the whole project.

With -o json or yaml the plan is one document: the project, workspace, environment, whether anything changes, and per resource its steps (create, update, save-evals, build, test, evaluate, publish, archive, deploy; none when unchanged), summary, changed files, reasons, current and next versions, and diff. A pipeline can post it on a pull request or check it with a policy. push and publish print it only with --dry-run.

**Examples**

```sh
caplo diff
caplo diff agent/concierge tool/order-desk
caplo diff --env prod -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--env`, `-e` | string |  | environment from caplo.yaml: its workspace, agent fields, channels, and promotion (default: $CAPLO_ENV) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo eval

Push the selection, then run each selected agent's eval cases against its draft.

```sh
caplo eval [agent/<name> | tool/<name>]... [flags]
```

Pushes the selection like caplo push, then runs each selected agent's eval cases against its saved draft in isolated test conversations and prints every case. A passing run for the same draft and suite is reused. Exits 3 when a case fails or an agent has no eval cases.

An agent file's evals list cases with the console's fields: name, input, desiredOutcome, uncertainty, prohibitedAction, answerContains, answerExcludes, subAgent, avoidSubAgent, routedBy, and tool. A push matches them to the suite's cases by name and replaces the agent's eval suite with them; without an evals key the suite is left alone. In every run a grader model also judges each case's desiredOutcome. A failed case prints the grader's rationale, and a case the grader could not judge reads desired outcome not graded and does not pass. routedBy (fast, model, or any) checks how an agent with fast routing routed the case.

Selectors are agent/&lt;file key or name&gt;, where a file key wins over a name, and tool/&lt;package&gt;. An agent brings its project sub-agents and the project packages they use. Without selectors the command acts on the whole project.

**Examples**

```sh
caplo eval
caplo eval agent/concierge
caplo eval --env staging
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--env`, `-e` | string |  | environment from caplo.yaml: its workspace, agent fields, channels, and promotion (default: $CAPLO_ENV) |

## caplo init

Create a project: caplo.yaml, agent files, and tool packages.

```sh
caplo init [dir] [flags]
```

Creates a project in dir (default: the current directory), which must be missing or empty. The blank template has one agent; summit is a sample shop with a concierge agent, three sub-agents, and two tool packages. Each tool package gets package.json and tsconfig.json from the @caplo/tools templates; run npm install in it before testing it.

A project is a folder with caplo.yaml: apiVersion v1, kind Project, a name, and the agents and tools globs (default agents/*.yaml and tools/*). Project commands find it by walking up from the current directory or --dir. Each agent file is an agent YAML document with apiVersion v2.0.0, the format of the console's Export YAML; v1 files are refused. The file name without .yaml is the agent's key, which links and selectors use. Each tool package is a directory with its own caplo.yaml, as caplo tool init makes it.

In an agent file:

```sh
subAgents link a project agent with local: <file key>, or any workspace agent with agentId. With release:
latest, or no release, the link pins the child's newest release that is not revoked whenever the parent is
pushed or published, so a child's new release publishes its parents again. A version pins that release. The
child runs with its own release's tools and knowledge.
```

```sh
tools name <package>/<tool> for a project package, <server>/<tool> for a published tool of a workspace remote
MCP server (caplo mcp), <connector>/<tool> for a connector's tool (caplo connector), or <package ID>/<tool>; a
package alone selects all its tools. A name that is no project package is looked up as a remote MCP server or
connector when the project is diffed, pushed, or published.
```

```sh
knowledgeBases name a workspace knowledge base by name or ID. A name resolves in the workspace the command acts
on, so one file works in every environment.
```

```sh
evals are the agent's eval cases; see caplo eval.
```

Workspace agents and packages are matched by name: a missing one is created and an existing one updated. Nothing is deleted; caplo publish --prune archives agents the project no longer defines.

**Examples**

```sh
caplo init shop --template summit
cd shop && (cd tools/order-desk && npm install) && (cd tools/store-stock && npm install)
caplo init --name support
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--name` | string |  | project name (default: the directory name) |
| `--template`, `-t` | string | `blank` | project template: blank or summit |

## caplo publish

Validate, push, test, evaluate, and publish bottom up: tools, then child agents, then parents.

```sh
caplo publish [agent/<name> | tool/<name>]... [flags]
```

Publishes the selection, or the whole project, bottom up. Changed packages are pushed, built, tested with their fixtures on the workspace's test runner, and published first. Then agents publish with children before parents: each draft is saved pinned to its children's new releases, its eval cases run, and it is published. An agent publishes when its file changed, its saved draft is unpublished, or a package or release: latest sub-agent it uses publishes. A release does not pin eval cases, so an agent whose cases alone changed since its release is evaluated and keeps the release. The workspace's publication requirements decide what eval results mean: while it requires passing evals, the default, an agent needs at least one eval case and every case must pass. With the requirement off, the cases still run and print but do not block publishing, and the platform checks of the run must still pass.

It validates the project, prints the plan and diffs, and asks before publishing; --yes skips the question. Without a terminal, and on a project's first publish to a workspace, it needs --yes. --dry-run prints the plan only. --prune archives the agents an earlier publish of this project created that it no longer defines; it takes no selectors.

Selectors are agent/&lt;file key or name&gt;, where a file key wins over a name, and tool/&lt;package&gt;. An agent brings its project sub-agents and the project packages they use. Without selectors the command acts on the whole project.

Selecting an agent also selects the project agents that link it at release: latest, since its new release publishes them again.

Environments. caplo.yaml may define environments, each a workspace the project publishes to:

```sh
environments:
  staging:
    workspace: 5b1e9c2a-...        # an ID, or a name when you log in rather than use an API key
    apiKeyEnv: CAPLO_STAGING_KEY   # optional: the variable with this environment's API key
  prod:
    workspace: 0d6a3c87-...
    apiKeyEnv: CAPLO_PROD_KEY
    promoteFrom: staging           # publish only what staging released from the same source
    agents:                        # agent fields by file key, merged over the agent file
      front: {model: {name: claude-sonnet-4-5}}
    channels:                      # channels a publish points at the agent's newest release
      front: [Website, twilio/Support line]
```

--env, or CAPLO_ENV, selects one for validate, diff, push, eval, and publish: its workspace (a different --workspace or CAPLO_WORKSPACE is refused), its API key when its apiKeyEnv variable is set (used instead of CAPLO_API_KEY), and its agent fields, which merge like a JSON merge patch: mappings merge, null removes a key, and anything else replaces.

Each release's note names the project and the agent's source digest: its file as written, the files of the project packages it uses, and its project sub-agents. With promoteFrom, the publish exits 3 unless every agent it publishes has a release in that environment, not revoked, with the same digest. That environment is read with its own apiKeyEnv key, else the login session; a publish that uses an API key needs the other environment's key, with agents:read. After publishing, it deploys the environment's channels that do not serve their agent's newest release, which needs channels:write; the plan lists them as channel/&lt;kind&gt;/&lt;name&gt;.

With -o json or yaml the plan is one document: the project, workspace, environment, whether anything changes, and per resource its steps (create, update, save-evals, build, test, evaluate, publish, archive, deploy; none when unchanged), summary, changed files, reasons, current and next versions, and diff. A pipeline can post it on a pull request or check it with a policy. push and publish print it only with --dry-run.

**Examples**

```sh
caplo publish
caplo publish agent/orders --dry-run
caplo publish --env prod --yes
caplo publish --prune
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--dry-run` |  |  | show the plan and diffs without publishing |
| `--env`, `-e` | string |  | environment from caplo.yaml: its workspace, agent fields, channels, and promotion (default: $CAPLO_ENV) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
| `--prune` |  |  | archive agents an earlier publish of this project created that it no longer defines |
| `--yes`, `-y` |  |  | publish without asking |

## caplo pull

Write a workspace agent, its sub-agents, and their packages into a project.

```sh
caplo pull agent/<name> [dir] [flags]
```

Writes a workspace agent, named by name or ID, and every sub-agent it links, with their drafts and eval cases, as agent files of a project. The project is the one at dir; a dir without caplo.yaml becomes a new project unless it is inside another one. Without dir it is the project above --dir, or a new one in --dir. Agents the project defines are written to their own files, others to new files in the directory the agents glob names.

Packages the agents use that the project lacks are pulled from their workspace drafts into the directory the tools glob names; remote MCP server and connector tools stay &lt;server&gt;/&lt;tool&gt; and &lt;connector&gt;/&lt;tool&gt;. Links name the release the draft pins, since a draft does not record release: latest.

**Examples**

```sh
caplo pull "agent/Shop Concierge"
caplo pull agent/concierge ./shop
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |

## caplo push

Create or update the workspace drafts, children first, so you can live test them.

```sh
caplo push [agent/<name> | tool/<name>]... [flags]
```

Prints the plan, then uploads and builds each changed package as its workspace draft, and saves each agent file as its agent's draft and its evals as the agent's eval suite, children before parents. A missing package or agent is created. Nothing is published.

A live test runs linked sub-agents from their releases, so push names the project sub-agents that have no release yet and the caplo publish that releases them. --dry-run prints the plan and diffs without pushing.

Selectors are agent/&lt;file key or name&gt;, where a file key wins over a name, and tool/&lt;package&gt;. An agent brings its project sub-agents and the project packages they use. Without selectors the command acts on the whole project.

With -o json or yaml the plan is one document: the project, workspace, environment, whether anything changes, and per resource its steps (create, update, save-evals, build, test, evaluate, publish, archive, deploy; none when unchanged), summary, changed files, reasons, current and next versions, and diff. A pipeline can post it on a pull request or check it with a policy. push and publish print it only with --dry-run.

**Examples**

```sh
caplo push
caplo push agent/concierge
caplo push --dry-run -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--dry-run` |  |  | show the changes and diffs without pushing |
| `--env`, `-e` | string |  | environment from caplo.yaml: its workspace, agent fields, channels, and promotion (default: $CAPLO_ENV) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo test

Run the selected tool packages' fixtures locally, like caplo tool test.

```sh
caplo test [agent/<name> | tool/<name>]... [flags]
```

Runs caplo tool test in each selected package: it bundles the package like the builder and runs its fixtures in local Node 24. It calls no workspace. Exits 3 when a fixture fails.

Selectors are agent/&lt;file key or name&gt;, where a file key wins over a name, and tool/&lt;package&gt;. An agent brings its project sub-agents and the project packages they use. Without selectors the command acts on the whole project.

**Examples**

```sh
caplo test
caplo test tool/order-desk -v
caplo test agent/orders
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--verbose`, `-v` |  |  | print log lines for passing fixtures too |

## caplo validate

Check the project offline: schemas, references, link cycles, and the depth limit.

```sh
caplo validate [flags]
```

Checks the project without calling the workspace: caplo.yaml and each package's caplo.yaml, every agent file against the agent schema, unique agent names and file keys, references to project agents and packages, the tools an mcp package declares, sub-agent link cycles, and each agent's depth limit: at most policy.maxDepth (1 to 4, default 3) sub-agent links below it. Tools of remote MCP servers and connectors are checked when the project is diffed, pushed, or published.

An agent with routing mode fast needs at least one sub-agent and doNotUseWhen on every link. When its file lists evals, each sub-agent also needs two cases that set routedBy and name it in subAgent.

Every environment in caplo.yaml is checked: the agent keys it names and its agent fields merged over each file. With --env, the agents are checked as that environment publishes them. Problems are printed and the command exits 3.

**Examples**

```sh
caplo validate
caplo validate --env prod
caplo validate -C ~/src/shop
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--dir`, `-C` | string | `.` | start looking for the project's caplo.yaml here |
| `--env`, `-e` | string |  | environment from caplo.yaml: its workspace, agent fields, channels, and promotion (default: $CAPLO_ENV) |
