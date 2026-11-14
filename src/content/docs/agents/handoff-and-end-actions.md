---
title: Hand off to a person or end a call
description: Allow an agent to transfer a conversation to a human or end a voice call, and see what happens when it does.
sidebar:
  order: 7
---

Conversation actions let an agent do more than reply: hand the conversation to a person, or end a voice call when the caller is done. An agent has no actions unless you allow them.

| Action | YAML value | Console label | What the agent can do |
| --- | --- | --- | --- |
| Transfer | `transfer` | **Transfer to a human** | Hand the conversation to a person through the channel's handoff destination, with a one-line reason. |
| End | `end` | **End call** | End a voice call, with a goodbye, once the caller has nothing more they need. Applies to voice calls only. |

## Allow an action

An action needs permission in two places: on the agent, and on the channel entry point that serves it. The agent decides when to use an action; the channel decides whether it is available there and where a transfer goes.

1. **On the agent.** In the console, open the agent's **Tools & actions** tab and check the actions under **Conversation actions**, then select **Save draft**. In an agent file, list them under `actions`:

   ```yaml
   actions:
     - transfer
     - end
   ```

2. **Publish** a release with the action. Adding an action suggests a minor version bump, removing one a major bump. See [Publish an agent](/agents/publishing/).

3. **On the channel.** For a website widget, open the entry point's **Conversation** tab and allow the action under **Conversation actions**; for a transfer, choose a Chatwoot handoff destination as the **Transfer destination**. An action the published agent does not allow shows **Unavailable: enable this action in the agent and publish a version.** For a phone channel, set **Transfer calls to** (a phone number or SIP address) and **Transfer type** in the channel's **Conversation** step; see [Phone](/channels/phone/). For WhatsApp, Messenger and Instagram, see [Handoff to Chatwoot](/channels/handoff-to-chatwoot/).

Tell the agent in its [instructions](/agents/instructions-and-model/) when to hand off, for example "Offer to connect the customer with a person when they ask for a refund over 100 euros, or when you cannot resolve the issue after two tries." Without guidance, the model decides on its own.

## What happens on a transfer

When the agent transfers a chat, the conversation is marked **Handed off** and the agent stops replying. What follows depends on the destination:

- **Chatwoot destination.** Caplo opens a conversation in your Chatwoot inbox and relays messages both ways, so your team replies from Chatwoot and the visitor stays in the same chat.
- **Caplo console.** Operators with inbox access see the conversation in **Monitor > Conversations**, where they can **Take over** and reply, and **Return to agent** when they are done.

On a phone call, the caller is transferred to the number or SIP address set on the entry point, either straight away (cold) or after the person who answers is briefed and accepts (warm).

For the full flow, including ownership and what the visitor sees, see [Conversations and handoff](/concepts/conversations-and-handoff/).

## Test actions

Try a handoff in the console's [live test](/agents/testing/) or with `caplo agent chat`, then add an [eval case](/agents/evals/) such as "Customer asks for a person" with a desired outcome that names the handoff, so every publish checks the behavior.
