# Website widget JavaScript API

> Control the website widget from your page with window.CaploWidget, sign visitors in from your own site, and listen to widget events.

The widget loader adds a small API to your page so your own code can open the widget, pass hints about the visitor, sign the visitor in, and react to widget events. Everything here runs in the visitor’s browser; nothing on this page needs a Caplo credential.

## Get the widget control

```plaintext
const chat = window.CaploWidget.get('<WIDGET_ID>');
```

`window.CaploWidget` exists once the loader script has run. `get(id)` returns the control for that widget ID, or `undefined` if no widget with that ID is loaded on the page. `window.CaploWidget.protocolVersion` is `2`.

The control is available as soon as the loader runs, before the widget has finished loading. Calls you make early are kept and applied when the widget mounts, so you do not need to wait for `caplo:mounted` to call `open()` or `setVisitorHints()`.

Because the loader script is `async`, run your code after it loads:

```plaintext
function withCaplo(widgetId, callback) {
  const chat = window.CaploWidget?.get(widgetId);
  if (chat) return callback(chat);
  const script = document.querySelector(`script[data-widget-id="${widgetId}"]`);
  script?.addEventListener('load', () => callback(window.CaploWidget.get(widgetId)), { once: true });
}
```

## Methods

| Method                                                                       | What it does                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `open()`                                                                     | Opens the popup widget. If the widget is still loading, it opens when it mounts.                                    |
| `close()`                                                                    | Closes the popup widget.                                                                                            |
| `setVisitorHints(hints)`                                                     | Passes unverified hints about the visitor to the conversation. Pass `null` to clear them.                           |
| `unmount()`                                                                  | Removes the widget from the page and closes its connection. To show it again, add the loader script again.          |
| `identity.configure({ getToken, when })`                                     | Registers your page as a sign-in provider. See [Sign visitors in from your page](#sign-visitors-in-from-your-page). |
| `identity.refresh()`                                                         | Tells the widget your page’s signed-in user changed. Returns a promise.                                             |
| `identity.signOut()`                                                         | Tells the widget your page signed its user out. Returns a promise.                                                  |
| `addEventListener(type, listener)` and `removeEventListener(type, listener)` | Listen to `caplo:identity` and `caplo:identity-signout-requested`.                                                  |

### Open the widget from your own button

```plaintext
withCaplo('<WIDGET_ID>', (chat) => {
  document.querySelector('#help-button').addEventListener('click', () => chat.open());
});
```

### Visitor hints

Hints give the agent context it would otherwise have to ask for. They are never treated as identity: a visitor’s name in a hint does not let tools act on that person’s account.

The widget always sends the browser’s language as `locale` and its time zone as `timeZone`, so the agent knows the visitor’s local date and can offer times in their zone without asking. Values you set replace the browser’s.

```plaintext
chat.setVisitorHints({
  name: 'Ada',
  locale: 'en-GB',
  page: window.location.href,
});
```

| Field      | Rules                                                                           |
| ---------- | ------------------------------------------------------------------------------- |
| `name`     | 1 to 80 characters, no control characters.                                      |
| `locale`   | A BCP 47 language tag, such as `en-GB` or `fr`, up to 35 characters.            |
| `page`     | An `http` or `https` URL without a user name or password, up to 512 characters. |
| `timeZone` | An IANA time zone, such as `Europe/London`.                                     |

Any other field throws a `TypeError`. A value that breaks these rules throws a `TypeError`; if you set it before the widget has loaded, the widget fails to load and shows **Chat unavailable · Try again**. Check values before you pass them, and leave a field out rather than sending an empty string. Each call replaces the previous hints. Hints travel with the visitor’s messages, so call `setVisitorHints` again when the page changes in a single page app.

## Sign visitors in from your page

If visitors are already signed in to your site, your page can sign them in to the widget too. This uses a **Host sign-in** connection that you set up under **Settings** then **Customer identity**, with these settings on the website entry point:

* **Customer verification** allows verified visitors, and the host sign-in connection is one of the **Sign-in methods**.
* **Consent mode** is **Show a notice after verification**. With the agreement mode, host sign-in does not run automatically.

Your backend signs a short-lived assertion for the signed-in user; the browser never holds your signing key. See [Website widget settings](/channels/website-widget/settings/#customer-verification).

```plaintext
chat.identity.configure({
  when: 'open',
  getToken: async ({ nonce, requirement }) => {
    const response = await fetch('/support/caplo-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nonce, requirement }),
    });
    return response.status === 200 ? response.text() : null;
  },
});
```

`getToken` receives:

| Field         | Meaning                                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nonce`       | A one-time value your backend must put in the assertion.                                                                                                                                                        |
| `requirement` | `null`, or the level the conversation needs: `level` (`low`, `standard` or `high`), optionally `maxAuthAgeSeconds`, and for a confirmation of a specific action, `action` with an `id`, `summary` and `digest`. |

Return the signed assertion as a string, or `null` when nobody is signed in on your page. The widget waits up to 30 seconds for an ordinary sign-in and up to 5 minutes when a specific action needs confirmation.

`when` decides when the widget asks for a token:

| `when`           | The widget signs the visitor in                             |
| ---------------- | ----------------------------------------------------------- |
| `open` (default) | When the widget opens, or when the visitor sends a message. |
| `first-message`  | When the visitor sends their first message.                 |
| `required`       | Only when the channel or an action requires verification.   |

Call `identity.refresh()` after your user signs in or switches account, and `identity.signOut()` after they sign out. Both return promises.

Caution

Never put assertions in URLs, logs or browser storage. Treat them like passwords: each one proves who the visitor is.

## Events

The loader dispatches two events on its `<script>` element. They bubble, so you can listen on `document`:

| Event           | When                                                                                            | `event.detail`                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `caplo:mounted` | The widget has loaded and rendered.                                                             | `{ installationId, bundleId, designId, revision }`: the widget ID, the widget release, and the design and revision shown. |
| `caplo:error`   | The widget could not load, so the page shows a **Chat unavailable · Try again** button instead. | `{ installationId, code }`, with `code` `"presentation-unavailable"`.                                                     |

Listen to identity events on the control:

| Event                              | When                                                                   | `event.detail`               |
| ---------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| `caplo:identity`                   | The visitor’s verification state changed.                              | `{ state, level?, reason? }` |
| `caplo:identity-signout-requested` | A visitor signed in through your page chose to sign out in the widget. | `{}`                         |

`state` is `anonymous`, `verified`, `reauthenticate` (the visitor must verify again) or `ended` (the verified conversation ended). `level` is present when `state` is `verified`. `reason` explains the change when there is one, for example `signed_in`, `stepped_up`, `signed_out` or `host_signed_out`.

```plaintext
document.addEventListener('caplo:error', (event) => {
  console.warn('Caplo widget unavailable', event.detail);
});


chat.addEventListener('caplo:identity', (event) => {
  console.log('Visitor is now', event.detail.state);
});


chat.addEventListener('caplo:identity-signout-requested', async () => {
  await signOutOfMySite();
  await chat.identity.signOut();
});
```

The widget also dispatches `caplo:open` and `caplo:close` (no detail) on its own element when a visitor opens or closes the popup. They bubble to `document`.

AI prompt

Open the Caplo widget from my own button

Wires an existing button on my site to open the website widget and passes visitor hints such as name, locale and page.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20let%20visitors%20open%20the%20Caplo%20website%20widget%20from%20a%20button%20on%20my%20site%2C%20and%20pass%20the%20agent%20hints%20about%20the%20visitor.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%0A-%20The%20button%20or%20link%20that%20should%20open%20the%20chat%3A%20%3CBUTTON_SELECTOR_OR_COMPONENT%3E%0A-%20Where%20the%20signed-in%20user's%20display%20name%20and%20locale%20come%20from%2C%20if%20anywhere%3A%20%3CUSER_SOURCE%3E%0A%0ASteps%3A%0A1.%20Confirm%20the%20widget's%20loader%20script%20is%20already%20on%20the%20page%20\(%60script%5Bdata-widget-id%3D%22%3CWIDGET_ID%3E%22%5D%60\).%20If%20not%2C%20add%20it%20first%20as%20the%20install%20page%20describes.%0A2.%20Write%20a%20small%20helper%20that%20runs%20a%20callback%20with%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\)%60%2C%20waiting%20for%20the%20loader%20script's%20%60load%60%20event%20if%20%60window.CaploWidget%60%20is%20not%20defined%20yet.%20Do%20not%20wait%20for%20%60caplo%3Amounted%60%3B%20calls%20made%20before%20the%20widget%20mounts%20are%20applied%20when%20it%20does.%0A3.%20Attach%20a%20click%20handler%20to%20%3CBUTTON_SELECTOR_OR_COMPONENT%3E%20that%20calls%20%60open\(\)%60%20on%20the%20control.%20In%20a%20framework%2C%20attach%20it%20in%20the%20component's%20mount%20effect%20and%20detach%20it%20on%20cleanup.%0A4.%20Call%20%60setVisitorHints\(%7B%20name%2C%20locale%2C%20page%20%7D\)%60%20with%20values%20from%20%3CUSER_SOURCE%3E%20and%20%60window.location.href%60.%20Only%20include%20a%20field%20when%20its%20value%20is%20valid%3A%20%60name%60%201%20to%2080%20characters%2C%20%60locale%60%20a%20BCP%2047%20tag%20such%20as%20%60en-GB%60%2C%20%60page%60%20an%20http\(s\)%20URL%20without%20credentials%2C%20up%20to%20512%20characters.%20An%20invalid%20value%20throws%20a%20TypeError%20and%20can%20stop%20the%20widget%20loading.%20In%20a%20single%20page%20app%2C%20call%20it%20again%20after%20each%20route%20change.%0A5.%20Listen%20for%20%60caplo%3Aerror%60%20on%20%60document%60%20and%20log%20%60event.detail%60%20so%20failures%20are%20visible%20during%20testing.%0A%0AVerify%3A%0A-%20On%20an%20allowed%20origin%2C%20clicking%20the%20button%20opens%20the%20widget%2C%20including%20when%20clicked%20before%20the%20widget%20finished%20loading.%0A-%20Hints%20are%20only%20hints%3A%20do%20not%20use%20them%20to%20identify%20the%20customer%20to%20tools.%20Verified%20identity%20needs%20host%20sign-in%2C%20which%20is%20a%20separate%20task.%0A%0ARules%3A%0A-%20No%20API%20keys%2C%20tokens%20or%20assertions%20in%20front-end%20code%2C%20logs%20or%20chat.%0A-%20Ask%20me%20before%20changing%20anything%20in%20the%20Caplo%20console%2C%20and%20before%20deploying.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20let%20visitors%20open%20the%20Caplo%20website%20widget%20from%20a%20button%20on%20my%20site%2C%20and%20pass%20the%20agent%20hints%20about%20the%20visitor.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%0A-%20The%20button%20or%20link%20that%20should%20open%20the%20chat%3A%20%3CBUTTON_SELECTOR_OR_COMPONENT%3E%0A-%20Where%20the%20signed-in%20user's%20display%20name%20and%20locale%20come%20from%2C%20if%20anywhere%3A%20%3CUSER_SOURCE%3E%0A%0ASteps%3A%0A1.%20Confirm%20the%20widget's%20loader%20script%20is%20already%20on%20the%20page%20\(%60script%5Bdata-widget-id%3D%22%3CWIDGET_ID%3E%22%5D%60\).%20If%20not%2C%20add%20it%20first%20as%20the%20install%20page%20describes.%0A2.%20Write%20a%20small%20helper%20that%20runs%20a%20callback%20with%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\)%60%2C%20waiting%20for%20the%20loader%20script's%20%60load%60%20event%20if%20%60window.CaploWidget%60%20is%20not%20defined%20yet.%20Do%20not%20wait%20for%20%60caplo%3Amounted%60%3B%20calls%20made%20before%20the%20widget%20mounts%20are%20applied%20when%20it%20does.%0A3.%20Attach%20a%20click%20handler%20to%20%3CBUTTON_SELECTOR_OR_COMPONENT%3E%20that%20calls%20%60open\(\)%60%20on%20the%20control.%20In%20a%20framework%2C%20attach%20it%20in%20the%20component's%20mount%20effect%20and%20detach%20it%20on%20cleanup.%0A4.%20Call%20%60setVisitorHints\(%7B%20name%2C%20locale%2C%20page%20%7D\)%60%20with%20values%20from%20%3CUSER_SOURCE%3E%20and%20%60window.location.href%60.%20Only%20include%20a%20field%20when%20its%20value%20is%20valid%3A%20%60name%60%201%20to%2080%20characters%2C%20%60locale%60%20a%20BCP%2047%20tag%20such%20as%20%60en-GB%60%2C%20%60page%60%20an%20http\(s\)%20URL%20without%20credentials%2C%20up%20to%20512%20characters.%20An%20invalid%20value%20throws%20a%20TypeError%20and%20can%20stop%20the%20widget%20loading.%20In%20a%20single%20page%20app%2C%20call%20it%20again%20after%20each%20route%20change.%0A5.%20Listen%20for%20%60caplo%3Aerror%60%20on%20%60document%60%20and%20log%20%60event.detail%60%20so%20failures%20are%20visible%20during%20testing.%0A%0AVerify%3A%0A-%20On%20an%20allowed%20origin%2C%20clicking%20the%20button%20opens%20the%20widget%2C%20including%20when%20clicked%20before%20the%20widget%20finished%20loading.%0A-%20Hints%20are%20only%20hints%3A%20do%20not%20use%20them%20to%20identify%20the%20customer%20to%20tools.%20Verified%20identity%20needs%20host%20sign-in%2C%20which%20is%20a%20separate%20task.%0A%0ARules%3A%0A-%20No%20API%20keys%2C%20tokens%20or%20assertions%20in%20front-end%20code%2C%20logs%20or%20chat.%0A-%20Ask%20me%20before%20changing%20anything%20in%20the%20Caplo%20console%2C%20and%20before%20deploying.)

Show prompt

```
Goal: let visitors open the Caplo website widget from a button on my site, and pass the agent hints about the visitor.

Read these pages first:
- https://docs.caplo.si/channels/website-widget/javascript-api.md
- https://docs.caplo.si/channels/website-widget/install.md

Values I will give you:
- Widget ID: <WIDGET_ID>
- The button or link that should open the chat: <BUTTON_SELECTOR_OR_COMPONENT>
- Where the signed-in user's display name and locale come from, if anywhere: <USER_SOURCE>

Steps:
1. Confirm the widget's loader script is already on the page (`script[data-widget-id="<WIDGET_ID>"]`). If not, add it first as the install page describes.
2. Write a small helper that runs a callback with `window.CaploWidget.get('<WIDGET_ID>')`, waiting for the loader script's `load` event if `window.CaploWidget` is not defined yet. Do not wait for `caplo:mounted`; calls made before the widget mounts are applied when it does.
3. Attach a click handler to <BUTTON_SELECTOR_OR_COMPONENT> that calls `open()` on the control. In a framework, attach it in the component's mount effect and detach it on cleanup.
4. Call `setVisitorHints({ name, locale, page })` with values from <USER_SOURCE> and `window.location.href`. Only include a field when its value is valid: `name` 1 to 80 characters, `locale` a BCP 47 tag such as `en-GB`, `page` an http(s) URL without credentials, up to 512 characters. An invalid value throws a TypeError and can stop the widget loading. In a single page app, call it again after each route change.
5. Listen for `caplo:error` on `document` and log `event.detail` so failures are visible during testing.

Verify:
- On an allowed origin, clicking the button opens the widget, including when clicked before the widget finished loading.
- Hints are only hints: do not use them to identify the customer to tools. Verified identity needs host sign-in, which is a separate task.

Rules:
- No API keys, tokens or assertions in front-end code, logs or chat.
- Ask me before changing anything in the Caplo console, and before deploying.
```
