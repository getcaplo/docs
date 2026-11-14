# Manage members and roles

> Invite people to a workspace, choose and change their roles, restrict invitations to your domains, transfer ownership, and remove members.

Open **Settings**, then **Members**. Every member can see the list; Owners and Admins invite, change roles and remove people. Each member has one role, and what each role can do is in the [roles table](/concepts/workspaces-and-roles/#members-and-roles). **Role permissions** on the same page shows the full permission matrix.

A workspace has exactly one Owner. The Owner role cannot be given by invitation or role change, only by [transferring ownership](#transfer-ownership).

## Invite members

1. Select **Invite member**.
2. Under **Email addresses**, paste up to 50 addresses, separated by commas or one per line, or select **Upload CSV** to read them from the first column of a CSV file.
3. Choose a **Role**: Admin, Builder, Developer, Supervisor, Auditor, Viewer or Billing.
4. Select **Send invitations**.

Each person gets an email with a link to sign in and join. An invitation:

* Expires after 7 days. **Resend** sends a new link and restarts the 7 days; **Revoke** cancels it.
* Must be accepted by someone signed in with that exact email address, verified by their sign-in provider.
* Is refused for someone who is already a member or already has a pending invitation.

If the workspace [requires SSO](/admin/sso-and-scim/#require-sso), the invitee must sign in through your identity provider to join. With SSO onboarding or SCIM provisioning, people can also join without an invitation; see [SSO and SCIM](/admin/sso-and-scim/).

### Limit invitations to your domains

Under **Invitation policy**, enter up to 20 **Allowed email domains**, such as `company.com, company.co.uk`, and save. Invitations to any other domain are then refused. Leave it empty to allow any domain. The policy applies to new invitations, not to members who have already joined.

## Change a member’s role

Choose a new role in the member’s **Role** menu and confirm **Change role**. It takes effect on their next action; if you change your own role, your access changes at once. The Owner’s role cannot be changed here.

## Transfer ownership

Only the Owner can transfer ownership, and only to an active member.

1. On your own row, select **Transfer ownership**.
2. Choose the **New Owner**.
3. Select **Transfer ownership**.

The new Owner gets the Owner role and you become an Admin immediately. The transfer is recorded in the [audit log](/operate/audit-log/). Only the new Owner can transfer it back.

## Remove a member

Select **Remove** on the member’s row and confirm **Remove member**. They lose access to this workspace; their other workspace memberships are not affected. To remove the Owner, transfer ownership first.

Removing a member does not revoke their API keys

API clients belong to the workspace, not to the member who created them. Keys a removed member created keep working until you revoke them in **Settings** > **API access**. See [API keys](/admin/api-keys/#revoke-keys).

Members provisioned by SCIM are suspended rather than removed when your identity provider deactivates them. See [SCIM provisioning](/admin/sso-and-scim/#scim-provisioning).

## Related

* [Workspaces and roles](/concepts/workspaces-and-roles/)
* [SSO and SCIM](/admin/sso-and-scim/)
* [Audit log](/operate/audit-log/)
