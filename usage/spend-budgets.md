# Spend budgets

> Set monthly budgets for the workspace, an agent or a channel, get email alerts at thresholds, and optionally pause new conversations at the limit.

A spend budget is a monthly limit on what Caplo charges for production conversations, for the whole workspace, one agent or one channel. When charges reach a threshold, Caplo emails your Owners and Billing members. You can also choose to pause new conversations when a budget is reached.

Budgets live on the **Spend controls** page, under **Usage & billing** in the console.

## What a budget counts

* Caplo’s charges for production conversations in the current UTC calendar month: platform fees and Caplo-managed AI usage. See [How Caplo charges](/usage/).
* Charges before the monthly allowance is subtracted, so a budget fills from the first charge of the month.
* Not live tests, evaluations or agent building, which are free.
* Not what your providers bill you for usage on your own keys.

Budgets reset on the first day of each UTC month.

## Who can manage budgets

Owners and Billing members can create, change and remove budgets. Admins and Auditors can view them. Every change is recorded in the audit log.

## Create a budget

1. Open **Usage & billing** then **Spend controls** and select **New budget**.

2. Enter a **Name**, for example “Support team”.

3. Under **Applies to**, choose **Whole workspace**, **An agent** or **A channel**. For an agent or channel, choose which one. You can’t change the scope later, and each scope can have only one budget.

4. Enter the **Monthly amount (USD)**.

5. Under **Alert at**, choose one or more thresholds: 50%, 80%, 90% or 100%.

6. Under **When the budget is reached**, choose **Alert only** or **Pause new conversations**.

7. Select **Create budget**.

A new budget shows **Not checked yet** until Caplo has compared it with the month’s charges, which takes about a minute.

## Alerts

Each threshold sends one email per budget per month, to every active Owner and Billing member of the workspace. The **Alert delivery** card lists who receives them, and **Recent alerts** shows the 50 most recent alerts with the amount spent when each was sent.

## Pause new conversations

With **Pause new conversations**, when charges in the budget’s scope reach the monthly amount:

* New conversations in that scope are refused. For a workspace budget, that is every channel; for an agent or channel budget, only that agent or channel.
* Conversations already in progress continue and finish normally.
* The pause lasts until the next month starts, or until you raise the amount, switch the budget to **Alert only** or remove it.
* Owners and Billing members get an email saying new conversations are paused, even if you did not choose the 100% threshold.

Caution

Pausing affects your customers. Charges are checked about once a minute, so the total can go slightly over the amount before new conversations stop, and conversations in progress keep adding charges. Use a lower threshold alert to act before a pause is needed.

## Read the page

The tiles at the top show **Charges this month** (production only), **Forecast at month end** at the month’s pace so far (shown once 10% of the month has passed), **Budgets at risk** and **Alerts this month**.

Each budget’s row shows what it has spent this month, its forecast, its thresholds, what happens at the limit and its status:

| Status              | Meaning                                                               |
| ------------------- | --------------------------------------------------------------------- |
| **On track**        | Below the amount and not forecast to reach it.                        |
| **Forecast over**   | Below the amount, but forecast to go over by month end.               |
| **Over budget**     | At or over the amount, with **Alert only**.                           |
| **Paused**          | At or over the amount, and new conversations in its scope are paused. |
| **Not checked yet** | No charges have been compared with this budget yet.                   |

## Resume or change a budget

To resume conversations a budget paused, open it with **Edit** and raise the **Monthly amount (USD)** above the month’s charges, or switch it to **Alert only**, then select **Save budget**. New conversations are accepted again once Caplo applies the change, usually within a minute.

To remove a budget, open it with **Edit** and select **Remove budget**. Its alerts stay in the history, and any conversations it paused are allowed again.

Note

**Settings** then **Billing & limits** links to **Spend controls**, where budgets are set.
