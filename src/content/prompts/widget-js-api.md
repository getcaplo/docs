---
title: Open the Caplo widget from my own button
description: Wires an existing button on my site to open the website widget and passes visitor hints such as name, locale and page.
---
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
