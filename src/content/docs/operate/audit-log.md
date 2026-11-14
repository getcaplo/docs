---
title: Audit log
description: What the workspace audit log records, who can read it, and how to filter it.
sidebar:
  order: 4
---

The audit log is a history of administrative and sensitive actions in a workspace, newest first. Open **Settings**, then **Audit log** (under **Advanced**).

Owners, Admins and Auditors can read it. Nobody can change or delete an entry, and entries never contain secret values.

## What is recorded

Each entry shows the action, who did it, what it changed, when, and whether it was **Allowed** or **Denied**. The actor is a member's name, an API client (by the start of its ID), or **Workspace retention policy** for deletions made by retention. A participant reveal also shows the reason the member gave.

| Area | Actions recorded |
| --- | --- |
| Workspace | Workspace created, details updated, paused and resumed, ownership transferred, Fast decisions provider changed. |
| Members | Invitations sent, resent and revoked, members joined, role changes, removals, invitation policy changes. |
| Sign-in and SSO | Sign-in policy changes, identity connections created, changed, activated and removed, domains added, verified and removed, SCIM settings, token rotations and provisioned users, members who joined through SSO. |
| API access | API clients created, keys created and revoked. |
| Secrets and integrations | Workspace secrets created, rotated and deleted; package secrets set, removed, bound and unbound; remote MCP server connections created, changed, removed and authorized. |
| Conversations | Participants revealed, conversations taken over and returned, team replies sent, notes added, files opened, conversation erasures. |
| Data and voice | Data retention changes, maximum call duration changes. |
| Billing | Spend budgets created, changed and deleted. |
| Customer identity | Changes to customer identity connections, policies and settings, account links created, and revocations. |

Retention changes, call duration changes and participant reveals are recorded before they take effect. If Caplo cannot write the entry, the action is refused and the console says that nothing was changed.

## Filter the log

The page loads 50 entries at a time; select **Load more activity** for older ones. Narrow it with:

- **Action**: one of the listed actions, such as **Member role changed**, **Participant revealed** or **API key revoked**.
- **Resource**: the kind of thing changed, such as **Member**, **Conversation**, **API client** or **Data retention**.
- **Date range**: whole days in the workspace time zone, set in [General settings](/admin/workspace-settings/).
- **Search audit log**: searches the entries already loaded by actor, action, target or reason.

Times are shown in the workspace time zone.

The **Action** list offers the most common actions. To find others, such as secret or SSO changes, leave **Action** at **All actions** and search the loaded entries.

The console has no export of the audit log.

## Related

- [Workspaces and roles](/concepts/workspaces-and-roles/)
- [Data retention and privacy](/operate/data-and-privacy/)
- [Work in the Conversations inbox](/operate/conversations-inbox/#reveal-a-participant)
