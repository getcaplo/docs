---
title: "caplo billing"
description: "See and change the workspace's plan, balance, billing details and documents."
editUrl: false
sidebar:
  order: 4
  label: "billing"
---

:::note[Generated reference]
Generated from `caplo` v0.5.0, the latest release. `caplo billing --help` prints the same text.
:::

See and change the workspace's plan, balance, billing details and documents.

```sh
caplo billing
```

Subscription billing: the workspace's plan, its prepaid balance and the credits in it, auto-recharge, the billing details on receipts, and its receipts, statements and invoices. Amounts are USD. Reading needs usage.view and changing needs billing.manage, which Owners and Billing members have. A workspace without subscription billing keeps price-plan billing, and these commands answer that it has no billing account; caplo billing plans works without a login.

**Examples**

```sh
caplo billing status
caplo billing funds add 25 --open
caplo billing plan change --plan pro --interval month
```

**Commands**

- [`caplo billing activity`](#caplo-billing-activity)
- [`caplo billing auto-recharge`](#caplo-billing-auto-recharge)
- [`caplo billing document`](#caplo-billing-document)
- [`caplo billing documents`](#caplo-billing-documents)
- [`caplo billing funds`](#caplo-billing-funds)
- [`caplo billing invoice`](#caplo-billing-invoice)
- [`caplo billing plan`](#caplo-billing-plan)
- [`caplo billing plans`](#caplo-billing-plans)
- [`caplo billing profile`](#caplo-billing-profile)
- [`caplo billing status`](#caplo-billing-status)

## caplo billing activity

List one month of the balance's activity: credits, fees, and usage one line per day.

```sh
caplo billing activity [flags]
```

Lists one UTC month of the balance's activity, newest first: each credit and fee is one line, and usage is one line per UTC day with its conversations and voice minutes. Credits are positive; fees, usage and refunds are negative.

**Examples**

```sh
caplo billing activity
caplo billing activity --month 2026-10 -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--month` | string |  | UTC month as YYYY-MM (default: the current month) |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo billing auto-recharge

Recharge the balance from the saved card when it runs low.

```sh
caplo billing auto-recharge
```

**Commands**

- [`caplo billing auto-recharge off`](#caplo-billing-auto-recharge-off)
- [`caplo billing auto-recharge set`](#caplo-billing-auto-recharge-set)

## caplo billing auto-recharge off

Turn auto-recharge off.

```sh
caplo billing auto-recharge off
```

**Examples**

```sh
caplo billing auto-recharge off
```

## caplo billing auto-recharge set

Turn on auto-recharge from the saved card.

```sh
caplo billing auto-recharge set [flags]
```

Turns auto-recharge on: when the balance falls below --threshold, the saved card is charged --amount, at most --monthly-limit a month (no limit without it). The threshold is at least 5, the amount 10 to 500 and above the threshold, and the limit at least the amount. It needs Standard or Pro and a saved card.

**Examples**

```sh
caplo billing auto-recharge set --threshold 5 --amount 25 --monthly-limit 200
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--amount` | string |  | USD to charge each time |
| `--monthly-limit` | string |  | the most USD to charge in a month (default: no limit) |
| `--threshold` | string |  | recharge when the balance falls below this many USD |

## caplo billing document

Download a receipt, statement or invoice.

```sh
caplo billing document
```

**Commands**

- [`caplo billing document download`](#caplo-billing-document-download)

## caplo billing document download

Save a receipt, statement or invoice as PDF.

```sh
caplo billing document download <id> [flags]
```

Saves a receipt (its ID), a monthly statement (statement-YYYY-MM) or an invoice (INV-YYYY-NNNN) as PDF, under the name Identity gives it in the current directory, or at --out. An existing file is never overwritten.

**Examples**

```sh
caplo billing document download statement-2026-10
caplo billing document download INV-2026-0001 --out invoice.pdf
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--out` | string |  | file to write (default: the document's name in the current directory) |

## caplo billing documents

List the workspace's receipts, monthly statements and invoices, newest first.

```sh
caplo billing documents [flags]
```

Lists a receipt for every plan fee and every payment of added funds, a statement for every past UTC month the balance changed, and every Enterprise invoice, newest first. caplo billing document download &lt;id&gt; saves one as PDF.

**Examples**

```sh
caplo billing documents
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo billing funds

Add funds to the prepaid balance.

```sh
caplo billing funds
```

**Commands**

- [`caplo billing funds add`](#caplo-billing-funds-add)

## caplo billing funds add

Add 10 to 500 USD to the balance on the payment provider's checkout page.

```sh
caplo billing funds add <amount> [flags]
```

Starts a payment of the amount (10 to 500 USD) and prints the provider's checkout page to pay it on; --open opens it in the default browser. The funds are credited once the provider confirms the payment, last 12 months, and are the only credit that pays plan fees. The billing country decides the provider, so set the billing details first with caplo billing profile set.

**Examples**

```sh
caplo billing funds add 25 --open
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--open` |  |  | open the checkout page in the default browser |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo billing invoice

Show an Enterprise invoice with its lines.

```sh
caplo billing invoice <id> [flags]
```

**Examples**

```sh
caplo billing invoice INV-2026-0001
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo billing plan

Change, cancel or keep the workspace's plan.

```sh
caplo billing plan
```

**Commands**

- [`caplo billing plan cancel`](#caplo-billing-plan-cancel)
- [`caplo billing plan change`](#caplo-billing-plan-change)
- [`caplo billing plan keep`](#caplo-billing-plan-keep)

## caplo billing plan cancel

Cancel the plan at the end of the period.

```sh
caplo billing plan cancel [flags]
```

Cancels the plan at the end of the period, replacing any pending downgrade. Production conversations then pause until a plan is chosen, and a paused workspace is erased 60 days later. caplo billing plan keep undoes the cancellation before the period ends. It asks first; --yes skips the question.

**Examples**

```sh
caplo billing plan cancel
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo billing plan change

Choose Standard or Pro, or confirm the trial.

```sh
caplo billing plan change [flags]
```

Starts or changes the plan. --plan standard or pro needs --interval month or year; --extra-phone-calls buys phone calls at once beyond Pro's limit. --plan trial confirms the trial a new workspace starts on, and takes neither.

From a trial or a pause the plan starts now at full price. An upgrade (a higher plan, monthly to yearly, or more extra phone calls) starts a new period now: its fee, less the unused part of the current one, is paid from added funds, and the new plan's credit replaces the current one. A downgrade waits for the period end; caplo billing plan keep undoes it. When added funds do not cover the fee, add them with caplo billing funds add first. Choosing Standard or Pro asks first; --yes skips the question.

**Examples**

```sh
caplo billing plan change --plan pro --interval year
caplo billing plan change --plan pro --interval month --extra-phone-calls 2 --yes
caplo billing plan change --plan trial
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--extra-phone-calls` | int | `0` | phone calls at once beyond Pro's limit, 0 to 100 |
| `--interval` | string |  | month or year |
| `--plan` | string |  | standard, pro, or trial to confirm the trial |
| `--yes`, `-y` |  |  | do not ask for confirmation |

## caplo billing plan keep

Keep the current plan: undo a pending downgrade or cancellation.

```sh
caplo billing plan keep
```

**Examples**

```sh
caplo billing plan keep
```

## caplo billing plans

List the plans Caplo offers, with their prices, limits and features.

```sh
caplo billing plans [flags]
```

Lists the current version of every plan Caplo offers. AI and speech are charged at provider list price on every plan; the platform fees per conversation and per voice minute come on top. Needs no login.

**Examples**

```sh
caplo billing plans
caplo billing plans -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |

## caplo billing profile

Set the business named on receipts.

```sh
caplo billing profile
```

**Commands**

- [`caplo billing profile set`](#caplo-billing-profile-set)

## caplo billing profile set

Set the business named on receipts, statements and invoices.

```sh
caplo billing profile set [flags]
```

Replaces the billing details: --legal-name, --email (where receipts go) and --country (ISO 3166-1 alpha-2, or OTHER) are required. --ntn, --strn and --province apply only to Pakistan (PK), where --province is required. The billing country decides the payment provider.

**Examples**

```sh
caplo billing profile set --legal-name "Acme Traders" --email finance@acme.example --country PK --province Sindh
caplo billing profile set --legal-name "Acme LLC" --email ap@acme.example --country AE --address "Dubai"
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--address` | string |  | the postal address |
| `--country` | string |  | ISO 3166-1 alpha-2 country code, or OTHER |
| `--email` | string |  | the email address receipts go to |
| `--legal-name` | string |  | the business's legal name |
| `--ntn` | string |  | Pakistani National Tax Number |
| `--province` | string |  | Pakistani province: Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, Azad Jammu and Kashmir |
| `--strn` | string |  | Pakistani Sales Tax Registration Number |

## caplo billing status

Show the plan, its status, the balance, credits and limits.

```sh
caplo billing status [flags]
```

**Examples**

```sh
caplo billing status
caplo billing status -o json
```

**Flags**

| Flag | Value | Default | Description |
| --- | --- | --- | --- |
| `--output`, `-o` | string | `table` | output format: table, json, or yaml |
