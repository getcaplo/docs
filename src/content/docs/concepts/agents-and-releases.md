---
title: Agents and releases
description: How an agent's editable draft becomes an immutable release, what a release pins, and how releases reach customers.
sidebar:
  order: 2
---

Every agent has one **draft** and any number of **releases**. You edit and test the draft. Customers only ever talk to a release.

## The draft

The draft holds the agent's current configuration: its name, instructions, greeting, model, knowledge bases, tools, sub-agents and conversation settings. Saving it (**Save draft** in the console, or `caplo push` from a project) stores it in the workspace, where anyone who can build agents can change it. You can test a draft at any time in the console's **Live test** panel or with `caplo agent chat`, without any channel.

Editing the draft never changes a published release. The console marks an agent with **Unpublished changes** when its saved draft differs from its latest release.

## Publishing a release

Publishing turns the saved draft into a release. An Owner or Admin publishes from **Publish agent** in the console or with `caplo publish` or `caplo agent publish`. Caplo then:

1. Checks the configuration, such as the greeting, the model and every reference.
2. Pins the newest published version of each tool package the agent uses, and the newest published version of each knowledge base it attaches.
3. Runs the agent's eval cases against this exact candidate and applies the workspace's publication requirements. See [Evaluations](/concepts/evaluations/).
4. Checks that the agent's instructions, tools and knowledge fit within what its model can handle.
5. Freezes the result as a numbered release with a semantic version (`1.0.0`, then a major, minor or patch bump) and your release note.

If any step fails, nothing is published.

## What a release pins

A release is immutable. It records:

- The configuration as it was when published.
- The exact tool package versions. A newer tool version reaches customers only when you publish the agent again.
- The exact knowledge base versions. Publishing a new knowledge version does not change live answers until the agent is published again.
- The exact release of each sub-agent. See [Multi-agent](/concepts/multi-agent/).

Eval cases are not part of a release. You can change them without republishing, and the next publish runs the current set.

## How releases reach customers

A [channel](/concepts/channels/) serves one specific release. Publishing a new release does not move any channel to it; you choose when:

- In the console, open the channel and select **Update to** the new version, or **Change release** to pick any release.
- With the CLI, run `caplo channel deploy` for the channel, or give the project an environment with `channels` so that `caplo publish` deploys them.

New conversations on the channel start on the new release. **Conversations already in progress keep the release they started with** until they end, so a customer is never switched mid-conversation.

To go back, point the channel at an earlier release with **Change release** or `caplo channel rollback`. The earlier release is served exactly as it was published.

## Revoking a release

Revoking permanently stops a release from running: no channel and no parent agent can run it again. Use it when a release is unsafe, for example if it exposes a tool it should not. Revoke with `caplo agent release revoke <AGENT> <RELEASE> --reason "<REASON>"`. A revocation cannot be undone, so move channels to another release first.

## Archiving and deleting agents

Archiving removes an agent from the active library while keeping its drafts, releases and history. Detach it from its channels and remove links from parent agents first. You can delete an agent only while it has never been published.

## Related

- [Publish an agent](/agents/publishing/)
- [Test an agent](/agents/testing/)
- [Agent YAML](/agents/agent-yaml/)
