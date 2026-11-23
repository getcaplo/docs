---
title: Receipts, statements and invoices
description: Find receipts for payments, monthly statements and Enterprise invoices, set the billing details they show, and pay an Enterprise invoice.
sidebar:
  order: 5
---

Billing documents are on **Plan & billing**, under **Invoices & receipts**, newest first. Open one with **View** to see it and download it as a PDF.

| Document | Issued for | Shows |
| --- | --- | --- |
| **Receipt** | Every payment: funds you added, an auto-recharge, or a card or Safepay payment for a plan fee, which is added to your balance and pays the fee from there. A fee paid from funds you had already added has no receipt of its own; its statement lists it. | What was paid, sales tax and how it was paid. |
| **Statement** | Every UTC month with balance activity. | Plan fees paid, funds added, trial and plan credit, and usage charged in the month. |
| **Invoice** | Every month of an Enterprise contract. | The contract's charges, tax, the total and how to pay. |

Amounts are in US dollars, with any sales tax shown separately at the rate in effect when the document was issued.

## Billing details

Receipts, statements and invoices show the billing details saved when they were issued. Owners and Billing members set them under **Billing details**, with **Add** or **Edit**:

| Field | Notes |
| --- | --- |
| **Business or person billed** | Required. |
| **Receipts email** | Required. |
| **Address** | Optional. |
| **Billing country** | Required. It decides how you pay and can't change once a card is saved. |
| **NTN**, **Sales tax number** and **Province** | Pakistan only. The NTN has 8 digits, such as `1234567-8`; the sales tax registration number has 13. Both are optional. |

Payments need billing details first. Without them, a payment shows **Add billing details**.

## Enterprise invoices

An Enterprise workspace has no prepaid balance. Caplo invoices each month on the 1st, for the month before:

- the monthly commitment, invoiced even when usage is lower;
- platform fees above the commitment, at your contract rates;
- AI and speech at list price;
- Caplo phone numbers at the contract's monthly fee, for the days you held each;
- sales tax.

Invoice numbers look like `INV-2026-0001`. Usage recorded after an invoice was prepared falls into the next one.

### Pay an invoice

Pay by bank transfer to the account printed on the PDF invoice, quoting the invoice number. Caplo marks the invoice paid when the transfer arrives, usually within two working days.

An invoice is due the number of days after issue that your contract sets. Owners and Billing members are told when an invoice is issued and when it becomes overdue. If an invoice is still unpaid 15 days after its due date, production conversations pause until Caplo records the payment; see [Paused workspaces](/billing/change-or-cancel/#paused-workspaces).

## Related

- [Balance and payments](/billing/balance-and-payments/)
- [How your bill works](/billing/how-billing-works/)
