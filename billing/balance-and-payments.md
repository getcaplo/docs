# Balance and payments

> How the prepaid balance works, which credit is spent first, what happens at zero, and how to add funds, save a card and turn on auto-recharge.

On the Free trial, Standard and Pro, usage is charged to one prepaid balance as it is recorded. The **Usage balance** card on **Plan & billing** shows what is left, about how many conversations or voice minutes that buys at your recent average, and each credit in the order it will be spent. The top bar shows the balance too.

## Kinds of credit

| Credit                 | Comes from                                                                                | Lasts                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Trial credit**       | $5 when the Free trial starts.                                                            | Until the trial ends, 30 days.                        |
| **Plan credit**        | Standard and Pro, each month of the plan, including on yearly plans.                      | Until the next month’s credit. It does not roll over. |
| **Added funds**        | Payments you make with **Add funds**.                                                     | 12 months.                                            |
| **Auto-recharge**      | Automatic payments from your saved card.                                                  | 12 months.                                            |
| **Promotional credit** | Granted by Caplo.                                                                         | The expiry shown with it.                             |
| **Adjustment**         | Unused plan fee returned when an upgrade costs less than what is left of the current fee. | Does not expire.                                      |

Plan fees are charged to your saved card. Without one, or when it is declined, only added funds and auto-recharge pay them. Trial and plan credit pay usage only.

## Spending order

Usage spends the credit that expires soonest first. Credits that expire together are spent free credit first, then added funds. The **Spent in this order** list on the **Usage balance** card shows the order for your balance.

## When the balance reaches zero

Caution

At a balance of $0.00, new production conversations stop on every channel.

* Conversations already running get 15 more minutes. Their usage can take the balance below zero, down to −$1 on the Free trial, −$2 on Standard or −$5 on Pro. Your next payment covers it first.
* After the 15 minutes, the agent stops replying in those conversations, and a call in progress ends with the agent’s time-limit warning and goodbye.
* Website visitors see “This assistant isn’t available right now. Please try again later.” Messages on WhatsApp, Messenger and Instagram still reach your inbox, but the agent doesn’t reply.
* Building agents keeps working. Live tests and evaluations stop too, since they spend the balance on Caplo-managed models and speech; the live test says “Live tests are paused because the workspace’s balance is used up”, and evaluation cases are marked as not run. Publishing needs its evaluations, so it waits for funds as well.
* Adding funds resumes new conversations within about a minute.

On the Free trial, an empty balance means choosing a plan. Owners and Billing members are told when the balance falls below $2, or below the auto-recharge threshold, and again when it runs out.

## Add funds

You need billing details first: open **Billing details** and add the business or person billed and the billing country. See [Billing details](/billing/receipts-and-invoices/#billing-details).

1. On **Plan & billing**, select **Add funds**. It is available once you are on Standard or Pro.
2. Choose an amount or enter another, from $10 to $500.
3. Select **Add** with the amount. You go to Safepay’s secure page and pay by card, JazzCash or Easypaisa, in US dollars.
4. Back on **Plan & billing**, the console confirms the payment. Funds reach your balance as soon as Safepay confirms it, usually at once.

Added funds can be used for 12 months. Unused funds can be refunded within 14 days of adding them; contact [support](/resources/support/) with the receipt number.

Caplo takes payments through Safepay for billing accounts in Pakistan. For other billing countries, **Payment method** shows that payments are not available yet; contact [support](/resources/support/).

## Save a card

A saved Visa or Mastercard pays plan fees, at renewal and when you start or upgrade a plan, and is needed for auto-recharge.

1. On the **Payment method** card, select **Save a card**.
2. Enter the cardholder’s first and last name and phone number with its country code, such as `+923001234567`. Safepay needs the phone number to save a card.
3. Select **Continue to Safepay** and enter the card on Safepay’s page. Saving a card charges nothing.

**Replace card** saves a different one. The billing country can’t change once a card is saved.

## Auto-recharge

Auto-recharge adds funds from your saved card when the balance falls below a threshold, so agents keep answering. It is available on Standard and Pro with a saved card.

1. On the **Auto-recharge** card, select **Set up**.
2. Turn on **Recharge automatically**.
3. Set **When balance falls below (USD)**, at least $5, and **Add (USD)**, from $10 to $500 and more than the threshold.
4. Optionally set a **Monthly recharge limit (USD)**. Recharging stops for the rest of the calendar month once it is reached. Leave it empty for no limit.
5. Save.

The balance is checked about once a minute, after charges are recorded. Each fall below the threshold is recharged once; if the charge fails, Owners and Billing members are told and it is not retried until the balance falls below the threshold again. Each recharge gets a receipt.

## After a payment

Safepay returns you to **Plan & billing**, which shows the outcome:

| Message                                            | Meaning                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Confirming your payment…**                       | Caplo is waiting for Safepay’s confirmation.                                            |
| **Payment received. … is in your balance.**        | The funds are added.                                                                    |
| **Payment received. Your plan has changed.**       | A plan fee was paid and the plan changed.                                               |
| **Payment received, but the plan did not change**  | The plan change was no longer allowed. The amount stays in your balance as added funds. |
| **Your payment is still being confirmed.**         | Safepay hasn’t confirmed yet. The balance updates as soon as it does.                   |
| **The payment did not go through.**                | Try again, or pay another way.                                                          |
| **The payment was cancelled, so nothing changed.** | You left Safepay’s page without paying.                                                 |

## Balance activity

**Balance activity** on **Plan & billing** lists credits added and usage charged, with one line per UTC day of usage. **See charge details** opens the **Charges** tab of [Usage](/usage/usage-and-statements/).

## Related

* [How your bill works](/billing/how-billing-works/)
* [Change or cancel your plan](/billing/change-or-cancel/)
* [Receipts, statements and invoices](/billing/receipts-and-invoices/)
