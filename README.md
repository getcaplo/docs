# Caplo docs

Source of [docs.caplo.si](https://docs.caplo.si): documentation for people who build agents, tools and widgets on Caplo, connect channels, and use the `caplo` CLI. Built with [Starlight](https://starlight.astro.build) and served by GitHub Pages.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # dist/, including llms.txt and a Markdown copy of every page
npm run check      # type check, plus CLI, schema and prompt drift checks
```

## Layout

| Path | Contents |
| --- | --- |
| `src/content/docs/` | Pages. The directory is the URL: `agents/publishing.mdx` is `/agents/publishing/`. |
| `src/content/docs/reference/` | Generated reference. Never edit by hand; `npm run sync` rewrites it. |
| `src/content/prompts/` | AI task prompts shown by `<AgentPrompt id="..."/>`. The file name is the ID. |
| `src/data/versions.json` | The production versions the generated reference and `requires` gates were built from. |
| `src/data/cli.json` | The released CLI's command tree, from `caplo docs export`. |
| `public/schemas/` | Published JSON Schemas (agent YAML, `caplo.yaml`, fixtures), for editors and AI tools. |
| `examples/` | Complete example files that CI validates with the released CLI. |
| `scripts/` | Sync, reference generators, drift checks and the Pages deploy. |

## Writing pages

Audience: people building on Caplo. Explain what they can do and how; never describe Caplo's internal services, infrastructure or operator settings. Document only what is live in production. Leave out preview features.

Front matter:

```yaml
---
title: Publish an agent              # sentence case, task pages start with a verb
description: One sentence on what the page helps the reader do.
sidebar:
  order: 3
requires:                            # optional: hidden until production runs these versions
  caplo-cli: ">=0.4.0"
---
```

`requires` keys are the repository names in `src/data/versions.json`. Write a page for a feature before it ships; the sync that sees the release in production publishes it.

Components (use `.mdx` when a page needs one):

```mdx
import { Tabs, TabItem, Steps, Aside, CardGrid, LinkCard } from '@astrojs/starlight/components';
import AgentPrompt from '~/components/AgentPrompt.astro';

<Tabs syncKey="surface">
  <TabItem label="Console">...</TabItem>
  <TabItem label="CLI">...</TabItem>
</Tabs>

<AgentPrompt id="add-widget-html" />
```

- Show both the console and the CLI way with `syncKey="surface"` tabs when both exist.
- Link with root-relative paths and a trailing slash: `/agents/publishing/`. CLI commands link to the reference: `/reference/cli/agent/#caplo-agent-publish`.
- Shell examples use ` ```sh `. Every `caplo` command in a code block, an inline code span or a prompt is checked against the released CLI; unknown commands or flags fail the build.
- A complete agent file (`apiVersion: v2.0.0`) or tool package `caplo.yaml` in a ` ```yaml ` block is validated against the published schema. Partial snippets are not.
- Plain, direct sentences. No marketing language, no double hyphens as dashes, no arrows; write "then" or use a list.

## AI prompts

A prompt file is a task brief for a coding agent (Claude Code, Cursor, Codex, ChatGPT):

```md
---
title: Add the Caplo widget to my website
description: Installs the embed snippet and checks that it loads.
---
Goal, the docs pages to read (as .md URLs on https://docs.caplo.si), the exact steps and commands,
how to verify the result, and rules (for example: never paste secrets; use caplo secret set).
Use <ANGLE_BRACKET> placeholders for values the reader supplies.
```

Every page also has a menu to copy it as Markdown or open it in Claude or ChatGPT.

## How the docs stay current

`scripts/sync.mjs` reads what production runs: image versions pinned in `getcaplo/argocd-deployments` and the latest CLI release in `getcaplo/homebrew-tap`. It downloads that CLI, checks it against the release checksums, runs `caplo docs export`, and regenerates `src/content/docs/reference/`, `src/data/` and `public/schemas/`.

The `Sync` workflow runs it when production versions change, when a CLI release is published, nightly, and on demand. On a change it commits to a `sync/` branch, builds and runs every check, then merges the branch into `main` and deploys. If a check fails, the branch stays and the workflow opens or updates a "Docs drift" issue; the live site keeps the last good build.

By hand:

```sh
npm run sync                                   # needs gh authenticated with read access to argocd-deployments
npm run sync -- --cli ../caplo-cli/caplo       # use a local CLI build instead of the release
npm run check && npm run build
npm run deploy                                 # publish dist/ to the gh-pages branch
```

## Publishing

Work on a `sqaisar/<task>` branch, then merge it into `main` with `git merge --no-ff` and push. `Deploy` builds `main` and publishes it to the `gh-pages` branch, which GitHub Pages serves at docs.caplo.si (`public/CNAME`).
