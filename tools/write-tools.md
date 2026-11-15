# Write tools safely

> Mark tools that change data as writes, require customer confirmation, use the idempotency key, report outcomes and answer status checks.

A write tool changes something outside the conversation: it cancels an order, books a slot, sends an email, issues a refund. Caplo treats writes differently from reads, so mark every such tool as one and give Caplo the information it needs to know whether the change happened.

## Choose the effect

Set `effect` in `caplo.yaml` for every tool:

* `read`: only looks things up. Running it twice has no side effects.
* `write`: changes data or triggers an action, including anything that sends a message or costs money.

The effect is yours to set; Caplo does not infer it from the code or from MCP annotations. For writes, Caplo asks the customer to confirm (unless you turn that off), passes an idempotency key, tracks the outcome, and never runs the tool in places where nobody can approve it: fixture runs on Caplo skip write tools, and evaluations do not run writes.

## Customer confirmation

`confirmation: required` is the default for write tools. The agent proposes the call with exact arguments, the customer reviews it, and the tool runs only after the customer confirms, with exactly those arguments.

```yaml
tools:
  - name: cancel_order
    effect: write
    timeoutSeconds: 15
    confirmation: required
```

* In the website widget, the customer sees a review card. Add a [`presentation`](/tools/present-results/#confirmation-and-receipt) to choose which arguments it shows, how they are labelled, and which ones the customer may change before confirming.
* In WhatsApp, Messenger and Instagram, the customer gets a message with **Confirm** and **Cancel** buttons. Fields cannot be edited there.
* On a voice call, in the website widget or by phone, Caplo reads the `presentation`’s title and fields aloud and the caller says yes or no. Without a `presentation`, the caller hears only a request to confirm, so the agent has to say what will change. Fields cannot be edited by voice.
* If the customer declines, or a different customer verifies in the same conversation, the write does not run.
* While an earlier write in the conversation still waits for a decision, or its outcome is unknown, the agent cannot start another write.

`confirmation: none` runs the write as soon as the agent calls it. Use it only for low-risk actions where a confirmation step adds nothing, such as adding a note to a support ticket.

## Use the idempotency key

Every write call carries `idempotencyKey` in its context. The key is the same for every attempt and status check of one confirmed action, and different for every other action. Send it to your API so that a repeated request applies the change only once:

```ts
async handler({ orderId }, { secrets, signal, idempotencyKey }) {
  const response = await fetch(`https://api.shop.example/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secrets.get("SHOP_API_KEY")}`,
      "idempotency-key": idempotencyKey ?? "",
    },
    signal,
  });
  // ...
}
```

If your API has no idempotency support, store the key with the change on your side and check it before applying the change again.

## Report the outcome

When a write ends, Caplo records one of these outcomes and the agent and customer are told accordingly:

| Your handler                              | Outcome     | Meaning                                                                              |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Returns a value                           | Applied     | The change happened. The value is the result.                                        |
| Returns `rejected(message)`               | Not applied | The provider definitely did not make the change, for example it refused the request. |
| Returns `pending(operationRef, message?)` | Pending     | The provider accepted the change but has not finished it.                            |
| Throws                                    | Unknown     | The change may or may not have happened.                                             |

Return `rejected` only when you are certain nothing changed. When in doubt, throw: an unknown outcome is safer than a false “not applied”, which could lead the customer to try again and, for example, pay twice.

```ts
import { defineTool, pending, rejected } from "@caplo/tools";


export default defineTool({
  name: "cancel_order",
  // description, inputSchema, outputSchema...
  async handler({ orderId }, { secrets, signal, idempotencyKey }) {
    const response = await fetch(`https://api.shop.example/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers: { authorization: `Bearer ${secrets.get("SHOP_API_KEY")}`, "idempotency-key": idempotencyKey ?? "" },
      signal,
    });
    const body = await response.json();
    if (response.status === 200) return { orderId, status: body.status };
    if (response.status === 202) return pending(body.operationId, "The cancellation is being processed.");
    if (response.status === 409) return rejected(body.reason ?? "This order can no longer be cancelled.");
    throw new Error(`cancel failed with ${response.status}`);
  },
});
```

`operationRef` is your reference for the pending operation: 1 to 256 printable ASCII characters. Caplo keeps it for status checks and never shows it to the model.

Typed outcomes need `@caplo/tools` 0.1.6 or later, which the templates already use.

### Outcomes in MCP packages

An MCP package reports the same outcomes in the result metadata. Advertise the capability when you create the server, and add `_meta` to each write result:

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { EFFECT_META_KEY, EFFECT_OUTCOME_CAPABILITY } from "@caplo/tools";


const server = new Server(
  { name: "orders", version: "1.0.0" },
  { capabilities: { tools: {}, logging: {}, experimental: { ...EFFECT_OUTCOME_CAPABILITY } } },
);


// Applied:
// { content, structuredContent, _meta: { [EFFECT_META_KEY]: { version: 1, outcome: "applied" } } }
// Not applied:
// { isError: true, content, _meta: { [EFFECT_META_KEY]: { version: 1, outcome: "not_applied" } } }
// Pending:
// { content, _meta: { [EFFECT_META_KEY]: { version: 1, outcome: "pending", operationRef: "op_123" } } }
```

Without the capability or the metadata, an error result from a write counts as unknown.

## Answer status checks

When a write’s outcome is unknown or pending, Caplo can ask your package what happened. Add a `status` handler to the `defineTool`:

```ts
import { applied, defineTool, pending, rejected } from "@caplo/tools";


export default defineTool({
  name: "cancel_order",
  // ...handler as above
  async status({ operationRef }, { secrets, signal, idempotencyKey }) {
    const query = new URLSearchParams({ key: idempotencyKey ?? "", ...(operationRef && { operation: operationRef }) });
    const response = await fetch(`https://api.shop.example/operations?${query}`, {
      headers: { authorization: `Bearer ${secrets.get("SHOP_API_KEY")}` },
      signal,
    });
    if (!response.ok) throw new Error(`status lookup failed with ${response.status}`);
    const body = await response.json();
    if (body.status === "applied") return applied({ orderId: body.orderId, status: "cancelled" });
    if (body.status === "not_applied") return rejected("The order was not cancelled.");
    if (body.status === "pending") return pending(body.operationId);
    throw new Error(`unexpected status ${body.status}`);
  },
});
```

* `ctx.idempotencyKey` is the original write’s key, and `operationRef` is the reference your `pending` returned, if any.
* Return `applied(result)`, `rejected(message)` or `pending(operationRef)`. Throw when the provider cannot tell. Any other return value leaves the write unknown.
* Caplo asks one check at a time per write, up to 8 times with growing gaps between checks.

An MCP package answers the `caplo/status` request (`STATUS_METHOD`) with params `name` and `operationRef`, and advertises `OPERATION_STATUS_CAPABILITY` beside `EFFECT_OUTCOME_CAPABILITY`.

## Ask the customer to verify again

For tools that act for a [verified customer](/tools/customer-aware-tools/), your API may need a stronger or more recent sign-in before it allows an operation. Return `stepUpRequired` instead of a result:

```ts
import { stepUpRequired, stepUpFromChallenge } from "@caplo/tools";


// Explicitly: the customer must have verified at level high within the last 5 minutes.
return stepUpRequired({ level: "high", maxAuthAgeSeconds: 300 });


// Or from your API's RFC 9470 challenge (WWW-Authenticate: Bearer error="insufficient_user_authentication").
const stepUp = stepUpFromChallenge(response.headers.get("www-authenticate"));
if (stepUp) return stepUp;
```

`level` is `low`, `standard` or `high`; `maxAuthAgeSeconds` is 0 to 86400. The call applies nothing. For a write, Caplo asks the customer to verify again and, once they have, runs the write again with the same arguments. For a read, the customer is told they need to verify.

## Before you publish a write tool

* `effect: write` is set, and `confirmation` is `required` unless you have a reason.
* The handler sends `idempotencyKey` to your API.
* Errors you are unsure about are thrown, not returned as `rejected`.
* A `presentation` shows the customer what they are confirming. See [Show results to customers](/tools/present-results/).
* Local fixtures for the tool point at a test environment: `caplo tool test` runs write fixtures for real on your machine. See [Test tools with fixtures](/tools/testing/).
