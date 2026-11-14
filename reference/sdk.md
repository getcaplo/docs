# @caplo/tools

> API reference for @caplo/tools, generated from the published package.

Generated reference

Generated from `@caplo/tools` 0.1.8 on npm. Install with `npm install @caplo/tools`; import from `@caplo/tools`. Guides: [Tools](/tools/).

## Functions

### applied()

```ts
function applied(result): Applied;
```

Reports that the provider applied the change, with its result. A status handler must return it to confirm a change; a tool handler may return the result directly.

#### Parameters

| Parameter | Type      |
| --------- | --------- |
| `result`  | `unknown` |

#### Returns

[`Applied`](#applied)

***

### context()

```ts
function context(extra): ToolContext;
```

#### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `extra`   | [`HandlerExtra`](#handlerextra) |

#### Returns

[`ToolContext`](#toolcontext)

***

### defineTool()

```ts
function defineTool<Args, Result>(definition): FunctionTool<Args, Result>;
```

#### Type Parameters

| Type Parameter | Default type |
| -------------- | ------------ |
| []()`Args`     | `any`        |
| []()`Result`   | `unknown`    |

#### Parameters

| Parameter    | Type                                                                  |
| ------------ | --------------------------------------------------------------------- |
| `definition` | [`FunctionToolDefinition`](#functiontooldefinition)<`Args`, `Result`> |

#### Returns

[`FunctionTool`](#functiontool)<`Args`, `Result`>

***

### pending()

```ts
function pending(operationRef, message?): Pending;
```

Reports that the provider accepted the change but has not finished it. The runner later asks `status` about it with this `operationRef`; it is never shown to the model.

#### Parameters

| Parameter      | Type     |
| -------------- | -------- |
| `operationRef` | `string` |
| `message?`     | `string` |

#### Returns

[`Pending`](#pending)

***

### rejected()

```ts
function rejected(message): Rejected;
```

Reports that the provider definitively did not apply the change, for example because it refused the request. Return it only when that is certain; throw when unsure, and the runner treats the change as unknown.

#### Parameters

| Parameter | Type     |
| --------- | -------- |
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

| Parameter      | Type                                    |
| -------------- | --------------------------------------- |
| `createServer` | () => [`McpServerLike`](#mcpserverlike) |
| `options?`     | [`StdioOptions`](#stdiooptions)         |

#### Returns

`Promise`<`void`>

***

### stepUpFromChallenge()

```ts
function stepUpFromChallenge(header): StepUpRequired | undefined;
```

Maps a client API’s RFC 9470 step-up challenge (`WWW-Authenticate: Bearer error="insufficient_user_authentication"`) to the result a tool returns; undefined for any other header. `acr_values` lists acceptable Caplo levels and the weakest one listed is required; `max_age` is the freshness in seconds.

#### Parameters

| Parameter | Type                              |
| --------- | --------------------------------- |
| `header`  | `string` \| `null` \| `undefined` |

#### Returns

[`StepUpRequired`](#stepuprequired) | `undefined`

***

### stepUpRequired()

```ts
function stepUpRequired(requirement?): StepUpRequired;
```

Reports that the provider refused the call until the customer authenticates again, at `level` or within `maxAuthAgeSeconds`, and applied nothing. A write waits for the customer to confirm on screen and then runs again.

#### Parameters

| Parameter      | Type                                                      |
| -------------- | --------------------------------------------------------- |
| `requirement?` | [`AuthenticationRequirement`](#authenticationrequirement) |

#### Returns

[`StepUpRequired`](#stepuprequired)

## Interfaces

### Applied

#### Properties

| Property        | Modifier   | Type        |
| --------------- | ---------- | ----------- |
| []()`[OUTCOME]` | `readonly` | `"applied"` |
| []()`result`    | `readonly` | `unknown`   |

***

### AuthenticationRequirement

#### Properties

| Property                 | Type                                | Description                                                    |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------- |
| []()`level?`             | `"low"` \| `"standard"` \| `"high"` | -                                                              |
| []()`maxAuthAgeSeconds?` | `number`                            | How recently the customer must have authenticated, in seconds. |

***

### CallContext

Per-call context the runner places in the `tools/call` request `_meta`.

#### Properties

| Property                | Type                         | Description                                                                                                |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| []()`conversationId?`   | `string`                     | -                                                                                                          |
| []()`deadline?`         | `number`                     | Epoch milliseconds.                                                                                        |
| []()`idempotencyKey?`   | `string`                     | -                                                                                                          |
| []()`invocationId?`     | `string`                     | -                                                                                                          |
| []()`packageVersionId?` | `string`                     | -                                                                                                          |
| []()`secrets?`          | `Record`<`string`, `string`> | -                                                                                                          |
| []()`subject?`          | [`Subject`](#subject)        | The owner-verified customer; only the runner sets it, from Conversation’s authority, never from arguments. |
| []()`turnId?`           | `string`                     | -                                                                                                          |
| []()`workspaceId?`      | `string`                     | -                                                                                                          |

***

### ElicitParams

MCP `elicitation/create` params in form mode.

#### Properties

| Property                     | Type                                                    |
| ---------------------------- | ------------------------------------------------------- |
| []()`message`                | `string`                                                |
| []()`mode?`                  | `"form"`                                                |
| []()`requestedSchema`        | `object`                                                |
| `requestedSchema.properties` | `Record`<`string`, [`ElicitProperty`](#elicitproperty)> |
| `requestedSchema.required?`  | `string`\[]                                             |
| `requestedSchema.type`       | `"object"`                                              |

***

### ElicitResult

The visitor’s answer: accept with content, decline, or cancel (dismissed without a choice).

#### Properties

| Property       | Type                                                                 |
| -------------- | -------------------------------------------------------------------- |
| []()`action`   | `"accept"` \| `"decline"` \| `"cancel"`                              |
| []()`content?` | `Record`<`string`, `string` \| `number` \| `boolean` \| `string`\[]> |

***

### FunctionTool

#### Extends

* [`FunctionToolDefinition`](#functiontooldefinition)<`Args`, `Result`>

#### Type Parameters

| Type Parameter | Default type |
| -------------- | ------------ |
| []()`Args`     | `any`        |
| []()`Result`   | `unknown`    |

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

* [`FunctionTool`](#functiontool)

#### Type Parameters

| Type Parameter |
| -------------- |
| []()`Args`     |
| []()`Result`   |

#### Methods

##### handler()

```ts
handler(args, ctx): Result | Promise<Result>;
```

###### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `args`    | `Args`                        |
| `ctx`     | [`ToolContext`](#toolcontext) |

###### Returns

`Result` | `Promise`<`Result`>

##### status()?

```ts
status?(input, ctx):
  | StatusAnswer
| Promise<StatusAnswer>;
```

Answers whether an earlier write was applied, for a write whose outcome is unknown or that returned `pending`. `ctx.idempotencyKey` is that write’s key and `operationRef` the reference its `pending` named. Return `applied(result)` when it was applied, `rejected` when it definitively was not, and `pending` while it is still in progress; throw when the provider cannot tell. Any other return leaves the write unknown.

###### Parameters

| Parameter             | Type                           |
| --------------------- | ------------------------------ |
| `input`               | { `operationRef?`: `string`; } |
| `input.operationRef?` | `string`                       |
| `ctx`                 | [`ToolContext`](#toolcontext)  |

###### Returns

\| [`StatusAnswer`](#statusanswer) | `Promise`<[`StatusAnswer`](#statusanswer)>

#### Properties

| Property            | Type                                  |
| ------------------- | ------------------------------------- |
| []()`annotations?`  | [`ToolAnnotations`](#toolannotations) |
| []()`description`   | `string`                              |
| []()`inputSchema`   | [`JsonSchema`](#jsonschema)           |
| []()`name`          | `string`                              |
| []()`outputSchema?` | [`JsonSchema`](#jsonschema)           |

***

### HandlerExtra

The parts of an MCP request handler’s `extra` argument that `context` reads.

#### Properties

| Property                | Type                                                     | Description                                                                   |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| []()`_meta?`            | `Record`<`string`, `unknown`>                            | -                                                                             |
| []()`elicit?`           | (`params`) => `Promise`<[`ElicitResult`](#elicitresult)> | Set by a function package’s server when the client declared form elicitation. |
| []()`sendNotification?` | (`notification`) => `Promise`<`void`>                    | -                                                                             |
| []()`signal`            | `AbortSignal`                                            | -                                                                             |

***

### JsonRpcMessage

#### Properties

| Property        | Type                      |
| --------------- | ------------------------- |
| []()`error?`    | `object`                  |
| `error.code`    | `number`                  |
| `error.data?`   | `unknown`                 |
| `error.message` | `string`                  |
| []()`id?`       | `JsonRpcId`               |
| []()`jsonrpc`   | `"2.0"`                   |
| []()`method?`   | `string`                  |
| []()`params?`   | `Record`<`string`, `any`> |
| []()`result?`   | `unknown`                 |

***

### Logger

#### Methods

##### debug()

```ts
debug(message, data?): void;
```

###### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `message` | `string`                      |
| `data?`   | `Record`<`string`, `unknown`> |

###### Returns

`void`

##### error()

```ts
error(message, data?): void;
```

###### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `message` | `string`                      |
| `data?`   | `Record`<`string`, `unknown`> |

###### Returns

`void`

##### info()

```ts
info(message, data?): void;
```

###### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `message` | `string`                      |
| `data?`   | `Record`<`string`, `unknown`> |

###### Returns

`void`

##### warn()

```ts
warn(message, data?): void;
```

###### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `message` | `string`                      |
| `data?`   | `Record`<`string`, `unknown`> |

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

| Parameter   | Type                      |
| ----------- | ------------------------- |
| `transport` | [`Transport`](#transport) |

###### Returns

`Promise`<`void`>

***

### Pending

#### Properties

| Property           | Modifier   | Type        |
| ------------------ | ---------- | ----------- |
| []()`[OUTCOME]`    | `readonly` | `"pending"` |
| []()`message?`     | `readonly` | `string`    |
| []()`operationRef` | `readonly` | `string`    |

***

### Rejected

#### Properties

| Property        | Modifier   | Type            |
| --------------- | ---------- | --------------- |
| []()`[OUTCOME]` | `readonly` | `"not_applied"` |
| []()`message`   | `readonly` | `string`        |

***

### Secrets

#### Methods

##### get()

```ts
get(name): string;
```

Returns a declared secret; throws when the runner did not supply it.

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `name`    | `string` |

###### Returns

`string`

##### has()

```ts
has(name): boolean;
```

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `name`    | `string` |

###### Returns

`boolean`

***

### StatusParams

`caplo/status` params: the tool and, when the write returned `pending`, the operation it named.

#### Properties

| Property            | Type                          |
| ------------------- | ----------------------------- |
| []()`_meta?`        | `Record`<`string`, `unknown`> |
| []()`name`          | `string`                      |
| []()`operationRef?` | `string`                      |

***

### StdioOptions

#### Properties

| Property       | Type        | Description                                                                                                          |
| -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| []()`secrets?` | `string`\[] | Secret names to read from the environment. Local development only; the Caplo runtime never uses environment secrets. |

***

### StepUpRequired

#### Properties

| Property          | Modifier   | Type                                                      |
| ----------------- | ---------- | --------------------------------------------------------- |
| []()`[OUTCOME]`   | `readonly` | `"step_up"`                                               |
| []()`requirement` | `readonly` | [`AuthenticationRequirement`](#authenticationrequirement) |

***

### Subject

A verified customer: the Caplo subject and binding, and the namespace-scoped identity a backend maps to its account.

#### Properties

| Property                  | Type                                | Description                                                                                                                                                                                                                     |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| []()`bindingId`           | `string`                            | -                                                                                                                                                                                                                               |
| []()`customerToken?`      | `string`                            | The customer context token for this call, present when the deployment pins a customer token audience for the tool. Send it as `Authorization: Bearer` to that API; it is not enumerable, so it never reaches logs by spreading. |
| []()`externalSubject`     | `string`                            | -                                                                                                                                                                                                                               |
| []()`level?`              | `"low"` \| `"standard"` \| `"high"` | -                                                                                                                                                                                                                               |
| []()`resourceRef`         | `string`                            | subjectNamespaceRef and externalSubject joined; the key a backend maps to its customer account.                                                                                                                                 |
| []()`subjectId`           | `string`                            | -                                                                                                                                                                                                                               |
| []()`subjectNamespace`    | `string`                            | -                                                                                                                                                                                                                               |
| []()`subjectNamespaceRef` | `string`                            | -                                                                                                                                                                                                                               |

***

### ToolAnnotations

#### Properties

| Property               | Type      |
| ---------------------- | --------- |
| []()`destructiveHint?` | `boolean` |
| []()`idempotentHint?`  | `boolean` |
| []()`openWorldHint?`   | `boolean` |
| []()`readOnlyHint?`    | `boolean` |
| []()`title?`           | `string`  |

***

### ToolContext

#### Methods

##### elicit()

```ts
elicit(params): Promise<ElicitResult>;
```

Asks the visitor for missing details with an MCP form-mode elicitation (function packages; an `McpServer` uses `server.server.elicitInput`). Declare every field under `elicitation` in caplo.yaml; never ask for a credential. Throws `ElicitationUnavailableError` when `canElicit` is false.

###### Parameters

| Parameter | Type                            |
| --------- | ------------------------------- |
| `params`  | [`ElicitParams`](#elicitparams) |

###### Returns

`Promise`<[`ElicitResult`](#elicitresult)>

##### requireSubject()

```ts
requireSubject(): Readonly<Subject>;
```

Returns the verified customer; throws when the call carries none, so a tool can never act unscoped.

###### Returns

`Readonly`<[`Subject`](#subject)>

#### Properties

| Property                | Type                              | Description                                                                                       |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| []()`canElicit`         | `boolean`                         | Whether `elicit` can ask the visitor now. False where no form can be shown, such as a phone call. |
| []()`conversationId?`   | `string`                          | -                                                                                                 |
| []()`deadline?`         | `Date`                            | -                                                                                                 |
| []()`idempotencyKey?`   | `string`                          | -                                                                                                 |
| []()`invocationId?`     | `string`                          | -                                                                                                 |
| []()`log`               | [`Logger`](#logger)               | -                                                                                                 |
| []()`packageVersionId?` | `string`                          | -                                                                                                 |
| []()`secrets`           | [`Secrets`](#secrets)             | -                                                                                                 |
| []()`signal`            | `AbortSignal`                     | -                                                                                                 |
| []()`subject?`          | `Readonly`<[`Subject`](#subject)> | Present only for a tool that declares `subject` in caplo.yaml and runs for a verified customer.   |
| []()`turnId?`           | `string`                          | -                                                                                                 |
| []()`workspaceId?`      | `string`                          | -                                                                                                 |

***

### Transport

The subset of the MCP SDK `Transport` interface the Caplo runtime and `serveStdio` use.

#### Methods

##### close()

```ts
close(): Promise<void>;
```

###### Returns

`Promise`<`void`>

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

| Parameter | Type    |
| --------- | ------- |
| `error`   | `Error` |

###### Returns

`void`

##### onmessage()?

```ts
onmessage?(message): void;
```

###### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `message` | [`JsonRpcMessage`](#jsonrpcmessage) |

###### Returns

`void`

##### send()

```ts
send(message): Promise<void>;
```

###### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `message` | [`JsonRpcMessage`](#jsonrpcmessage) |

###### Returns

`Promise`<`void`>

##### start()

```ts
start(): Promise<void>;
```

###### Returns

`Promise`<`void`>

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

### AUTHENTICATION_META_KEY

```ts
const AUTHENTICATION_META_KEY: "caplo/authentication" = "caplo/authentication";
```

Result `_meta` key with which a tool asks for the customer to authenticate again (step-up).

***

### CONTEXT_META_KEY

```ts
const CONTEXT_META_KEY: "caplo/context" = "caplo/context";
```

***

### EFFECT_META_KEY

```ts
const EFFECT_META_KEY: "caplo/effect" = "caplo/effect";
```

Result `_meta` key carrying a write’s typed outcome.

***

### EFFECT_OUTCOME_CAPABILITY

```ts
const EFFECT_OUTCOME_CAPABILITY: object;
```

MCP server capability a bundle advertises when its write results carry a typed outcome under `_meta["caplo/effect"]`. Without it, or without the typed outcome, the runner reports an `isError` write as unknown: the change may have happened before the error.

#### Type Declaration

| Name                           | Type     |
| ------------------------------ | -------- |
| []()`caplo/effect-outcome`     | `object` |
| `caplo/effect-outcome.version` | `1`      |

***

### LEVELS

```ts
const LEVELS: readonly ["low", "standard", "high"];
```

Caplo assurance levels, weakest first.

***

### MAX_AUTH_AGE_SECONDS

```ts
const MAX_AUTH_AGE_SECONDS: 86400 = 86400;
```

The longest freshness a step-up may ask for, in seconds.

***

### OPERATION_STATUS_CAPABILITY

```ts
const OPERATION_STATUS_CAPABILITY: object;
```

MCP server capability a bundle advertises when it answers `caplo/status`: the runner may ask it whether an earlier write whose outcome is unknown or pending was applied.

#### Type Declaration

| Name                             | Type     |
| -------------------------------- | -------- |
| []()`caplo/operation-status`     | `object` |
| `caplo/operation-status.version` | `1`      |

***

### STATUS_METHOD

```ts
const STATUS_METHOD: "caplo/status" = "caplo/status";
```

JSON-RPC method the runner sends to ask for the status of an earlier write.

***

### SUBJECT_CONTEXT_CAPABILITY

```ts
const SUBJECT_CONTEXT_CAPABILITY: object;
```

MCP server capability a bundle advertises when its tools read the verified subject through `context()`. Function tools advertise it automatically; MCP servers add it to `capabilities.experimental`. The host refuses subject calls to a bundle that does not advertise it.

#### Type Declaration

| Name                            | Type     |
| ------------------------------- | -------- |
| []()`caplo/subject-context`     | `object` |
| `caplo/subject-context.version` | `1`      |

## Classes

### ElicitationUnavailableError

#### Extends

* `Error`

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

* `Error`

#### Constructors

##### Constructor

```ts
new MissingSecretError(name): MissingSecretError;
```

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `name`    | `string` |

###### Returns

[`MissingSecretError`](#missingsecreterror)

###### Overrides

`Error.constructor`

***

### MissingSubjectError

#### Extends

* `Error`

#### Constructors

##### Constructor

```ts
new MissingSubjectError(): MissingSubjectError;
```

###### Returns

[`MissingSubjectError`](#missingsubjecterror)

###### Overrides

`Error.constructor`
