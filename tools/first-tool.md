# Build your first tool

> Create a function package, run it locally, test it, then push and publish it with the CLI or in Tool Studio.

This page takes a one-tool function package from nothing to a published version an agent can use. The starter tool, `double_value`, doubles a number; replace its body with your own logic once the loop works.

## Before you start

* The **Owner**, **Admin** or **Developer** role in the workspace. These roles can create, build and publish tools.
* For the CLI path: the `caplo` CLI ([install it](/cli/install/)), signed in with `caplo auth login` and with a workspace selected with `caplo workspace use`. See [Sign in from the CLI](/cli/authentication/).
* For the CLI path: **Node.js 24** and npm. Tool packages run on Node 24, and `caplo tool test` refuses any other major version. Local tests run on macOS and Linux; on Windows, use WSL.

## Create, test and publish

**CLI**

1. **Create the package.** `caplo tool init` writes a package from the SDK template into a new or empty directory and names it after the directory:

   ```plaintext
   caplo tool init double-value --type function
   cd double-value
   ```

   You get `caplo.yaml`, `package.json`, `tsconfig.json`, `src/tool.ts` (the tool), `src/stdio.ts` (runs it for local MCP clients) and `tests/double-value.json` (a fixture). Use `--type mcp` for an MCP package with several tools; see [Define tools and use the call context](/tools/define-tool-and-context/).

2. **Install dependencies.**

   ```plaintext
   npm install
   ```

   This also writes `package-lock.json`. Keep it and commit it: Caplo installs exactly what the lockfile lists, and a push without a lockfile fails to build. `yarn.lock` and `pnpm-lock.yaml` also work.

3. **Look at the tool.** `src/tool.ts` exports one `defineTool`:

   ```plaintext
   import { defineTool } from "@caplo/tools";


   export default defineTool<{ value: number }, { result: number }>({
     name: "double_value",
     description: "Doubles a number",
     inputSchema: { type: "object", properties: { value: { type: "number" } }, required: ["value"] },
     outputSchema: { type: "object", properties: { result: { type: "number" } }, required: ["result"] },
     async handler({ value }, { log }) {
       log.info("doubling", { value });
       return { result: value * 2 };
     },
   });
   ```

   `caplo.yaml` names the package and sets the tool’s policy: `effect: read` and `timeoutSeconds: 5`.

4. **Call it by hand.** `caplo tool dev` opens MCP Inspector (started with `npx`) connected to your package, so you can list and call the tool:

   ```plaintext
   caplo tool dev
   ```

   Secrets your `caplo.yaml` declares are read from environment variables of the same name. To use the package from another local MCP client instead, run `caplo tool dev --no-inspector`, which speaks MCP on standard input and output.

5. **Run the fixtures.** `caplo tool test` bundles the package the way Caplo’s builder does, checks `caplo.yaml` against the tools the code lists, and runs every fixture in `tests/`:

   ```plaintext
   caplo tool test
   ```

   ```plaintext
   bundle 7.5 KB (d64251e71094, esbuild 0.28.2)
   tool double_value__double_value (read, 5s)
   capabilities subject-context/1 effect-outcome/1 operation-status/1
   server advertises subject-context/1 effect-outcome/1
   ok   tests/double-value.json (doubles 21)
   1 passed, 0 failed
   ```

   `double_value__double_value` is the name the model sees. See [Test tools with fixtures](/tools/testing/).

6. **Push and build.** `caplo tool push` uploads the folder as the package’s workspace draft (creating the package on the first push), builds it, and streams the build log. `node_modules`, `.git` and anything your `.gitignore` files ignore are left out.

   ```plaintext
   caplo tool push
   ```

   The build installs from your lockfile, bundles the code, runs safety checks and lists the tools with no network access. It ends with `Build <id> succeeded` and the tools it found, or with an error code such as `lockfile_required` or `tool_policy_missing`.

7. **Publish.** `caplo tool publish` turns the latest succeeded build into the next version:

   ```plaintext
   caplo tool publish
   ```

   ```plaintext
   Published double-value version 1 from build <BUILD_ID>
     double_value__double_value (read, 5s)
   ```

**Tool Studio**

Tool Studio is a browser editor at [studio.caplo.si](https://studio.caplo.si) for writing, building, testing and publishing tool packages without installing anything.

1. In the console, open **Tools**, select **Add tools**, then **Create package**. Studio opens on this workspace in a new tab; sign in if it asks.

2. In the **Packages** view, select **Create Package**. Choose **Function** (one tool written as a function) or **MCP server** (several tools in one server), then enter a package name such as `double-value`: a lowercase letter, then lowercase letters, digits or dashes.

3. Studio creates the package from the same template as the CLI. Edit `src/tool.ts` and `caplo.yaml`. Your edits are saved to the package’s workspace draft. When you save `package.json`, Studio resolves the dependencies and updates the lockfile for you.

4. In the **Tools** view, select **Build**. When the build succeeds, Studio offers **Run Tests** and **Publish**. To call a tool by hand, select **Call Tool** on it, fill in the arguments and select **Send Call**.

5. Select **Run Fixture Tests** to run the files in `tests/`.

6. In the **Versions** view, select **Publish** and confirm. Studio builds the draft first if it changed since the last build.

You can return to a package from the console: **Tools** lists each package with **Open in Studio**.

## Give the tool to an agent

A published tool appears on every agent’s **Tools & actions** tab, grouped under its package. Select it there, or list it in agent YAML by package and tool name:

```plaintext
tools:
  - double-value/double_value
```

Then publish the agent. Its release pins version 1 of `double-value`; later versions reach the agent when you publish the agent again. See [Give an agent tools](/agents/tools/).

Tip

Each new push replaces the workspace draft and starts a new build. Publishing is a separate step, so you can push as often as you like without affecting agents.

## Next steps

* Replace the starter with real logic that calls your API: [Define tools and use the call context](/tools/define-tool-and-context/) and [Secrets and network access](/tools/secrets-and-egress/).
* For tools that change data, read [Write tools safely](/tools/write-tools/) before you publish.

## Let an AI agent do it

If you already have a REST API, a coding agent can wrap it as a tool package with read and write tools, declared secrets and an egress list.

AI prompt

Wrap my REST API as a Caplo tool package

Builds an MCP tool package with read and write tools for an existing REST API, with declared secrets, an egress list and fixtures.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20turn%20the%20REST%20API%20in%20this%20repository%20\(or%20the%20one%20I%20describe\)%20into%20a%20Caplo%20tool%20package%20that%20agents%20can%20call.%20Read%20operations%20become%20%60read%60%20tools%2C%20operations%20that%20change%20data%20become%20%60write%60%20tools%20that%20the%20customer%20confirms.%20The%20package%20declares%20the%20secret%20names%20it%20needs%20and%20the%20exact%20hosts%20it%20calls.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ffirst-tool.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fdefine-tool-and-context.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fwrite-tools.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fsecrets-and-egress.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ftesting.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Fcaplo-yaml.md%0A%0AValues%20I%20supply%3A%20package%20name%20%60%3CPACKAGE_NAME%3E%60%20\(lowercase%20letters%2C%20digits%20and%20dashes\)%2C%20API%20base%20URL%20%60%3CAPI_BASE_URL%3E%60%2C%20and%20the%20operations%20to%20expose%20%60%3COPERATIONS%3E%60%20\(if%20I%20leave%20this%20out%2C%20propose%20a%20list\).%0A%0ASteps%3A%0A%0A1.%20Find%20the%20API's%20routes%2C%20request%20and%20response%20shapes%2C%20and%20authentication%20scheme%20\(an%20OpenAPI%20file%2C%20route%20handlers%2C%20or%20client%20code\).%20List%20the%20operations%20you%20plan%20to%20expose%2C%20each%20marked%20%60read%60%20or%20%60write%60%2C%20with%20one%20sentence%20on%20what%20the%20agent%20would%20use%20it%20for.%20Mark%20anything%20that%20changes%20data%2C%20sends%20a%20message%20or%20costs%20money%20as%20%60write%60.%20Show%20me%20the%20list%20and%20wait%20for%20my%20answer.%0A2.%20Check%20that%20%60node%20--version%60%20reports%20v24.%20Then%20create%20the%20package%20and%20install%20dependencies%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20tool%20init%20tools%2F%3CPACKAGE_NAME%3E%20--type%20mcp%0A%20%20%20cd%20tools%2F%3CPACKAGE_NAME%3E%0A%20%20%20npm%20install%0A%20%20%20%60%60%60%0A%0A3.%20In%20%60src%2Fserver.ts%60%2C%20register%20one%20tool%20per%20operation%20with%20%60server.registerTool%60.%20Tool%20names%20are%20lowercase%20with%20underscores%20\(for%20example%20%60get_order%60%2C%20%60cancel_order%60\).%20For%20each%20tool%3A%0A%20%20%20-%20Write%20a%20description%20that%20says%20what%20it%20does%20and%20when%20to%20use%20it.%0A%20%20%20-%20Give%20every%20input%20a%20description%3B%20use%20enums%2C%20patterns%20and%20length%20limits%3B%20keep%20inputs%20to%20what%20the%20model%20can%20know.%0A%20%20%20-%20Define%20an%20%60outputSchema%60%20and%20return%20%60structuredContent%60%20with%20only%20the%20fields%20an%20agent%20needs%2C%20mapped%20explicitly%20from%20the%20API%20response.%0A%20%20%20-%20Get%20secrets%20with%20%60context\(extra\).secrets.get\(%22%3CSECRET_NAME%3E%22\)%60%20and%20pass%20%60signal%60%20to%20every%20%60fetch%60.%0A%20%20%20-%20For%20write%20tools%2C%20send%20%60idempotencyKey%60%20from%20the%20context%20to%20the%20API%20\(as%20an%20%60Idempotency-Key%60%20header%20if%20the%20API%20supports%20it\).%20Throw%20on%20any%20response%20you%20cannot%20interpret%2C%20so%20the%20outcome%20counts%20as%20unknown%20rather%20than%20failed.%0A%20%20%20Keep%20%60capabilities%3A%20%7B%20logging%3A%20%7B%7D%20%7D%60%20on%20the%20server%20and%20log%20with%20%60context\(extra\).log%60%2C%20never%20%60console.log%60%2C%20and%20never%20log%20secrets%20or%20personal%20data.%0A4.%20Edit%20%60caplo.yaml%60%3A%20one%20%60tools%60%20entry%20per%20tool%20with%20%60effect%60%20and%20%60timeoutSeconds%60%20\(1%20to%2030\)%3B%20%60confirmation%3A%20required%60%20on%20every%20write%20tool%3B%20%60egress%60%20with%20the%20API's%20exact%20host%20names%20\(no%20scheme%20or%20path\)%3B%20%60secrets%60%20with%20the%20names%20the%20code%20reads%2C%20such%20as%20%60%3CSECRET_NAME%3E%60.%20Remove%20the%20template's%20example%20tools%2C%20fixtures%20and%20secret.%0A5.%20Update%20%60src%2Fstdio.ts%60%20so%20%60serveStdio%60%20lists%20the%20same%20secret%20names.%0A6.%20Write%20one%20fixture%20per%20read%20tool%20in%20%60tests%2F%60%2C%20plus%20one%20for%20an%20expected%20error%20such%20as%20an%20unknown%20ID.%20Only%20use%20fixture%20%60secrets%60%20values%20that%20I%20give%20you%20for%20a%20test%20or%20sandbox%20environment%3B%20if%20I%20give%20none%2C%20ask%20me.%0A7.%20Run%20%60caplo%20tool%20test%60%20and%20fix%20every%20failure.%20Then%20ask%20me%20before%20running%20%60caplo%20tool%20test%20--remote%60%2C%20which%20pushes%20the%20package%20as%20a%20workspace%20draft%20and%20runs%20the%20fixtures%20on%20Caplo%20with%20the%20egress%20list%20enforced.%20Fix%20any%20%60egress%20denied%60%20line%20by%20correcting%20the%20%60egress%60%20list.%0A%0AVerify%3A%20%60caplo%20tool%20test%60%20passes%2C%20%60caplo%20tool%20test%20--remote%60%20passes%20with%20no%20%60egress%20denied%60%20lines%2C%20and%20every%20tool%20has%20an%20%60effect%60%20that%20matches%20what%20it%20does.%0A%0ARules%3A%0A%0A-%20Never%20write%20a%20secret%20value%20into%20code%2C%20%60caplo.yaml%60%2C%20fixtures%2C%20commit%20messages%20or%20this%20chat.%20Tell%20me%20to%20set%20values%20myself%20with%20%60caplo%20tool%20secret%20set%20%3CSECRET_NAME%3E%60%20\(it%20prompts%20without%20echoing\)%20or%20to%20bind%20a%20workspace%20secret%20with%20%60caplo%20tool%20secret%20bind%20%3CSECRET_NAME%3E%20%3Cworkspace-secret%3E%60.%0A-%20Do%20not%20run%20%60caplo%20tool%20publish%60%2C%20%60caplo%20tool%20push%60%20or%20%60caplo%20publish%60%20without%20my%20explicit%20approval.%20Publishing%20creates%20a%20version%20agents%20can%20pin.%0A-%20Do%20not%20mark%20a%20write%20tool%20%60confirmation%3A%20none%60%20unless%20I%20ask%20for%20it.%0A-%20Keep%20the%20package's%20existing%20lockfile%20in%20the%20commit%3B%20the%20build%20installs%20only%20what%20it%20lists.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20turn%20the%20REST%20API%20in%20this%20repository%20\(or%20the%20one%20I%20describe\)%20into%20a%20Caplo%20tool%20package%20that%20agents%20can%20call.%20Read%20operations%20become%20%60read%60%20tools%2C%20operations%20that%20change%20data%20become%20%60write%60%20tools%20that%20the%20customer%20confirms.%20The%20package%20declares%20the%20secret%20names%20it%20needs%20and%20the%20exact%20hosts%20it%20calls.%0A%0ARead%20these%20pages%20first%3A%0A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ffirst-tool.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fdefine-tool-and-context.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fwrite-tools.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Fsecrets-and-egress.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Ftools%2Ftesting.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Freference%2Fcaplo-yaml.md%0A%0AValues%20I%20supply%3A%20package%20name%20%60%3CPACKAGE_NAME%3E%60%20\(lowercase%20letters%2C%20digits%20and%20dashes\)%2C%20API%20base%20URL%20%60%3CAPI_BASE_URL%3E%60%2C%20and%20the%20operations%20to%20expose%20%60%3COPERATIONS%3E%60%20\(if%20I%20leave%20this%20out%2C%20propose%20a%20list\).%0A%0ASteps%3A%0A%0A1.%20Find%20the%20API's%20routes%2C%20request%20and%20response%20shapes%2C%20and%20authentication%20scheme%20\(an%20OpenAPI%20file%2C%20route%20handlers%2C%20or%20client%20code\).%20List%20the%20operations%20you%20plan%20to%20expose%2C%20each%20marked%20%60read%60%20or%20%60write%60%2C%20with%20one%20sentence%20on%20what%20the%20agent%20would%20use%20it%20for.%20Mark%20anything%20that%20changes%20data%2C%20sends%20a%20message%20or%20costs%20money%20as%20%60write%60.%20Show%20me%20the%20list%20and%20wait%20for%20my%20answer.%0A2.%20Check%20that%20%60node%20--version%60%20reports%20v24.%20Then%20create%20the%20package%20and%20install%20dependencies%3A%0A%0A%20%20%20%60%60%60sh%0A%20%20%20caplo%20tool%20init%20tools%2F%3CPACKAGE_NAME%3E%20--type%20mcp%0A%20%20%20cd%20tools%2F%3CPACKAGE_NAME%3E%0A%20%20%20npm%20install%0A%20%20%20%60%60%60%0A%0A3.%20In%20%60src%2Fserver.ts%60%2C%20register%20one%20tool%20per%20operation%20with%20%60server.registerTool%60.%20Tool%20names%20are%20lowercase%20with%20underscores%20\(for%20example%20%60get_order%60%2C%20%60cancel_order%60\).%20For%20each%20tool%3A%0A%20%20%20-%20Write%20a%20description%20that%20says%20what%20it%20does%20and%20when%20to%20use%20it.%0A%20%20%20-%20Give%20every%20input%20a%20description%3B%20use%20enums%2C%20patterns%20and%20length%20limits%3B%20keep%20inputs%20to%20what%20the%20model%20can%20know.%0A%20%20%20-%20Define%20an%20%60outputSchema%60%20and%20return%20%60structuredContent%60%20with%20only%20the%20fields%20an%20agent%20needs%2C%20mapped%20explicitly%20from%20the%20API%20response.%0A%20%20%20-%20Get%20secrets%20with%20%60context\(extra\).secrets.get\(%22%3CSECRET_NAME%3E%22\)%60%20and%20pass%20%60signal%60%20to%20every%20%60fetch%60.%0A%20%20%20-%20For%20write%20tools%2C%20send%20%60idempotencyKey%60%20from%20the%20context%20to%20the%20API%20\(as%20an%20%60Idempotency-Key%60%20header%20if%20the%20API%20supports%20it\).%20Throw%20on%20any%20response%20you%20cannot%20interpret%2C%20so%20the%20outcome%20counts%20as%20unknown%20rather%20than%20failed.%0A%20%20%20Keep%20%60capabilities%3A%20%7B%20logging%3A%20%7B%7D%20%7D%60%20on%20the%20server%20and%20log%20with%20%60context\(extra\).log%60%2C%20never%20%60console.log%60%2C%20and%20never%20log%20secrets%20or%20personal%20data.%0A4.%20Edit%20%60caplo.yaml%60%3A%20one%20%60tools%60%20entry%20per%20tool%20with%20%60effect%60%20and%20%60timeoutSeconds%60%20\(1%20to%2030\)%3B%20%60confirmation%3A%20required%60%20on%20every%20write%20tool%3B%20%60egress%60%20with%20the%20API's%20exact%20host%20names%20\(no%20scheme%20or%20path\)%3B%20%60secrets%60%20with%20the%20names%20the%20code%20reads%2C%20such%20as%20%60%3CSECRET_NAME%3E%60.%20Remove%20the%20template's%20example%20tools%2C%20fixtures%20and%20secret.%0A5.%20Update%20%60src%2Fstdio.ts%60%20so%20%60serveStdio%60%20lists%20the%20same%20secret%20names.%0A6.%20Write%20one%20fixture%20per%20read%20tool%20in%20%60tests%2F%60%2C%20plus%20one%20for%20an%20expected%20error%20such%20as%20an%20unknown%20ID.%20Only%20use%20fixture%20%60secrets%60%20values%20that%20I%20give%20you%20for%20a%20test%20or%20sandbox%20environment%3B%20if%20I%20give%20none%2C%20ask%20me.%0A7.%20Run%20%60caplo%20tool%20test%60%20and%20fix%20every%20failure.%20Then%20ask%20me%20before%20running%20%60caplo%20tool%20test%20--remote%60%2C%20which%20pushes%20the%20package%20as%20a%20workspace%20draft%20and%20runs%20the%20fixtures%20on%20Caplo%20with%20the%20egress%20list%20enforced.%20Fix%20any%20%60egress%20denied%60%20line%20by%20correcting%20the%20%60egress%60%20list.%0A%0AVerify%3A%20%60caplo%20tool%20test%60%20passes%2C%20%60caplo%20tool%20test%20--remote%60%20passes%20with%20no%20%60egress%20denied%60%20lines%2C%20and%20every%20tool%20has%20an%20%60effect%60%20that%20matches%20what%20it%20does.%0A%0ARules%3A%0A%0A-%20Never%20write%20a%20secret%20value%20into%20code%2C%20%60caplo.yaml%60%2C%20fixtures%2C%20commit%20messages%20or%20this%20chat.%20Tell%20me%20to%20set%20values%20myself%20with%20%60caplo%20tool%20secret%20set%20%3CSECRET_NAME%3E%60%20\(it%20prompts%20without%20echoing\)%20or%20to%20bind%20a%20workspace%20secret%20with%20%60caplo%20tool%20secret%20bind%20%3CSECRET_NAME%3E%20%3Cworkspace-secret%3E%60.%0A-%20Do%20not%20run%20%60caplo%20tool%20publish%60%2C%20%60caplo%20tool%20push%60%20or%20%60caplo%20publish%60%20without%20my%20explicit%20approval.%20Publishing%20creates%20a%20version%20agents%20can%20pin.%0A-%20Do%20not%20mark%20a%20write%20tool%20%60confirmation%3A%20none%60%20unless%20I%20ask%20for%20it.%0A-%20Keep%20the%20package's%20existing%20lockfile%20in%20the%20commit%3B%20the%20build%20installs%20only%20what%20it%20lists.)

Show prompt

````
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
````
