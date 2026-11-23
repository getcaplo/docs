---
title: Plan limits and errors
description: What each plan limit counts, what happens when you reach one, and the messages your team and your customers may see.
sidebar:
  order: 6
---

The **Plan limits** card on **Plan & billing** shows what your plan allows. Limits apply across every agent in the workspace, and a limit only refuses something new: what you already have keeps working, also after a downgrade.

## Limits

| Limit | What counts | At the limit |
| --- | --- | --- |
| **Phone calls at once** | Calls in progress at the same moment across all phone channels. Website chat and browser voice are not limited by plan. | The next caller is turned away as busy. |
| **Published agents** | Agents with a release that no other agent uses as a sub-agent. Sub-agents don't count. | Publishing another agent's first release, or restoring an archived one, is refused. New releases of published agents are not. |
| **Channels of each type** | Website, phone (Twilio, Telnyx and Caplo numbers together), WhatsApp, Messenger, Instagram and Outlook channels, each type separately. Removed channels don't count. | Creating another channel of that type is refused. |
| **Handoff destinations** | Destinations that pass conversations to your team. | Adding another is refused. The Free trial has none. |
| **Knowledge storage** | Files stored in all knowledge bases. | Uploading or replacing a file that adds to the total is refused. |
| **Longest call** | Each voice call, by phone or in the widget. | The caller hears a warning a minute before and a goodbye at the limit. A shorter **Maximum call duration** in [Data and privacy](/operate/data-and-privacy/#maximum-call-duration) still applies. |
| **Conversation history kept** | How long transcripts are kept. | Longer **Transcript retention** choices are refused. |

## Features

A feature your plan leaves out shows which plans include it, where you would use it: for example "Call recording is available on Pro and Enterprise." The control stays unavailable until you change the plan.

| Feature | Without it |
| --- | --- |
| Caplo phone numbers | You can't search for or add a Caplo number. Numbers you already have keep working. |
| Your own model and speech keys | You can't save a key or choose **Your key**. After a downgrade, providers set to **Your key** use Caplo-managed models and speech, charged at list price, until the plan includes keys again. |
| Call recording | Calls are not recorded, whatever the setting says. You can still turn recording off. |
| Customer memory | Agents don't remember customers between conversations. |
| Remove "Powered by Caplo" | The website widget shows a small "Powered by Caplo" link. |
| Single sign-on and SCIM | Company sign-in and provisioning can't be set up. |

## Messages your team may see

| Message | What to do |
| --- | --- |
| Your plan allows a number of published agents, channels or handoff destinations | Archive or remove one, or [change the plan](/billing/change-or-cancel/). |
| "This file would take the workspace past the … of stored files its plan includes." | Delete knowledge files you no longer need, or change the plan. |
| Your plan does not include Caplo phone numbers, your own keys or call recording | Change the plan. |
| A longer history than the plan keeps | Choose fewer days, or change the plan. |
| "Added funds do not cover the fee due now." | [Add funds](/billing/balance-and-payments/#add-funds) or select **Pay now**. |
| A payment needs billing details | Add them under [Billing details](/billing/receipts-and-invoices/#billing-details). |
| "The payment provider did not complete the request." or "Payments are not available right now." | Try again in a few minutes. |
| "Your workspace role does not allow this." | Ask an Owner or Billing member. |

## What customers may see

When the balance is used up, the workspace is paused or a [spend budget](/usage/spend-budgets/) pauses new conversations:

- New conversations are refused. The website widget answers "This assistant isn't available right now. Please try again later." Visitors never see why.
- Messages on WhatsApp, Messenger and Instagram reach your [inbox](/operate/conversations-inbox/), but the agent doesn't reply.
- New phone calls are refused.
- A budget pause lets conversations in progress finish. When the balance is used up or the workspace is paused, they get 15 more minutes; then the agent stops replying and calls end with the time-limit goodbye.

Budget pauses and paused plans never hold back live tests and evaluations. A used-up balance stops them at once, without the 15 minutes, because they spend it.

## Related

- [Plans](/billing/)
- [Change or cancel your plan](/billing/change-or-cancel/)
- [Balance and payments](/billing/balance-and-payments/#when-the-balance-reaches-zero)
