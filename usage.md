# Usage and charges

> Where the console shows what your agents used and what it cost, who can see it, and how charges work for a workspace billed by a price plan.

**Usage & billing** in the console has three pages:

| Page               | Answers                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plan & billing** | Which plan are we on, what is left in the balance, and what did we pay? See [Plans and billing](/billing/).                                           |
| **Usage**          | What did our agents use (the **Usage** tab), and what did it cost (the **Charges** tab)? See [Usage and charges pages](/usage/usage-and-statements/). |
| **Spend controls** | Are we within our monthly budgets? See [Spend budgets](/usage/spend-budgets/).                                                                        |

Building agents is free. What production conversations, live tests and evaluations cost depends on your plan: see [How your bill works](/billing/how-billing-works/).

## Who can see charges

Owners, Admins, Billing members and Auditors can see **Usage**, **Plan & billing** and spend budgets. Other roles see a message that their workspace role does not allow viewing usage or billing. Only Owners and Billing members can change the plan, pay, or change budgets.

Days and months on these pages are UTC.

## Workspaces billed by a price plan

Some workspaces are billed by a price plan instead of a [plan](/billing/) with a prepaid balance. For them, **Plan & billing** shows “Plans are not available here yet”, and the **Charges** tab prices usage with the price plan:

* **Platform fees**: **Voice minutes**, for connected time on voice calls, and **AI replies**, for each completed agent reply in a text channel. They apply whichever key paid for the models.
* **AI usage**: language models, speech to text and text to speech on providers set to **Caplo Managed**, at list price plus the price plan’s markup, if it has one. Calls on your own keys add no AI usage charge.
* **Monthly allowance**: an amount included each month and credited against all of that month’s charges.
* Live tests, evaluations and agent building are not charged.

Without a price plan for a period, the **Charges** tab shows “No price plan applies to this period yet, so its usage is recorded but not charged.” A new price plan is announced on the **Charges** tab before it takes effect. Charges are estimates until the month closes.

## Related

* [Plans](/billing/)
* [Usage and charges pages](/usage/usage-and-statements/)
* [Cost reports](/usage/cost-reports/)
* [Models and providers](/providers/)
