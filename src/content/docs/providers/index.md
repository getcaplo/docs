---
title: Models and providers
description: Choose which language model and speech providers your agents can use, and whether each one runs on Caplo's account or your own key.
sidebar:
  order: 1
---

Agents call two kinds of providers: language model providers, which write replies and decide which tools to call, and speech providers, which turn caller audio into text and replies into speech. For each provider your workspace chooses whether it is on, and if so, whose account pays for its calls.

## Providers

| Kind | Provider | Used for |
| --- | --- | --- |
| Language models | Anthropic | Agent replies and tool use. |
| Language models | OpenAI | Agent replies and tool use, realtime voice models, and [Fast decisions](/providers/fast-decisions/). |
| Speech | Deepgram | Speech recognition on voice calls. |
| Speech | ElevenLabs | Voices that speak the agent's replies. |

The **Language models** list also shows Google, labelled **Realtime voice (Gemini Live) only**. Caplo does not route agent chat to Google models, so turn Google on only if an agent uses Gemini Live for realtime voice. See [Voice and speech](/providers/voice-and-speech/).

The models you can pick for an agent depend on which providers are on. See [Instructions and model](/agents/instructions-and-model/) and [Voice and speech](/providers/voice-and-speech/).

## Key source

Each provider has one of three settings, called its key source:

| Key source | What happens | Who bills the provider usage |
| --- | --- | --- |
| **Off** | Agents can't use this provider's models. | Nobody. |
| **Caplo Managed** | Calls run on Caplo's provider account. No key needed. | Caplo, on your Caplo bill. |
| **Your key** | Calls run on your own provider account, with an API key you add. | The provider, directly. |

**Caplo Managed** is offered only for providers Caplo runs an account for. When it is not, the option is disabled and shows "Not available in this environment".

### Defaults

A new workspace starts with:

- **Anthropic**: **Caplo Managed**.
- **OpenAI** and **Google**: **Off**.
- **Deepgram** and **ElevenLabs**: **Caplo Managed**.

So agents on Anthropic models and voice calls with the default speech settings work without any keys. To use OpenAI models, turn OpenAI on with either key source.

## Change a provider's key source

1. In the console, open **Integrations** then **Service providers**. The page has two cards: **Language models** and **Speech providers**.
2. On the provider's row, choose **Off**, **Caplo Managed** or **Your key**.
3. Select **Apply**. If you chose **Your key** and no key is saved yet, the button reads **Apply · add key** and asks for the key first. See [Bring your own key](/providers/bring-your-own-key/).

The change applies to new calls straight away; you do not need to publish the agent again. When a provider is **Off**, calls to it are refused, so move agents that use its models to another provider first.

## Who can change providers

Owners, Admins and Developers can change key sources and manage keys. Other roles that can see integrations (for example Builders and Viewers) see the settings read-only.

## Billing effect

- **Caplo Managed** usage appears on your Caplo bill at the provider's list price plus your plan's markup.
- **Your key** usage is billed to you by the provider and adds no AI usage charge from Caplo. Caplo's platform fees (per voice minute and per AI reply) still apply.

See [How Caplo charges](/usage/).

## Related

- [Bring your own key](/providers/bring-your-own-key/)
- [Fast decisions](/providers/fast-decisions/)
- [Voice and speech](/providers/voice-and-speech/)
