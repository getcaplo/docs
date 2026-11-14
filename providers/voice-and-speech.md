# Voice and speech

> How agents hear and speak on voice calls, where to choose speech recognition, voices and realtime models, and what affects the cost of a call.

On a voice call, whether by phone or in the website widget, an agent needs to turn the caller’s speech into text and its own replies into speech. Caplo does this with speech providers and, optionally, a realtime voice model.

## How a voice reply is made

**Speech pipeline** (always used):

1. **Speech recognition** transcribes the caller.
2. The agent’s language model writes the reply, the same way it does in chat.
3. A **voice model** speaks the reply in the chosen voice.

**Realtime model** (optional): a realtime voice model writes and speaks each reply itself, so replies start sooner. Speech recognition still transcribes the caller, and the pipeline’s voice still speaks the greeting and the fixed lines such as the transfer and silence messages.

## Providers

* Speech recognition and voice models come from **Deepgram** and **ElevenLabs**, set under **Speech providers**.
* Realtime models belong to a language model provider (OpenAI for OpenAI Realtime, Google for Gemini Live) and use its **Language models** key source.

Both are in the console under **Integrations** then **Service providers**. Speech providers are **Caplo Managed** by default, so voice works without your own keys. See [Models and providers](/providers/).

## Where to choose them

Voice settings belong to the agent, so every channel serving a release uses the same ones. Open the agent’s configuration, then **Advanced settings** then **Voice**:

| Setting                                        | What it does                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Voice language**                             | The language callers speak and the agent answers in. Changing it can replace speech models that do not support the new language; the console tells you when it does.               |
| **Speech recognition**                         | The model that transcribes callers. Models are grouped by provider, and each shows the key source its calls use.                                                                   |
| **Voice model** and **Voice**                  | The model and voice that speak replies. Play a preview of a voice, optionally with your own **Preview sentence**, before you choose.                                               |
| **Realtime model** and **Realtime voice**      | Optional. A realtime model and one of its provider’s voices.                                                                                                                       |
| Fixed lines                                    | What the agent says when it cannot take the call, a turn fails, the call is transferred, the caller is silent or the time limit is near. Leave a line empty to use the platform’s. |
| **Transcript script**                          | Rewrites the caller’s transcript into another script, such as Urdu script, before the agent reads it.                                                                              |
| **Start replies early**                        | Starts the reply while the caller may still be finishing, to answer sooner.                                                                                                        |
| **Silence check after** and **End call after** | Seconds of caller silence before the silence check line, and before the call ends. 5 to 300 seconds each; the platform defaults are 15 and 10.                                     |

Changes apply to new calls after you publish a release and update the channel to it. If you leave voice unset, the agent uses Caplo’s default English speech recognition and voice.

Channels decide whether voice is offered:

* A phone channel is always voice.
* A website channel offers voice only when the channel allows website voice and the entry point’s mode is **Text + voice**. See [Website widget settings](/channels/website-widget/settings/#text-and-voice).

## What affects cost

A voice conversation can add these charges. See [How Caplo charges](/usage/) for how each is billed.

| What                             | Measured in                                    | Billed by                                                  |
| -------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Connected call time              | Voice minutes, by the second                   | Caplo platform fee, whatever keys you use.                 |
| Speech recognition               | Audio minutes                                  | Caplo on **Caplo Managed**; your provider on **Your key**. |
| Speaking replies                 | Characters spoken                              | Caplo on **Caplo Managed**; your provider on **Your key**. |
| Language model or realtime model | Text and audio tokens                          | Caplo on **Caplo Managed**; your provider on **Your key**. |
| Phone carrier                    | Call time on your own Twilio or Telnyx account | Your carrier.                                              |

What makes a call cost more:

* **Longer calls**: every connected minute counts, including silence before the call ends. Shorter silence timings end abandoned calls sooner.
* **Longer replies**: more characters to speak and more output tokens. Ask for short spoken replies in the agent’s instructions.
* **Realtime models**: they bill audio tokens for what they hear and say, on top of the pipeline’s speech recognition.

The **Usage** page shows speech to text minutes, text to speech characters and voice minutes by provider, agent or channel. See [Usage and statements](/usage/usage-and-statements/).
