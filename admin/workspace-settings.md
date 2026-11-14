# Workspace settings

> Rename a workspace and set its time zone, find its ID and login link, set agent publication requirements, and pause or resume the workspace.

Workspace-wide settings live under **Settings**. Every member can read **General**; Owners and Admins change it. **Workspace controls** is for the Owner only.

## General

**Settings** > **General** has three panels.

**Workspace details**

| Field                  | Notes                                                                                                                                                                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workspace name**     | Up to 80 characters. Shown in the workspace menu and in invitation emails.                                                                                                                                                                                                                          |
| **Workspace timezone** | One of UTC, America/New_York, America/Los_Angeles, Europe/London, Europe/Berlin, Asia/Karachi or Asia/Singapore. It sets the days of the **Overview** date range and the times and date filter of the [audit log](/operate/audit-log/). Billing periods and the Conversations inbox always use UTC. |

**Workspace information**

* **Workspace ID**: the identifier that `CAPLO_WORKSPACE`, API keys and the SCIM endpoint use. `caplo workspace get` shows it too.
* **Workspace login link**: `https://app.caplo.si/login?workspace=<WORKSPACE_ID>`. Share it with your team to open this workspace’s sign-in page directly, with its [SSO](/admin/sso-and-scim/) options. **Open workspace sign-in** opens it.

**Agent publication requirements** is described next.

## Agent publication requirements

These rules decide what eval results mean when anyone publishes an agent in the workspace. Owners and Admins can change them, and so can an API key with `agents:publish`.

| Setting                                 | Choices                                                                                          | Default  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| **Eval requirement**                    | **Required**: all evals must pass. **Disabled**: results do not block publication.               | Required |
| **Passing routing cases per sub-agent** | 1 to 10: how many passing routed eval cases each direct sub-agent of a fast-routing agent needs. | 2        |

Select **Save publication requirements** to apply them.

* They apply to every agent in the workspace. There are no per-agent overrides.
* Releases already published keep the requirements they were published under.
* Platform checks, such as no business action during evals, apply even when the eval requirement is off.

For how the gate works, see [Publication requirements](/agents/evals/#publication-requirements) and [Evaluations](/concepts/evaluations/).

Caution

With **Eval requirement** set to **Disabled**, a release can reach customers without proof that it behaves. Prefer fixing or removing a failing case.

## Pause a workspace

**Settings** > **Workspace controls** (under **Advanced**) holds the emergency switch. Only the Owner can see it.

1. Select **Pause new sessions**.
2. Confirm **Pause workspace**. The badge changes from **Running** to **Paused**.

While the workspace is paused:

* Caplo refuses requests that need a workspace permission, from members and API keys alike: editing, publishing and deploying agents and tools, reading conversations, and the like. API keys stop authenticating.
* Members cannot enter the workspace in the console, and invitations cannot be accepted.
* Channels keep serving customers. Pausing the workspace does not stop conversations; to stop an agent answering, pause or turn off its channels. See [Channels](/channels/).

To resume, select **Resume workspace** and confirm **Resume workspace**. Everything that was refused works again; nothing is deleted while paused.

Pausing locks you out too

Once you reload or leave the page, the console can no longer open a paused workspace, even for its Owner, so **Resume workspace** is out of reach. Resume from the same page, or contact [support](/resources/support/) to resume it for you.

Pausing and resuming are recorded in the [audit log](/operate/audit-log/).

## Related

* [Manage members and roles](/admin/members-and-roles/)
* [Data retention and privacy](/operate/data-and-privacy/)
* [Workspaces and roles](/concepts/workspaces-and-roles/)
