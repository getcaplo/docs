---
title: "@caplo/tools"
description: "API reference for @caplo/tools, generated from the published package."
editUrl: false
sidebar:
  order: 0
  label: "Overview"
---

:::note[Generated reference]
Generated from `@caplo/tools` 0.1.8 on npm. Install with `npm install @caplo/tools`; import from `@caplo/tools`. Guides: [Tools](/tools/).
:::

## Functions

### applied()

```ts
function applied(result): Applied;
```

Reports that the provider applied the change, with its result. A status handler must return it to confirm a change;
a tool handler may return the result directly.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `result` | `unknown` |

#### Returns

[`Applied`](#applied)

***

### context()

```ts
function context(extra): ToolContext;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `extra` | [`HandlerExtra`](#handlerextra) |

#### Returns

[`ToolContext`](#toolcontext)

***

### defineTool()

```ts
function defineTool<Args, Result>(definition): FunctionTool<Args, Result>;
```

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| <a id="type-parameter-args-2"></a> `Args` | `any` |
| <a id="type-parameter-result-2"></a> `Result` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `definition` | [`FunctionToolDefinition`](#functiontooldefinition)\<`Args`, `Result`\> |

#### Returns

[`FunctionTool`](#functiontool)\<`Args`, `Result`\>

***

### pending()

```ts
function pending(operationRef, message?): Pending;
```

Reports that the provider accepted the change but has not finished it. The runner later asks `status` about it with
this `operationRef`; it is never shown to the model.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operationRef` | `string` |
| `message?` | `string` |

#### Returns

[`Pending`](#pending)

***

### rejected()

```ts
function rejected(message): Rejected;
```

Reports that the provider definitively did not apply the change, for example because it refused the request. Return
it only when that is certain; throw when unsure, and the runner treats the change as unknown.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

[`Rejected`](#rejected)

***

### serveStdio()

```ts
function serveStdio(createServer, options?): Promise<void>;
```

Runs a package over stdio so local MCP clients and MCP Inspector can use it.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `createServer` | () => [`McpServerLike`](#mcpserverlike) |
| `options?` | [`StdioOptions`](#stdiooptions) |

#### Returns

`Promise`\<`void`\>

***

### stepUpFromChallenge()

```ts
function stepUpFromChallenge(header): StepUpRequired | undefined;
```

Maps a client API's RFC 9470 step-up challenge (`WWW-Authenticate: Bearer error="insufficient_user_authentication"`)
to the result a tool returns; undefined for any other header. `acr_values` lists acceptable Caplo levels and the
weakest one listed is required; `max_age` is the freshness in seconds.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `header` | `string` \| `null` \| `undefined` |

#### Returns

[`StepUpRequired`](#stepuprequired) \| `undefined`

***

### stepUpRequired()

```ts
function stepUpRequired(requirement?): StepUpRequired;
```

Reports that the provider refused the call until the customer authenticates again, at `level` or within
`maxAuthAgeSeconds`, and applied nothing. A write waits for the customer to confirm on screen and then runs again.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `requirement?` | [`AuthenticationRequirement`](#authenticationrequirement) |

#### Returns

[`StepUpRequired`](#stepuprequired)

## Interfaces

### Applied

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-outcome"></a> `[OUTCOME]` | `readonly` | `"applied"` |
| <a id="property-result"></a> `result` | `readonly` | `unknown` |

***

### AuthenticationRequirement

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-level"></a> `level?` | `"low"` \| `"standard"` \| `"high"` | - |
| <a id="property-maxauthageseconds"></a> `maxAuthAgeSeconds?` | `number` | How recently the customer must have authenticated, in seconds. |

***

### CallContext

Per-call context the runner places in the `tools/call` request `_meta`.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-conversationid"></a> `conversationId?` | `string` | - |
| <a id="property-deadline"></a> `deadline?` | `number` | Epoch milliseconds. |
| <a id="property-idempotencykey"></a> `idempotencyKey?` | `string` | - |
| <a id="property-invocationid"></a> `invocationId?` | `string` | - |
| <a id="property-packageversionid"></a> `packageVersionId?` | `string` | - |
| <a id="property-secrets"></a> `secrets?` | `Record`\<`string`, `string`\> | - |
| <a id="property-subject"></a> `subject?` | [`Subject`](#subject) | The owner-verified customer; only the runner sets it, from Conversation's authority, never from arguments. |
| <a id="property-turnid"></a> `turnId?` | `string` | - |
| <a id="property-workspaceid"></a> `workspaceId?` | `string` | - |

***

### ElicitParams

MCP `elicitation/create` params in form mode.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-message"></a> `message` | `string` |
| <a id="property-mode"></a> `mode?` | `"form"` |
| <a id="property-requestedschema"></a> `requestedSchema` | `object` |
| `requestedSchema.properties` | `Record`\<`string`, [`ElicitProperty`](#elicitproperty)\> |
| `requestedSchema.required?` | `string`[] |
| `requestedSchema.type` | `"object"` |

***

### ElicitResult

The visitor's answer: accept with content, decline, or cancel (dismissed without a choice).

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-action"></a> `action` | `"accept"` \| `"decline"` \| `"cancel"` |
| <a id="property-content"></a> `content?` | `Record`\<`string`, `string` \| `number` \| `boolean` \| `string`[]\> |

***

### FunctionTool

#### Extends

- [`FunctionToolDefinition`](#functiontooldefinition)\<`Args`, `Result`\>

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| <a id="type-parameter-args"></a> `Args` | `any` |
| <a id="type-parameter-result"></a> `Result` | `unknown` |

#### Methods

##### createServer()

```ts
createServer(): McpServerLike;
```

###### Returns

[`McpServerLike`](#mcpserverlike)

***

### FunctionToolDefinition

#### Extended by

- [`FunctionTool`](#functiontool)

#### Type Parameters

| Type Parameter |
| ------ |
| <a id="type-parameter-args-1"></a> `Args` |
| <a id="type-parameter-result-1"></a> `Result` |

#### Methods

##### handler()

```ts
handler(args, ctx): Result | Promise<Result>;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Args` |
| `ctx` | [`ToolContext`](#toolcontext) |

###### Returns

`Result` \| `Promise`\<`Result`\>

##### status()?

```ts
status?(input, ctx): 
  | StatusAnswer
| Promise<StatusAnswer>;
```

Answers whether an earlier write was applied, for a write whose outcome is unknown or that returned `pending`.
`ctx.idempotencyKey` is that write's key and `operationRef` the reference its `pending` named. Return
`applied(result)` when it was applied, `rejected` when it definitively was not, and `pending` while it is still in
progress; throw when the provider cannot tell. Any other return leaves the write unknown.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | \{ `operationRef?`: `string`; \} |
| `input.operationRef?` | `string` |
| `ctx` | [`ToolContext`](#toolcontext) |

###### Returns

  \| [`StatusAnswer`](#statusanswer)
  \| `Promise`\<[`StatusAnswer`](#statusanswer)\>

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-annotations"></a> `annotations?` | [`ToolAnnotations`](#toolannotations) |
| <a id="property-description"></a> `description` | `string` |
| <a id="property-inputschema"></a> `inputSchema` | [`JsonSchema`](#jsonschema) |
| <a id="property-name"></a> `name` | `string` |
| <a id="property-outputschema"></a> `outputSchema?` | [`JsonSchema`](#jsonschema) |

***

### HandlerExtra

The parts of an MCP request handler's `extra` argument that `context` reads.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-_meta"></a> `_meta?` | `Record`\<`string`, `unknown`\> | - |
| <a id="property-elicit"></a> `elicit?` | (`params`) => `Promise`\<[`ElicitResult`](#elicitresult)\> | Set by a function package's server when the client declared form elicitation. |
| <a id="property-sendnotification"></a> `sendNotification?` | (`notification`) => `Promise`\<`void`\> | - |
| <a id="property-signal"></a> `signal` | `AbortSignal` | - |

***

### JsonRpcMessage

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-error"></a> `error?` | `object` |
| `error.code` | `number` |
| `error.data?` | `unknown` |
| `error.message` | `string` |
| <a id="property-id"></a> `id?` | `JsonRpcId` |
| <a id="property-jsonrpc"></a> `jsonrpc` | `"2.0"` |
| <a id="property-method"></a> `method?` | `string` |
| <a id="property-params"></a> `params?` | `Record`\<`string`, `any`\> |
| <a id="property-result-1"></a> `result?` | `unknown` |

***

### Logger

#### Methods

##### debug()

```ts
debug(message, data?): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### error()

```ts
error(message, data?): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### info()

```ts
info(message, data?): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

##### warn()

```ts
warn(message, data?): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `data?` | `Record`\<`string`, `unknown`\> |

###### Returns

`void`

***

### McpServerLike

#### Methods

##### connect()

```ts
connect(transport): Promise<void>;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `transport` | [`Transport`](#transport) |

###### Returns

`Promise`\<`void`\>

***

### Pending

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-outcome-1"></a> `[OUTCOME]` | `readonly` | `"pending"` |
| <a id="property-message-1"></a> `message?` | `readonly` | `string` |
| <a id="property-operationref"></a> `operationRef` | `readonly` | `string` |

***

### Rejected

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-outcome-2"></a> `[OUTCOME]` | `readonly` | `"not_applied"` |
| <a id="property-message-2"></a> `message` | `readonly` | `string` |

***

### Secrets

#### Methods

##### get()

```ts
get(name): string;
```

Returns a declared secret; throws when the runner did not supply it.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`string`

##### has()

```ts
has(name): boolean;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

`boolean`

***

### StatusParams

`caplo/status` params: the tool and, when the write returned `pending`, the operation it named.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-_meta-1"></a> `_meta?` | `Record`\<`string`, `unknown`\> |
| <a id="property-name-1"></a> `name` | `string` |
| <a id="property-operationref-1"></a> `operationRef?` | `string` |

***

### StdioOptions

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-secrets-1"></a> `secrets?` | `string`[] | Secret names to read from the environment. Local development only; the Caplo runtime never uses environment secrets. |

***

### StepUpRequired

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-outcome-3"></a> `[OUTCOME]` | `readonly` | `"step_up"` |
| <a id="property-requirement"></a> `requirement` | `readonly` | [`AuthenticationRequirement`](#authenticationrequirement) |

***

### Subject

A verified customer: the Caplo subject and binding, and the namespace-scoped identity a backend maps to its account.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-bindingid"></a> `bindingId` | `string` | - |
| <a id="property-customertoken"></a> `customerToken?` | `string` | The customer context token for this call, present when the deployment pins a customer token audience for the tool. Send it as `Authorization: Bearer` to that API; it is not enumerable, so it never reaches logs by spreading. |
| <a id="property-externalsubject"></a> `externalSubject` | `string` | - |
| <a id="property-level-1"></a> `level?` | `"low"` \| `"standard"` \| `"high"` | - |
| <a id="property-resourceref"></a> `resourceRef` | `string` | subjectNamespaceRef and externalSubject joined; the key a backend maps to its customer account. |
| <a id="property-subjectid"></a> `subjectId` | `string` | - |
| <a id="property-subjectnamespace"></a> `subjectNamespace` | `string` | - |
| <a id="property-subjectnamespaceref"></a> `subjectNamespaceRef` | `string` | - |

***

### ToolAnnotations

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-destructivehint"></a> `destructiveHint?` | `boolean` |
| <a id="property-idempotenthint"></a> `idempotentHint?` | `boolean` |
| <a id="property-openworldhint"></a> `openWorldHint?` | `boolean` |
| <a id="property-readonlyhint"></a> `readOnlyHint?` | `boolean` |
| <a id="property-title"></a> `title?` | `string` |

***

### ToolContext

#### Methods

##### elicit()

```ts
elicit(params): Promise<ElicitResult>;
```

Asks the visitor for missing details with an MCP form-mode elicitation (function packages; an `McpServer` uses
`server.server.elicitInput`). Declare every field under `elicitation` in caplo.yaml; never ask for a credential.
Throws `ElicitationUnavailableError` when `canElicit` is false.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`ElicitParams`](#elicitparams) |

###### Returns

`Promise`\<[`ElicitResult`](#elicitresult)\>

##### requireSubject()

```ts
requireSubject(): Readonly<Subject>;
```

Returns the verified customer; throws when the call carries none, so a tool can never act unscoped.

###### Returns

`Readonly`\<[`Subject`](#subject)\>

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-canelicit"></a> `canElicit` | `boolean` | Whether `elicit` can ask the visitor now. False where no form can be shown, such as a phone call. |
| <a id="property-conversationid-1"></a> `conversationId?` | `string` | - |
| <a id="property-deadline-1"></a> `deadline?` | `Date` | - |
| <a id="property-idempotencykey-1"></a> `idempotencyKey?` | `string` | - |
| <a id="property-invocationid-1"></a> `invocationId?` | `string` | - |
| <a id="property-log"></a> `log` | [`Logger`](#logger) | - |
| <a id="property-packageversionid-1"></a> `packageVersionId?` | `string` | - |
| <a id="property-secrets-2"></a> `secrets` | [`Secrets`](#secrets) | - |
| <a id="property-signal-1"></a> `signal` | `AbortSignal` | - |
| <a id="property-subject-1"></a> `subject?` | `Readonly`\<[`Subject`](#subject)\> | Present only for a tool that declares `subject` in caplo.yaml and runs for a verified customer. |
| <a id="property-turnid-1"></a> `turnId?` | `string` | - |
| <a id="property-workspaceid-1"></a> `workspaceId?` | `string` | - |

***

### Transport

The subset of the MCP SDK `Transport` interface the Caplo runtime and `serveStdio` use.

#### Methods

##### close()

```ts
close(): Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### onclose()?

```ts
onclose?(): void;
```

###### Returns

`void`

##### onerror()?

```ts
onerror?(error): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `Error` |

###### Returns

`void`

##### onmessage()?

```ts
onmessage?(message): void;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`JsonRpcMessage`](#jsonrpcmessage) |

###### Returns

`void`

##### send()

```ts
send(message): Promise<void>;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`JsonRpcMessage`](#jsonrpcmessage) |

###### Returns

`Promise`\<`void`\>

##### start()

```ts
start(): Promise<void>;
```

###### Returns

`Promise`\<`void`\>

## Type Aliases

### EffectOutcome

```ts
type EffectOutcome = 
  | {
  outcome: "applied";
  version: 1;
}
  | {
  outcome: "not_applied";
  version: 1;
}
  | {
  operationRef: string;
  outcome: "pending";
  version: 1;
};
```

***

### ElicitProperty

```ts
type ElicitProperty = 
  | {
  default?: string;
  description?: string;
  format?: "email" | "uri" | "date" | "date-time";
  maxLength?: number;
  minLength?: number;
  title?: string;
  type: "string";
}
  | {
  default?: string;
  description?: string;
  enum: string[];
  title?: string;
  type: "string";
}
  | {
  default?: string;
  description?: string;
  oneOf: object[];
  title?: string;
  type: "string";
}
  | {
  default?: number;
  description?: string;
  maximum?: number;
  minimum?: number;
  title?: string;
  type: "number" | "integer";
}
  | {
  default?: boolean;
  description?: string;
  title?: string;
  type: "boolean";
}
  | {
  default?: string[];
  description?: string;
  items:   | {
     enum: string[];
     type: "string";
   }
     | {
     anyOf: object[];
   };
  maxItems?: number;
  minItems?: number;
  title?: string;
  type: "array";
};
```

A primitive property of a form-mode elicitation schema (MCP `PrimitiveSchemaDefinition`).

***

### JsonSchema

```ts
type JsonSchema = object;
```

#### Indexable

```ts
[key: string]: unknown
```

#### Properties

##### type

```ts
type: "object";
```

***

### Level

```ts
type Level = typeof LEVELS[number];
```

***

### LogLevel

```ts
type LogLevel = "debug" | "info" | "warning" | "error";
```

***

### StatusAnswer

```ts
type StatusAnswer = Applied | Rejected | Pending;
```

## Variables

### AUTHENTICATION\_META\_KEY

```ts
const AUTHENTICATION_META_KEY: "caplo/authentication" = "caplo/authentication";
```

Result `_meta` key with which a tool asks for the customer to authenticate again (step-up).

***

### CONTEXT\_META\_KEY

```ts
const CONTEXT_META_KEY: "caplo/context" = "caplo/context";
```

***

### EFFECT\_META\_KEY

```ts
const EFFECT_META_KEY: "caplo/effect" = "caplo/effect";
```

Result `_meta` key carrying a write's typed outcome.

***

### EFFECT\_OUTCOME\_CAPABILITY

```ts
const EFFECT_OUTCOME_CAPABILITY: object;
```

MCP server capability a bundle advertises when its write results carry a typed outcome under `_meta["caplo/effect"]`.
Without it, or without the typed outcome, the runner reports an `isError` write as unknown: the change may have
happened before the error.

#### Type Declaration

| Name | Type |
| ------ | ------ |
| <a id="property-caploeffect-outcome"></a> `caplo/effect-outcome` | `object` |
| `caplo/effect-outcome.version` | `1` |

***

### LEVELS

```ts
const LEVELS: readonly ["low", "standard", "high"];
```

Caplo assurance levels, weakest first.

***

### MAX\_AUTH\_AGE\_SECONDS

```ts
const MAX_AUTH_AGE_SECONDS: 86400 = 86400;
```

The longest freshness a step-up may ask for, in seconds.

***

### OPERATION\_STATUS\_CAPABILITY

```ts
const OPERATION_STATUS_CAPABILITY: object;
```

MCP server capability a bundle advertises when it answers `caplo/status`: the runner may ask it whether an earlier
write whose outcome is unknown or pending was applied.

#### Type Declaration

| Name | Type |
| ------ | ------ |
| <a id="property-caplooperation-status"></a> `caplo/operation-status` | `object` |
| `caplo/operation-status.version` | `1` |

***

### STATUS\_METHOD

```ts
const STATUS_METHOD: "caplo/status" = "caplo/status";
```

JSON-RPC method the runner sends to ask for the status of an earlier write.

***

### SUBJECT\_CONTEXT\_CAPABILITY

```ts
const SUBJECT_CONTEXT_CAPABILITY: object;
```

MCP server capability a bundle advertises when its tools read the verified subject through `context()`. Function
tools advertise it automatically; MCP servers add it to `capabilities.experimental`. The host refuses subject calls
to a bundle that does not advertise it.

#### Type Declaration

| Name | Type |
| ------ | ------ |
| <a id="property-caplosubject-context"></a> `caplo/subject-context` | `object` |
| `caplo/subject-context.version` | `1` |

## Classes

### ElicitationUnavailableError

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new ElicitationUnavailableError(): ElicitationUnavailableError;
```

###### Returns

[`ElicitationUnavailableError`](#elicitationunavailableerror)

###### Overrides

`Error.constructor`

***

### MissingSecretError

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new MissingSecretError(name): MissingSecretError;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

###### Returns

[`MissingSecretError`](#missingsecreterror)

###### Overrides

`Error.constructor`

***

### MissingSubjectError

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new MissingSubjectError(): MissingSubjectError;
```

###### Returns

[`MissingSubjectError`](#missingsubjecterror)

###### Overrides

`Error.constructor`
