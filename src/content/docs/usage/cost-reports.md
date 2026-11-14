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
| **AI usage** and **Platform** | **Usage & billing** then **Billing** | What will Caplo charge, by charge type, agent, channel and model? | Yes, as an estimate until the month closes. |
| Quantities | **Usage & billing** then **Usage** | How many tokens, audio minutes, characters and voice minutes did we use? | No prices are shown. |

## Monitor cost estimates

The **Overview** page has an **Estimated cost** tile, and **Conversations** shows an estimated cost for each conversation and each agent turn, next to its model calls and token counts. These are quick estimates for spotting expensive conversations and agents:

- They estimate model calls only, priced from a rate card whose version the tile shows (for example "rate card 2026-10").
- They price every model call the same way, whether it ran on **Caplo Managed** or **Your key**. Each model call in a turn shows which key source it used.
- They do not include platform fees, speech, your plan's markup or the monthly allowance.
- **Partial estimate, some models have no price** means some calls used a model the rate card has no price for. The real cost is higher than shown.
- The **Overview** tile is not estimated per channel. Clear the channel filter to see it.

The tile says "not billing" for a reason: never reconcile an invoice against these figures.

## Billed cost

The **Billing** page is the figure that matters for your bill. See [Usage and statements](/usage/usage-and-statements/). It separates:

- **Platform**: voice minutes and AI replies, charged whichever key was used.
- **AI usage**: Caplo-managed language models and speech, at list price plus your plan's markup.

Calls on your own keys add no AI usage charge. The page counts how many requests used your keys and which providers, and those providers bill you directly. Group the **Charge breakdown** by **Model** or **Provider** to see where AI usage comes from.

## Caplo-managed and your-key usage

To compare what runs on Caplo's accounts with what runs on yours, use the **Usage** page and set **Keys** to **Caplo-managed** or **Your keys**. Quantities come from what each provider reports, so you can compare your-key usage with the provider's own usage dashboard.

Caplo does not show prices for usage on your keys: your provider's invoice is the source of truth for that cost.

## Known cost is a lower bound

Caplo counts cost from what each provider reports for each request. Sometimes a report is incomplete:

- On the **Usage** page, a note says how many requests have partial or missing usage from the provider. Their known quantities are included, so totals can rise as reports arrive.
- On the **Billing** page, a note says when Caplo-managed requests used a meter that has no list price yet. Those requests are charged for their priced part only.
- In Monitor, a partial estimate means some models have no price.

In each case the figure shown is the cost Caplo knows, not more. Treat it as a minimum, and select **Refresh** later for updated numbers.

## Why the figures differ

If **Estimated cost** in Monitor and **AI usage** on the Billing page disagree, the usual reasons are:

- Monitor includes calls on your own keys; Billing charges only Caplo-managed calls.
- Billing adds platform fees, speech and your plan's markup; Monitor does not.
- The two use different price sources: a rate card for Monitor, your price plan and list prices for Billing.
- Usage before your price plan started is recorded but not charged.

## Related

- [How Caplo charges](/usage/)
- [Spend budgets](/usage/spend-budgets/)
- [Bring your own key](/providers/bring-your-own-key/)
