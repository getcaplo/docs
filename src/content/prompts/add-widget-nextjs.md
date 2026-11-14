---
title: Add the Caplo widget to my Next.js app
description: Adds the website widget to a Next.js App Router project with next/script or a client component, updates the CSP, and checks that it loads.
---
Goal: add the Caplo website widget to this Next.js (App Router) app.

Read these pages first:
- https://docs.caplo.si/channels/website-widget/install.md
- https://docs.caplo.si/channels/website-widget/javascript-api.md
- https://docs.caplo.si/channels/website-widget/troubleshooting.md

Values I will give you:
- Widget ID: <WIDGET_ID> (from the Install tab of the website entry point in the Caplo console)
- Display mode: <POPUP_OR_INLINE>
- For an inline design, the route and position for the conversation: <ROUTE_AND_POSITION>

Steps:
1. Put the widget ID in configuration that is safe to expose to the browser, for example `NEXT_PUBLIC_CAPLO_WIDGET_ID`. It is a public identifier, not a secret.
2. For a popup design, add to `app/layout.tsx`, inside `<body>` after `{children}`:
   ```tsx
   <Script
     src="https://api.caplo.si/v1/messaging/widget/loader.js"
     data-widget-id={process.env.NEXT_PUBLIC_CAPLO_WIDGET_ID}
     strategy="afterInteractive"
   />
   ```
   with `import Script from 'next/script'`.
3. For an inline design, do not use `next/script` (it loads a script only once per session, so the widget would not return after navigation). Create a client component (`'use client'`) that renders a `div` whose id is `caplo-` followed by the widget ID and, in a `useEffect`, appends a script element with `src` set to the loader URL, `async = true`, `dataset.widgetId` and `dataset.container = '#' + CSS.escape(containerId)`, and removes the script element on cleanup. Render it on <ROUTE_AND_POSITION>.
4. If the app sets a Content-Security-Policy (middleware, `next.config` headers or a meta tag), add `https://api.caplo.si` to `script-src`, `connect-src` and `font-src`, add `blob:` to `img-src` and `worker-src`, and keep every existing source. If it uses a per-request nonce, pass it to `<Script nonce={nonce} />` or set `script.nonce` in the component. If voice is enabled for this channel, also add `wss://livekit.caplo.si` to `connect-src`.
5. Optionally, if I have a "Help" or "Chat with us" button, open the widget from it with `window.CaploWidget.get('<WIDGET_ID>').open()` once the loader has loaded.

Verify:
- Run the dev server on an origin listed as an allowed origin of the entry point (ask me to add `http://localhost:<PORT>` in the console if needed).
- Load the page, navigate to another route and back, and confirm the widget stays (popup) or comes back (inline). The browser console must show no CSP errors.
- If you see "Chat unavailable · Try again", inspect the POST to `/v1/messaging/widget/presentation` in the Network tab and explain the cause using the troubleshooting page.

Rules:
- No API keys, tokens or credentials in code, environment files or chat. The widget needs none.
- Ask me before changing anything in the Caplo console, and before deploying.
