# Conversations and handoff

> What a conversation is, how your team reads and takes over conversations in the console, and how an agent hands a customer to a person.

A **conversation** is one customer’s chat or call on a channel. It starts when the customer first writes or calls, keeps the agent release and channel settings it started with, and ends after the channel’s inactivity timeout. Test chats in the console and the CLI are private and do not appear among your channel conversations.

## The console inbox

**Conversations** (under **Monitor**) lists calls and chats from every channel. You can filter by channel, status and date, or show only conversations that were **Handed off**. Opening one shows the transcript, the customer’s reply ratings if the agent collects them, and the tools behind each reply.

Who sees what depends on the [role](/concepts/workspaces-and-roles/):

* Owners, Admins, Builders, Supervisors, Auditors and Viewers can read conversations.
* The customer’s identity is hidden as **Participant hidden** until someone with permission selects **Reveal** and gives a reason. Every reveal is recorded in the workspace audit log.
* Tool activity behind a reply is visible to Supervisors, Admins and Owners.
* **Internal notes** are visible only to your team, never to the customer or the agent.

## Taking over

Owners, Admins and Supervisors can step into an open text conversation at any time. Select **Take over**: the agent stops replying, the transcript notes “A member of our team has joined and will reply here.” (website visitors see it; on WhatsApp, Messenger and Instagram it is not sent), and you reply from the console. When you are done, select **Return to agent** and the agent answers the customer’s next message.

Taking over needs no setup. Voice calls cannot be taken over from the console.

## Handoff to a person

An agent can also decide to hand a conversation to your team, for example when the customer asks for a person or the request is outside what the agent should handle. This works only when the channel’s entry point allows the **transfer** conversation action and names a destination:

| Channel        | Destination                                                                   | What happens                                                                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website widget | A Chatwoot inbox, connected under **Integrations** > **Handoff destinations** | The conversation opens in Chatwoot with a summary, and messages are relayed both ways until your team finishes. WhatsApp, Messenger and Instagram conversations are mirrored into Chatwoot instead; see [Handoff to Chatwoot](/channels/handoff-to-chatwoot/). |
| Telephone      | A phone number or SIP address set in **Transfer calls to**                    | The call is transferred, either straight away (cold) or after briefing the person who answers (warm).                                                                                                                                                          |

What the customer sees during a text handoff:

1. When the agent hands off: “I’ve asked a member of our team to join. They’ll reply here as soon as they can.”
2. If nobody accepts in time: “No one from our team is available right now, so I’ll keep helping here.” The agent carries on.
3. When your team finishes: “Our team has finished here. I’m back to help with anything else.”

In the console inbox, a handed-off conversation shows **External inbox** while the destination has it. Without a handoff destination, the agent cannot hand off on its own, but your team can still take over from the console.

## Related

* [Handoff and end actions](/agents/handoff-and-end-actions/): set up transfers and destinations.
* [Channels](/concepts/channels/)
* [Tools and actions](/concepts/tools-and-actions/): what happens when a write’s outcome needs a person to check.
