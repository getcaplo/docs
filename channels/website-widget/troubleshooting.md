# Troubleshoot the website widget

> Find out why the website widget does not appear, shows Chat unavailable, is blocked by a Content Security Policy, or cannot use the microphone.

Start with the browser’s developer tools on the page that should show the widget. The **Console** shows script and Content Security Policy errors, and the **Network** tab shows the widget’s requests to `api.caplo.si`.

## See why the widget failed

When the widget cannot load, the loader replaces it with a **Chat unavailable · Try again** button in the bottom right corner and dispatches a `caplo:error` event. Log it to confirm which widget failed:

```plaintext
document.addEventListener('caplo:error', (event) => {
  console.warn('Caplo widget unavailable', event.detail);
});
```

`event.detail` is `{ installationId, code: "presentation-unavailable" }`. For the reason, look in the **Network** tab for the `POST` request to `/v1/messaging/widget/presentation`. Its response title says what is wrong:

| Response                                                       | Meaning                                                                                                                          | Fix                                                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 403 **Origin denied**                                          | The page’s origin is not an allowed origin of the entry point.                                                                   | Add the exact origin. See [below](#origin-not-allowed).                                            |
| 409 **Publish and apply a widget design before installing it** | No design revision is applied to the channel.                                                                                    | Publish a design revision and apply it. See [Design the widget](/channels/website-widget/design/). |
| 503 **The selected widget release is unavailable**             | The applied revision was built for a widget release that is no longer offered.                                                   | Publish a new revision of the design and apply it.                                                 |
| Another status with **Widget presentation is unavailable**     | The entry point is disabled, the channel is paused or deleted, the widget ID is unknown, or the service was briefly unavailable. | Check the channel and entry point in the console, then select **Try again**.                       |

## The widget does not appear at all

* **The script is missing or never ran.** Check that the page source contains the loader script and that the **Network** tab shows `loader.js` loading with status 200.
* **The widget ID is wrong.** The loader silently does nothing when `data-widget-id` is missing or malformed. Copy the code again from the **Install** tab.
* **An inline container is missing.** For an inline design, the element named in `data-container` must exist when the loader runs. Otherwise the widget fails to load. Put the container before the script, or add the script after your app renders the container.
* **The design changed between popup and inline.** If you applied a revision with a different **Display mode**, update the embed code. A popup snippet does not render an inline design.
* **It is still loading.** The loader waits up to 12 seconds for the widget’s settings and 20 seconds for the widget itself before it shows **Chat unavailable**.

## Origin not allowed

The widget works only on the exact origins listed on the website entry point, under **General** then **Allowed website origin**.

* Scheme, host and port must match exactly. `https://example.com` does not cover `https://www.example.com` or `https://shop.example.com`.
* Paths and wildcards are not allowed. Enter `https://example.com`, not `https://example.com/support`.
* HTTP only works for `localhost`, `127.0.0.1` and `.localhost` hosts.

## The widget is unavailable on other hosts

A staging, preview or test site is a different origin. Either add it as an allowed origin (up to 10 per entry point) or, to keep test traffic separate, create a second website channel for your test hosts and use its widget ID there.

## Content Security Policy errors

If your site sends a `Content-Security-Policy`, the browser console shows messages such as “Refused to load the script” or “Refused to connect”. Add the sources the widget needs and keep your existing ones:

```plaintext
script-src https://api.caplo.si;
connect-src https://api.caplo.si;
font-src https://api.caplo.si;
img-src blob:;
worker-src blob:;
```

* A missing `script-src` stops the widget loading.
* A missing `connect-src` shows **Chat unavailable**, or the widget opens but cannot send messages.
* A missing `font-src` falls back to the device font. A missing `img-src blob:` hides your logo and avatar. A missing `worker-src blob:` stops map results rendering.
* For voice, also allow `wss://livekit.caplo.si` in `connect-src`.
* If your policy uses nonces, add `nonce="<NONCE>"` to the loader script tag. The widget applies the same nonce to its styles.

The **Install** tab shows these sources under **Content Security Policy additions**.

## Voice does not start

* **No voice button.** The channel must allow website voice, and the entry point’s **Conversation modes** must be **Text + voice**. See [Website widget settings](/channels/website-widget/settings/#text-and-voice).
* **“Microphone access is unavailable. Check your browser permissions and audio device.”** The visitor blocked the microphone, or the browser has no input device. The visitor needs to allow microphone access for your site in the browser’s site settings and try again.
* **Embedded in an iframe.** If your page shows the widget inside an iframe, the iframe needs `allow="microphone"`.
* **“Voice is busy or unavailable. Please try again shortly.”** The call could not start. Try again; if it keeps happening, check the agent’s voice settings and that its speech providers are on under **Integrations** then **Service providers**. See [Voice and speech](/providers/voice-and-speech/).
* **“Enable audio playback”** appears when the browser blocked sound until the visitor interacts with the page. The visitor selects it to hear the agent.

## Still stuck

Collect the widget ID, the page URL, the `caplo:error` detail and the failing request from the **Network** tab, then [contact support](/resources/support/).
