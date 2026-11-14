# Publish to several environments

> Define staging and production environments in caplo.yaml, vary agent settings per environment, deploy channels, and promote only what passed the previous environment.

An environment is a named workspace that a project publishes to, such as `staging` or `prod`. Keep one workspace per environment so that testing never touches what customers use. With environments, one set of agent files publishes to every workspace, with small per-environment differences, and production can be limited to exactly what staging released.

## Define environments

Add an `environments` map to the project’s `caplo.yaml`:

```yaml
apiVersion: v1
kind: Project
name: shop
agents: agents/*.yaml
tools: tools/*
environments:
  staging:
    workspace: <STAGING_WORKSPACE_ID>
    apiKeyEnv: CAPLO_STAGING_KEY
    channels:
      concierge: [Staging website]
  prod:
    workspace: <PROD_WORKSPACE_ID>
    apiKeyEnv: CAPLO_PROD_KEY
    promoteFrom: staging
    agents:
      concierge:
        model: {temperature: 0.2}
        suggestedReplies: null
    channels:
      concierge: [Website, twilio/Support line]
```

| Field         | Required | Description                                                                                                                                                                 |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace`   | Yes      | The workspace ID. A workspace name also works when you are logged in, but an [API key](/cli/authentication/#api-keys-for-automation) needs the ID.                          |
| `apiKeyEnv`   | No       | The name of an environment variable that holds this environment’s API key, such as `CAPLO_PROD_KEY`. When that variable is set, the CLI uses it instead of `CAPLO_API_KEY`. |
| `promoteFrom` | No       | Another environment. A publish here only goes ahead for agents that environment already released from the same source. See [Promote a release](#promote-a-release).         |
| `agents`      | No       | Agent fields by agent file key, merged over the agent files. See [Vary agents per environment](#vary-agents-per-environment).                                               |
| `channels`    | No       | Channels by agent file key. After a publish, each listed channel is pointed at the agent’s newest release. See [Deploy channels](#deploy-channels).                         |

Environment names start with a lowercase letter and use only lowercase letters, digits and hyphens. `promoteFrom` must name another environment and must not loop back.

## Use an environment

Pass `--env` (`-e`), or set `CAPLO_ENV`, on `caplo validate`, `diff`, `push`, `eval` and `publish`:

```sh
caplo diff --env staging
caplo publish --env prod
```

Selecting an environment does three things:

1. **Workspace.** The command acts on the environment’s workspace. If `--workspace` or `CAPLO_WORKSPACE` names a different one, the command stops with exit code 2 instead of guessing.
2. **Credentials.** If the environment’s `apiKeyEnv` variable is set, the command authenticates with that key. Otherwise it uses `CAPLO_API_KEY` if set, and your login if not.
3. **Agent fields.** The environment’s `agents` fields are merged over the agent files before anything is compared or pushed.

Without `--env` or `CAPLO_ENV`, project commands act on the [selected workspace](/cli/workspaces/) and use the agent files unchanged.

## Vary agents per environment

Under `agents`, each key is an agent file key and each value is a partial agent file. It merges over the file like a JSON merge patch:

* Mappings merge key by key, so `model: {temperature: 0.2}` changes only the temperature and keeps the model name.
* `null` removes a field, so `suggestedReplies: null` turns suggested replies off in that environment.
* Any other value, including a list, replaces the field entirely.

Use this for settings that should really differ, such as model, temperature, greeting or limits. Knowledge base and remote MCP server names already resolve in each command’s own workspace, so you rarely need to override them.

`caplo validate` checks every environment’s fields merged over each file, whether or not you pass `--env`. With `--env`, it also checks the agents exactly as that environment publishes them.

## Deploy channels

An environment’s `channels` lists, for each agent key, the channels that should serve that agent:

```yaml
channels:
  concierge: [Website, twilio/Support line, <CHANNEL_ID>]
```

Name a channel by its name, by its ID, or as `<kind>/<name>` when two channels share a name. Kinds are `website`, `whatsapp`, `messenger`, `instagram`, `twilio` and `telnyx`; `caplo channel list` shows yours.

After `caplo publish --env <name>` publishes, it points each listed channel at its agent’s newest release, if the channel does not serve it already. That happens even when this publish made no new release. The plan lists each channel as `channel/<kind>/<name>` with a `deploy` step, and the publish confirmation covers it. New conversations get the new release; conversations already open keep theirs. Every other channel setting stays as it is. The agent must have a release in that workspace.

With an API key, deploying channels needs the `channels:write` scope. The CLI checks this before it starts, so a missing scope stops the publish with exit code 2 before anything changes.

## Promote a release

`promoteFrom` makes an environment accept only what the previous one released. Each release the CLI publishes from a project records a **source digest** of the agent:

* its agent file as written, byte for byte, before any environment’s fields apply
* the files of the project packages it uses, as `caplo push` uploads them
* the source of its project sub-agents, in the same way

`caplo.yaml` and environment fields are not part of the digest, so production can use different settings and still match staging. Any edit to the agent file, a package it uses, or a project sub-agent, even a comment, changes the digest.

When you publish to an environment with `promoteFrom`, every agent the publish would release must have a release in the `promoteFrom` environment with the same digest that is not revoked. The plan prints the matching release for each agent. If one is missing, the publish stops with exit code 3 before changing anything, naming the agents that need publishing there first.

1. Publish to staging and test there:

   ```sh
   caplo publish --env staging
   ```

2. When staging is good, publish the same commit to production:

   ```sh
   caplo publish --env prod
   ```

   The plan shows lines such as `agent/concierge matches staging release 1.3.0`. Confirm to publish.

3. If you changed anything in between, publish to staging again first. Production refuses a source staging has not released.

To read the `promoteFrom` environment, the CLI uses that environment’s own `apiKeyEnv` key when its variable is set, and otherwise your login. A key for one workspace cannot read another, so when you publish with an API key, the `promoteFrom` environment needs `apiKeyEnv` and that variable must hold a key of its workspace with at least `agents:read`:

```sh
CAPLO_STAGING_KEY=<STAGING_KEY> CAPLO_PROD_KEY=<PROD_KEY> caplo publish --env prod --yes
```

Caution

Releases are numbered per workspace, so the same source can be 1.3.0 in staging and 2.1.0 in production. Compare environments by source digest, which the plan prints, not by version number.

AI prompt

Add staging and production environments to my Caplo project

Adds staging and prod environments to caplo.yaml so production only publishes what staging released from the same source.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20add%20%60staging%60%20and%20%60prod%60%20environments%20to%20this%20repository's%20Caplo%20project%2C%20so%20%60caplo%20publish%20--env%20staging%60%20publishes%20to%20the%20staging%20workspace%20and%20%60caplo%20publish%20--env%20prod%60%20publishes%20only%20agents%20that%20staging%20already%20released%20from%20the%20same%20source.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fenvironments.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fauthentication.md%0A%0AInputs%20I%20will%20give%20you%3A%0A-%20%60%3CSTAGING_WORKSPACE_ID%3E%60%20and%20%60%3CPROD_WORKSPACE_ID%3E%60%3A%20the%20workspace%20IDs%20\(from%20%60caplo%20workspace%20list%60\).%0A-%20Which%20settings%2C%20if%20any%2C%20should%20differ%20in%20production%2C%20and%20which%20channels%20each%20environment%20should%20deploy.%0A%0ASteps%3A%0A1.%20Find%20the%20project's%20%60caplo.yaml%60%20\(the%20one%20with%20%60kind%3A%20Project%60\)%20and%20read%20its%20agent%20files.%20Note%20each%20agent's%20file%20key%20\(its%20file%20name%20without%20%60.yaml%60\).%0A2.%20Add%20an%20%60environments%60%20map%3A%0A%20%20%20-%20%60staging%60%20with%20%60workspace%3A%20%3CSTAGING_WORKSPACE_ID%3E%60%20and%20%60apiKeyEnv%3A%20CAPLO_STAGING_KEY%60%3B%0A%20%20%20-%20%60prod%60%20with%20%60workspace%3A%20%3CPROD_WORKSPACE_ID%3E%60%2C%20%60apiKeyEnv%3A%20CAPLO_PROD_KEY%60%20and%20%60promoteFrom%3A%20staging%60.%0A3.%20Only%20if%20I%20asked%20for%20different%20settings%2C%20add%20them%20under%20%60prod.agents.%3CAGENT_KEY%3E%60%20as%20partial%20agent%20fields.%20Mappings%20merge%2C%20%60null%60%20removes%20a%20field%2C%20and%20anything%20else%20replaces%20it.%20Do%20not%20copy%20whole%20agent%20files%20into%20%60caplo.yaml%60.%0A4.%20Only%20if%20I%20named%20channels%2C%20add%20them%20under%20%60%3CENVIRONMENT%3E.channels.%3CAGENT_KEY%3E%60%20as%20a%20list%20of%20channel%20names%2C%20IDs%20or%20%60%3Ckind%3E%2F%3Cname%3E%60.%0A5.%20Run%20%60caplo%20validate%60%2C%20which%20checks%20every%20environment%2C%20and%20%60caplo%20validate%20--env%20prod%60.%20Fix%20what%20they%20report.%0A6.%20If%20the%20repository%20has%20a%20CI%20workflow%20that%20runs%20%60caplo%20publish%60%2C%20show%20me%20how%20to%20change%20it%20to%20%60caplo%20publish%20--env%20staging%20--yes%60%20with%20%60CAPLO_STAGING_KEY%60%2C%20and%20a%20separate%20production%20job%20with%20both%20%60CAPLO_STAGING_KEY%60%20and%20%60CAPLO_PROD_KEY%60%2C%20but%20do%20not%20change%20it%20without%20asking.%20Remove%20%60CAPLO_WORKSPACE%60%20from%20jobs%20that%20use%20%60--env%60.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20and%20%60caplo%20validate%20--env%20prod%60%20exit%200.%0A-%20If%20I%20am%20logged%20in%2C%20%60caplo%20diff%20--env%20staging%60%20and%20%60caplo%20diff%20--env%20prod%60%20show%20the%20plan%20for%20each%20workspace%20without%20changing%20anything.%0A%0ARules%3A%0A-%20Never%20write%20API%20keys%20into%20%60caplo.yaml%60%20or%20any%20file.%20%60apiKeyEnv%60%20holds%20only%20the%20name%20of%20an%20environment%20variable.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20for%20any%20environment%20without%20asking%20me%20first.%0A-%20Use%20workspace%20IDs%2C%20not%20names%2C%20so%20the%20file%20also%20works%20with%20API%20keys%20in%20CI.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20add%20%60staging%60%20and%20%60prod%60%20environments%20to%20this%20repository's%20Caplo%20project%2C%20so%20%60caplo%20publish%20--env%20staging%60%20publishes%20to%20the%20staging%20workspace%20and%20%60caplo%20publish%20--env%20prod%60%20publishes%20only%20agents%20that%20staging%20already%20released%20from%20the%20same%20source.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fenvironments.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fprojects.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fcli%2Fauthentication.md%0A%0AInputs%20I%20will%20give%20you%3A%0A-%20%60%3CSTAGING_WORKSPACE_ID%3E%60%20and%20%60%3CPROD_WORKSPACE_ID%3E%60%3A%20the%20workspace%20IDs%20\(from%20%60caplo%20workspace%20list%60\).%0A-%20Which%20settings%2C%20if%20any%2C%20should%20differ%20in%20production%2C%20and%20which%20channels%20each%20environment%20should%20deploy.%0A%0ASteps%3A%0A1.%20Find%20the%20project's%20%60caplo.yaml%60%20\(the%20one%20with%20%60kind%3A%20Project%60\)%20and%20read%20its%20agent%20files.%20Note%20each%20agent's%20file%20key%20\(its%20file%20name%20without%20%60.yaml%60\).%0A2.%20Add%20an%20%60environments%60%20map%3A%0A%20%20%20-%20%60staging%60%20with%20%60workspace%3A%20%3CSTAGING_WORKSPACE_ID%3E%60%20and%20%60apiKeyEnv%3A%20CAPLO_STAGING_KEY%60%3B%0A%20%20%20-%20%60prod%60%20with%20%60workspace%3A%20%3CPROD_WORKSPACE_ID%3E%60%2C%20%60apiKeyEnv%3A%20CAPLO_PROD_KEY%60%20and%20%60promoteFrom%3A%20staging%60.%0A3.%20Only%20if%20I%20asked%20for%20different%20settings%2C%20add%20them%20under%20%60prod.agents.%3CAGENT_KEY%3E%60%20as%20partial%20agent%20fields.%20Mappings%20merge%2C%20%60null%60%20removes%20a%20field%2C%20and%20anything%20else%20replaces%20it.%20Do%20not%20copy%20whole%20agent%20files%20into%20%60caplo.yaml%60.%0A4.%20Only%20if%20I%20named%20channels%2C%20add%20them%20under%20%60%3CENVIRONMENT%3E.channels.%3CAGENT_KEY%3E%60%20as%20a%20list%20of%20channel%20names%2C%20IDs%20or%20%60%3Ckind%3E%2F%3Cname%3E%60.%0A5.%20Run%20%60caplo%20validate%60%2C%20which%20checks%20every%20environment%2C%20and%20%60caplo%20validate%20--env%20prod%60.%20Fix%20what%20they%20report.%0A6.%20If%20the%20repository%20has%20a%20CI%20workflow%20that%20runs%20%60caplo%20publish%60%2C%20show%20me%20how%20to%20change%20it%20to%20%60caplo%20publish%20--env%20staging%20--yes%60%20with%20%60CAPLO_STAGING_KEY%60%2C%20and%20a%20separate%20production%20job%20with%20both%20%60CAPLO_STAGING_KEY%60%20and%20%60CAPLO_PROD_KEY%60%2C%20but%20do%20not%20change%20it%20without%20asking.%20Remove%20%60CAPLO_WORKSPACE%60%20from%20jobs%20that%20use%20%60--env%60.%0A%0AVerify%3A%0A-%20%60caplo%20validate%60%20and%20%60caplo%20validate%20--env%20prod%60%20exit%200.%0A-%20If%20I%20am%20logged%20in%2C%20%60caplo%20diff%20--env%20staging%60%20and%20%60caplo%20diff%20--env%20prod%60%20show%20the%20plan%20for%20each%20workspace%20without%20changing%20anything.%0A%0ARules%3A%0A-%20Never%20write%20API%20keys%20into%20%60caplo.yaml%60%20or%20any%20file.%20%60apiKeyEnv%60%20holds%20only%20the%20name%20of%20an%20environment%20variable.%0A-%20Do%20not%20run%20%60caplo%20push%60%2C%20%60caplo%20eval%60%20or%20%60caplo%20publish%60%20for%20any%20environment%20without%20asking%20me%20first.%0A-%20Use%20workspace%20IDs%2C%20not%20names%2C%20so%20the%20file%20also%20works%20with%20API%20keys%20in%20CI.)

Show prompt

```
Goal: add `staging` and `prod` environments to this repository's Caplo project, so `caplo publish --env staging` publishes to the staging workspace and `caplo publish --env prod` publishes only agents that staging already released from the same source.

Read these pages first:
- https://docs.caplo.si/cli/environments.md
- https://docs.caplo.si/cli/projects.md
- https://docs.caplo.si/cli/authentication.md

Inputs I will give you:
- `<STAGING_WORKSPACE_ID>` and `<PROD_WORKSPACE_ID>`: the workspace IDs (from `caplo workspace list`).
- Which settings, if any, should differ in production, and which channels each environment should deploy.

Steps:
1. Find the project's `caplo.yaml` (the one with `kind: Project`) and read its agent files. Note each agent's file key (its file name without `.yaml`).
2. Add an `environments` map:
   - `staging` with `workspace: <STAGING_WORKSPACE_ID>` and `apiKeyEnv: CAPLO_STAGING_KEY`;
   - `prod` with `workspace: <PROD_WORKSPACE_ID>`, `apiKeyEnv: CAPLO_PROD_KEY` and `promoteFrom: staging`.
3. Only if I asked for different settings, add them under `prod.agents.<AGENT_KEY>` as partial agent fields. Mappings merge, `null` removes a field, and anything else replaces it. Do not copy whole agent files into `caplo.yaml`.
4. Only if I named channels, add them under `<ENVIRONMENT>.channels.<AGENT_KEY>` as a list of channel names, IDs or `<kind>/<name>`.
5. Run `caplo validate`, which checks every environment, and `caplo validate --env prod`. Fix what they report.
6. If the repository has a CI workflow that runs `caplo publish`, show me how to change it to `caplo publish --env staging --yes` with `CAPLO_STAGING_KEY`, and a separate production job with both `CAPLO_STAGING_KEY` and `CAPLO_PROD_KEY`, but do not change it without asking. Remove `CAPLO_WORKSPACE` from jobs that use `--env`.

Verify:
- `caplo validate` and `caplo validate --env prod` exit 0.
- If I am logged in, `caplo diff --env staging` and `caplo diff --env prod` show the plan for each workspace without changing anything.

Rules:
- Never write API keys into `caplo.yaml` or any file. `apiKeyEnv` holds only the name of an environment variable.
- Do not run `caplo push`, `caplo eval` or `caplo publish` for any environment without asking me first.
- Use workspace IDs, not names, so the file also works with API keys in CI.
```

## Credentials per environment

| How you run                          | Workspace field                                                   | Keys                                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Logged in as yourself                | ID or name; you must be a member of every environment’s workspace | None needed                                                                                                                          |
| One API key, one environment per job | ID                                                                | `CAPLO_API_KEY`, or the environment’s `apiKeyEnv` variable                                                                           |
| API keys, with `promoteFrom`         | ID                                                                | The target’s key in `CAPLO_API_KEY` or its `apiKeyEnv` variable, and the `promoteFrom` environment’s key in its `apiKeyEnv` variable |

Each key belongs to one workspace, so create one API client per environment workspace. See [Run the CLI in CI/CD](/cli/ci-cd/) for a complete pipeline.
