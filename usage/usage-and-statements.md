# Usage and charges pages

> Read the Usage page's Usage and Charges tabs, filter by source, keys, agent and channel, and export the data as CSV.

The **Usage** page, under **Usage & billing**, shows what your agents used and what it cost, on two tabs:

* **Usage**: raw quantities from the models and speech services your agents call, with no prices.
* **Charges**: what Caplo charges for that usage, by day, with the month’s estimate.

Your plan, balance, payments, receipts and monthly statements are on **Plan & billing**; see [Plans and billing](/billing/). Both pages need a role that can view financial data: Owner, Admin, Billing or Auditor. Days and months are UTC.

## Usage tab

The **Usage** tab answers “how much did our agents use, and where?”.

![The Usage page with totals, filters and usage by channel](/_astro/usage.Bl-AINJj_Z2rd3sm.webp)

**Filters** at the top apply to everything on the tab:

| Filter                    | Options                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Source**                | **Production** (the default), **Live tests**, **Evals**, **Background**, **Authoring** or **All sources**. |
| **Keys**                  | **All keys**, **Caplo-managed** or **Your keys**.                                                          |
| **Agent** and **Channel** | One agent or channel, or all.                                                                              |
| **Usage dates**           | Last 7 or 30 days, or any range within the last 400 days.                                                  |

**Tiles** show the totals for the range: **Language model tokens**, **Speech to text** (audio minutes), **Text to speech** (characters), **Voice minutes** and **Conversations**. Voice minutes and conversations are not paid with a provider key, so they show **Not split by key** when you filter by keys.

**Usage by channel** shows how language model tokens or voice minutes split across your channels.

**Language models** charts tokens over time and lists them by **Model**, **Provider**, **Agent** or **Channel**, with **Input**, **Cached input**, **Output**, **Audio** (realtime models) and **Requests** columns.

**Voice** charts **Speech to text**, **Text to speech** or **Voice minutes**, grouped the same way.

Usage on your own keys is included on this tab. Those providers bill you, not Caplo.

If a provider has not reported full usage for some requests yet, a note under the table says how many; their known quantities are included. Quantities update as providers report them, and each request counts once at its latest report.

## Charges tab

The **Charges** tab answers “what does this usage cost?”. It prices usage for workspaces billed by a [price plan](/usage/#workspaces-billed-by-a-price-plan). On a plan with a prepaid balance, what was charged each day is in **Balance activity** on **Plan & billing**, and each month’s total is in its statement; see [Balance and payments](/billing/balance-and-payments/#balance-activity).

![The Charges tab with the estimated amount due and charges over time](/_astro/billing.DhcCchJc_1yBlf8.webp)

**Filters**: **Charges** (**All charges**, **Voice**, **Text** or **Language models**), **Agent**, **Channel** and **Billing dates** (**This month**, **Last month**, **Last 30 days** or a custom range).

**Tiles**:

| Tile                     | What it shows                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Estimated amount due** | The month that contains the end of your date range: that month’s charges to date, after the included allowance. It always covers the whole workspace, whatever the filters. |
| **Platform**             | Platform fees in the range, with the number of voice minutes and AI replies.                                                                                                |
| **AI usage**             | Caplo-managed models and speech.                                                                                                                                            |
| **Included allowance**   | How much of the month’s allowance is used, and how much is left.                                                                                                            |

**Charges over time** shows daily or weekly charges by type. **Charge split** divides them by channel, agent or charge type. **Charge breakdown** lists every charge in the range grouped by **Charge**, **Model**, **Provider**, **Agent** or **Channel**, with quantity, rate, amount and share.

Notes under the breakdown explain two cases:

* How many requests used your own keys. Only the platform fee for those conversations appears.
* Caplo-managed requests that used a meter without a list price yet. They are charged for their priced part only.

Each charge belongs to the UTC day the usage happened. Only production conversations are charged here; charges are estimates until the month closes. To follow a month as it goes, choose **This month**; to review a finished month, choose **Last month**.

## Export

Both tabs have **Export CSV**:

* **Usage** exports exact quantities per UTC day, service, provider and model, with request counts and any usage Caplo cannot classify yet.
* **Charges** exports every charge per UTC day, with its charge type, provider, model, agent, channel, quantity, unit, amount in USD and whether a price plan rated it.

## Consistent numbers

Each tab reads all its charts and tables from one snapshot, shown at the bottom of the page with its time. Select **Refresh** to load a newer one. Exports use the same snapshot as the page, so a CSV matches what you see.

## Related

* [Usage and charges](/usage/)
* [How your bill works](/billing/how-billing-works/)
* [Spend budgets](/usage/spend-budgets/)
* [Cost reports](/usage/cost-reports/)
