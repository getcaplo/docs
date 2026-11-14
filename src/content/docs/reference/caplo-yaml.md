---
title: "caplo.yaml (tool package)"
description: "Every field of a tool package caplo.yaml, generated from the schema the CLI and builder validate against."
editUrl: false
sidebar:
  order: 11
---

:::note[Generated reference]
Generated from the schema in `caplo` v0.4.1. Guides: [Tools](/tools/).
:::

For validation and completion in your editor, add this first line to the file (YAML language server, used by VS Code and others):

```yaml
# yaml-language-server: $schema=https://docs.caplo.si/schemas/caplo.schema.json
```

The schema is also published at [/schemas/caplo.schema.json](/schemas/caplo.schema.json).

## Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `apiVersion` | string | Yes | v1, v1.0, and v1.0.0 resolve to the latest matching schema. Pattern `^v1(\.0(\.0)?)?$`. |
| `kind` | `"ToolPackage"` | Yes |  |
| `name` | string | Yes | Unique per workspace. Pattern `^[a-z][a-z0-9-]{1,39}$`. |
| `type` | `"function"`, `"mcp"` | Yes |  |
| `description` | string |  | At most 500 characters. |
| `entry` | string | Yes | Module that exports createServer() (mcp) or a default defineTool() (function). Pattern `^(?!/)(?!.*(^\|/)\.\.(/\|$))[A-Za-z0-9._/-]+\.(ts\|mts\|js\|mjs)$`. |
| `runtime` | `"node24"` | Yes |  |
| `tools` | array of object |  | Effect and timeout for every tool the server lists (mcp only). At least 1 items. At most 64 items. See [`tools`](#tools). |
| `effect` | `"read"`, `"write"` |  | Function packages only. |
| `timeoutSeconds` | integer |  | Function packages only. From 1 to 30. |
| `confirmation` | `"required"`, `"none"` |  | Function packages only. |
| `egress` | array of string |  | Exact hosts or *.suffix wildcards. Empty or absent means no network. At most 50 items. |
| `secrets` | array of string |  | Secret names; values are configured per workspace and passed per call. At most 50 items. |
| `tests` | string |  | Glob of fixture files relative to the package root. Default `"tests/*.json"`. |
| `subject` | object |  | Function packages only. See [`subject`](#subject). |
| `presentation` | object |  | Function packages only. See [`presentation`](#presentation). |
| `progress` | object |  | Function packages only. See [`progress`](#progress). |
| `elicitation` | object |  | Function packages only. See [`elicitation`](#elicitation). |

Other fields are refused.


### `tools`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Pattern `^[a-z][a-z0-9_]{0,47}$`. |
| `effect` | `"read"`, `"write"` | Yes |  |
| `timeoutSeconds` | integer | Yes | From 1 to 30. |
| `confirmation` | `"required"`, `"none"` |  | Write tools only. required (the default) runs the tool only after the customer confirms the call in a later turn. |
| `subject` | object |  | The tool acts for a verified customer. The runner passes the owner-verified subject in the call context, never through arguments; selector names an optional input property the runner fills with the subject's resource reference and refuses from the model. See [`tools.subject`](#toolssubject). |
| `presentation` | object |  | Public form and receipt metadata. Only listed fields are ever shown; it grants no execution and exposes no other argument. The build checks every path against the tool's schemas. See [`tools.presentation`](#toolspresentation). |
| `progress` | object |  | Static customer-facing status while the tool runs. Frozen with the release and never interpolated. See [`tools.progress`](#toolsprogress). |
| `elicitation` | object |  | Read tools only. While it runs, the tool may ask the visitor for missing details with MCP form elicitation (elicitation/create). A request may name only these fields; Caplo refuses one that asks for a credential, and offers elicitation only where the visitor can answer, so the tool must handle a client without the capability. See [`tools.elicitation`](#toolselicitation). |

Other fields are refused.


#### `tools.subject`

The tool acts for a verified customer. The runner passes the owner-verified subject in the call context, never through arguments; selector names an optional input property the runner fills with the subject's resource reference and refuses from the model.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `policy` | `"verified_required"` | Yes |  |
| `selector` | string |  | Pattern `^[A-Za-z_][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.


#### `tools.presentation`

Public form and receipt metadata. Only listed fields are ever shown; it grants no execution and exposes no other argument. The build checks every path against the tool's schemas.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `schemaVersion` | `1` | Yes |  |
| `title` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`tools.presentation.fields`](#toolspresentationfields). |
| `receipt` | object |  | Display fields selected from structuredContent; never decides whether the operation succeeded. See [`tools.presentation.receipt`](#toolspresentationreceipt). |
| `result` | object |  | Items of structuredContent shown with the reply: up to 20 of one array property as a list, table or cards, up to 10 as choices, up to 4 side by side as a comparison, up to 12 as timeline steps, up to 20 as places on a map, or one object as a detail (the output itself, or the direct object property path names), or as a page: a link the visitor opens over the chat (read tools only). Columns are direct primitive properties of an item; nothing else of the result is shown. Column roles and item actions depend on the layout. See [`tools.presentation.result`](#toolspresentationresult). |
| `files` | object |  | Read tools only. The tool may return files for the visitor as MCP embedded resources with a blob (resource.uri names the file, resource.mimeType its type). Caplo takes them out of the result so the model never sees the bytes, proves the type from the content, scans them and shows them with the agent's reply as a download where the channel can; elsewhere the model is told they were not delivered. At most 3 files per result. See [`tools.presentation.files`](#toolspresentationfiles). |

Other fields are refused.


#### `tools.presentation.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |
| `editable` | boolean |  | The customer may change this string input before review. |
| `input` | `"text"`, `"select"` |  |  |
| `options` | array of object |  | At least 1 items. At most 20 items. See [`tools.presentation.fields.options`](#toolspresentationfieldsoptions). |

Other fields are refused.


#### `tools.presentation.fields.options`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | string | Yes | At most 1000 characters. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |

Other fields are refused.


#### `tools.presentation.receipt`

Display fields selected from structuredContent; never decides whether the operation succeeded.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`tools.presentation.receipt.fields`](#toolspresentationreceiptfields). |

Other fields are refused.


#### `tools.presentation.receipt.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |

Other fields are refused.


#### `tools.presentation.result`

Items of structuredContent shown with the reply: up to 20 of one array property as a list, table or cards, up to 10 as choices, up to 4 side by side as a comparison, up to 12 as timeline steps, up to 20 as places on a map, or one object as a detail (the output itself, or the direct object property path names), or as a page: a link the visitor opens over the chat (read tools only). Columns are direct primitive properties of an item; nothing else of the result is shown. Column roles and item actions depend on the layout.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string |  | The array property of the items; for a detail or a page, a direct object property, or omitted for the output itself. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `layout` | `"list"`, `"table"`, `"cards"`, `"choices"`, `"detail"`, `"comparison"`, `"timeline"`, `"page"`, `"map"` | Yes |  |
| `title` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `columns` | array of object | Yes | At most 6, or 12 for a detail, comparison or map. At least 1 items. At most 12 items. See [`tools.presentation.result.columns`](#toolspresentationresultcolumns). |
| `actions` | array of object |  | Item controls: up to two on cards, a detail, a comparison or a map, and exactly one reply on choices. A reply sends a visitor message; a link opens a page. Neither calls a tool. At least 1 items. At most 2 items. See [`tools.presentation.result.actions`](#toolspresentationresultactions). |
| `page` | object |  | Layout page only. How the link opens: label is its button; display panel opens it in a sandboxed panel over the chat, tab in a new browser tab (use tab for pages that refuse to be framed). The link, and any message the page posts, must come from one of origins. The page never decides an outcome: confirm it with a read tool. See [`tools.presentation.result.page`](#toolspresentationresultpage). |

Other fields are refused.


#### `tools.presentation.result.columns`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |
| `role` | `"image"`, `"title"`, `"subtitle"`, `"description"`, `"money"`, `"badge"`, `"link"`, `"time"`, `"status"`, `"latitude"`, `"longitude"`, `"address"` |  | How the layout shows the column. image and link need https URLs, money a currency, time a date or date-time string, status a string enum mapped by statuses, and latitude and longitude (map) numbers in degrees. |
| `currency` | object |  | The ISO 4217 currency of a money column: a sibling string property of the item, or a fixed code. See [`tools.presentation.result.columns.currency`](#toolspresentationresultcolumnscurrency). |
| `statuses` | object |  | The timeline state of every enum value of a status column. |

Other fields are refused.


#### `tools.presentation.result.columns.currency`

The ISO 4217 currency of a money column: a sibling string property of the item, or a fixed code.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string |  | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `code` | string |  | Pattern `^[A-Z]{3}$`. |

Other fields are refused.


#### `tools.presentation.result.actions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `kind` | `"reply"`, `"link"` | Yes |  |
| `label` | string | Yes | At most 20 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `template` | string |  | The visitor message; {name} inserts the item's value of the listed column name. At most 200 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `path` | string |  | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.


#### `tools.presentation.result.page`

Layout page only. How the link opens: label is its button; display panel opens it in a sandboxed panel over the chat, tab in a new browser tab (use tab for pages that refuse to be framed). The link, and any message the page posts, must come from one of origins. The page never decides an outcome: confirm it with a read tool.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | string | Yes | At most 20 characters. Pattern `^[^\r\n&lt;&gt;]+$`. |
| `display` | `"panel"`, `"tab"` | Yes |  |
| `origins` | array of string | Yes | At least 1 items. At most 5 items. |

Other fields are refused.


#### `tools.presentation.files`

Read tools only. The tool may return files for the visitor as MCP embedded resources with a blob (resource.uri names the file, resource.mimeType its type). Caplo takes them out of the result so the model never sees the bytes, proves the type from the content, scans them and shows them with the agent's reply as a download where the channel can; elsewhere the model is told they were not delivered. At most 3 files per result.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `accept` | array of `"image/jpeg"`, `"image/png"`, `"image/gif"`, `"image/webp"`, `"application/pdf"` | Yes | At least 1 items. At most 5 items. |
| `maxBytes` | integer | Yes | From 1024 to 10485760. |

Other fields are refused.


#### `tools.progress`

Static customer-facing status while the tool runs. Frozen with the release and never interpolated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | string | Yes | Widget status line, for example Checking available times: 3 to 40 characters, no trailing punctuation. Pattern `^(?![\s\S]*(?:https?:\|www\.))[^\s&lt;&gt;{}\u0000-\u001f\u007f][^&lt;&gt;{}\u0000-\u001f\u007f]{1,38}[^\s.!?:;,\u2026&lt;&gt;{}\u0000-\u001f\u007f]$`. |
| `spoken` | string |  | Voice acknowledgement, one sentence of 3 to 90 characters ending with a full stop. Pattern `^(?![\s\S]*(?:https?:\|www\.))[^\s&lt;&gt;{}\u0000-\u001f\u007f][^&lt;&gt;{}\u0000-\u001f\u007f]{1,87}\.$`. |

Other fields are refused.


#### `tools.elicitation`

Read tools only. While it runs, the tool may ask the visitor for missing details with MCP form elicitation (elicitation/create). A request may name only these fields; Caplo refuses one that asks for a credential, and offers elicitation only where the visitor can answer, so the tool must handle a client without the capability.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `style` | `"form"`, `"questions"` |  | form (default) shows each request as a form on the website widget. questions asks one tapped question per request, on the website and in WhatsApp, Messenger and Instagram: each request names one field as a required single choice of 2 to 9 options with labels of at most 20 characters, and the tool may ask as many questions per call as it declares fields, up to 8. |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`tools.elicitation.fields`](#toolselicitationfields). |

Other fields are refused.


#### `tools.elicitation.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | A property name the tool's requestedSchema may use. Pattern `^[A-Za-z][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.


### `subject`

Function packages only.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `policy` | `"verified_required"` | Yes |  |
| `selector` | string |  | Pattern `^[A-Za-z_][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.


### `presentation`

Function packages only.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `schemaVersion` | `1` | Yes |  |
| `title` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`presentation.fields`](#presentationfields). |
| `receipt` | object |  | Display fields selected from structuredContent; never decides whether the operation succeeded. See [`presentation.receipt`](#presentationreceipt). |
| `result` | object |  | Items of structuredContent shown with the reply: up to 20 of one array property as a list, table or cards, up to 10 as choices, up to 4 side by side as a comparison, up to 12 as timeline steps, up to 20 as places on a map, or one object as a detail (the output itself, or the direct object property path names), or as a page: a link the visitor opens over the chat (read tools only). Columns are direct primitive properties of an item; nothing else of the result is shown. Column roles and item actions depend on the layout. See [`presentation.result`](#presentationresult). |
| `files` | object |  | Read tools only. The tool may return files for the visitor as MCP embedded resources with a blob (resource.uri names the file, resource.mimeType its type). Caplo takes them out of the result so the model never sees the bytes, proves the type from the content, scans them and shows them with the agent's reply as a download where the channel can; elsewhere the model is told they were not delivered. At most 3 files per result. See [`presentation.files`](#presentationfiles). |

Other fields are refused.


#### `presentation.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |
| `editable` | boolean |  | The customer may change this string input before review. |
| `input` | `"text"`, `"select"` |  |  |
| `options` | array of object |  | At least 1 items. At most 20 items. See [`presentation.fields.options`](#presentationfieldsoptions). |

Other fields are refused.


#### `presentation.fields.options`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | string | Yes | At most 1000 characters. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |

Other fields are refused.


#### `presentation.receipt`

Display fields selected from structuredContent; never decides whether the operation succeeded.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`presentation.receipt.fields`](#presentationreceiptfields). |

Other fields are refused.


#### `presentation.receipt.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |

Other fields are refused.


#### `presentation.result`

Items of structuredContent shown with the reply: up to 20 of one array property as a list, table or cards, up to 10 as choices, up to 4 side by side as a comparison, up to 12 as timeline steps, up to 20 as places on a map, or one object as a detail (the output itself, or the direct object property path names), or as a page: a link the visitor opens over the chat (read tools only). Columns are direct primitive properties of an item; nothing else of the result is shown. Column roles and item actions depend on the layout.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string |  | The array property of the items; for a detail or a page, a direct object property, or omitted for the output itself. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `layout` | `"list"`, `"table"`, `"cards"`, `"choices"`, `"detail"`, `"comparison"`, `"timeline"`, `"page"`, `"map"` | Yes |  |
| `title` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `columns` | array of object | Yes | At most 6, or 12 for a detail, comparison or map. At least 1 items. At most 12 items. See [`presentation.result.columns`](#presentationresultcolumns). |
| `actions` | array of object |  | Item controls: up to two on cards, a detail, a comparison or a map, and exactly one reply on choices. A reply sends a visitor message; a link opens a page. Neither calls a tool. At least 1 items. At most 2 items. See [`presentation.result.actions`](#presentationresultactions). |
| `page` | object |  | Layout page only. How the link opens: label is its button; display panel opens it in a sandboxed panel over the chat, tab in a new browser tab (use tab for pages that refuse to be framed). The link, and any message the page posts, must come from one of origins. The page never decides an outcome: confirm it with a read tool. See [`presentation.result.page`](#presentationresultpage). |

Other fields are refused.


#### `presentation.result.columns`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | Yes | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `label` | string | Yes | Plain text rendered escaped: no markup, control characters, or surrounding whitespace. At most 80 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `display` | `"plain"`, `"last4"` | Yes | last4 shows only the final four characters. |
| `role` | `"image"`, `"title"`, `"subtitle"`, `"description"`, `"money"`, `"badge"`, `"link"`, `"time"`, `"status"`, `"latitude"`, `"longitude"`, `"address"` |  | How the layout shows the column. image and link need https URLs, money a currency, time a date or date-time string, status a string enum mapped by statuses, and latitude and longitude (map) numbers in degrees. |
| `currency` | object |  | The ISO 4217 currency of a money column: a sibling string property of the item, or a fixed code. See [`presentation.result.columns.currency`](#presentationresultcolumnscurrency). |
| `statuses` | object |  | The timeline state of every enum value of a status column. |

Other fields are refused.


#### `presentation.result.columns.currency`

The ISO 4217 currency of a money column: a sibling string property of the item, or a fixed code.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string |  | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |
| `code` | string |  | Pattern `^[A-Z]{3}$`. |

Other fields are refused.


#### `presentation.result.actions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `kind` | `"reply"`, `"link"` | Yes |  |
| `label` | string | Yes | At most 20 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `template` | string |  | The visitor message; {name} inserts the item's value of the listed column name. At most 200 characters. Pattern `^[^\s&lt;&gt;\u0000-\u001F\u007F](?:[^&lt;&gt;\u0000-\u001F\u007F]*[^\s&lt;&gt;\u0000-\u001F\u007F])?$`. |
| `path` | string |  | JSON pointer to one direct property of the tool's schema. Pattern `^/[A-Za-z_][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.


#### `presentation.result.page`

Layout page only. How the link opens: label is its button; display panel opens it in a sandboxed panel over the chat, tab in a new browser tab (use tab for pages that refuse to be framed). The link, and any message the page posts, must come from one of origins. The page never decides an outcome: confirm it with a read tool.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | string | Yes | At most 20 characters. Pattern `^[^\r\n&lt;&gt;]+$`. |
| `display` | `"panel"`, `"tab"` | Yes |  |
| `origins` | array of string | Yes | At least 1 items. At most 5 items. |

Other fields are refused.


#### `presentation.files`

Read tools only. The tool may return files for the visitor as MCP embedded resources with a blob (resource.uri names the file, resource.mimeType its type). Caplo takes them out of the result so the model never sees the bytes, proves the type from the content, scans them and shows them with the agent's reply as a download where the channel can; elsewhere the model is told they were not delivered. At most 3 files per result.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `accept` | array of `"image/jpeg"`, `"image/png"`, `"image/gif"`, `"image/webp"`, `"application/pdf"` | Yes | At least 1 items. At most 5 items. |
| `maxBytes` | integer | Yes | From 1024 to 10485760. |

Other fields are refused.


### `progress`

Function packages only.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | string | Yes | Widget status line, for example Checking available times: 3 to 40 characters, no trailing punctuation. Pattern `^(?![\s\S]*(?:https?:\|www\.))[^\s&lt;&gt;{}\u0000-\u001f\u007f][^&lt;&gt;{}\u0000-\u001f\u007f]{1,38}[^\s.!?:;,\u2026&lt;&gt;{}\u0000-\u001f\u007f]$`. |
| `spoken` | string |  | Voice acknowledgement, one sentence of 3 to 90 characters ending with a full stop. Pattern `^(?![\s\S]*(?:https?:\|www\.))[^\s&lt;&gt;{}\u0000-\u001f\u007f][^&lt;&gt;{}\u0000-\u001f\u007f]{1,87}\.$`. |

Other fields are refused.


### `elicitation`

Function packages only.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `style` | `"form"`, `"questions"` |  | form (default) shows each request as a form on the website widget. questions asks one tapped question per request, on the website and in WhatsApp, Messenger and Instagram: each request names one field as a required single choice of 2 to 9 options with labels of at most 20 characters, and the tool may ask as many questions per call as it declares fields, up to 8. |
| `fields` | array of object | Yes | At least 1 items. At most 12 items. See [`elicitation.fields`](#elicitationfields). |

Other fields are refused.


#### `elicitation.fields`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | A property name the tool's requestedSchema may use. Pattern `^[A-Za-z][A-Za-z0-9_]{0,63}$`. |

Other fields are refused.

