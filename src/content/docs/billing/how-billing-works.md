---
title: How your bill works
description: What Caplo charges on a plan, from the plan fee and platform fees to AI and speech at cost, what is free, and what other providers bill you directly.
sidebar:
  order: 2
---

On a Free trial, Standard or Pro plan, everything Caplo charges comes out of one prepaid balance. Enterprise works the same way, except that usage is invoiced monthly instead; see [Enterprise invoices](/billing/receipts-and-invoices/#enterprise-invoices).

A bill has three parts:

| Part | What it is | Paid from |
| --- | --- | --- |
| **Plan fee** | The monthly or yearly price of Standard or Pro, plus any extra phone calls at once on Pro. | Your saved card; without one, or if it is declined, funds you added. Never from trial or plan credit. |
| **Platform fees** | Caplo's fee for each production conversation and each voice minute. | Your balance, in [spending order](/billing/balance-and-payments/#spending-order). |
| **AI and speech** | The models, speech to text and text to speech your agents used on Caplo's accounts, at each provider's list price. | Your balance. |

Caplo phone numbers add a monthly fee per number, also charged to your balance; see [Phone numbers](#phone-numbers).

## Platform fees

**Conversations.** A conversation is one customer's thread on one text channel, such as website chat, WhatsApp, Messenger or Instagram. It covers up to 20 agent replies within 24 hours of its first reply. A thread that goes on longer, or past 24 hours, counts as another conversation. The fee is charged when the agent's first reply of each conversation is sent.

**Voice minutes.** Connected time on voice calls, by phone or in the website widget, charged by the second. Voice calls pay per minute, not per conversation.

| | Free trial | Standard | Pro |
| --- | --- | --- | --- |
| Per conversation | $0.006 | $0.006 | $0.004 |
| Per voice minute | $0.02 | $0.02 | $0.015 |

Platform fees apply to every production conversation, whoever's keys paid for the models.

## AI and speech

Language model tokens, speech recognition and spoken characters are charged at the provider's published list price, with no markup, when the provider is set to **Caplo Managed**. When a provider is set to **Your key**, its calls run on your provider account: that provider bills you, and Caplo charges nothing for them. Your own keys need Standard or higher; see [Bring your own key](/providers/bring-your-own-key/).

A cost is charged once the provider has reported it, usually within a minute of the call.

## What is free

- **Building agents.** Editing, publishing and the console's assistance cost nothing.
- **Live tests and evaluations** pay only for the AI and speech they use. They have no platform fee.

## Phone numbers

- **Your own Twilio or Telnyx number:** Twilio or Telnyx bills you for the number and its calls. Caplo charges the voice minutes and any Caplo-managed speech and AI.
- **Caplo phone number:** $18 a month for each number on Standard and Pro, charged to your balance for each day the workspace holds it. You buy one in the console when you create a phone channel, and release it when you no longer need it. The Free trial can't buy one. Incoming calls on it have no network charge, only the same voice minutes as any other call; outgoing calls aren't available yet.
- **Extra phone calls at once** on Pro are $15 a month each, added to the plan fee and prorated from the day you add them.

## WhatsApp charges

Meta bills WhatsApp messages to your own WhatsApp Business account, not to Caplo, and Caplo adds no markup. Templates your agents or team send to start or reopen a conversation are charged by Meta per delivered message, by category and the customer's country. Replies inside the customer's 24-hour window are free for the first 1,000 a number each month, then charged at Meta's rate. The conversation itself carries the usual platform fee.

## Where to see it

What was charged each day is in **Balance activity** on **Plan & billing**, and each month's total in its [statement](/billing/receipts-and-invoices/). The [Usage](/usage/usage-and-statements/) page shows the quantities behind it, by source, agent, channel and model, including live tests and evaluations.

## An example month

A workspace on Standard, paying monthly, with 1,000 chat conversations and 200 voice minutes, all on Caplo-managed models:

| Line | Amount |
| --- | --- |
| Standard plan fee | $10.00 |
| Platform fee, 1,000 conversations at $0.006 | $6.00 |
| Platform fee, 200 voice minutes at $0.02 | $4.00 |
| AI and speech at list price, for example | $8.00 |
| Usage credit included with Standard | −$5.00 |
| **Total for the month** | **$23.00** |

The AI and speech line depends on the models and voices your agents use; larger models cost more per reply. The plan fee is paid from funds you added; the usage is charged to your balance, which spends the plan credit first.

## Taxes and currency

All prices and balances are in US dollars. Receipts and invoices show any sales tax separately, at the rate in effect when they were issued.

## Related

- [Plans](/billing/)
- [Balance and payments](/billing/balance-and-payments/)
- [Spend budgets](/usage/spend-budgets/)
- [Cost reports](/usage/cost-reports/)
