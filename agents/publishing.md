# Publish an agent

> Publish an agent's draft as an immutable release, choose the version, revoke releases, and deploy or roll back the release a channel serves.

Editing an agent changes only its draft. Customers talk to a **release**: an immutable snapshot of a draft that a channel serves. Publishing creates a release; deploying points a channel at it. The two are separate steps, so you can publish, test the release, and then deploy it. For the model behind this, see [Agents and releases](/concepts/agents-and-releases/).

Publishing needs an Owner or Admin, or an API key with the `agents:publish` and `agents:write` scopes (plus `tools:publish` and `tools:write` when a project has tool packages, and `channels:write` to deploy). See [CI/CD](/cli/ci-cd/).

## Publish a release

**Console**

1. Save your edits with **Save draft**. The **Releases** tab shows **Release readiness**: whether the saved draft is valid and what blocks publishing.
2. Select **Publish agent**. The dialog lists any remaining issues, compares the draft with the latest release, and shows each tool with the exact version and behavior the release will pin.
3. Choose the **Version bump** and write a **Release note** (required, up to 400 characters).
4. Under **Agent evals**, select **Run tests** and wait for the cases to pass. For a fast-routing agent, the **Fast routing** section lists what it still needs.
5. Select **Publish version**.

**Publish agent** is available when the saved draft has unpublished changes and the YAML editor has no unapplied edits.

**CLI**

Publish one agent’s saved draft:

```sh
caplo agent push -f support.yaml
caplo agent publish "Support Desk"
```

Or publish a whole project, packages and agents together:

```sh
caplo publish --dry-run
caplo publish
```

Both pin tool versions, check readiness, run the eval cases, show what will change, and ask before publishing; `--yes` skips the question. `caplo publish` publishes tool packages first, then child agents, then their parents, and on a project’s first publish to a workspace it always needs `--yes`. A CLI release gets the note “Published with the caplo CLI”.

`caplo agent publish` needs the agent’s sub-agents to have releases already. `caplo publish` releases a project’s agents in the right order for you. See [The CLI workflow](/cli/workflow/).

The first release is `1.0.0`. Releases are listed on the agent’s **Releases** tab and with `caplo agent release list "Support Desk"`; `caplo agent release get "Support Desk" 1.2.0` shows one with its tools, sub-agent releases and eval gate.

## Version bumps

Each release has a semantic version. The console and the CLI suggest the bump from what changed since the latest release:

| Bump  | Suggested when                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| Major | The first release; any change to sub-agents; a changed provider or model; a removed tool, action or knowledge base. |
| Minor | An added tool, action or knowledge base.                                                                            |
| Patch | Anything else, such as instructions, greeting, temperature or policy.                                               |

Choose another bump in the dialog, or with `caplo agent publish "Support Desk" --bump minor`. The version is a label for people; channels and parents pin a release, not a version range.

## What a release pins

A release freezes everything the agent needs to behave the same way every time:

* The whole configuration: instructions, greeting, model and its settings, actions, routing, suggested replies and ratings.
* The policy, with each field you left out filled with the platform default of the day.
* Each tool package at its latest published version, with each tool’s schema and read or write effect. See [Give an agent tools](/agents/tools/#how-releases-pin-tool-versions).
* Each knowledge base at its ready version. See [Add knowledge](/agents/knowledge/#versions-and-agent-releases).
* Each sub-agent at an exact release. See [Release pinning](/agents/sub-agents-and-routing/#release-pinning).

A release does not pin eval cases. When only the cases change, `caplo publish` runs them against the released draft and keeps the release.

To pick up newer tool package versions without other changes, run `caplo agent publish` or `caplo publish`: they save a new draft revision and publish it. A newer knowledge version or child release needs a draft change to publish.

## Deploy a release to channels

Publishing does not change what channels serve. Each channel keeps its release until you deploy another.

**Console**

Open the agent’s **Channels** tab. A channel serving an older release offers an **Update to** link with the newer version; select it to review and deploy. **Change agent or release** opens the channel’s settings to pick any release. See [Channels](/channels/).

**CLI**

```sh
caplo channel deploy Website
caplo channel deploy whatsapp/Support --agent "Support Desk@1.2.0"
```

Without `--agent`, each channel moves to its agent’s newest release that is not revoked. `--agent` names the agent and, after `@`, a version or release number. A channel is named by ID, name, or `<kind>/<name>`. Every other channel setting stays as it is. The command asks first; `--yes` skips the question.

In a project, an [environment](/cli/environments/) can list `channels` that `caplo publish` deploys after it publishes.

A deploy affects new conversations only. Conversations already open keep the release they started with, so a customer never sees the agent change mid-conversation.

## Roll back

To return channels to the release before the one they serve:

```sh
caplo channel rollback Website
```

It points each channel at its agent’s newest release that is older than the current one and not revoked, served exactly as it was published. To move forward again, deploy or publish a newer release. Rolling back does not change the agent’s draft.

## Revoke a release

Revoking marks a release as unusable, for example one that gives wrong refund advice:

```sh
caplo agent release revoke "Support Desk" 1.2.0 --reason "wrong refund policy"
```

`--reason` is required, and the command asks first.

Revoking cannot be undone

Channels that serve a revoked release and parent agents that pin it can no longer run it. Deploy or roll back those channels, and publish those parents with another release, before you revoke. Links at `release: latest`, `caplo channel deploy` and `caplo channel rollback` skip revoked releases.

## See also

* [Write and run evals](/agents/evals/) for the publication gate.
* [CI/CD](/cli/ci-cd/) to publish from a pipeline.
