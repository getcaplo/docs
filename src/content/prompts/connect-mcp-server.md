---
title: Connect a remote MCP server to Caplo
description: Checks an MCP server, adds it to the workspace with the right authentication, reviews its tools and prepares them for publishing.
---
Goal: connect the remote MCP server at `<SERVER_URL>` to my Caplo workspace as `<SERVER_NAME>` (lowercase letters, digits and dashes; permanent), review its tools so only the ones I want are enabled with the correct effect, and publish them once I approve.

Read these pages first:

- https://docs.caplo.si/tools/remote-mcp.md
- https://docs.caplo.si/tools/write-tools.md
- https://docs.caplo.si/agents/tools.md

Steps:

1. Confirm the CLI is signed in to the right workspace with `caplo auth status`.
2. Check the server without saving anything:

   ```sh
   caplo mcp check <SERVER_URL>
   ```

   Report whether it is reachable, its protocol and transport, how many tools it lists, and whether it requires OAuth. If it requires a token or API key header, ask me which.
3. Add it with the authentication the check suggests. Read any secret from standard input or an environment variable that I set; never ask me to paste it into this chat.

   ```sh
   # OAuth where a person signs in
   caplo mcp add <SERVER_NAME> --url <SERVER_URL> --auth oauth
   # or a static token / API key header, read from an environment variable I export myself
   caplo mcp add <SERVER_NAME> --url <SERVER_URL> --auth bearer --secret-env <TOKEN_ENV_VAR>
   caplo mcp add <SERVER_NAME> --url <SERVER_URL> --auth header --header-name <HEADER_NAME> --secret-env <TOKEN_ENV_VAR>
   ```

   If the authorization server refuses automatic client registration, tell me; I will create a client and give you its ID, and run `caplo mcp get <SERVER_NAME>` to show me the redirect URI to register.
4. For OAuth with a person signing in, run `caplo mcp connect <SERVER_NAME>` and tell me to open the printed URL in a browser where I am signed in to the Caplo console. Wait for it to finish.
5. List the tools with `caplo mcp tools <SERVER_NAME>`. Propose which to enable, each with an effect: `read` only if it cannot change anything; `write` for anything that creates, updates, deletes, sends or charges. Do not trust the server's `readOnlyHint` alone; read each description and schema. Propose a timeout (1 to 30 seconds) where the default of 20 does not fit. Show me the proposal and wait.
6. Apply the review I approve, for example:

   ```sh
   caplo mcp review <SERVER_NAME> --enable <READ_TOOL>=read --enable <WRITE_TOOL>=write --confirmation <WRITE_TOOL>=required --timeout <READ_TOOL>=10
   ```

7. Ask me before publishing. When I approve, run `caplo mcp publish <SERVER_NAME>` and tell me the agent YAML names it prints (`<SERVER_NAME>/<tool>`).

Verify: `caplo mcp get <SERVER_NAME>` shows status `connected`, a published version, and only the tools I approved enabled.

Rules:

- Never print, log or store a token, header value or client secret, and never put one in a command line argument, file or this chat.
- Keep `confirmation` required for every write tool unless I explicitly ask otherwise.
- Do not run `caplo mcp publish`, `caplo mcp remove` or `caplo mcp update` without my approval.
- Remember that the credential is shared by every conversation in the workspace; point out if the server's credential has broader access than these tools need.
