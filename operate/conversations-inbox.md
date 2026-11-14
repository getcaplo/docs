# Work in the Conversations inbox

> Find and read customer conversations, step in and reply as your team, leave internal notes, reveal a participant, and send WhatsApp templates from the console.

**Conversations** (under **Monitor** in the console) lists the calls and chats your customers have on every channel. Test chats from the agent builder and the CLI never appear here. For what a conversation is and how handoff works, see [Conversations and handoff](/concepts/conversations-and-handoff/).

Owners, Admins, Builders, Supervisors, Auditors and Viewers can read conversations. Only Owners, Admins and Supervisors can take over, reply, add notes and reveal participants. See [Workspaces and roles](/concepts/workspaces-and-roles/).

## Find a conversation

The counts at the top cover the selected date range and refresh every minute:

| Count               | What it counts                                                |
| ------------------- | ------------------------------------------------------------- |
| **Conversations**   | All conversations started in the range.                       |
| **Live now**        | Conversations still in progress.                              |
| **Needs attention** | Conversations that failed or whose transfer was not accepted. |
| **Calls · Chats**   | The same total split into voice and text.                     |
| **First response**  | The median time to the agent’s first reply.                   |

Select a count, or use the **All**, **Live now** and **Needs attention** views. Narrow the list with:

* **Calls** or **Chats**, and the date range: **Last 24 hours**, **Last 7 days**, **Last 30 days** or **All retained**.
* **Filters**: **Channel type**, **Status** (**Live**, **Completed**, **Transferred**, **Failed**), **Channel**, **Agent** and its **Version**, **Has errors** and **Handed off**.
* The sort: **Recent activity** or **Newest first**.

The search box filters only the rows on the current page. To open any conversation, paste its full conversation ID and press Enter. When new conversations arrive, a **new conversations · Show** bar appears above the list instead of moving the rows under you.

Each row shows who is handling the conversation: **AI agent**, **Your team** (taken over in the console) or **External inbox** (handed off to a destination such as Chatwoot), plus signals for errors, handoffs and the estimated model cost.

## Read a conversation

Select a row to open it beside the list. The header shows the channel and **Participant hidden**: the customer’s identity stays masked until someone reveals it. Below it are the agent and release, start time, length, first response time and estimated cost.

* **Transcript** shows the messages from the customer, the agent and your team, with times in UTC. A voice call shows its transcript, which updates while the call is in progress, and why each call ended, such as **Caller hung up** or **Time limit reached**.
* On messaging channels, your team’s and the agent’s messages show their delivery state, such as **Sent**, **Delivered**, **Read** or **Delivery failed**.
* Files a customer sends while a person handles the conversation appear in the transcript as an image or a download.
* If the agent collects ratings, a rated reply shows **Rated helpful by the visitor** or **Rated not helpful by the visitor**, with the visitor’s reason. See [Replies and feedback](/agents/replies-and-feedback/#where-operators-see-ratings).
* **Show tool calls**, under an agent reply, lists each tool and sub-agent call behind it: its outcome, why it failed or was refused, its arguments and the result the model read.
* **Activity** lists each turn with its status, latency, model calls, tokens, estimated cost, and the tools it called with their status and error.

Tool details are visible to Owners, Admins and Supervisors; other roles see **Detail restricted**. To work through a wrong answer step by step, see [Monitor and analytics](/operate/monitor-and-analytics/#investigate-a-bad-answer).

**More actions** offers **Download transcript** (a text file), **Copy link** and **Copy conversation ID**.

## Take over and reply

You can take over an open text conversation that the agent is handling. Voice calls cannot be taken over, and neither can a conversation that is with an external inbox.

1. Open the conversation and select **Take over**. The customer sees that a member of your team has joined.
2. Type in **Reply to the customer as your team** and select **Send**. Replies are up to 4,000 characters.
3. When you are done, select **Return to agent**.

While your team has the conversation:

* The agent does not reply. Customer messages are recorded in the transcript and start no agent turn.
* Any Owner, Admin or Supervisor can reply or return it, not only the person who took over. If someone else changed the conversation in the meantime, the console refuses the command and reloads it; check the transcript and try again.
* On WhatsApp, Messenger and Instagram, replies are queued and delivered in order. These channels allow free replies only within 24 hours of the customer’s last message; the panel shows when the WhatsApp reply window closes.

After **Return to agent**, the agent answers the customer’s next message.

A conversation accepts new messages only while it is open. Once it ends or reaches the channel’s inactivity timeout, **Take over** and the composer disappear.

On a WhatsApp, Messenger or Instagram channel whose **Who answers** setting is **Your team**, the agent stays silent and customer messages wait here for your team to take over. See [Channels](/channels/).

## Internal notes

The **Notes** tab holds notes for your team, up to 4,000 characters each. The customer and the agent never see them. Notes show their author and time, and adding one is recorded in the [audit log](/operate/audit-log/).

## Reveal a participant

Owners, Admins and Supervisors can see who the customer is, such as the account ID of a verified customer.

1. Open **More actions** and select **Reveal participant · audited**.
2. Enter the reason you need to see it, up to 1,000 characters.
3. Select **Reveal**.

The identity replaces **Participant hidden** for you until you reload the page. Every reveal is recorded in the workspace [audit log](/operate/audit-log/) with your reason.

## Send a WhatsApp template

Outside the 24-hour window, WhatsApp only delivers templates that Meta has approved. You can send one from the inbox to a conversation you have taken over:

1. Select **Take over**, then **More actions** and **Send approved template**.
2. Choose an **Approved template** and fill in each **Body parameter**. The dialog shows a **Message preview**.
3. Choose a recorded **Customer opt-in** for the template’s category. If there is none, pick the **Customer message with explicit opt-in**, check that it really grants permission, and select **Record customer opt-in**.
4. Select **Queue template**. Its delivery state appears in the transcript.

Only body-text templates synchronized from your WhatsApp account are offered. **Revoke selected opt-in** withdraws a recorded opt-in. If the dialog says a previous send has an unconfirmed outcome, select **Check pending command** before you send again, so the customer does not get the template twice. For connecting WhatsApp and managing templates, see [WhatsApp](/channels/whatsapp/).

Caution

A booking request or an ordinary reply is not opt-in. Record opt-in only from a message in which the customer explicitly agrees to receive that category of message.

## Related

* [Monitor and analytics](/operate/monitor-and-analytics/)
* [Handoff and end actions](/agents/handoff-and-end-actions/)
* [Data and privacy](/operate/data-and-privacy/): how long transcripts are kept.
