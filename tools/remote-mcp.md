# Connect a remote MCP server

> Check an MCP server you already run, add it with its credential, review the tools it lists, and publish them for agents.

If your tools already exist behind an MCP endpoint, yours or a vendor’s, connect the server instead of rebuilding them as a tool package. Caplo calls the server over HTTPS with a credential you configure, and only for the tools you review and publish.

## How it works

* **Workspace credential.** Caplo stores one credential per server and uses it for every conversation in the workspace. Agents can reach anything that credential can, so give it the narrowest access that works.
* **Review before use.** Caplo lists the server’s tools, but none reaches an agent until you enable it, classify it as `read` or `write`, and publish. Write tools ask the customer to confirm by default, as with [tool packages](/tools/write-tools/).
* **Pinned contracts.** Publishing creates a numbered version that pins each enabled tool’s description and schemas. Agents pin that version when you publish them.
* **Change detection.** Caplo checks each server about every 15 minutes. If a published tool’s schema changes or the tool disappears, the server shows **Tools changed** and Caplo stops calling the changed tools until you review the new list and publish again.
* **Idempotency.** Calls to write tools carry the action’s idempotency key in the request’s `_meta` as `io.caplo/idempotencyKey`, so your server can apply each confirmed write once.
* **Network.** Calls leave through Caplo’s egress. Servers on private, loopback or link-local addresses are not reachable. Responses must be under 256 KiB, and each tool has a timeout of 1 to 30 seconds (20 by default).

The server’s name is permanent, unique among the workspace’s packages and servers, and prefixes its tools: a `search` tool on server `crm` is `crm/search` in agent YAML and `crm__search` to the model.

## Authentication

| Method                   | CLI `--auth`                             | Use it when                                                                                              |
| ------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| No auth                  | `none`                                   | The server is public.                                                                                    |
| Bearer token             | `bearer`                                 | The server takes a static token as `Authorization: Bearer`.                                              |
| Custom header            | `header`                                 | The server takes an API key in a header you name, such as `X-API-Key`.                                   |
| OAuth, a user signs in   | `oauth` (grant `authorization_code`)     | The server uses OAuth with PKCE. A workspace member signs in once; Caplo stores and refreshes the token. |
| OAuth, the client itself | `oauth --oauth-grant client_credentials` | Machine-to-machine OAuth with a confidential client and its secret.                                      |

For OAuth, Caplo registers itself with the authorization server where the server allows it. Otherwise use a client an administrator registered: pass its client ID and secret, and add Caplo’s redirect URI (shown in the console, or by `caplo mcp get`) to the client’s allowed redirect URIs.

Tokens, header values and client secrets are write-only. Caplo stores them encrypted and never shows them again.

## Connect, review and publish

**Console**

1. Open **Connectors**, select **Add connector**, then **Custom connection (MCP)**.

2. **Server.** Enter the **Server URL**, for example `https://mcp.example.com/mcp`, and select **Check server**. Caplo reports whether the endpoint speaks MCP, how many tools it lists, and whether it asks for OAuth. Checking saves nothing. Leave **Transport** on **Detect automatically** unless you know the server only speaks one. Select **Continue**.

3. **Connection.** Enter a **Display name** and a **Name** (lowercase, permanent), then choose the **Authentication method**:

   * **Bearer token** or **Custom header**: paste the value.
   * **OAuth**: under **Who signs in**, choose **A user signs in** or **The client itself**. Choose **Register automatically**, or **Use a registered client** and enter its **Client ID** and, for a confidential client, its **Client secret**. Copy the **Redirect URI** into a registered client’s settings.

   Select **Save server**, or **Save and authorize** for OAuth, which sends you to the authorization server to sign in.

4. **Tools.** Caplo shows how many tools it discovered. Select **Review tools**.

5. In the review, enable each tool agents may use and set its **Effect** (**Read only** or **Writes data**), its **Confirmation** for writes (**Customer confirms** or **No confirmation**) and its **Timeout**. Select **Save review**, then the publish button, which names how many tools it publishes, such as **Publish 2 tools**.

The server’s row under **Custom connections (MCP)** on the **Connectors** page shows its status. Select **Manage** to see its authentication and how many tools are published, with **Connect** or **Reconnect** (OAuth), **Review tools** (or **Review changes**), **Check now**, **Edit** and **Remove**.

**CLI**

1. **Check the server.** Nothing is saved. Add `--bearer-stdin`, or `--header X-API-Key --value-stdin`, to check with a credential.

   ```plaintext
   caplo mcp check https://mcp.example.com/mcp
   ```

2. **Add it.** Give it a name and the authentication method. Secrets are read from standard input (a hidden prompt on a terminal) or from an environment variable, never from a flag value.

   ```plaintext
   # OAuth, a user signs in; Caplo registers itself where the server allows it
   caplo mcp add crm --url https://mcp.example.com/mcp --auth oauth --display-name "Customer CRM"


   # OAuth with a registered confidential client
   caplo mcp add crm --url https://mcp.example.com/mcp --auth oauth --client-id caplo --client-secret-stdin


   # OAuth, client credentials
   caplo mcp add crm --url https://mcp.example.com/mcp --auth oauth --oauth-grant client_credentials --client-id caplo --client-secret-env CRM_CLIENT_SECRET


   # A static token, or an API key header
   caplo mcp add crm --url https://mcp.example.com/mcp --auth bearer --secret-stdin
   caplo mcp add crm --url https://mcp.example.com/mcp --auth header --header-name X-API-Key --secret-env CRM_API_KEY
   ```

   Use `--scope` (repeatable) to request specific OAuth scopes and `--token-auth-method` if the token endpoint needs `client_secret_basic` or `client_secret_post`.

3. **Authorize (OAuth).** Open the printed URL in a browser signed in to the Caplo console; the console completes the authorization. `--open` opens it for you. The client credentials grant completes at once.

   ```plaintext
   caplo mcp connect crm --open
   ```

4. **Review the tools.** List them, then enable and classify the ones agents may use, by their remote name:

   ```plaintext
   caplo mcp tools crm
   caplo mcp review crm \
     --enable search_contacts=read \
     --enable create_note=write \
     --confirmation create_note=required \
     --timeout search_contacts=10
   ```

   `--enable` without `=read` or `=write` keeps the tool’s current effect or takes the one the server’s `readOnlyHint` suggests. Check it: hints are only suggestions. Tools you do not name keep their review; `--disable` turns one off.

5. **Publish.**

   ```plaintext
   caplo mcp publish crm
   ```

   ```plaintext
   Published crm version 1 with 2 tools
   ...
   Agent files use them as crm/<tool>
   ```

| Command                                  | Use                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `caplo mcp list`, `caplo mcp get <name>` | Status, authentication, last error, OAuth redirect URI and discovered tools.                                                         |
| `caplo mcp refresh <name>`               | Check the server now and refresh its tool list.                                                                                      |
| `caplo mcp update <name>`                | Change the URL, transport or credential. A new URL or authentication discards stored OAuth tokens, so run `caplo mcp connect` again. |
| `caplo mcp remove <name>`                | Remove the server. Its published tools stop working and its credentials are deleted.                                                 |

See the [`caplo mcp` reference](/reference/cli/mcp/).

Then select the tools on an agent and publish the agent. See [Give an agent tools](/agents/tools/).

## Statuses

| Status                  | Meaning and fix                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connected**           | Working.                                                                                                                                                                     |
| **Needs authorization** | OAuth was never completed, a token was rejected or could not be refreshed, or the server needs more scopes. Select **Connect** or **Reconnect**, or run `caplo mcp connect`. |
| **Degraded**            | A server that worked before is timing out or failing. Caplo keeps checking.                                                                                                  |
| **Tools changed**       | A published tool changed or disappeared on the server. The changed tools are blocked until you review the list and publish again.                                            |
| **Error**               | The endpoint is not an MCP server, is unreachable, or refused the destination. Fix it with **Edit** or `caplo mcp update`, then check again.                                 |

Caution

**Remove** deletes the server’s credentials and stops its published tools in every agent that uses them. To pause a single agent’s use, remove the tools from that agent and publish it instead.

## Let an AI agent do it

AI prompt

Connect a remote MCP server to Caplo

Checks an MCP server, adds it to the workspace with the right authentication, reviews its tools and prepares them for publishing.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20connect%20the%20remote%20MCP%20server%20at%20%60%3CSERVER_URL%3E%60%20to%20my%20Caplo%20workspace%20as%20%60%3CSERVER_NAME%3E%60%20\(lowercase%20letters%2C%20digits%20and%20dashes%3B%20permanent\)%2C%20review%20its%20tools%20so%20only%20the%20ones%20I%20want%20are%20enabled%20with%20the%20correct%20effect%2C%20and%20publish%20them%20once%20I%20approve.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fremote-mcp.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fwrite-tools.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fagents%2Ftools.md%0A%0ASteps%3A%0A%0A1.%20Confirm%20the%20CLI%20is%20signed%20in%20to%20the%20right%20workspace%20with%20%60caplo%20auth%20status%60.%0A2.%20Check%20the%20server%20without%20saving%20anything%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20mcp%20check%20%3CSERVER_URL%3E%0A%20%20%20%60%60%60%0A%0A%20%20%20Report%20whether%20it%20is%20reachable%2C%20its%20protocol%20and%20transport%2C%20how%20many%20tools%20it%20lists%2C%20and%20whether%20it%20requires%20OAuth.%20If%20it%20requires%20a%20token%20or%20API%20key%20header%2C%20ask%20me%20which.%0A3.%20Add%20it%20with%20the%20authentication%20the%20check%20suggests.%20Read%20any%20secret%20from%20standard%20input%20or%20an%20environment%20variable%20that%20I%20set%3B%20never%20ask%20me%20to%20paste%20it%20into%20this%20chat.%0A%0A%20%20%20%60%60%60sh%0A%20%20%20%23%20OAuth%20where%20a%20person%20signs%20in%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20oauth%0A%20%20%20%23%20or%20a%20static%20token%20%2F%20API%20key%20header%2C%20read%20from%20an%20environment%20variable%20I%20export%20myself%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20bearer%20--secret-env%20%3CTOKEN_ENV_VAR%3E%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20header%20--header-name%20%3CHEADER_NAME%3E%20--secret-env%20%3CTOKEN_ENV_VAR%3E%0A%20%20%20%60%60%60%0A%0A%20%20%20If%20the%20authorization%20server%20refuses%20automatic%20client%20registration%2C%20tell%20me%3B%20I%20will%20create%20a%20client%20and%20give%20you%20its%20ID%2C%20and%20run%20%60caplo%20mcp%20get%20%3CSERVER_NAME%3E%60%20to%20show%20me%20the%20redirect%20URI%20to%20register.%0A4.%20For%20OAuth%20with%20a%20person%20signing%20in%2C%20run%20%60caplo%20mcp%20connect%20%3CSERVER_NAME%3E%60%20and%20tell%20me%20to%20open%20the%20printed%20URL%20in%20a%20browser%20where%20I%20am%20signed%20in%20to%20the%20Caplo%20console.%20Wait%20for%20it%20to%20finish.%0A5.%20List%20the%20tools%20with%20%60caplo%20mcp%20tools%20%3CSERVER_NAME%3E%60.%20Propose%20which%20to%20enable%2C%20each%20with%20an%20effect%3A%20%60read%60%20only%20if%20it%20cannot%20change%20anything%3B%20%60write%60%20for%20anything%20that%20creates%2C%20updates%2C%20deletes%2C%20sends%20or%20charges.%20Do%20not%20trust%20the%20server's%20%60readOnlyHint%60%20alone%3B%20read%20each%20description%20and%20schema.%20Propose%20a%20timeout%20\(1%20to%2030%20seconds\)%20where%20the%20default%20of%2020%20does%20not%20fit.%20Show%20me%20the%20proposal%20and%20wait.%0A6.%20Apply%20the%20review%20I%20approve%2C%20for%20example%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20mcp%20review%20%3CSERVER_NAME%3E%20--enable%20%3CREAD_TOOL%3E%3Dread%20--enable%20%3CWRITE_TOOL%3E%3Dwrite%20--confirmation%20%3CWRITE_TOOL%3E%3Drequired%20--timeout%20%3CREAD_TOOL%3E%3D10%0A%20%20%20%60%60%60%0A%0A7.%20Ask%20me%20before%20publishing.%20When%20I%20approve%2C%20run%20%60caplo%20mcp%20publish%20%3CSERVER_NAME%3E%60%20and%20tell%20me%20the%20agent%20YAML%20names%20it%20prints%20\(%60%3CSERVER_NAME%3E%2F%3Ctool%3E%60\).%0A%0AVerify%3A%20%60caplo%20mcp%20get%20%3CSERVER_NAME%3E%60%20shows%20status%20%60connected%60%2C%20a%20published%20version%2C%20and%20only%20the%20tools%20I%20approved%20enabled.%0A%0ARules%3A%0A%0A-%20Never%20print%2C%20log%20or%20store%20a%20token%2C%20header%20value%20or%20client%20secret%2C%20and%20never%20put%20one%20in%20a%20command%20line%20argument%2C%20file%20or%20this%20chat.%0A-%20Keep%20%60confirmation%60%20required%20for%20every%20write%20tool%20unless%20I%20explicitly%20ask%20otherwise.%0A-%20Do%20not%20run%20%60caplo%20mcp%20publish%60%2C%20%60caplo%20mcp%20remove%60%20or%20%60caplo%20mcp%20update%60%20without%20my%20approval.%0A-%20Remember%20that%20the%20credential%20is%20shared%20by%20every%20conversation%20in%20the%20workspace%3B%20point%20out%20if%20the%20server's%20credential%20has%20broader%20access%20than%20these%20tools%20need.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20connect%20the%20remote%20MCP%20server%20at%20%60%3CSERVER_URL%3E%60%20to%20my%20Caplo%20workspace%20as%20%60%3CSERVER_NAME%3E%60%20\(lowercase%20letters%2C%20digits%20and%20dashes%3B%20permanent\)%2C%20review%20its%20tools%20so%20only%20the%20ones%20I%20want%20are%20enabled%20with%20the%20correct%20effect%2C%20and%20publish%20them%20once%20I%20approve.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fremote-mcp.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fwrite-tools.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fagents%2Ftools.md%0A%0ASteps%3A%0A%0A1.%20Confirm%20the%20CLI%20is%20signed%20in%20to%20the%20right%20workspace%20with%20%60caplo%20auth%20status%60.%0A2.%20Check%20the%20server%20without%20saving%20anything%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20mcp%20check%20%3CSERVER_URL%3E%0A%20%20%20%60%60%60%0A%0A%20%20%20Report%20whether%20it%20is%20reachable%2C%20its%20protocol%20and%20transport%2C%20how%20many%20tools%20it%20lists%2C%20and%20whether%20it%20requires%20OAuth.%20If%20it%20requires%20a%20token%20or%20API%20key%20header%2C%20ask%20me%20which.%0A3.%20Add%20it%20with%20the%20authentication%20the%20check%20suggests.%20Read%20any%20secret%20from%20standard%20input%20or%20an%20environment%20variable%20that%20I%20set%3B%20never%20ask%20me%20to%20paste%20it%20into%20this%20chat.%0A%0A%20%20%20%60%60%60sh%0A%20%20%20%23%20OAuth%20where%20a%20person%20signs%20in%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20oauth%0A%20%20%20%23%20or%20a%20static%20token%20%2F%20API%20key%20header%2C%20read%20from%20an%20environment%20variable%20I%20export%20myself%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20bearer%20--secret-env%20%3CTOKEN_ENV_VAR%3E%0A%20%20%20caplo%20mcp%20add%20%3CSERVER_NAME%3E%20--url%20%3CSERVER_URL%3E%20--auth%20header%20--header-name%20%3CHEADER_NAME%3E%20--secret-env%20%3CTOKEN_ENV_VAR%3E%0A%20%20%20%60%60%60%0A%0A%20%20%20If%20the%20authorization%20server%20refuses%20automatic%20client%20registration%2C%20tell%20me%3B%20I%20will%20create%20a%20client%20and%20give%20you%20its%20ID%2C%20and%20run%20%60caplo%20mcp%20get%20%3CSERVER_NAME%3E%60%20to%20show%20me%20the%20redirect%20URI%20to%20register.%0A4.%20For%20OAuth%20with%20a%20person%20signing%20in%2C%20run%20%60caplo%20mcp%20connect%20%3CSERVER_NAME%3E%60%20and%20tell%20me%20to%20open%20the%20printed%20URL%20in%20a%20browser%20where%20I%20am%20signed%20in%20to%20the%20Caplo%20console.%20Wait%20for%20it%20to%20finish.%0A5.%20List%20the%20tools%20with%20%60caplo%20mcp%20tools%20%3CSERVER_NAME%3E%60.%20Propose%20which%20to%20enable%2C%20each%20with%20an%20effect%3A%20%60read%60%20only%20if%20it%20cannot%20change%20anything%3B%20%60write%60%20for%20anything%20that%20creates%2C%20updates%2C%20deletes%2C%20sends%20or%20charges.%20Do%20not%20trust%20the%20server's%20%60readOnlyHint%60%20alone%3B%20read%20each%20description%20and%20schema.%20Propose%20a%20timeout%20\(1%20to%2030%20seconds\)%20where%20the%20default%20of%2020%20does%20not%20fit.%20Show%20me%20the%20proposal%20and%20wait.%0A6.%20Apply%20the%20review%20I%20approve%2C%20for%20example%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20mcp%20review%20%3CSERVER_NAME%3E%20--enable%20%3CREAD_TOOL%3E%3Dread%20--enable%20%3CWRITE_TOOL%3E%3Dwrite%20--confirmation%20%3CWRITE_TOOL%3E%3Drequired%20--timeout%20%3CREAD_TOOL%3E%3D10%0A%20%20%20%60%60%60%0A%0A7.%20Ask%20me%20before%20publishing.%20When%20I%20approve%2C%20run%20%60caplo%20mcp%20publish%20%3CSERVER_NAME%3E%60%20and%20tell%20me%20the%20agent%20YAML%20names%20it%20prints%20\(%60%3CSERVER_NAME%3E%2F%3Ctool%3E%60\).%0A%0AVerify%3A%20%60caplo%20mcp%20get%20%3CSERVER_NAME%3E%60%20shows%20status%20%60connected%60%2C%20a%20published%20version%2C%20and%20only%20the%20tools%20I%20approved%20enabled.%0A%0ARules%3A%0A%0A-%20Never%20print%2C%20log%20or%20store%20a%20token%2C%20header%20value%20or%20client%20secret%2C%20and%20never%20put%20one%20in%20a%20command%20line%20argument%2C%20file%20or%20this%20chat.%0A-%20Keep%20%60confirmation%60%20required%20for%20every%20write%20tool%20unless%20I%20explicitly%20ask%20otherwise.%0A-%20Do%20not%20run%20%60caplo%20mcp%20publish%60%2C%20%60caplo%20mcp%20remove%60%20or%20%60caplo%20mcp%20update%60%20without%20my%20approval.%0A-%20Remember%20that%20the%20credential%20is%20shared%20by%20every%20conversation%20in%20the%20workspace%3B%20point%20out%20if%20the%20server's%20credential%20has%20broader%20access%20than%20these%20tools%20need.)

Show prompt

````
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
````
