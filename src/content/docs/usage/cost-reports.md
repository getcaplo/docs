---
title: Cost reports
description: Understand the different cost figures in the console, from model cost estimates in Monitor to billed charges, and how Caplo-managed and your-key costs are separated.
sidebar:
  order: 4
---

The console shows cost in more than one place, and the figures answer different questions. Use this page to pick the right one and to understand why two figures can differ.

| Figure | Where | Answers | Is it what you pay Caplo? |
| --- | --- | --- | --- |
| **Estimated cost** | **Overview**, and **Conversations** under **Monitor** | Roughly what did the model calls in these conversations cost? | No. |
| **Balance activity**, statements and receipts | **Usage & billing** then **Plan & billing** | What was charged to our balance and what did we pay? | Yes, on a plan with a prepaid balance. |
| **AI usage** and **Platform** | **Usage & billing** then **Usage**, **Charges** tab | What does a price plan charge, by charge type, agent, channel and model? | Yes, for a workspace billed by a price plan, as an estimate until the month closes. |
| Quantities | **Usage & billing** then **Usage**, **Usage** tab | How many tokens, audio minutes, characters and voice minutes did we use? | No prices are shown. |

## Monitor cost estimates

The **Overview** page has an **Estimated cost** tile, and **Conversations** shows an estimated cost for each conversation and each agent turn, next to its model calls and token counts. These are quick estimates for spotting expensive conversations and agents:

- They estimate model calls only, priced from a rate card whose version the tile shows (for example "rate card 2026-10").
- They price every model call the same way, whether it ran on **Caplo Managed** or **Your key**. Each model call in a turn shows which key source it used.
- They do not include platform fees, speech or plan credit.
- **Partial estimate, some models have no price** means some calls used a model the rate card has no price for. The real cost is higher than shown.
- The **Overview** tile is not estimated per channel. Clear the channel filter to see it.

The tile says "not billing" for a reason: never reconcile an invoice against these figures.

## Billed cost

On a plan, what you pay is what was charged to your balance: **Balance activity** on **Plan & billing**, one line per day, and the month's statement. It covers platform fees for conversations and voice minutes, and Caplo-managed AI and speech at list price with no markup. See [How your bill works](/billing/how-billing-works/).

For a workspace billed by a price plan, the **Charges** tab of **Usage** is the figure that matters. See [Usage and charges pages](/usage/usage-and-statements/#charges-tab). It separates:

- **Platform**: voice minutes and AI replies, charged whichever key was used.
- **AI usage**: Caplo-managed language models and speech, at list price plus the price plan's markup.

Calls on your own keys add no AI usage charge. The **Charges** tab counts how many requests used your keys and which providers, and those providers bill you directly. Group the **Charge breakdown** by **Model** or **Provider** to see where AI usage comes from.

## Caplo-managed and your-key usage

To compare what runs on Caplo's accounts with what runs on yours, use the **Usage** tab and set **Keys** to **Caplo-managed** or **Your keys**. Quantities come from what each provider reports, so you can compare your-key usage with the provider's own usage dashboard.

Caplo does not show prices for usage on your keys: your provider's invoice is the source of truth for that cost.

## Known cost is a lower bound

Caplo counts cost from what each provider reports for each request. Sometimes a report is incomplete:

- On the **Usage** tab, a note says how many requests have partial or missing usage from the provider. Their known quantities are included, so totals can rise as reports arrive.
- On the **Charges** tab, a note says when Caplo-managed requests used a meter that has no list price yet. Those requests are charged for their priced part only.
- In Monitor, a partial estimate means some models have no price.

In each case the figure shown is the cost Caplo knows, not more. Treat it as a minimum, and select **Refresh** later for updated numbers.

## Why the figures differ

If **Estimated cost** in Monitor and what you were charged disagree, the usual reasons are:

- Monitor includes calls on your own keys; Caplo charges only Caplo-managed calls.
- Charges add platform fees and speech, and on a price plan its markup; Monitor does not.
- The two use different price sources: a rate card for Monitor, list prices (and a price plan, where one applies) for charges.

## Related

- [How your bill works](/billing/how-billing-works/)
- [Spend budgets](/usage/spend-budgets/)
- [Bring your own key](/providers/bring-your-own-key/)
