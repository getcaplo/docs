---
title: How Caplo charges
description: What Caplo charges for, what is free, how the monthly allowance and your own provider keys change the bill, and where to find your prices.
sidebar:
  order: 1
---

Caplo charges for production conversations: the ones your customers have with your agents on live channels. Building and testing agents is free.

Your prices come from your workspace's price plan, which the console shows on the **Billing** page under **Your rates**. This page explains what each charge is for; it does not list prices.

## What is charged

Charges come in two kinds.

**Platform fees** apply to every production conversation, whichever key paid for the models:

| Charge | What counts |
| --- | --- |
| **Voice minutes** | Connected time on voice calls, by phone or in the website widget, billed by the second. |
| **AI replies** | Each completed agent reply in a text channel, such as the website widget chat or WhatsApp. |

**AI usage** applies only to providers set to **Caplo Managed**. It is the provider's list price for what your agents used, plus your plan's markup percentage, if it has one:

| Charge | What counts |
| --- | --- |
| **Language models** | Input, cached input and output tokens, including audio tokens of realtime voice models. |
| **Speech to text** | Audio transcribed on voice calls. |
| **Text to speech** | Characters spoken on voice calls. |

The **Your rates** card lists the platform fee rates and the list rates of the Caplo-managed models your workspace used in the selected period.

## What is free

These are never charged:

- Live tests from the agent builder.
- Evaluation runs.
- Agent building assistance and other platform work in the background.

They still appear on the **Usage** page, under the matching **Source** filter, so you can see how much they use.

## Monthly allowance

Your price plan can include an amount each month (**Included each month**). It is credited against all of that month's charges, platform fees and AI usage alike. The **Billing** page shows how much of it is used, and **Estimated amount due** is the month's charges after the allowance.

Months are UTC calendar months, and days on the usage and billing pages are UTC days.

## Using your own keys

When a provider is set to **Your key**, its calls run on your provider account:

- They add no AI usage charge. The provider bills you directly at your rates with them.
- Platform fees still apply to those conversations.
- The **Billing** page counts the requests that used your keys, so you can see why a conversation has a platform fee but no AI usage.

See [Bring your own key](/providers/bring-your-own-key/).

## When no price plan applies

If no price plan covers a period, the **Billing** page shows "No price plan applies to this period yet, so its usage is recorded but not charged." Usage is still recorded on the **Usage** page. If a plan started partway through the period, the page notes that usage before the plan started is not charged.

A new price plan is announced on the **Billing** page before it takes effect, with its date and new rates. Prices change only with notice, and each charge uses the plan in effect when the usage happened.

## Estimates, invoices and payment

Charges on the **Billing** page are estimates until the month closes. The console does not show subscriptions, taxes, invoices or payment collection; under **Settings** then **Billing & limits**, the **Invoices** section reads "No invoices yet".

## Who can see charges

Owners, Admins, Billing members and Auditors can see the **Usage** and **Billing** pages and spend budgets. Other roles see a message that their workspace role does not allow viewing usage or billing. Only Owners and Billing members can change budgets. See [Spend budgets](/usage/spend-budgets/).

## Related

- [Usage and statements](/usage/usage-and-statements/)
- [Spend budgets](/usage/spend-budgets/)
- [Cost reports](/usage/cost-reports/)
- [Models and providers](/providers/)
