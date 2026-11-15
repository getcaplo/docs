# Set up SSO and SCIM

> Let your team sign in through your identity provider with OIDC or SAML, verify your domains, require SSO, and provision members with SCIM 2.0.

Workspace SSO lets members sign in to a workspace through your company identity provider instead of Google or an email and password. Everything here is under **Settings** > **Identity & SSO**, and only Owners and Admins can see or change it. SSO settings belong to one workspace; other workspaces your members belong to keep their own.

The usual order is: verify a domain, add and test a connection, activate it, then choose a sign-in policy.

## Verify a domain

Caplo uses verified domains to route sign-ins and to admit new members through SSO.

1. Under **Organization domains**, enter the exact domain, such as `company.com`, and select **Add domain**. Wildcards are not accepted.
2. Caplo shows a **DNS TXT verification record**. In your DNS provider, add a TXT record at the **Host** shown, `_caplo-verify.company.com`, with the **Value** shown, which starts with `caplo-verification=`.
3. Select **Check verification**. If the record is not visible yet, wait for DNS to update and check again.

A domain can belong to only one workspace. Verifying it never grants anyone Admin access. To remove a domain, first take it out of any connection’s **Routing domain**; the last verified domain cannot be removed while SSO is required or SSO onboarding is on.

## Add an identity connection

A connection is saved as a draft, tested with a real sign-in, then activated.

1. Under **Identity connections**, select **Add connection**, enter a **Connection name** and choose the **Protocol**, **OIDC** or **SAML**.

2. Enter your provider’s details:

   * **OIDC**: the **Issuer URL** (HTTPS; Caplo reads the provider’s discovery document), the **Client ID** and the **Client secret**.
   * **SAML**: choose how to give the provider’s metadata: a **Metadata URL**, an uploaded XML file, or **Enter manually** with the **IdP entity ID**, **IdP sign-in URL** and **IdP signing certificate**.

3. Check **Email attribute or claim** and **Display-name attribute or claim** (`email` and `name` by default) and select **Save draft**.

4. Select **Prepare Redirect URI** (OIDC) or **Prepare provider URLs** (SAML), and register what Caplo shows in your provider: the **Redirect URI** for OIDC; the **Assertion consumer service URL**, **Service provider entity ID** or **Service provider metadata URL** for SAML.

5. Select **Test login**, then **Continue to provider**, and sign in through your provider. A successful sign-in marks the connection **Test passed**.

6. Select **Activate**.

Caplo stores the client secret encrypted and never shows it again. Your provider must confirm the user’s email address.

Editing an active connection creates a replacement draft; the active configuration keeps working until you test and activate the draft, or **Discard draft**. The protocol cannot be changed; create a new connection instead. You can add several connections, for example one per subsidiary.

### Routing options

| Option                                         | What it does                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Routing domain**                             | **Any verified organization domain**, or one verified domain this connection serves.                                                       |
| **Redirect when email domain matches**         | Sends people whose email domain matches straight to this provider when they sign in to the workspace. It is discovery, not an access rule. |
| **Excluded routing domains**                   | Domains to skip for redirection, such as `contractors.company.com` or `*.partners.company.com`.                                            |
| **Hide from the provider choice**              | Members reach the provider only through redirection.                                                                                       |
| **Show to members linked to another provider** | Whether members who already sign in through another connection see this one.                                                               |

The **Workspace login link** in [General settings](/admin/workspace-settings/#general) opens this workspace’s sign-in page, with its SSO options, directly.

### Map groups to roles

**Group-to-role mapping** sets the role of members who join through SSO onboarding from their groups in your provider. Enter pairs such as `support=Supervisor, builders=Builder`. The provider must send the groups in a `groups` claim (OIDC) or attribute (SAML).

* Roles are Viewer, Builder, Developer, Supervisor, Auditor and Billing. Owner and Admin are always assigned by hand.
* The role is checked again at every sign-in, so a group change in your provider changes the role.
* When several groups match, the first role in this order wins: Supervisor, Developer, Builder, Auditor, Billing, Viewer. With no match, the member gets the **New member role**.
* Members who joined by invitation or SCIM keep the role you set in **Members**.

## Choose the sign-in policy

Under **Sign-in policy**, set **Workspace SSO policy**:

| Policy       | Effect                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Disabled** | Members use Google or email and password. Connections cannot be used to enter this workspace. This is the default. |
| **Optional** | Members can use company SSO or Google and email and password.                                                      |
| **Required** | Members can enter the workspace only through an active connection.                                                 |

**New member onboarding** decides how people join:

* **Invitation only** (default): only people you [invite](/admin/members-and-roles/#invite-members) can join.
* **Approved SSO onboarding on verified domains**: anyone who signs in through an active connection with a verified email on one of your verified domains joins with the **New member role** (Viewer, Builder or Supervisor) or the role their groups map to. It needs a verified domain, an active connection, and SSO set to **Optional** or **Required**.

### Require SSO

Requiring SSO needs a verified domain, an active, tested connection and **Recovery path confirmed** turned on, and you must check **I understand the sign-in and session impact**.

When you save it:

* Members signed in with Google or email and password lose access to this workspace at once, Owner included, until they sign in again through your provider.
* Existing members keep their roles.
* API keys keep working; they do not sign in.

Plan for an identity provider outage

If your provider is down or misconfigured while SSO is required, nobody can enter the workspace through it. The Owner can lift the requirement: open `https://app.caplo.si/login?workspace=<WORKSPACE_ID>&recovery=1` and sign in with the email and password of their Caplo account, not through SSO. Caplo sets the policy back to **Optional** with **Invitation only** onboarding and records an owner recovery in the [audit log](/operate/audit-log/). This works only while **Recovery path confirmed** is on.

## SCIM provisioning

SCIM lets your identity provider add, update and deactivate workspace members automatically.

1. Under **SCIM provisioning**, select **Create token** and copy the **Bearer token**. It is shown once.
2. Turn on **Enable SCIM**.
3. In your identity provider, set the SCIM base URL to the **SCIM 2.0 endpoint** shown, `https://api.caplo.si/v1/identity/workspaces/<WORKSPACE_ID>/scim/v2`, and authenticate with the token as a bearer token.

**Rotate token** issues a new token and revokes the old one at once. Turning SCIM off makes the token stop working.

### What Caplo supports

* The **Users** resource, with `POST`, `GET`, `PUT`, `PATCH` (`add`, `replace`, `remove`) and `DELETE`. Groups, bulk operations, sorting and password changes are not supported.
* Filters on `userName`, `emails.value` or `externalId` with `eq`, up to 100 results per page.

| Attribute                                                            | Use                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `userName`                                                           | Required. If `emails` is absent, it must be an email address. |
| `emails`                                                             | The primary address, or the first one, is the member’s email. |
| `name.givenName`, `name.familyName`, `name.formatted`, `displayName` | The member’s display name.                                    |
| `externalId`                                                         | Your provider’s ID for the user.                              |
| `active`                                                             | `false` suspends the member; `true` restores them.            |

SCIM does not set roles. Provisioned members get the **New member role** when they join; change it later in [Members](/admin/members-and-roles/#change-a-members-role).

### How provisioned users join

* A provisioned user becomes a member the first time they sign in through an active connection with that email address. Provisioning alone sends no email.
* Provisioned members can enter the workspace only through SSO, even when the policy is **Optional**. Keep the policy at **Optional** or **Required** and at least one connection active.
* Deactivating or deleting a user in your provider suspends their membership. Changing their email suspends the old membership. Suspension revokes the API keys the member created, and restoring them does not bring the keys back.
* While SCIM is on, SSO onboarding admits only provisioned users. Invitations still work.

### Existing members

When your provider provisions an email that already belongs to a member, that member becomes SCIM-managed: from then on your provider can suspend them. Owners and Admins cannot be SCIM-managed; Caplo refuses to provision their email with a conflict error, so leave them out of the SCIM assignment in your provider.

## Related

* [Manage members and roles](/admin/members-and-roles/)
* [Workspaces and roles](/concepts/workspaces-and-roles/)
* [Audit log](/operate/audit-log/)
