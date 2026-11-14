# Connect a Twilio number

> Connect your Twilio account, route a number to Caplo with an Elastic SIP trunk, set up transfers, test a call, and remove the number again.

Caplo answers calls to your Twilio numbers through Twilio Elastic SIP Trunking. You create the trunk in your Twilio account and point it at Caplo; Caplo never creates trunks, buys numbers or changes your Twilio configuration. For how phone channels work as a whole, see [Phone calls](/channels/phone/).

## What you need

| Value                                  | Where to find it in Twilio                                                                            | What Caplo does with it                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Twilio Account SID**                 | The account dashboard. Starts with `AC`.                                                              | Selects the account or subaccount whose numbers you connect.                                          |
| **API Key SID** and **API Key Secret** | **API keys & tokens**. Create a key in the same account as the Account SID. The SID starts with `SK`. | Reads the account’s phone numbers, the trunks they are assigned to, and call records after calls end. |
| **Account Auth Token**                 | **API keys & tokens**, under the account’s auth tokens.                                               | Required by the connect form. Caplo stores it encrypted.                                              |

The account must be in Twilio’s **US1** region. The API Key Secret and the Account Auth Token are different values; the form needs both.

Caplo only reads through the API key: incoming phone numbers, calls, and Elastic SIP trunks. A Standard key works. If you use a Restricted key, give it read access to those three resources.

Caplo stores the secrets encrypted and never shows them again. You also need a role that can manage integrations (Owner, Admin or Developer), and phone numbers enabled for your workspace. See [Before you start](/channels/phone/#before-you-start).

## Connect the account

1. In the console, open **Integrations** then **Communication channels**, select the **Twilio** tab, then **Add integration**.

2. Enter an **Integration name**, the **Twilio Account SID**, **API Key SID**, **API Key Secret** and **Account Auth Token**, then select **Verify and connect**. Caplo checks the credentials with Twilio and lists the account’s voice numbers.

3. Select **Connection details** on the new account. The **SIP connection** panel shows the values you need in Twilio:

   | Field                                                 | Use                                                             |
   | ----------------------------------------------------- | --------------------------------------------------------------- |
   | **Origination URI**                                   | Where the trunk sends calls. Always copy it from here.          |
   | **Termination username** and **Termination password** | Only for warm transfers. Select **Reveal** to see the password. |

Connecting changes nothing in Twilio. Your numbers keep their current routing until you assign them to a trunk.

## Route a number to Caplo

1. In the Twilio console, go to **Elastic SIP Trunking** and create a trunk. Use one trunk for all the numbers you send to Caplo.

2. On the trunk’s **Origination** settings, add the **Origination URI** from Caplo’s **Connection details**. No credential list is needed for origination.

3. On the trunk’s **Numbers** settings, add the phone number.

   Caution

   Assigning a number to a trunk replaces how Twilio handled its calls before, such as a webhook URL or TwiML app. Calls to that number reach Caplo only from then on.

4. Back in Caplo, select **Refresh account and numbers** in **Connection details**. The number should now show **Eligible for binding**.

5. Create a phone channel for the number. See [Set up a phone channel](/channels/phone/#set-up-a-phone-channel).

Saving the channel creates the number’s route in Caplo. It shows **Provisioning** and then **Ready** under **Number routes**.

Secure Trunking (encrypted calls) can be on or off. Caplo accepts calls either way.

## Transfers

If the channel transfers callers to your team, the trunk must allow it. Change these on the trunk in Twilio, then select **Refresh account and numbers** in Caplo, because Caplo reads the trunk’s settings only when the account is checked.

**Cold transfers** use SIP REFER:

* In the trunk’s general settings, turn on **Call Transfer (SIP REFER)**.
* To transfer to a phone number, also allow transfers to the PSTN. With SIP-only transfers, use a `sip:` URI as the target.

**Warm transfers** make a new call from your Twilio account to the person:

* Set a **Termination SIP URI** on the trunk.
* Create a credential list with the **Termination username** and **Termination password** from Caplo’s **Connection details**, and add it to the trunk’s termination authentication.

If you change Secure Trunking later, refresh the account so warm transfers use the matching encryption.

When the trunk blocks the transfer type you chose, the channel’s **Configure** dialog shows a warning such as “Call transfer is turned off on this number’s Twilio trunk”. The transferred call is billed to your Twilio account.

## Test a call

1. Check that the number shows **Ready** under **Number routes** in **Connection details**.
2. Call the number from a phone. You should hear the agent’s greeting.
3. Talk to the agent, try interrupting it, and hang up.
4. Open **Monitor** then **Conversations** and find the call on the channel to read the transcript.

Number discovery does not prove that audio works both ways, so make a real call after every change to the trunk.

## Keep the account current

Caplo checks a Twilio account’s numbers and trunks when you connect it, rotate its credentials, or select **Refresh account and numbers**. It does not check them on its own.

Refresh at least every 24 hours

A Twilio number whose last check is more than 24 hours old stops taking calls: callers are disconnected without a message. Select **Refresh account and numbers** to bring it back.

Select **Refresh account and numbers** whenever you change something in Twilio, such as trunk settings or the numbers on a trunk.

To replace the API key or Auth Token, select **Rotate credentials** on the account, enter the new values and select **Verify and rotate**. The name and Account SID stay the same.

## What not to change in Twilio

While a number serves a phone channel, leave these as they are:

* The Origination URI on the trunk. Without it, calls never reach Caplo.
* The number’s assignment to the trunk. Moving it off the trunk stops its calls reaching Caplo.
* The termination SIP URI and credential list, if you use warm transfers.
* **Call Transfer (SIP REFER)** and PSTN transfer settings, if you use cold transfers.

If you change any of them, select **Refresh account and numbers** in Caplo and make a test call.

## Remove a number

1. In Caplo, open the number’s channel and select **Pause channel**. New calls are disconnected; calls in progress finish.
2. In Twilio, remove the number from the Elastic SIP trunk and set up its voice handling as you want it.
3. In Caplo, select **Refresh account and numbers**. The number shows **Needs setup** and its route **Disconnected**.

Phone channels cannot be deleted, and a number stays tied to the channel it was first connected to. To have another agent answer the number, change the channel’s agent instead.

To stop all numbers of a Twilio account at once, select **Disable** on the account in **Integrations**. Its numbers stop taking calls until you select **Enable**.

## Troubleshooting

Blockers next to a number in **Connection details**:

| Message                                                                        | Fix                                                                               |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| The number is no longer available in this account.                             | The number was released or moved. Check the account in Twilio, then refresh.      |
| Enable this account connection.                                                | The account is disabled in Caplo. Select **Enable**.                              |
| Refresh the account and numbers.                                               | The last check is more than 24 hours old. Select **Refresh account and numbers**. |
| Assign the number to an Elastic SIP trunk configured with the origination URI. | Add the number to the trunk, then refresh.                                        |

**No voice-capable numbers found.** Assign an owned voice number to an Elastic SIP trunk in Twilio, then refresh.

**Verify and connect fails.** Check that the API key belongs to the account in **Twilio Account SID**, that the key is active, and that the account is in the US1 region.

**Calls are not answered.** Check the Origination URI matches **Connection details** exactly, the route is **Ready**, the channel is not paused, and the account was refreshed in the last 24 hours. See [Troubleshooting](/channels/phone/#troubleshooting) for more.
