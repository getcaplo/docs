# Phone calls

> Answer calls to your own Twilio or Telnyx number with an agent, transfer callers to your team, and know what callers hear, what it costs and how to fix common problems.

A phone channel lets customers call an agent. You bring a phone number from your own Twilio or Telnyx account and point it at Caplo. When someone calls, your carrier sends the call to Caplo over SIP, and the agent release the channel serves answers it.

Phone channels take **inbound calls only**. Caplo does not buy numbers, place outbound calls to customers, or change your carrier account beyond what you configure yourself.

## How a call reaches your agent

1. A caller dials your Twilio or Telnyx number.
2. Your carrier sends the call over SIP to the address Caplo shows for your account (a Twilio Elastic SIP trunk or a Telnyx FQDN connection).
3. Caplo checks that the number is connected to an active phone channel in your workspace, then starts a conversation on the release that channel serves.
4. The agent speaks its greeting, listens, and answers by voice until the call ends or is transferred.

Each call is one conversation. It appears under **Monitor** then **Conversations** with the channel’s name, so you can read the transcript. See [Conversations inbox](/operate/conversations-inbox/).

## Before you start

* **Phone channels are enabled per workspace.** If the **Twilio** or **Telnyx** tab under **Integrations** then **Communication channels** shows an error, or connecting an account fails, ask [Caplo support](/resources/support/) to enable phone numbers for your workspace.
* A Twilio or Telnyx account with at least one voice-capable phone number. Your carrier bills you for the number and the call minutes.
* A published agent release. See [Publish an agent](/agents/publishing/).
* A role that can manage integrations (Owner, Admin or Developer) to connect the carrier account, and one that can configure channels (Owner, Admin or Builder) to create the channel.

## Choose Twilio or Telnyx

Both carriers work the same way once connected. Pick the one where your numbers already are.

|                                | Twilio                                                                         | Telnyx                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| What you connect               | Account SID, an API key and the account’s Auth Token                           | An API v2 key and the account’s public key                                   |
| Where calls are routed         | An Elastic SIP trunk with Caplo’s origination URI                              | An FQDN SIP connection to Caplo’s SIP host, with credentials Caplo gives you |
| Account limits                 | US1 region accounts only                                                       | None specific to Caplo                                                       |
| Number checks                  | When you connect, rotate credentials or select **Refresh account and numbers** | Automatically about once an hour, and when you refresh                       |
| Extra setup for warm transfers | A termination SIP URI and a credential list on the trunk                       | The connection must be allowed to place outbound calls                       |

Setup guides: [Connect a Twilio number](/channels/phone/twilio/) and [Connect a Telnyx number](/channels/phone/telnyx/).

## Set up a phone channel

1. **Connect your carrier account** in **Integrations** then **Communication channels**, and route your number to Caplo as the carrier guide describes. When **Connection details** lists the number as **Eligible for binding**, it is ready.

2. **Create the channel.** In **Channels** (under **Deploy**), select **Create channel** and choose **Telephone**. Enter a **Channel name**, choose the **Agent** and **Agent release**, then select **Set up connection**.

3. On **Phone connection**, choose the **Voice provider** (Twilio or Telnyx), the connected account, and the **Phone number**. Only verified numbers that no other channel uses can be chosen. Select **Continue**.

4. On **Conversation**, optionally set **Transfer calls to** and **Transfer type** (see [Transfer calls to a person](#transfer-calls-to-a-person)), then select **Create channel**.

5. Caplo creates the number’s route. Under **Number routes** in the SIP connection panel, the number shows **Provisioning** and then **Ready**, usually within a minute.

6. **Call the number.** You should hear the agent’s greeting. Check the call in **Monitor** then **Conversations**. Discovering a number does not prove that audio works both ways, so always make a real test call before you give the number to customers.

The provider and the number are fixed once the channel exists. To have a different agent answer the same number, change the channel’s release or agent instead.

### Change the release a number serves

**Console**

Open the channel in **Channels** and select **Update to** the newest release, or **Change release** to pick any release or another agent. New calls use the new release; calls in progress keep theirs. See [Channels](/channels/).

**CLI**

Phone channels are named `twilio/<name>` or `telnyx/<name>`:

```sh
caplo channel list
caplo channel deploy "twilio/Support line"
caplo channel deploy "telnyx/Support line" --agent "Support Desk@1.4.0"
caplo channel rollback "twilio/Support line"
```

See [`caplo channel deploy`](/reference/cli/channel/#caplo-channel-deploy).

To change transfer settings later, open the channel and select **Configure** on its phone entry point.

## Voice settings for phone calls

How the agent listens and speaks is set on the agent, under **Advanced settings** then **Voice**, so it is the same on the phone and in the website widget. [Voice and speech](/providers/voice-and-speech/) explains every setting. On the phone, these matter most:

* **Voice language** and **Speech recognition**: callers are understood only in the agent’s voice language. Test with real phone audio, which is lower quality than a browser microphone.
* **Greeting**: the caller hears the agent’s greeting as soon as the call connects. Keep it short.
* **Fixed lines**: the transfer, transfer failed, time limit and silence lines are what callers hear at those moments. The **Continue in chat line** never plays on a phone call.
* **Silence check after** and **End call after**: with the defaults, a silent caller hears “Are you still there?” after 15 seconds and the call ends 10 seconds later.
* **Typing sound while working**: plays a soft typing sound while the agent looks something up, so the caller does not hear dead air.
* **Start replies early** and a **Realtime model** make replies start sooner.

Callers can interrupt the agent at any time. The agent stops speaking, and its next reply knows how much of the interrupted answer the caller actually heard.

To let the agent hang up when the caller is done, allow the **End call** action on the agent. See [Hand off to a person or end a call](/agents/handoff-and-end-actions/).

Voice changes reach callers after you publish a release and update the channel to it.

## Transfer calls to a person

A phone channel can send callers to your team when the agent hands off. It needs both:

* The agent allows the **Transfer to a human** action in a published release, and its instructions say when to use it. See [Hand off to a person or end a call](/agents/handoff-and-end-actions/).
* The channel’s **Transfer calls to** field holds a phone number in international format (for example `+15550100142`) or a `sip:` or `sips:` URI, up to 256 characters.

Without a **Transfer calls to** target, the call stays with the agent. Phone calls cannot be taken over from the console.

Choose the **Transfer type**:

|                              | Cold                                                  | Warm                                                                                                         |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Target                       | Phone number or SIP URI                               | Phone number only                                                                                            |
| What the caller hears        | The transfer line, then ringing at your team’s number | The transfer line, then hold music                                                                           |
| What your team hears         | A normal incoming call                                | A briefing with the agent’s reason for the transfer and the caller’s number, then “Press 1 to take the call” |
| When the caller is connected | As soon as your team answers                          | When the person presses 1                                                                                    |
| How it works                 | Your carrier transfers the call (SIP REFER)           | Caplo calls the person through your carrier, then joins them to the caller                                   |

The destination rings for up to 30 seconds. For a warm transfer, the briefing plays at most twice, with 10 seconds after each to press 1, and the whole transfer must connect within 150 seconds. Edit the briefing with the **Warm transfer briefing** line in the agent’s voice settings; `{reason}` and `{caller}` are filled in for you.

If nobody answers, the person declines, or the carrier refuses the transfer, the caller hears the **Transfer failed line** and the agent carries on. A call can attempt at most two warm transfers.

Your carrier must allow transfers on the number. See the carrier guide for the settings: [Twilio](/channels/phone/twilio/#transfers) or [Telnyx](/channels/phone/telnyx/#transfers).

## Maximum call duration

Every call has a time limit, set for the whole workspace in **Settings** then **Data & privacy** under **Voice calls**. It is 60 minutes unless you change it, and you can set 5 to 240 minutes. Owners and Admins can change it. See [Data and privacy](/operate/data-and-privacy/).

* One minute before the limit, the caller hears the **Time limit warning line**.
* At the limit, the caller hears the **Time limit goodbye line** and the call ends. A transfer already in progress finishes first.
* A change applies to calls that start after it.

After a warm transfer connects, the conversation between the caller and your team is no longer timed by this setting, but no phone call can last longer than about four hours.

## What callers hear when something goes wrong

| Situation                                                                                                             | What the caller hears                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| The number has no phone channel, or its route is not **Ready**                                                        | Caplo does not answer; the caller gets your carrier’s failed-call treatment.        |
| The channel is paused, the carrier integration is disabled, the release was revoked, or Caplo is at its call capacity | The call is disconnected without a message.                                         |
| A Twilio number has not been checked for 24 hours                                                                     | The call is disconnected without a message. Select **Refresh account and numbers**. |
| A reply cannot be produced right now                                                                                  | The **Unavailable line**, then the agent keeps listening.                           |
| A reply fails                                                                                                         | The **Error line**, then the agent keeps listening.                                 |
| A speech provider refuses your own key                                                                                | The call ends. Check the key under **Integrations** then **Service providers**.     |
| The caller stays silent                                                                                               | The **Silence check line**, then the **Silence goodbye line**, and the call ends.   |

Fixed lines left empty use the platform’s wording, shown as placeholders in the agent’s voice settings.

## Costs

A phone call is billed in two places:

* **Caplo** charges **Voice minutes** for connected call time, billed by the second, plus speech recognition, spoken characters and model tokens for providers set to **Caplo Managed**. See [How Caplo charges](/usage/) and [what affects the cost of a call](/providers/voice-and-speech/#what-affects-cost).
* **Your carrier** bills your Twilio or Telnyx account directly for the number, the inbound call minutes, and any transferred calls. A warm transfer places an outbound call from your account, and the caller’s inbound call stays open while they talk to your team.

Shorter silence timings, a lower maximum call duration and short spoken replies all reduce the cost of a call.

## Limits

| Limit               | Value                                                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Call direction      | Inbound only. Caplo never calls customers.                                                                                                                                                                                                             |
| Numbers per channel | One. A number can serve only one channel, and the provider and number cannot be changed after the channel is created.                                                                                                                                  |
| Simultaneous calls  | Currently one call at a time per workspace, counting phone and website voice calls together; platform capacity is also limited. A call that arrives when no capacity is free is disconnected. Contact [support](/resources/support/) if you need more. |
| Call length         | 5 to 240 minutes, set per workspace; 60 by default.                                                                                                                                                                                                    |
| Write tools         | Do not run on phone calls. Read tools work as usual.                                                                                                                                                                                                   |
| Caller identity     | Callers are anonymous. The caller’s number is not treated as a verified customer.                                                                                                                                                                      |
| Transfer target     | One per channel. Warm transfers need a phone number; at most two warm transfer attempts per call.                                                                                                                                                      |
| Deleting            | Phone channels can be paused but not deleted.                                                                                                                                                                                                          |

Because write tools do not run on calls, tell the agent in its instructions how to help callers who want to change something, for example by transferring them or pointing them to your website. See [Write tools](/tools/write-tools/).

## Pause or stop answering a number

Select **Pause channel** on the channel. Caplo then disconnects new calls to the number; calls in progress continue. **Resume channel** takes calls again.

To send the number’s calls somewhere else entirely, route it away from Caplo in your carrier account. See [Remove a Twilio number](/channels/phone/twilio/#remove-a-number) or [Remove a Telnyx number](/channels/phone/telnyx/#remove-a-number).

## Troubleshooting

**The call does not connect, or the caller hears a carrier error.**

* In **Integrations**, open the account’s **Connection details**. The number should be **Eligible for binding**, and under **Number routes** it should be **Ready**. A blocker next to the number says what to fix.
* Check that the account is enabled and the channel is not paused.
* Check the SIP settings in your carrier account against **Connection details**. Copy the values again rather than typing them.
* For Twilio, select **Refresh account and numbers**: a Twilio number not checked for 24 hours stops taking calls.

**The call connects and then hangs up straight away.** The channel may be paused, the release revoked, or another call may be using your workspace’s call capacity. Try again once other calls have ended. If your speech providers use your own keys, check that the keys still work.

**The caller hears nothing, or the agent does not hear the caller.** This is usually a media setting at the carrier. For Telnyx, enable SRTP and the PCMU (G.711 μ-law) codec on the connection. For Twilio, check the trunk has not been changed since you connected it, then select **Refresh account and numbers**. If the greeting plays but the agent never answers, check that the caller speaks the agent’s **Voice language**.

**Transfers fail.** The caller hears the transfer failed line when the target does not answer within 30 seconds, the person does not press 1, or the carrier refuses the transfer. Check:

* The agent’s published release allows **Transfer to a human**, and the channel has **Transfer calls to** set.
* The target number is in international format and can take calls from your carrier.
* Your carrier allows transfers on this number. For Twilio, the channel’s **Configure** dialog warns you when the trunk blocks the transfer you chose.

**The number is not in the list when creating the channel.** It must be voice-capable, routed to Caplo (an Elastic SIP trunk for Twilio, an FQDN SIP connection for Telnyx), and not already used by another channel. Fix the routing, then select **Refresh account and numbers**.

## Related

[Connect a Twilio number](/channels/phone/twilio/)

[Connect a Telnyx number](/channels/phone/telnyx/)

[Voice and speech](/providers/voice-and-speech/)

[Hand off to a person or end a call](/agents/handoff-and-end-actions/)
