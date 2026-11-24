# Manage API keys

> Create API clients and keys in the console, choose scopes, rotate and revoke keys, and use a key with the caplo CLI.

An **API client** is a workspace identity for CI pipelines and scripts. It is not a member: it has no role and cannot sign in to the console. It can do only what its **scopes** allow, in its own workspace. Each client has one or more **keys**, secret strings that start with `caplo_sk_`; several active keys let you rotate without downtime.

Owners, Admins and Developers manage API clients in **Settings** > **API access** (under **Developer**). For using keys from the CLI side, see [Log in and use API keys](/cli/authentication/#api-keys-for-automation).

## Create a client

**Console**

1. Open **Settings** > **API access** and select **Create client**.
2. Enter a **Client name** (up to 80 characters) and turn on the **Permissions** it needs. Grant only what the job uses.
3. Select **Create key** and copy the key from **Copy your API key**.

**CLI**

```plaintext
caplo workspace api-client create github-deploy \
  --scope agents:write,agents:publish,tools:write,tools:publish
```

The key is printed once on standard output.

The key is shown only once. Caplo keeps only a hash of it and cannot show it again, so store it in your CI’s secret store straight away.

A client’s name and scopes cannot be changed, and a client cannot be deleted. To change scopes, create a new client and revoke the old client’s keys.

## Scopes

A write or publish scope includes the read scope of the same resource: `agents:publish` can also read agents.

| Scope                | Console label                 | Allows                                                                                                                                                                                                             |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agents:read`        | **Read agents**               | Read agents, drafts, releases and the workspace’s publication requirements; knowledge bases and their files; eval suites and runs.                                                                                 |
| `agents:write`       | **Edit agents and knowledge** | Create agents and save drafts; create and change knowledge bases; upload, replace, publish, unpublish and delete their files; create and save eval suites.                                                         |
| `agents:publish`     | **Publish agents**            | Run evals; publish and revoke releases and pin their tool versions; archive and delete agents; change the workspace’s [agent publication requirements](/admin/workspace-settings/#agent-publication-requirements). |
| `tools:read`         | **Read tools**                | Read tool packages, their files, builds and build logs, versions, test runs and invocation logs; remote MCP servers; the names of package and workspace secrets and where they are bound.                          |
| `tools:write`        | **Edit tools**                | Create, change and delete packages and their files; install dependencies; start and cancel builds; run remote fixture tests; review the tools of remote MCP servers.                                               |
| `tools:publish`      | **Publish tools**             | Publish and revoke package versions; publish remote MCP server tools; set and remove a package’s own secret values.                                                                                                |
| `channels:read`      | **Read channels**             | Read channels, the release each serves, and widget designs.                                                                                                                                                        |
| `channels:write`     | **Deploy to channels**        | Create, change, pause, resume and delete channels; deploy and roll back releases; create, edit and publish widget designs and upload their assets.                                                                 |
| `conversations:read` | **Read conversations**        | Accepted, but no Caplo API accepts API keys for conversations yet.                                                                                                                                                 |
| `usage:read`         | **Read usage**                | Accepted, but no Caplo API accepts API keys for usage yet.                                                                                                                                                         |
| `endpoints:read`     | **Read endpoints**            | Accepted, but no Caplo API uses it.                                                                                                                                                                                |
| `endpoints:write`    | **Manage endpoints**          | Accepted, but no Caplo API uses it.                                                                                                                                                                                |

agents:publish is broad

`agents:publish` lets a key publish agents, and it can also delete agents and turn off the workspace’s eval requirement. Give it only to pipelines that publish, and keep that key in a protected CI environment.

No scope covers members, roles, SSO, billing, workspace secrets, integrations or other API clients. Those always need a person. See [What works with an API key](/cli/authentication/#what-works-with-an-api-key) for the CLI commands each scope enables.

### What you can grant

You can create a client, or add a key to one, only if your role holds every action its scopes grant. For example:

* A **Developer** can grant `agents:read`, the tool scopes and `channels:read`, but not `agents:write`, `agents:publish`, `channels:write`, `conversations:read` or `usage:read`.
* An **Admin** or **Owner** can grant any scope.

This also applies to rotation: a Developer cannot add a key to a client that an Admin created with `agents:publish`.

## Rotate a key

1. Add a new key: **Add rotation key** on the client in the console, or `caplo workspace api-client rotate github-deploy`.
2. Replace the old key in your CI’s secret store and check that jobs pass.
3. Revoke the old key.

The client’s other keys keep working until you revoke them, so nothing breaks during the switch.

## Revoke keys

In the console, select **Revoke** next to a key. With the CLI:

```plaintext
caplo workspace api-client revoke github-deploy --key <KEY_ID_OR_PREFIX>
caplo workspace api-client revoke github-deploy --except <NEW_KEY_ID_OR_PREFIX>
caplo workspace api-client revoke github-deploy
```

The first revokes one key, the second every key but the new one after a rotation, and the third every active key. Anything using a revoked key stops working at once, and a revoked key cannot be restored.

Each key in the console shows its prefix, when it was created and when it was last used, so you can find keys nobody uses any more. `caplo workspace api-client list` shows each client’s scopes and active key prefixes.

Note

Clients belong to the workspace, not to the member who created them. When a member is removed, or suspended through SCIM, Caplo revokes the keys that member created; their clients, and keys other members added to them, keep working. Keys stop working while the workspace is [paused](/admin/workspace-settings/#pause-a-workspace).

## Use a key

Set the key and the workspace ID in the environment, and `caplo` commands run as the client:

```plaintext
export CAPLO_API_KEY=<API_KEY>
export CAPLO_WORKSPACE=<WORKSPACE_ID>
caplo auth status
```

Name the workspace by its ID, shown in [General settings](/admin/workspace-settings/#general), because a key cannot list workspaces. For pipelines, see [CI/CD](/cli/ci-cd/).

Every key creation and revocation is recorded in the [audit log](/operate/audit-log/).

## Related

* [Log in and use API keys](/cli/authentication/)
* [CI/CD](/cli/ci-cd/)
* [Workspaces and roles](/concepts/workspaces-and-roles/)
