---
title: Write fixtures for my Caplo tool package
description: Adds JSON fixtures that cover each tool's normal and error behaviour, and runs them locally and on Caplo.
---
Goal: give the Caplo tool package in `<PACKAGE_DIR>` a useful set of fixtures, one JSON file per call, so `caplo tool test` catches regressions before a version is published.

Read these pages first:

- https://docs.caplo.si/tools/testing.md
- https://docs.caplo.si/reference/fixtures.md
- https://docs.caplo.si/tools/define-tool-and-context.md

Steps:

1. Read `caplo.yaml` (its `tools` list or, for a function package, its top-level policy, and its `tests` glob, default `tests/*.json`) and the source of each tool. Note each tool's `effect`, its input schema and what it returns in `structuredContent` and text.
2. For each tool, plan fixtures for:
   - a normal call with realistic arguments;
   - an edge case, such as an empty result or the largest allowed input;
   - an expected error, such as an unknown ID, with `"expect": { "isError": true }`.
   Show me the plan before writing files.
3. Write each fixture as its own file in the tests folder, named after the tool and case (for example `tests/get_order-shipped.json`):

   ```json
   {
     "name": "<WHAT_THIS_CASE_CHECKS>",
     "tool": "<TOOL_NAME>",
     "arguments": { },
     "expect": { "structuredContent": { }, "textIncludes": "<TEXT>" }
   }
   ```

   `tool` is the tool name the package lists, not the `<package>__<tool>` model name. In `structuredContent`, list only the properties that matter; listed values must match exactly, unlisted ones are ignored. Every fixture needs at least one expectation.
4. If a tool reads secrets, the fixture needs `secrets` with test values. Use only values I give you for a test or sandbox environment; if I have none, ask me how to proceed.
5. If the package has write tools, warn me that `caplo tool test` runs write fixtures for real on my machine. Write them only against a test environment I confirm; `caplo tool test --remote` skips them.
6. Run the fixtures and fix the fixtures (not the tool) until they reflect the tool's real, correct behaviour. If a fixture reveals a bug in the tool, report it instead of weakening the expectation.

   ```sh
   cd <PACKAGE_DIR>
   caplo tool test -v
   ```

7. Ask me before running `caplo tool test --remote`, which pushes the package as the workspace draft, builds it and runs the read fixtures on Caplo with the egress list enforced.

Verify: `caplo tool test` prints `ok` for every fixture and exits 0; with `--remote`, there are no failures and no `egress denied` lines.

Rules:

- Never put production credentials, real customer data or secret values in fixtures or in this chat.
- Do not run `caplo tool push`, `caplo tool publish` or `caplo publish` without my approval.
- Use Node 24; check with `node --version` and run `npm install` first if `node_modules` is missing.
