---
title: Tool limits
description: The runtime, time, memory, size, network, concurrency and log limits that apply to tool packages and remote MCP tools.
sidebar:
  order: 11
---

These limits apply to every workspace. A call or build that exceeds one fails with the error code shown, which `caplo tool logs`, test output or the build log reports.

## Runtime

| Limit | Value |
| --- | --- |
| Runtime | Node.js 24 (`runtime: node24`). Local `caplo tool test` and `caplo tool dev` also need Node 24. |
| Module format | Your code is bundled into one ES module. Native `.node` addons are refused. |
| Forbidden imports | `child_process`, `cluster`, `worker_threads`, `inspector`. |
| Environment | No environment variables or secrets from the environment. Read secrets from the [call context](/tools/define-tool-and-context/#the-call-context). |
| Memory | Your workspace's tools run in workers with a 256 MB JavaScript heap, shared by the packages loaded in that worker. Module-level state can persist between calls in the same worker. |

## Calls

| Limit | Value | Error |
| --- | --- | --- |
| Timeout per tool | 1 to 30 seconds, set by `timeoutSeconds` (remote MCP tools: set in review, 20 by default) | `tool_timeout` |
| Result size | 256 KiB, after any [files](/tools/present-results/#return-files) are taken out | `output_too_large` |
| Structured result | Must match the tool's `outputSchema`, if it has one | `output_schema_violation` |
| Files per result | 3, each up to the tool's `maxBytes`, at most 10 MiB; JPEG, PNG, GIF, WebP or PDF | `output_file_invalid` |
| Form questions | 3 per call; up to 12 declared fields | |
| Concurrent calls | Up to 16 of a workspace's tool calls at a time | `tool_concurrency_exceeded` |
| Write status checks | Up to 8 per write | |

## Packages and builds

| Limit | Value | Error |
| --- | --- | --- |
| Package name | 2 to 40 characters: lowercase letters, digits and dashes, starting with a letter | `config_invalid` |
| Tool name | Up to 48 characters: lowercase letters, digits and underscores, starting with a letter | `tool_name_invalid` |
| Model name (`<package>__<tool>`) | Up to 64 characters | `tool_name_invalid` |
| Tools per MCP package | 64 | `config_invalid` |
| Function package | Exactly one tool | `schema_invalid` |
| Description | 500 characters | `config_invalid` |
| Files in a draft | 1,000, with paths up to 512 characters | `too_many_files` |
| File size | 1 MiB per file; 10 MiB for a lockfile | `file_too_large` |
| Draft size | 5 MiB in total, not counting lockfiles | `draft_too_large` |
| Bundle size | 10 MiB | `bundle_too_large` |
| Dependency install | 90 seconds | `install_timeout` |
| Build | 120 seconds | `build_timeout` |

## Network and secrets

| Limit | Value |
| --- | --- |
| Egress hosts | Up to 50 per package. No list means no network access. |
| Reachable addresses | Public addresses only. Private, loopback, link-local and cloud metadata addresses are refused even when the host is listed. |
| Secrets | Up to 50 names per package; names up to 64 characters. |
| Secret changes | Live calls use a new, rotated or bound value within a minute. |

## Presentation

| Limit | Value |
| --- | --- |
| Confirmation and receipt fields | 12 each |
| Labels and titles | 80 characters; action labels 20 |
| `list`, `table`, `cards` | 20 items |
| `choices` | 10 items |
| `comparison` | 4 items |
| `timeline` | 12 steps |
| `map` | 20 places |
| Page origins | 5 per page result |
| Progress label | 3 to 40 characters; spoken line 3 to 90 |

## Logs

| Limit | Value |
| --- | --- |
| Retention | Live invocations from the last hour, up to about the 1,000 most recent per package |
| Lines per invocation | 200; a line over 8 KiB is cut short |
| `caplo tool logs -n` | At most 200 invocations at a time |
