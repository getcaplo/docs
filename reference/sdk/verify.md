# @caplo/tools/verify

> API reference for @caplo/tools/verify, generated from the published package.

Generated reference

Generated from `@caplo/tools` 0.1.8 on npm. Install with `npm install @caplo/tools`; import from `@caplo/tools/verify`. Guides: [Tools](/tools/).

## Functions

### verifyCustomerContext()

```ts
function verifyCustomerContext(token, options): Promise<CustomerContextClaims>;
```

Verifies a customer context token and returns its claims; throws `CustomerContextError` otherwise.

#### Parameters

| Parameter | Type                              |
| --------- | --------------------------------- |
| `token`   | `string`                          |
| `options` | [`VerifyOptions`](#verifyoptions) |

#### Returns

`Promise`<[`CustomerContextClaims`](#customercontextclaims)>

## Interfaces

### CustomerContextClaims

The claims of a verified customer context token.

#### Properties

| Property                | Type                                            | Description                                                                                  |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| []()`acr`               | [`CustomerContextLevel`](#customercontextlevel) | -                                                                                            |
| []()`act`               | `object`                                        | The Caplo agent acting; for a person acting for another, `act.act` names the person present. |
| `act.act?`              | `object`                                        | -                                                                                            |
| `act.act.relationship?` | `string`                                        | -                                                                                            |
| `act.act.sub`           | `string`                                        | -                                                                                            |
| `act.sub`               | `string`                                        | -                                                                                            |
| []()`attributes?`       | `Record`<`string`, `unknown`>                   | -                                                                                            |
| []()`aud`               | `string`                                        | -                                                                                            |
| []()`auth_time?`        | `number`                                        | -                                                                                            |
| []()`caplo`             | `object`                                        | -                                                                                            |
| `caplo.action?`         | `string`                                        | -                                                                                            |
| `caplo.actionDigest?`   | `string`                                        | -                                                                                            |
| `caplo.conversation`    | `string`                                        | -                                                                                            |
| `caplo.namespace`       | `string`                                        | -                                                                                            |
| []()`client_id`         | `string`                                        | -                                                                                            |
| []()`exp`               | `number`                                        | -                                                                                            |
| []()`iat`               | `number`                                        | -                                                                                            |
| []()`iss`               | `string`                                        | -                                                                                            |
| []()`jti`               | `string`                                        | -                                                                                            |
| []()`scope`             | `string`                                        | -                                                                                            |
| []()`sub`               | `string`                                        | The client’s own customer id.                                                                |

***

### ReplayStore

Records each token id once; `use` resolves false when the id was already used.

#### Methods

##### use()

```ts
use(jti, expiresAt): boolean | Promise<boolean>;
```

###### Parameters

| Parameter   | Type     |
| ----------- | -------- |
| `jti`       | `string` |
| `expiresAt` | `Date`   |

###### Returns

`boolean` | `Promise`<`boolean`>

***

### VerifyOptions

#### Properties

| Property                     | Type                          | Description                                                                                 |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| []()`audience`               | `string`                      | This API’s audience, one of the connection’s API audiences.                                 |
| []()`clockToleranceSeconds?` | `number`                      | Allowed clock skew; default 0.                                                              |
| []()`issuer`                 | `string`                      | The exact issuer shown in the Caplo Console, `https://…/identity/workspaces/<workspaceId>`. |
| []()`replayStore?`           | [`ReplayStore`](#replaystore) | Rejects a reused token; recommended for write APIs.                                         |
| []()`requiredScope?`         | `string`                      | A scope the token must carry.                                                               |

## Type Aliases

### CustomerContextLevel

```ts
type CustomerContextLevel = "low" | "standard" | "high";
```

***

### VerifyFailure

```ts
type VerifyFailure =
  | "malformed"
  | "typ"
  | "alg"
  | "kid_unknown"
  | "jwks_unavailable"
  | "signature"
  | "issuer"
  | "audience"
  | "claims"
  | "expired"
  | "not_yet_valid"
  | "lifetime"
  | "scope"
  | "replayed";
```

## Classes

### CustomerContextError

#### Extends

* `Error`

#### Constructors

##### Constructor

```ts
new CustomerContextError(reason, message): CustomerContextError;
```

###### Parameters

| Parameter | Type                              |
| --------- | --------------------------------- |
| `reason`  | [`VerifyFailure`](#verifyfailure) |
| `message` | `string`                          |

###### Returns

[`CustomerContextError`](#customercontexterror)

###### Overrides

`Error.constructor`

#### Properties

| Property     | Modifier   | Type                              |
| ------------ | ---------- | --------------------------------- |
| []()`reason` | `readonly` | [`VerifyFailure`](#verifyfailure) |

***

### MemoryReplayStore

A process-local replay store; use a shared store when the API runs on more than one instance.

#### Implements

* [`ReplayStore`](#replaystore)

#### Constructors

##### Constructor

```ts
new MemoryReplayStore(): MemoryReplayStore;
```

###### Returns

[`MemoryReplayStore`](#memoryreplaystore)

#### Methods

##### use()

```ts
use(jti, expiresAt): boolean;
```

###### Parameters

| Parameter   | Type     |
| ----------- | -------- |
| `jti`       | `string` |
| `expiresAt` | `Date`   |

###### Returns

`boolean`

###### Implementation of

[`ReplayStore`](#replaystore).[`use`](#use-1)
