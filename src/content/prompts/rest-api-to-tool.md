---
title: Wrap my REST API as a Caplo tool package
description: Builds an MCP tool package with read and write tools for an existing REST API, with declared secrets, an egress list and fixtures.
---
Goal: turn the REST API in this repository (or the one I describe) into a Caplo tool package that agents can call. Read operations become `read` tools, operations that change data become `write` tools that the customer confirms. The package declares the secret names it needs and the exact hosts it calls.

Read these pages first:

- https://docs.caplo.si/tools/first-tool.md
- https://docs.caplo.si/tools/define-tool-and-context.md
- https://docs.caplo.si/tools/write-tools.md
- https://docs.caplo.si/tools/secrets-and-egress.md
- https://docs.caplo.si/tools/testing.md
- https://docs.caplo.si/reference/caplo-yaml.md

Values I supply: package name `<PACKAGE_NAME>` (lowercase letters, digits and dashes), API base URL `<API_BASE_URL>`, and the operations to expose `<OPERATIONS>` (if I leave this out, propose a list).

Steps:

1. Find the API's routes, request and response shapes, and authentication scheme (an OpenAPI file, route handlers, or client code). List the operations you plan to expose, each marked `read` or `write`, with one sentence on what the agent would use it for. Mark anything that changes data, sends a message or costs money as `write`. Show me the list and wait for my answer.
2. Check that `node --version` reports v24. Then create the package and install dependencies:

   ```sh
   caplo tool init tools/<PACKAGE_NAME> --type mcp
   cd tools/<PACKAGE_NAME>
   npm install
   ```

3. In `src/server.ts`, register one tool per operation with `server.registerTool`. Tool names are lowercase with underscores (for example `get_order`, `cancel_order`). For each tool:
   - Write a description that says what it does and when to use it.
   - Give every input a description; use enums, patterns and length limits; keep inputs to what the model can know.
   - Define an `outputSchema` and return `structuredContent` with only the fields an agent needs, mapped explicitly from the API response.
   - Get secrets with `context(extra).secrets.get("<SECRET_NAME>")` and pass `signal` to every `fetch`.
   - For write tools, send `idempotencyKey` from the context to the API (as an `Idempotency-Key` header if the API supports it). Throw on any response you cannot interpret, so the outcome counts as unknown rather than failed.
   Keep `capabilities: { logging: {} }` on the server and log with `context(extra).log`, never `console.log`, and never log secrets or personal data.
4. Edit `caplo.yaml`: one `tools` entry per tool with `effect` and `timeoutSeconds` (1 to 30); `confirmation: required` on every write tool; `egress` with the API's exact host names (no scheme or path); `secrets` with the names the code reads, such as `<SECRET_NAME>`. Remove the template's example tools, fixtures and secret.
5. Update `src/stdio.ts` so `serveStdio` lists the same secret names.
6. Write one fixture per read tool in `tests/`, plus one for an expected error such as an unknown ID. Only use fixture `secrets` values that I give you for a test or sandbox environment; if I give none, ask me.
7. Run `caplo tool test` and fix every failure. Then ask me before running `caplo tool test --remote`, which pushes the package as a workspace draft and runs the fixtures on Caplo with the egress list enforced. Fix any `egress denied` line by correcting the `egress` list.

Verify: `caplo tool test` passes, `caplo tool test --remote` passes with no `egress denied` lines, and every tool has an `effect` that matches what it does.

Rules:

- Never write a secret value into code, `caplo.yaml`, fixtures, commit messages or this chat. Tell me to set values myself with `caplo tool secret set <SECRET_NAME>` (it prompts without echoing) or to bind a workspace secret with `caplo tool secret bind <SECRET_NAME> <workspace-secret>`.
- Do not run `caplo tool publish`, `caplo tool push` or `caplo publish` without my explicit approval. Publishing creates a version agents can pin.
- Do not mark a write tool `confirmation: none` unless I ask for it.
- Keep the package's existing lockfile in the commit; the build installs only what it lists.
