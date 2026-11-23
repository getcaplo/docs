# Bring your own key

> Run a model or speech provider on your own provider account by adding an API key, and rotate or remove it later.

With **Your key**, an agent’s calls to a provider run on your own account with that provider. The provider bills you directly, and Caplo adds no AI usage charge for those calls. Use it when you already have negotiated rates, need usage on your own account, or want a provider Caplo does not manage for you.

You can bring your own key for Anthropic, OpenAI, Deepgram and ElevenLabs. Each provider has one key per workspace. Your own keys need the Standard plan or higher; on the Free trial, **Your key** shows which plans include it. After a downgrade to a plan without them, providers set to **Your key** run on Caplo-managed models and speech, charged at list price, and your saved keys work again once the plan includes them. See [Plan limits](/billing/plan-limits/#features).

## Who can manage keys

Owners, Admins and Developers can add, replace and remove keys and change key sources. Other members who can view integrations see the key source and the last characters of a saved key, never the key itself.

## Add a key and use it

1. In the console, open **Integrations** then **Service providers**.

2. On the provider’s row, under **Language models** or **Speech providers**, choose **Your key** and select **Apply · add key**.

3. Paste the key into the provider’s **API key** field and select **Check key and use it**.

Caplo checks the key with the provider before saving it. If the provider rejects it, you see “The provider did not accept this key. Check the key and try again.” and nothing changes. When the check passes, Caplo saves the key and switches the provider to **Your key** in one step.

To save a key without switching to it yet, select **Add key** on the row instead, then **Check and save key**. Switch to **Your key** later with **Apply**.

Note

The check only proves the key authenticates. A key restricted so that it cannot list models or read account details is still accepted. Make sure the key’s project or account can use the models and voices your agents need, and has enough quota.

![The Service providers page with Your key and Add key on each provider](/_astro/service-providers.C1HhurgE_Z1RAbkt.webp)

## How keys are stored and shown

* Caplo stores the key encrypted and never shows it again, in the console or through any API.
* The row shows **Configured · ending in** and the last 4 characters of the key, so you can tell which key is saved. Keys shorter than 16 characters show only **Configured**.
* The row also shows when the key was last checked, in UTC.
* Agents never see the key. It is used only for the calls Caplo makes to the provider on your workspace’s behalf.

## Rotate a key

1. Create the new key in the provider’s dashboard.

2. In **Service providers**, select **Replace key** on the provider’s row.

3. Paste the new key and select **Check and save key**. The dialog shows the last characters of the key it replaces.

4. Once calls succeed with the new key, revoke the old key in the provider’s dashboard.

Caplo deletes the old key when it saves the new one. New calls use the new key straight away.

## Remove a key

You can’t remove the key a provider is currently using. First switch the provider to **Off** or **Caplo Managed** and select **Apply**, then select **Remove key** and confirm. Caplo deletes the stored key.

## What happens if your key fails

Calls on **Your key** use only your key. If the provider rejects it, the key is revoked, or your account runs out of quota, those calls fail; Caplo does not switch them to its own account. Replace the key, or switch the provider to **Caplo Managed** if it is offered.

## Realtime voice models

A realtime voice model writes and speaks a call’s replies itself. It belongs to a language model provider, so its calls use that provider’s **Language models** key source. For example, an OpenAI realtime model runs on your OpenAI key when OpenAI is set to **Your key**, and is unavailable when OpenAI is **Off**. See [Voice and speech](/providers/voice-and-speech/).

## Billing effect

* Calls on your key add no AI usage charge to your Caplo bill. Your provider bills you for them.
* Caplo’s platform fees still apply to every production conversation, whoever’s key it used.
* The **Usage** tab of **Usage** includes their token and speech quantities; filter **Keys** by **Your keys** to see them alone. On a price plan, the **Charges** tab counts the requests that used your keys.

See [How your bill works](/billing/how-billing-works/) and [Usage and charges pages](/usage/usage-and-statements/).
