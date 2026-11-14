---
title: Add the Caplo widget to my website
description: Adds the website widget embed code to a plain HTML site, updates the Content Security Policy if there is one, and checks that it loads.
---
Goal: add the Caplo website widget to this website so visitors can chat with our agent.

Read these pages first:
- https://docs.caplo.si/channels/website-widget/install.md
- https://docs.caplo.si/channels/website-widget/troubleshooting.md

Values I will give you:
- Widget ID: <WIDGET_ID> (from the Install tab of the website entry point in the Caplo console)
- Display mode: <POPUP_OR_INLINE>
- For an inline design, where the conversation should appear: <PAGE_AND_POSITION>

Steps:
1. Find the HTML templates or layout files that render every page that should show the widget. Prefer one shared layout or footer include over editing each page.
2. For a popup design, add this just before `</body>`:
   ```html
   <script
     src="https://api.caplo.si/v1/messaging/widget/loader.js"
     data-widget-id="<WIDGET_ID>"
     async
   ></script>
   ```
   For an inline design, add `<div id="caplo-<WIDGET_ID>"></div>` where the conversation should appear, and the script after it with `data-container="#caplo-<WIDGET_ID>"`. If the widget ID contains a dot, escape it in the selector (`\.`).
3. Look for a Content-Security-Policy, in server config, a meta tag or framework headers. If there is one, add `https://api.caplo.si` to `script-src`, `connect-src` and `font-src`, add `blob:` to `img-src` and `worker-src`, and keep every existing source. If the policy uses nonces, add the page's nonce attribute to the script tag. If voice is enabled for this channel, also add `wss://livekit.caplo.si` to `connect-src`.
4. Do not add any API key, token or credential. The widget ID is public and is the only value the snippet needs.

Verify:
- Serve the site on an origin that is listed as an allowed origin of the entry point (for local testing, ask me to add `http://localhost:<PORT>` in the console).
- Open a page and confirm the launcher or inline conversation appears, and the browser console shows no CSP errors.
- If you see "Chat unavailable · Try again", check the POST to `/v1/messaging/widget/presentation` in the Network tab and use the troubleshooting page to explain the cause to me.

Rules:
- Only change the website's files. Ask me before changing allowed origins, designs or channels in the Caplo console; you cannot do that from the code.
- Ask before deploying or publishing the site.
