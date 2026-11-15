# Build your first agent with the CLI

> Install the caplo CLI, scaffold a multi-agent project with tools, test it, and publish it from your terminal.

With the `caplo` CLI you keep agents and tool packages as files in your own repository and publish them from your terminal or CI. This quickstart scaffolds the **summit** example: an outdoor gear shop with a concierge agent that routes customers to three specialist agents, plus two tool packages with mock data.

## Before you start

* A Caplo account. If you have never signed in, sign in once at [app.caplo.si](https://app.caplo.si); Caplo creates a workspace for you.
* The **Owner** or **Admin** role in the workspace. The project pushes tool packages and agents and publishes both, which no other role can do alone. See [Workspaces and roles](/concepts/workspaces-and-roles/).
* Node.js 24 and npm, to install the tool packages’ dependencies.
* **Fast decisions** turned on for the workspace. The summit concierge uses fast routing to pick a specialist, and an agent with fast routing cannot publish without it. An Owner or Admin turns it on in the console under **Settings** > **AI providers** > **Fast decisions**. See [Fast decisions](/providers/fast-decisions/).

Note

If you only want a single agent without tools or fast routing, run `caplo init my-assistant` instead. It uses the **blank** template: one agent file and one eval case. The rest of the steps are the same, without the tool dependencies.

## Create and publish the project

1. **Install the CLI.** On macOS or Linux:

   ```plaintext
   brew install getcaplo/tap/caplo
   ```

   Or install it to `~/.local/bin` without Homebrew:

   ```plaintext
   curl -fsSL https://cli.caplo.si/install.sh | sh
   ```

   See [Install the CLI](/cli/install/) for Windows, version pinning and verifying signatures.

2. **Sign in.**

   ```plaintext
   caplo auth login
   ```

   Your browser opens to sign in; on a machine without a browser, use `caplo auth login --device`. If you belong to one workspace, the CLI selects it. Otherwise pick one:

   ```plaintext
   caplo workspace list
   caplo workspace use "<WORKSPACE_NAME>"
   ```

   `caplo auth status` shows who you are signed in as and which workspace commands act on.

3. **Scaffold the project.**

   ```plaintext
   caplo init shop --template summit
   cd shop
   ```

   The project name comes from the directory and becomes part of each agent’s name. You get:

   | Path                    | Contents                                                                                                                                                                                       |
   | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `caplo.yaml`            | The project file. It finds agents in `agents/*.yaml` and tool packages in `tools/*`.                                                                                                           |
   | `agents/concierge.yaml` | **Shop Concierge**, the entry agent. It routes to the three specialists with fast routing.                                                                                                     |
   | `agents/orders.yaml`    | **Shop Orders**: looks up orders and shipments and starts returns.                                                                                                                             |
   | `agents/gear.yaml`      | **Shop Gear**: recommends products and checks store stock.                                                                                                                                     |
   | `agents/returns.yaml`   | **Shop Returns**: answers return and warranty policy questions from its instructions.                                                                                                          |
   | `tools/order-desk/`     | An MCP server package with mock data: `lookup_order`, `track_shipment`, `search_products` and `check_return_eligibility` (reads) and `create_return` (a write that the customer must confirm). |
   | `tools/store-stock/`    | A function package with one read tool, `check_store_stock`.                                                                                                                                    |

   Every agent file includes eval cases. The agents use an Anthropic model; if your workspace cannot use it, change `model.name` in each agent file. See [Instructions and model](/agents/instructions-and-model/).

4. **Install the tool dependencies.** Each package needs its dependencies and a lockfile before Caplo can build it.

   ```plaintext
   (cd tools/order-desk && npm install)
   (cd tools/store-stock && npm install)
   ```

5. **Validate the project.** This runs offline and checks the files against the schemas, every tool and sub-agent reference, and the sub-agent links.

   ```plaintext
   caplo validate
   ```

   You can also run the tool packages’ test fixtures locally with `caplo test`.

6. **Push the drafts.**

   ```plaintext
   caplo push
   ```

   The CLI uploads and builds both tool packages, then saves each agent as a draft, specialists before the concierge. Nothing is published yet and no customer can reach the agents. Agents and packages are matched by name, so pushing again updates them.

7. **Chat with the draft.**

   ```plaintext
   caplo agent chat "Shop Concierge"
   ```

   Type one message per line, for example `Where is my order SO-1002?` or `Can you recommend a lightweight two-person tent?` Each reply shows the sub-agents and tools the turn used. When the agent proposes a write such as `create_return`, the CLI shows what it will do; type `/confirm` to approve it or `/cancel` to decline. Ordinary text never approves a write. End the chat with `/exit` or Ctrl-D.

   This is a private test conversation, but tools run for real. The summit tools only use mock data.

8. **Preview the publish.**

   ```plaintext
   caplo publish --dry-run
   ```

   The plan lists what will be published, in order: the tool packages, then the specialists, then the concierge, pinned to the specialists’ new releases.

9. **Publish.** A project’s first publish to a workspace needs `--yes`, after you have reviewed the plan:

   ```plaintext
   caplo publish --yes
   ```

   For each agent the CLI pins the exact tool versions, runs its eval cases, and creates a release. Every eval case must pass unless your workspace has made evals advisory. If a case fails, the CLI prints why and stops with exit code 3; fix the agent file or the case and run `caplo publish` again. Later publishes show the plan and ask before going ahead.

Your agents now have releases in the workspace, and you can see them under **Agents** in the console.

## Put it on your website

Channels are created in the console. Follow [Add an agent to your website](/get-started/add-to-your-website/) and choose **Shop Concierge** as the channel’s agent. After that, publish new releases with `caplo publish` and move the channel to them with `caplo channel deploy`; see [Agents and releases](/concepts/agents-and-releases/).

## Let an AI assistant do it

AI prompt

Scaffold and publish a Caplo agent project with the CLI

Creates a Caplo project from the summit template, pushes and tests it, then publishes it after asking you.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20create%20a%20Caplo%20project%20in%20this%20repository%20with%20the%20%60caplo%60%20CLI%2C%20push%20it%20to%20my%20workspace%20as%20drafts%2C%20test%20it%20in%20a%20chat%2C%20and%20publish%20it%20only%20after%20I%20approve.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fget-started%2Fquickstart-cli.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fconcepts%2Fagents-and-releases.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fconcepts%2Fevaluations.md%0A%0AInputs%3A%0A-%20Project%20directory%20and%20name%3A%20%3CPROJECT_NAME%3E%20\(lowercase%20letters%2C%20digits%20and%20hyphens%2C%20starting%20with%20a%20letter\)%0A-%20Template%3A%20%3CTEMPLATE%3E%20\(summit%20for%20the%20multi-agent%20example%20with%20tools%2C%20or%20blank%20for%20one%20agent\)%0A-%20Workspace%3A%20%3CWORKSPACE_NAME%3E%0A%0ASteps%3A%0A1.%20Check%20the%20CLI%20is%20installed%20with%20%60caplo%20version%60.%20If%20it%20is%20missing%2C%20tell%20me%20to%20install%20it%20\(%60brew%20install%20getcaplo%2Ftap%2Fcaplo%60\)%20and%20stop.%0A2.%20Run%20%60caplo%20auth%20status%60.%20If%20I%20am%20not%20signed%20in%2C%20ask%20me%20to%20run%20%60caplo%20auth%20login%60%20myself%2C%20then%20continue.%0A3.%20Run%20%60caplo%20workspace%20use%20%22%3CWORKSPACE_NAME%3E%22%60.%0A4.%20Run%20%60caplo%20init%20%3CPROJECT_NAME%3E%20--template%20%3CTEMPLATE%3E%60%2C%20then%20work%20inside%20%60%3CPROJECT_NAME%3E%60.%0A5.%20If%20the%20template%20is%20summit%2C%20run%20%60npm%20install%60%20in%20%60tools%2Forder-desk%60%20and%20in%20%60tools%2Fstore-stock%60.%20Keep%20the%20generated%20%60package-lock.json%60%20files.%0A6.%20Run%20%60caplo%20validate%60%20and%20fix%20any%20problem%20it%20reports%20in%20the%20files%20you%20created.%0A7.%20If%20the%20template%20is%20summit%2C%20run%20%60caplo%20test%60%20and%20report%20the%20fixture%20results.%0A8.%20Run%20%60caplo%20push%60.%20Report%20each%20tool%20package%20and%20agent%20it%20created%20or%20updated.%0A9.%20Chat%20with%20the%20entry%20agent%3A%20run%20%60caplo%20agent%20chat%20%22%3CENTRY_AGENT_NAME%3E%22%60%20\(for%20summit%2C%20the%20entry%20agent%20is%20the%20project%20title%20followed%20by%20Concierge%2C%20for%20example%20%22Shop%20Concierge%22%20for%20a%20project%20named%20shop%3B%20for%20blank%2C%20the%20title%20followed%20by%20Assistant\).%20Send%20two%20or%20three%20realistic%20customer%20messages%2C%20one%20per%20line%2C%20then%20%60%2Fexit%60.%20If%20the%20agent%20proposes%20a%20write%2C%20answer%20%60%2Fcancel%60%3B%20never%20%60%2Fconfirm%60%20without%20asking%20me.%0A10.%20Run%20%60caplo%20publish%20--dry-run%60%20and%20show%20me%20the%20plan.%0A11.%20Ask%20me%20whether%20to%20publish.%20Only%20after%20I%20say%20yes%2C%20run%20%60caplo%20publish%20--yes%60.%0A12.%20If%20publishing%20stops%20on%20a%20failed%20eval%20case%20\(exit%20code%203\)%2C%20show%20me%20the%20case%20and%20the%20grader's%20reason%2C%20propose%20a%20fix%20to%20the%20agent%20file%20or%20the%20case%2C%20and%20wait%20for%20my%20approval%20before%20changing%20anything%20or%20publishing%20again.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20passes.%0A-%20%60caplo%20agent%20list%60%20shows%20the%20project's%20agents%2C%20each%20with%20a%20release%20after%20publishing.%0A%0ARules%3A%0A-%20Never%20paste%2C%20print%20or%20commit%20secrets%2C%20tokens%20or%20API%20keys.%20Tool%20package%20secrets%20are%20set%20with%20%60caplo%20secret%20set%60%20and%20bound%20with%20%60caplo%20tool%20secret%20bind%60%2C%20never%20written%20into%20code%20or%20this%20chat.%0A-%20Never%20publish%2C%20revoke%20releases%20or%20deploy%20channels%20without%20asking%20me%20first.%0A-%20If%20publishing%20fails%20because%20Fast%20decisions%20are%20disabled%20for%20the%20workspace%2C%20tell%20me%3A%20an%20Owner%20or%20Admin%20must%20enable%20it%20in%20the%20console%20under%20Settings%2C%20AI%20providers.%20Do%20not%20remove%20fast%20routing%20to%20work%20around%20it%20unless%20I%20ask.%0A-%20Do%20not%20edit%20files%20outside%20the%20project%20directory.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20create%20a%20Caplo%20project%20in%20this%20repository%20with%20the%20%60caplo%60%20CLI%2C%20push%20it%20to%20my%20workspace%20as%20drafts%2C%20test%20it%20in%20a%20chat%2C%20and%20publish%20it%20only%20after%20I%20approve.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fget-started%2Fquickstart-cli.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fconcepts%2Fagents-and-releases.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fconcepts%2Fevaluations.md%0A%0AInputs%3A%0A-%20Project%20directory%20and%20name%3A%20%3CPROJECT_NAME%3E%20\(lowercase%20letters%2C%20digits%20and%20hyphens%2C%20starting%20with%20a%20letter\)%0A-%20Template%3A%20%3CTEMPLATE%3E%20\(summit%20for%20the%20multi-agent%20example%20with%20tools%2C%20or%20blank%20for%20one%20agent\)%0A-%20Workspace%3A%20%3CWORKSPACE_NAME%3E%0A%0ASteps%3A%0A1.%20Check%20the%20CLI%20is%20installed%20with%20%60caplo%20version%60.%20If%20it%20is%20missing%2C%20tell%20me%20to%20install%20it%20\(%60brew%20install%20getcaplo%2Ftap%2Fcaplo%60\)%20and%20stop.%0A2.%20Run%20%60caplo%20auth%20status%60.%20If%20I%20am%20not%20signed%20in%2C%20ask%20me%20to%20run%20%60caplo%20auth%20login%60%20myself%2C%20then%20continue.%0A3.%20Run%20%60caplo%20workspace%20use%20%22%3CWORKSPACE_NAME%3E%22%60.%0A4.%20Run%20%60caplo%20init%20%3CPROJECT_NAME%3E%20--template%20%3CTEMPLATE%3E%60%2C%20then%20work%20inside%20%60%3CPROJECT_NAME%3E%60.%0A5.%20If%20the%20template%20is%20summit%2C%20run%20%60npm%20install%60%20in%20%60tools%2Forder-desk%60%20and%20in%20%60tools%2Fstore-stock%60.%20Keep%20the%20generated%20%60package-lock.json%60%20files.%0A6.%20Run%20%60caplo%20validate%60%20and%20fix%20any%20problem%20it%20reports%20in%20the%20files%20you%20created.%0A7.%20If%20the%20template%20is%20summit%2C%20run%20%60caplo%20test%60%20and%20report%20the%20fixture%20results.%0A8.%20Run%20%60caplo%20push%60.%20Report%20each%20tool%20package%20and%20agent%20it%20created%20or%20updated.%0A9.%20Chat%20with%20the%20entry%20agent%3A%20run%20%60caplo%20agent%20chat%20%22%3CENTRY_AGENT_NAME%3E%22%60%20\(for%20summit%2C%20the%20entry%20agent%20is%20the%20project%20title%20followed%20by%20Concierge%2C%20for%20example%20%22Shop%20Concierge%22%20for%20a%20project%20named%20shop%3B%20for%20blank%2C%20the%20title%20followed%20by%20Assistant\).%20Send%20two%20or%20three%20realistic%20customer%20messages%2C%20one%20per%20line%2C%20then%20%60%2Fexit%60.%20If%20the%20agent%20proposes%20a%20write%2C%20answer%20%60%2Fcancel%60%3B%20never%20%60%2Fconfirm%60%20without%20asking%20me.%0A10.%20Run%20%60caplo%20publish%20--dry-run%60%20and%20show%20me%20the%20plan.%0A11.%20Ask%20me%20whether%20to%20publish.%20Only%20after%20I%20say%20yes%2C%20run%20%60caplo%20publish%20--yes%60.%0A12.%20If%20publishing%20stops%20on%20a%20failed%20eval%20case%20\(exit%20code%203\)%2C%20show%20me%20the%20case%20and%20the%20grader's%20reason%2C%20propose%20a%20fix%20to%20the%20agent%20file%20or%20the%20case%2C%20and%20wait%20for%20my%20approval%20before%20changing%20anything%20or%20publishing%20again.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20passes.%0A-%20%60caplo%20agent%20list%60%20shows%20the%20project's%20agents%2C%20each%20with%20a%20release%20after%20publishing.%0A%0ARules%3A%0A-%20Never%20paste%2C%20print%20or%20commit%20secrets%2C%20tokens%20or%20API%20keys.%20Tool%20package%20secrets%20are%20set%20with%20%60caplo%20secret%20set%60%20and%20bound%20with%20%60caplo%20tool%20secret%20bind%60%2C%20never%20written%20into%20code%20or%20this%20chat.%0A-%20Never%20publish%2C%20revoke%20releases%20or%20deploy%20channels%20without%20asking%20me%20first.%0A-%20If%20publishing%20fails%20because%20Fast%20decisions%20are%20disabled%20for%20the%20workspace%2C%20tell%20me%3A%20an%20Owner%20or%20Admin%20must%20enable%20it%20in%20the%20console%20under%20Settings%2C%20AI%20providers.%20Do%20not%20remove%20fast%20routing%20to%20work%20around%20it%20unless%20I%20ask.%0A-%20Do%20not%20edit%20files%20outside%20the%20project%20directory.)

Show prompt

```
Goal: create a Caplo project in this repository with the `caplo` CLI, push it to my workspace as drafts, test it in a chat, and publish it only after I approve.

Read these pages first:
- https://docs.caplo.si/get-started/quickstart-cli.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/concepts/agents-and-releases.md
- https://docs.caplo.si/concepts/evaluations.md

Inputs:
- Project directory and name: <PROJECT_NAME> (lowercase letters, digits and hyphens, starting with a letter)
- Template: <TEMPLATE> (summit for the multi-agent example with tools, or blank for one agent)
- Workspace: <WORKSPACE_NAME>

Steps:
1. Check the CLI is installed with `caplo version`. If it is missing, tell me to install it (`brew install getcaplo/tap/caplo`) and stop.
2. Run `caplo auth status`. If I am not signed in, ask me to run `caplo auth login` myself, then continue.
3. Run `caplo workspace use "<WORKSPACE_NAME>"`.
4. Run `caplo init <PROJECT_NAME> --template <TEMPLATE>`, then work inside `<PROJECT_NAME>`.
5. If the template is summit, run `npm install` in `tools/order-desk` and in `tools/store-stock`. Keep the generated `package-lock.json` files.
6. Run `caplo validate` and fix any problem it reports in the files you created.
7. If the template is summit, run `caplo test` and report the fixture results.
8. Run `caplo push`. Report each tool package and agent it created or updated.
9. Chat with the entry agent: run `caplo agent chat "<ENTRY_AGENT_NAME>"` (for summit, the entry agent is the project title followed by Concierge, for example "Shop Concierge" for a project named shop; for blank, the title followed by Assistant). Send two or three realistic customer messages, one per line, then `/exit`. If the agent proposes a write, answer `/cancel`; never `/confirm` without asking me.
10. Run `caplo publish --dry-run` and show me the plan.
11. Ask me whether to publish. Only after I say yes, run `caplo publish --yes`.
12. If publishing stops on a failed eval case (exit code 3), show me the case and the grader's reason, propose a fix to the agent file or the case, and wait for my approval before changing anything or publishing again.

Verify:
- `caplo validate` passes.
- `caplo agent list` shows the project's agents, each with a release after publishing.

Rules:
- Never paste, print or commit secrets, tokens or API keys. Tool package secrets are set with `caplo secret set` and bound with `caplo tool secret bind`, never written into code or this chat.
- Never publish, revoke releases or deploy channels without asking me first.
- If publishing fails because Fast decisions are disabled for the workspace, tell me: an Owner or Admin must enable it in the console under Settings, AI providers. Do not remove fast routing to work around it unless I ask.
- Do not edit files outside the project directory.
```

## Next steps

* How projects, selectors and environments work: [Projects](/cli/projects/) and [Environments](/cli/environments/).
* The day-to-day loop of editing, pushing and publishing: [CLI workflow](/cli/workflow/).
* Every field of an agent file: [Agent YAML](/agents/agent-yaml/) and the [agent YAML reference](/reference/agent-yaml/).
* Writing your own tool package: [Write your first tool](/tools/first-tool/).
* Commands used here: [`caplo init`](/reference/cli/project/#caplo-init), [`caplo push`](/reference/cli/project/#caplo-push), [`caplo publish`](/reference/cli/project/#caplo-publish), [`caplo agent chat`](/reference/cli/agent/#caplo-agent-chat).
