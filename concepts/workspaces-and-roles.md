# Workspaces and roles

> How workspaces separate your work, what each of the eight member roles can do, and how to switch between workspaces.

A workspace is the boundary for everything in Caplo. Agents, tool packages, knowledge bases, channels, conversations, secrets, provider keys, usage and billing all belong to one workspace, and nothing is shared between workspaces. Many teams use one workspace per environment, for example one for staging and one for production, and publish to each with the CLI’s [environments](/cli/environments/).

The first time you sign in to the console, Caplo creates a workspace for you and makes you its Owner. You can create more from the workspace menu, or with `caplo workspace create`.

## Members and roles

Each member has exactly one role in a workspace. Owners and Admins invite people from **Settings** > **Members** with **Invite member**: enter the email addresses, choose a **Role**, and select **Send invitations**. They can also limit invitations to **Allowed email domains** and change or remove members later. A workspace has exactly one Owner, and only the Owner can transfer ownership.

| What you can do                                                                            | Owner | Admin | Builder | Developer | Supervisor | Auditor | Viewer | Billing |
| ------------------------------------------------------------------------------------------ | ----- | ----- | ------- | --------- | ---------- | ------- | ------ | ------- |
| Create, edit and test agents; manage knowledge bases and their files                       | Yes   | Yes   | Yes     |           |            |         |        |         |
| Publish agents                                                                             | Yes   | Yes   |         |           |            |         |        |         |
| Build and publish tool packages                                                            | Yes   | Yes   |         | Yes       |            |         |        |         |
| Manage workspace secrets and bind them to tools                                            | Yes   | Yes   |         |           |            |         |        |         |
| Configure channels and widget designs                                                      | Yes   | Yes   | Yes     |           |            |         |        |         |
| Connect integrations, such as messaging accounts, phone providers and handoff destinations | Yes   | Yes   |         | Yes       |            |         |        |         |
| Manage AI provider keys                                                                    | Yes   | Yes   |         | Yes       |            |         |        |         |
| Read conversations                                                                         | Yes   | Yes   | Yes     |           | Yes        | Yes     | Yes    |         |
| Take over conversations, add notes, reveal participants                                    | Yes   | Yes   |         |           | Yes        |         |        |         |
| View usage                                                                                 | Yes   | Yes   |         |           |            | Yes     |        | Yes     |
| Manage the plan, payments, billing details and spend budgets                               | Yes   |       |         |           |            |         |        | Yes     |
| Invite and manage members                                                                  | Yes   | Yes   |         |           |            |         |        |         |
| Workspace settings, SSO, customer identity, data retention                                 | Yes   | Yes   |         |           |            |         |        |         |
| Create API clients for CI and scripts                                                      | Yes   | Yes   |         | Yes       |            |         |        |         |
| Read the audit log                                                                         | Yes   | Yes   |         |           |            | Yes     |        |         |
| Transfer ownership                                                                         | Yes   |       |         |           |            |         |        |         |

Every role except Auditor can also read agents, tools, channels and integration status. Auditor reads agents, channels, conversations, usage and the audit log, but not tools or integrations.

A few combinations are worth knowing:

* **Builders cannot publish.** A Builder prepares and tests an agent; an Owner or Admin reviews and publishes it.
* **Developers cannot edit agents.** A Developer builds tool packages and integrations that Builders then attach to agents.
* **A CLI project that contains both agents and tool packages** needs an Owner or Admin to push and publish it.

Caplo checks permissions on every request, so the CLI, Tool Studio and the API enforce the same rules as the console. An [API client](/cli/ci-cd/) can be granted only actions that the member creating it holds.

## Switching workspaces

In the console, the workspace menu in the top bar shows the current workspace’s name. Open it to switch to another workspace you belong to, or select **Create workspace**. If a workspace requires company single sign-on, you may be asked to sign in through your identity provider when you enter it.

The CLI acts on one workspace at a time:

* `caplo workspace use "<NAME>"` selects the workspace for later commands.
* `--workspace` (or `-w`) on any command, or the `CAPLO_WORKSPACE` environment variable, overrides it for that command.
* `caplo workspace list` shows the workspaces you belong to, and `caplo auth status` shows the selected one.

See [Workspaces in the CLI](/cli/workspaces/) for details.

## Related

* [Agents and releases](/concepts/agents-and-releases/): what Builders and Admins create and publish.
* [Conversations and handoff](/concepts/conversations-and-handoff/): what Supervisors do in the inbox.
* [Plans](/billing/) and [spend budgets](/usage/spend-budgets/): what the Billing role manages.
