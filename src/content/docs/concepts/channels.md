---
title: Channels
description: What channels and entry points are, which kinds of channel Caplo supports, and how a channel serves, updates and rolls back an agent release.
sidebar:
  order: 6
---

A **channel** is how customers reach an agent. It connects one or more **entry points**, such as a widget on your website or a WhatsApp number, to one published release of one agent. You manage channels under **Channels** in the console.

## Kinds of channel

| Channel | Entry point | Conversations |
| --- | --- | --- |
| **Live chat widget** | The Caplo widget, installed on your website with an embed snippet and limited to the website origins you allow. | Text, and optionally voice in the browser. |
| **WhatsApp Business** | A WhatsApp Business phone number connected through Meta. | Text messages. |
| **Facebook Messenger** | A Facebook Page connected through Meta. | Text messages. |
| **Instagram** | An Instagram professional account connected through Meta. | Text messages. |
| **Telephone** | A phone number from your Twilio or Telnyx account. | Voice calls. |

For a website, you only need a published widget design; see [Add an agent to your website](/get-started/add-to-your-website/). Messaging and phone channels first need the account connected under **Integrations** > **Communication channels**. See the [channels overview](/channels/).

## A channel serves one release

Each channel names an agent and a specific release of it. That agent is the channel's **entry agent**: it greets the customer and may delegate to sub-agents (see [Multi-agent](/concepts/multi-agent/)).

Because the channel names a release rather than "the latest", publishing a new agent release never changes what customers get on its own. You decide when each channel moves.

## Deploying and rolling back

| To | In the console | With the CLI |
| --- | --- | --- |
| Move to the newest release | Open the channel and select **Update to** the new version | `caplo channel deploy "<CHANNEL>"` |
| Choose a specific release | **Change release** | `caplo channel deploy "<CHANNEL>" --agent "<AGENT>@<VERSION>"` |
| Go back to the previous release | **Change release** | `caplo channel rollback "<CHANNEL>"` |

Whichever way you deploy:

- **New conversations** start on the new release straight away.
- **Conversations in progress** keep the release they started with until they end. A conversation ends after the channel's inactivity timeout, which is 24 hours unless you change it.
- Rolling back serves the earlier release exactly as it was published; to move forward again, deploy or publish again.

A CLI project can also deploy channels as part of `caplo publish`, by listing them under an environment's `channels`. See [Environments](/cli/environments/).

## Channel settings

Besides the release, a channel's entry points carry settings that apply to every conversation on them, such as allowed website origins, whether voice is allowed, the inactivity timeout, and conversation actions like transferring to a person or ending a call. Changes to a channel are saved as new revisions, and settings that shape a conversation apply to conversations that start after the change.

## Related

- [Channels overview](/channels/)
- [Install the website widget](/channels/website-widget/install/)
- [Conversations and handoff](/concepts/conversations-and-handoff/)
- [`caplo channel deploy`](/reference/cli/channel/#caplo-channel-deploy)
