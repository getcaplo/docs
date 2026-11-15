# Work with a project

> Keep agents and tool packages as files in a caplo project, understand caplo.yaml, and choose what each command acts on.

A project is a folder, usually a Git repository, that holds a set of agents and the tool packages they use as plain files. The project commands (`caplo validate`, `diff`, `push`, `test`, `eval`, `publish` and `pull`) read the folder, compare it with a workspace, and create or update what changed. Review changes in pull requests, then publish from your terminal or [from CI](/cli/ci-cd/).

## Create a project

```plaintext
caplo init support
caplo init shop --template summit
```

`caplo init [dir]` creates the project in `dir`, or in the current directory, which must be missing or empty. The project name defaults to the folder name; set another with `--name`. A name starts with a lowercase letter and uses only lowercase letters, digits and hyphens.

| Template          | What you get                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `blank` (default) | One agent with a starter eval case                                                                                                |
| `summit`          | A sample outdoor shop: a concierge agent with fast routing, three specialist sub-agents, and two tool packages with test fixtures |

The `summit` template creates this layout:

```plaintext
shop/
  caplo.yaml                  the project file
  agents/
    concierge.yaml            one agent file per agent
    gear.yaml
    orders.yaml
    returns.yaml
  tools/
    order-desk/               one directory per tool package
      caplo.yaml              the package's own caplo.yaml
      package.json
      tsconfig.json
      src/
      tests/
    store-stock/
      ...
```

Each tool package gets `package.json` and `tsconfig.json` from the current tool SDK templates. Run `npm install` in each package before you run its fixtures; `caplo init` prints the commands. To start from an agent that already exists in a workspace, use [`caplo pull`](#pull-an-existing-agent) instead.

## The project file

The project’s `caplo.yaml` sits at the root of the folder:

```plaintext
apiVersion: v1
kind: Project
name: shop
agents: agents/*.yaml
tools: tools/*
```

| Field          | Required | Description                                                                                                                      |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apiVersion`   | Yes      | Always `v1`.                                                                                                                     |
| `kind`         | Yes      | Always `Project`. This is what tells it apart from a tool package’s `caplo.yaml`.                                                |
| `name`         | Yes      | The project name: a lowercase letter, then lowercase letters, digits and hyphens. Releases published from the project record it. |
| `agents`       | No       | Glob for agent files, relative to the project root. Default `agents/*.yaml`.                                                     |
| `tools`        | No       | Glob for tool package directories, relative to the project root. Default `tools/*`.                                              |
| `environments` | No       | Named workspaces the project publishes to. See [Environments](/cli/environments/).                                               |

Unknown fields are an error. Globs must stay inside the project, and they skip hidden files and folders such as `.DS_Store`. A directory the `tools` glob matches is a package only if it contains a `caplo.yaml`; others are ignored.

## Agent files

Each agent is one YAML file in the agent YAML format the console exports, with `apiVersion: v2.0.0`. Files with `apiVersion` v1 are refused. See [Agent YAML](/agents/agent-yaml/) for how to write one and the [agent YAML reference](/reference/agent-yaml/) for every field.

The file name without `.yaml` is the agent’s **key**, for example `orders` for `agents/orders.yaml`. Keys start with a lowercase letter and use only lowercase letters, digits and hyphens. Other agents in the project link to an agent by its key, and selectors can use it, so renaming the file is a breaking change inside the project. The agent’s `name` field is what customers and the console see.

Inside a project, agent files refer to other resources like this:

| In the agent file                  | Refers to                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `subAgents: [{local: orders}]`     | The project agent with key `orders`                                                                      |
| `subAgents: [{agentId: <ID>}]`     | Any agent already in the workspace                                                                       |
| `tools: [order-desk/lookup_order]` | Tool `lookup_order` of the project package named `order-desk`; `order-desk` alone selects all its tools  |
| `tools: [crm/find_contact]`        | A published tool of the workspace’s remote MCP server named `crm`, when no project package has that name |
| `tools: [<PACKAGE_ID>/<TOOL>]`     | A tool of any workspace package, by package ID                                                           |
| `knowledgeBases: [Returns policy]` | The workspace knowledge base with that name, or an ID                                                    |

A package’s name is the `name` in its own `caplo.yaml`, not its folder name. Names of remote MCP servers and knowledge bases are looked up in the workspace a command acts on, so the same file works in several workspaces. A sub-agent link with `release: latest`, or with no `release`, follows the child’s newest release; see [Sub-agents and routing](/agents/sub-agents-and-routing/).

## How files map to the workspace

The CLI matches project files to workspace resources **by name**: agents by their `name` field and packages by their package name. It never stores workspace IDs in your files.

* A name the workspace does not have yet is created on the next push or publish.
* A name it has is updated.
* Nothing is ever deleted. Renaming an agent in its file therefore creates a new agent and leaves the old one in place. After a publish, `caplo publish --prune` archives agents that an earlier publish of this project created and that the project no longer defines.
* If the workspace agent with that name is archived, the command stops. Restore the agent in the console, or rename it in the file.

Agent names must be unique in the project, ignoring case.

## Select part of a project

Without arguments, `diff`, `push`, `test`, `eval` and `publish` act on the whole project. Pass selectors to act on part of it:

```plaintext
caplo push agent/orders
caplo test tool/order-desk
caplo publish "agent/Shop Concierge" tool/store-stock
```

| Selector              | Selects                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `agent/<KEY_OR_NAME>` | One agent, by file key or by its `name`; a key wins over a name. It brings its project sub-agents and the project packages they use. |
| `tool/<PACKAGE>`      | One project package, by package name.                                                                                                |

`caplo publish` also brings the project agents that link a selected agent at `release: latest`, because publishing the child publishes them again. A selector that matches nothing is a usage error.

## Run commands from anywhere in the project

Project commands look for the project file in the current directory, then in each parent directory, skipping tool packages’ own `caplo.yaml` files. So you can run them from inside `agents/` or a package folder. To point at a project elsewhere, pass `-C` (`--dir`):

```plaintext
caplo validate -C ~/src/shop
```

## Check a project offline

```plaintext
caplo validate
```

`caplo validate` checks the project without calling the workspace:

* `caplo.yaml` and every package’s `caplo.yaml`
* every agent file against the agent schema, and unique file keys and agent names
* references to project agents and packages, and the tools an `mcp` package declares
* sub-agent link cycles, and each agent’s depth limit: at most `policy.maxDepth` (1 to 4, default 3) links below it
* fast routing: at least one sub-agent and `doNotUseWhen` on every link, and, when the file has evals, two cases with `routedBy` per sub-agent
* every [environment](/cli/environments/) in `caplo.yaml`, with its agent fields applied

Problems are printed with their file and the command exits with code 3. Tools of remote MCP servers are checked against the workspace on `diff`, `push` and `publish`. `diff`, `push`, `test`, `eval` and `publish` run the same checks first and stop on any problem.

## Pull an existing agent

To bring an agent you built in the console under version control:

```plaintext
caplo pull "agent/Shop Concierge"
caplo pull agent/concierge ./shop
```

`caplo pull` writes the agent, every sub-agent it links, and their eval cases as agent files. It also pulls the source of any package they use that the project lacks into the `tools` directory. Agents the project already defines are written to their existing files; new ones get a file named after the agent.

The target is the project at the directory you give, or the project above `-C`. If there is none, the CLI creates a new project there, but never inside another project. Links name the exact release the draft pins, because a draft does not record `release: latest`; change them back to `release: latest` if you want parents to follow new child releases. Tools of remote MCP servers stay as `<server>/<tool>`.

Caution

`caplo pull` overwrites the agent files it writes. Commit or stash local changes first so you can review the difference.

Next, see the [day-to-day workflow](/cli/workflow/).
