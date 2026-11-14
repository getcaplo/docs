---
title: "@caplo/tools/verify"
description: "API reference for @caplo/tools/verify, generated from the published package."
editUrl: false
sidebar:
  order: 1
  label: "verify"
---

:::note[Generated reference]
Generated from `@caplo/tools` 0.1.8 on npm. Install with `npm install @caplo/tools`; import from `@caplo/tools/verify`. Guides: [Tools](/tools/).
:::

## Functions

### verifyCustomerContext()

```ts
function verifyCustomerContext(token, options): Promise<CustomerContextClaims>;
```

Verifies a customer context token and returns its claims; throws `CustomerContextError` otherwise.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |
| `options` | [`VerifyOptions`](#verifyoptions) |

#### Returns

`Promise`\<[`CustomerContextClaims`](#customercontextclaims)\>

## Interfaces

### CustomerContextClaims

The claims of a verified customer context token.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-acr"></a> `acr` | [`CustomerContextLevel`](#customercontextlevel) | - |
| <a id="property-act"></a> `act` | `object` | The Caplo agent acting; for a person acting for another, `act.act` names the person present. |
| `act.act?` | `object` | - |
| `act.act.relationship?` | `string` | - |
| `act.act.sub` | `string` | - |
| `act.sub` | `string` | - |
| <a id="property-attributes"></a> `attributes?` | `Record`\<`string`, `unknown`\> | - |
| <a id="property-aud"></a> `aud` | `string` | - |
| <a id="property-auth_time"></a> `auth_time?` | `number` | - |
| <a id="property-caplo"></a> `caplo` | `object` | - |
| `caplo.action?` | `string` | - |
| `caplo.actionDigest?` | `string` | - |
| `caplo.conversation` | `string` | - |
| `caplo.namespace` | `string` | - |
| <a id="property-client_id"></a> `client_id` | `string` | - |
| <a id="property-exp"></a> `exp` | `number` | - |
| <a id="property-iat"></a> `iat` | `number` | - |
| <a id="property-iss"></a> `iss` | `string` | - |
| <a id="property-jti"></a> `jti` | `string` | - |
| <a id="property-scope"></a> `scope` | `string` | - |
| <a id="property-sub"></a> `sub` | `string` | The client's own customer id. |

***

### ReplayStore

Records each token id once; `use` resolves false when the id was already used.

#### Methods

##### use()

```ts
use(jti, expiresAt): boolean | Promise<boolean>;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `jti` | `string` |
| `expiresAt` | `Date` |

###### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### VerifyOptions

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-audience"></a> `audience` | `string` | This API's audience, one of the connection's API audiences. |
| <a id="property-clocktoleranceseconds"></a> `clockToleranceSeconds?` | `number` | Allowed clock skew; default 0. |
| <a id="property-issuer"></a> `issuer` | `string` | The exact issuer shown in the Caplo Console, `https://…/identity/workspaces/<workspaceId>`. |
| <a id="property-replaystore"></a> `replayStore?` | [`ReplayStore`](#replaystore) | Rejects a reused token; recommended for write APIs. |
| <a id="property-requiredscope"></a> `requiredScope?` | `string` | A scope the token must carry. |

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

- `Error`

#### Constructors

##### Constructor

```ts
new CustomerContextError(reason, message): CustomerContextError;
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `reason` | [`VerifyFailure`](#verifyfailure) |
| `message` | `string` |

###### Returns

[`CustomerContextError`](#customercontexterror)

###### Overrides

`Error.constructor`

#### Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="property-reason"></a> `reason` | `readonly` | [`VerifyFailure`](#verifyfailure) |

***

### MemoryReplayStore

A process-local replay store; use a shared store when the API runs on more than one instance.

#### Implements

- [`ReplayStore`](#replaystore)

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

| Parameter | Type |
| ------ | ------ |
| `jti` | `string` |
| `expiresAt` | `Date` |

###### Returns

`boolean`

###### Implementation of

[`ReplayStore`](#replaystore).[`use`](#use-1)
