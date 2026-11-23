---
title: "Tool fixtures"
description: "Every field of a tool test fixture, generated from the schema caplo tool test validates against."
editUrl: false
sidebar:
  order: 12
---

:::note[Generated reference]
Generated from the schema in `caplo` v0.5.1. Guide: [Test tools](/tools/testing/).
:::

For validation and completion in your editor, add this first line to the file (YAML language server, used by VS Code and others):

```yaml
# yaml-language-server: $schema=https://docs.caplo.si/schemas/fixture.schema.json
```

The schema is also published at [/schemas/fixture.schema.json](/schemas/fixture.schema.json).

## Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string |  | At most 200 characters. |
| `tool` | string | Yes | Pattern `^[a-z][a-z0-9_]{0,47}$`. |
| `arguments` | object | Yes |  |
| `secrets` | object |  | Test values for declared secrets. |
| `expect` | object | Yes |  See [`expect`](#expect). |

Other fields are refused.


### `expect`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `isError` | boolean |  |  |
| `structuredContent` | object |  | Every listed field must equal the result's field; extra result fields are allowed. |
| `textIncludes` | string |  | Substring of the joined text content. |

Other fields are refused.

