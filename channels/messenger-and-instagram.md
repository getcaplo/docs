# Connect Messenger and Instagram

> Connect a Facebook Page or an Instagram professional account through Meta, serve an agent release on it, and understand the messaging window and what customers see.

A Messenger channel answers messages sent to one of your Facebook Pages. An Instagram channel answers direct messages sent to one of your Instagram professional accounts. Both work the same way: you authorize the account with Meta once under **Integrations**, then create a channel that serves a published agent release on it.

## Before you start

* **Messenger**: a Facebook Page, and a Facebook account that can manage it.
* **Instagram**: an Instagram professional account (business or creator) that belongs to a Meta business portfolio, and a Facebook or Instagram login that can manage it.
* A workspace role that can manage integrations (Owner, Admin or Developer) to connect the account, and one that can configure channels (Owner, Admin or Builder) to create the channel.
* A published agent release. See [Publish an agent](/agents/publishing/).
* A browser that allows popups from the console, because Meta’s authorization opens in a popup.

## Connect the account

1. In the console, open **Integrations** then **Communication channels**.

2. Select **Add integration**, then **Facebook Messenger** or **Instagram**.

3. Enter an **Integration name** and select **Prepare Meta connection**. A setup row appears with the status **Awaiting authorization**.

4. Select **Continue with Meta** and authorize in the popup:

   * **Messenger**: sign in with Facebook and grant access to the Page.
   * **Instagram**: sign in with Instagram or Facebook (Meta Unified Login), then choose the business portfolio and the professional account.

   When Meta returns, the popup says “Authorization returned to your original Caplo window.” You can close it.

5. Back in the console, the row shows **Choose account**. Pick the **Facebook Page** or **Instagram professional account** and select **Connect selected account**.

6. Caplo checks the access Meta granted, subscribes the Page or account to Caplo’s webhooks, and reads the subscription back to confirm it. The connection then shows **Connected**.

Meta asks you to grant these permissions. Caplo checks each of them and refuses the connection when one is missing:

| Channel   | Permissions                                                   |
| --------- | ------------------------------------------------------------- |
| Messenger | `pages_show_list`, `pages_manage_metadata`, `pages_messaging` |
| Instagram | `instagram_basic`, `instagram_manage_messages`                |

If the account list is empty (“No eligible accounts were granted”), select **Cancel setup**, start again, and select the Page or account in Meta’s popup.

A Page or Instagram account can be connected to one Caplo workspace at a time.

## Create the channel

1. Open **Channels** under **Deploy**, select **Create channel** and choose **Facebook Messenger** or **Instagram**.

2. Enter a **Channel name**, choose the **Agent** and **Agent release**, then select **Set up connection**.

3. Choose the connection, then the **Facebook Page** or **Instagram professional account**. Only verified accounts that no other channel uses can be selected. Select **Continue**.

4. Choose **Who answers**: **AI agent** (the agent answers every customer) or **Your team** (the agent stays silent, also in open conversations, and messages wait in **Conversations** for your team).

5. Set the **Conversation inactivity timeout (seconds)**, from 300 to 604800. The default is 86400, one day.

6. Select **Create channel**, then send a message to the Page or account from another Facebook or Instagram account to test it.

A channel keeps its Page or account; create another channel for a different one. Update the release it serves as described in [Channels](/channels/#deploy-a-new-release). You can pause these channels but not delete them.

Customers on Messenger and Instagram are not signed in, so tools that need a [verified customer](/tools/customer-aware-tools/) do not run there, and customer memory is off. A conversation lasts at most seven days, whatever the inactivity timeout.

## The 24-hour messaging window

Meta allows a business to reply for 24 hours after the customer’s last message. Caplo follows that rule for the agent and for your team:

* The agent replies only within 24 hours of the customer’s message. A message that reaches Caplo late, for example after a Meta outage, is recorded without a reply.
* Your team’s replies from the console or from Chatwoot are refused once the window has closed. The customer must write again to reopen it.
* Confirmation buttons work only while the window is open.

Caplo does not send message tags or other messages outside the window on Messenger or Instagram. If you need to reach a customer later, ask them to write to you.

## What is supported

|                            | Messenger and Instagram                                                                                                                                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer messages          | Text, taps on Caplo’s buttons and carousels, and your Page’s Get Started button, persistent menu, ice breakers and quick replies (the agent receives their visible text).                                                                                                                                |
| Attachments from customers | Not supported. A message with only an image or file reaches the agent as a placeholder such as “\[image, file]”; text sent with an attachment is kept.                                                                                                                                                   |
| Long messages              | A customer message over 4,000 characters reaches the agent shortened and marked “\[message shortened]”. Long agent replies are split into several messages: over 2,000 characters on Messenger and 1,000 bytes on Instagram.                                                                             |
| Suggested replies          | Up to three reply buttons of up to 20 characters, when the reply is 640 characters or shorter. See [Replies and feedback](/agents/replies-and-feedback/).                                                                                                                                                |
| Tool results               | Cards become a carousel. Choices become reply buttons when three or fewer fit, otherwise a carousel. A detail with reply actions becomes a one-card carousel. Other results are sent as short numbered text. See [Present results](/tools/present-results/).                                             |
| Confirmations              | A message with the details, “Confirm to approve these details, or Cancel.”, and **Confirm** and **Cancel** buttons. A confirmation that does not fit in 640 characters, or that needs editing, is not offered; the customer is told it cannot be confirmed here. See [Write tools](/tools/write-tools/). |
| Handoff                    | No transfer destination: the agent cannot hand off on its own. Your team takes over from **Conversations**, or from Chatwoot when you mirror these channels there. See [Hand off to Chatwoot](/channels/handoff-to-chatwoot/).                                                                           |
| Sending rate               | One message a second per Page or account. Replies queue behind each other in order.                                                                                                                                                                                                                      |

Note

Caplo does not see replies your team sends from Meta Business Suite or the Instagram app, and they do not stop the agent. To answer a customer yourself, take over the conversation in **Conversations** (or reply from a mirrored Chatwoot conversation), so the agent stops replying.

## Check the connection

Select **Check connection** on the account under **Integrations**. The **Deliveries** tab lists outgoing messages with their status and Meta’s reason for a failure. **Check delivery evidence** looks for Meta’s receipt; **Retry delivery** is offered only when the earlier attempt is proven not to have been accepted. Caplo never resends a message whose outcome is unknown.

**Disconnect** stops new messages and replies for every channel that uses the account and releases the Page or account, so it can be connected again later or to another workspace. Existing conversations are kept. **Reconnect** restores it.

## Troubleshooting

| Problem                                                                   | What to do                                                                                                                                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Allow popups for this console, then continue with Meta again.”           | Allow popups for `app.caplo.si`, then select **Continue with Meta**.                                                                                       |
| “This authorization window is no longer connected to Caplo.”              | The console tab that started setup was closed or reloaded. Close the popup and select **Continue with Meta** in the original tab.                          |
| “Meta did not grant the account access required for messaging.”           | A permission in the table above was not granted. Start again and accept all requested permissions.                                                         |
| Connection shows **Reconnect required** or **Authorization expired**      | Meta access was revoked or expired, or a permission was removed. Select **Reconnect**.                                                                     |
| Connection shows **Needs attention**                                      | Caplo could not complete a check, often because Meta was briefly unavailable. It keeps sending and checks again. If it stays, select **Check connection**. |
| Instagram messages never arrive                                           | In the Instagram app, allow connected tools to access messages (in the account’s message settings), and check that the account is a professional account.  |
| Delivery failed with a reason ending in `2018278`, `2018065` or `2534022` | The 24-hour window had closed. Wait for the customer to write again.                                                                                       |
| Delivery failed with a reason ending in `2018108` or `1545041`            | The person no longer receives messages from the Page or is unavailable.                                                                                    |
| The agent does not answer                                                 | Check that the channel is not paused, **Who answers** is **AI agent**, and the customer wrote within the last 24 hours.                                    |

## Related

* [Channels](/channels/)
* [Connect WhatsApp](/channels/whatsapp/)
* [Hand off to Chatwoot](/channels/handoff-to-chatwoot/)
* [Conversations inbox](/operate/conversations-inbox/)
