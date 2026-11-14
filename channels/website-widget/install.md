# Install the website widget

> Copy the widget embed code from the console and add it to a plain HTML site, a Next.js app or a React single page app.

The website widget is one script tag. It loads the widget from Caplo, shows the published design you applied to the channel, and connects visitors to the agent release the channel serves.

## Before you start

* Create a website channel (**Live chat widget**) for a published agent. See [Channels](/channels/).
* Publish a widget design and apply a revision to the channel. The console only gives you embed code once a design is applied, because the code depends on whether the design is a popup or an inline container. See [Design the widget](/channels/website-widget/design/).
* Know the exact origin of every site that will show the widget, for example `https://www.example.com`.

## Get the embed code

1. In **Channels**, open the website channel and select **Configure & install** on its website entry point.

2. On the **General** tab, check **Allowed website origin**. Add every origin that will show the widget, then select **Save entry point**.

3. Open the **Install** tab and select **Copy embed code**.

If **Copy embed code** is disabled, the hint next to it says why: no design is applied, there are unsaved edits, the entry point is disabled, or the channel is paused.

The **Widget ID** on the Install tab is a public identifier. The snippet contains no credentials, and you never need to add any.

## The embed code

A popup design (a launcher button in a corner of the page):

```html
<script
  src="https://api.caplo.si/v1/messaging/widget/loader.js"
  data-widget-id="<WIDGET_ID>"
  async
></script>
```

An inline design (the conversation sits inside an element on your page) adds a container and points the script at it:

```html
<div id="caplo-<WIDGET_ID>"></div>
<script
  src="https://api.caplo.si/v1/messaging/widget/loader.js"
  data-widget-id="<WIDGET_ID>"
  data-container="#caplo-<WIDGET_ID>"
  async
></script>
```

Always copy the code from the console rather than typing it: the console escapes the container selector when the widget ID contains a dot.

| Attribute          | Required                  | What it does                                                                                                                                                       |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src`              | Yes                       | The widget loader. Load it from Caplo; a self-hosted copy cannot reach the widget service.                                                                         |
| `data-widget-id`   | Yes                       | The widget ID from the Install tab.                                                                                                                                |
| `data-container`   | Inline designs            | A CSS selector for the element the widget renders into. The element must exist on the page when the loader runs.                                                   |
| `data-persistence` | No                        | By default the widget restores the visitor’s conversation after a reload in the same browser tab. Set `data-persistence="none"` to start fresh on every page load. |
| `nonce`            | When your CSP uses nonces | Add your page’s nonce. The widget applies it to the styles it adds.                                                                                                |
| `async`            | Recommended               | Loads the widget without blocking your page.                                                                                                                       |

The widget ID stays the same when you apply a new design revision, so you do not need to change your site when the appearance changes. Switching a design between popup and inline is the exception: inline needs the container element and `data-container`.

## Allowed origins

The widget only works on the origins listed on the entry point.

* List exact origins: scheme and host, plus the port if it is not the default. No paths and no wildcards.
* `https://example.com` and `https://www.example.com` are different origins. List both if you use both.
* Use HTTPS. HTTP is accepted only for `localhost`, `127.0.0.1` and `.localhost` hosts, which is useful for local development.
* You can list up to 10 origins per entry point.

On any other site, including a staging host you have not listed, the widget shows a **Chat unavailable · Try again** button instead of the chat. Removing an origin closes open conversations on that site.

## Add it to your site

**HTML**

Paste the code just before the closing `</body>` tag on every page that should show the widget. For an inline design, place the `<div>` where the conversation should appear and keep the script after it.

```html
    <!-- your page content -->
    <script
      src="https://api.caplo.si/v1/messaging/widget/loader.js"
      data-widget-id="<WIDGET_ID>"
      async
    ></script>
  </body>
</html>
```

**Next.js (App Router)**

For a popup design, load the script once in the root layout with `next/script`. It stays on the page across client-side navigation.

app/layout.tsx

```tsx
import Script from 'next/script';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://api.caplo.si/v1/messaging/widget/loader.js"
          data-widget-id="<WIDGET_ID>"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

For an inline design shown on one route, use the client component from the React tab instead of `next/script`. `next/script` loads a given script only once per page session, so the widget would not come back after a visitor navigates away and returns.

If your site sets a Content Security Policy with a nonce, pass it to `<Script nonce={nonce} />`.

**React SPA**

For a popup design, add the embed code to your `index.html`, before `</body>`. The widget stays mounted while your router changes pages.

For an inline design, render the container and add the loader from an effect:

```tsx
import { useEffect } from 'react';


const LOADER = 'https://api.caplo.si/v1/messaging/widget/loader.js';


export function CaploInlineWidget({ widgetId }: { widgetId: string }) {
  const containerId = `caplo-${widgetId}`;
  useEffect(() => {
    const script = document.createElement('script');
    script.src = LOADER;
    script.async = true;
    script.dataset.widgetId = widgetId;
    script.dataset.container = `#${CSS.escape(containerId)}`;
    document.body.append(script);
    return () => script.remove();
  }, [widgetId, containerId]);
  return <div id={containerId} />;
}
```

When the container leaves the page, the widget unmounts itself. Mounting the component again adds a new script, and the widget renders into the new container. Loading the same widget ID twice on one page is harmless: the second script does nothing.

## Content Security Policy

If your site sends a `Content-Security-Policy` header, add these sources to the matching directives and keep your existing sources:

```text
script-src https://api.caplo.si;
connect-src https://api.caplo.si;
font-src https://api.caplo.si;
img-src blob:;
worker-src blob:;
```

The console shows the same list under **Content Security Policy additions** on the Install tab. Brand logos and avatars render from `blob:` URLs, and map results start a worker from a `blob:` URL.

If the channel allows voice, the browser also connects to Caplo’s media server for the call. Add it to `connect-src`:

```text
connect-src https://api.caplo.si wss://livekit.caplo.si;
```

Caplo never changes your site’s policy. See [Troubleshoot the website widget](/channels/website-widget/troubleshooting/) for how CSP errors show up.

## Single page apps

* The loader runs once per script element. Calling it again with the same widget ID on the same page does nothing until the widget is unmounted.
* A popup widget stays mounted across client-side route changes. To remove it on some routes, call `unmount()` from the [JavaScript API](/channels/website-widget/javascript-api/); add the script again to bring it back.
* An inline widget unmounts itself when its container is removed from the page.
* On a full page unload the widget closes its connection. With the default persistence, the conversation resumes when the visitor returns in the same tab.

## Check the installation

1. Open a page on an allowed origin. The launcher appears in the corner you chose, or the conversation appears in its container.

2. Send a message and check that the agent replies. The conversation appears in **Conversations** in the console.

3. If you see **Chat unavailable · Try again**, or nothing, see [Troubleshoot the website widget](/channels/website-widget/troubleshooting/).

AI prompt

Add the Caplo widget to my website

Adds the website widget embed code to a plain HTML site, updates the Content Security Policy if there is one, and checks that it loads.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20add%20the%20Caplo%20website%20widget%20to%20this%20website%20so%20visitors%20can%20chat%20with%20our%20agent.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Ftroubleshooting.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%20\(from%20the%20Install%20tab%20of%20the%20website%20entry%20point%20in%20the%20Caplo%20console\)%0A-%20Display%20mode%3A%20%3CPOPUP_OR_INLINE%3E%0A-%20For%20an%20inline%20design%2C%20where%20the%20conversation%20should%20appear%3A%20%3CPAGE_AND_POSITION%3E%0A%0ASteps%3A%0A1.%20Find%20the%20HTML%20templates%20or%20layout%20files%20that%20render%20every%20page%20that%20should%20show%20the%20widget.%20Prefer%20one%20shared%20layout%20or%20footer%20include%20over%20editing%20each%20page.%0A2.%20For%20a%20popup%20design%2C%20add%20this%20just%20before%20%60%3C%2Fbody%3E%60%3A%0A%20%20%20%60%60%60html%0A%20%20%20%3Cscript%0A%20%20%20%20%20src%3D%22https%3A%2F%2Fapi.caplo.si%2Fv1%2Fmessaging%2Fwidget%2Floader.js%22%0A%20%20%20%20%20data-widget-id%3D%22%3CWIDGET_ID%3E%22%0A%20%20%20%20%20async%0A%20%20%20%3E%3C%2Fscript%3E%0A%20%20%20%60%60%60%0A%20%20%20For%20an%20inline%20design%2C%20add%20%60%3Cdiv%20id%3D%22caplo-%3CWIDGET_ID%3E%22%3E%3C%2Fdiv%3E%60%20where%20the%20conversation%20should%20appear%2C%20and%20the%20script%20after%20it%20with%20%60data-container%3D%22%23caplo-%3CWIDGET_ID%3E%22%60.%20If%20the%20widget%20ID%20contains%20a%20dot%2C%20escape%20it%20in%20the%20selector%20\(%60%5C.%60\).%0A3.%20Look%20for%20a%20Content-Security-Policy%2C%20in%20server%20config%2C%20a%20meta%20tag%20or%20framework%20headers.%20If%20there%20is%20one%2C%20add%20%60https%3A%2F%2Fapi.caplo.si%60%20to%20%60script-src%60%2C%20%60connect-src%60%20and%20%60font-src%60%2C%20add%20%60blob%3A%60%20to%20%60img-src%60%20and%20%60worker-src%60%2C%20and%20keep%20every%20existing%20source.%20If%20the%20policy%20uses%20nonces%2C%20add%20the%20page's%20nonce%20attribute%20to%20the%20script%20tag.%20If%20voice%20is%20enabled%20for%20this%20channel%2C%20also%20add%20%60wss%3A%2F%2Flivekit.caplo.si%60%20to%20%60connect-src%60.%0A4.%20Do%20not%20add%20any%20API%20key%2C%20token%20or%20credential.%20The%20widget%20ID%20is%20public%20and%20is%20the%20only%20value%20the%20snippet%20needs.%0A%0AVerify%3A%0A-%20Serve%20the%20site%20on%20an%20origin%20that%20is%20listed%20as%20an%20allowed%20origin%20of%20the%20entry%20point%20\(for%20local%20testing%2C%20ask%20me%20to%20add%20%60http%3A%2F%2Flocalhost%3A%3CPORT%3E%60%20in%20the%20console\).%0A-%20Open%20a%20page%20and%20confirm%20the%20launcher%20or%20inline%20conversation%20appears%2C%20and%20the%20browser%20console%20shows%20no%20CSP%20errors.%0A-%20If%20you%20see%20%22Chat%20unavailable%20%C2%B7%20Try%20again%22%2C%20check%20the%20POST%20to%20%60%2Fv1%2Fmessaging%2Fwidget%2Fpresentation%60%20in%20the%20Network%20tab%20and%20use%20the%20troubleshooting%20page%20to%20explain%20the%20cause%20to%20me.%0A%0ARules%3A%0A-%20Only%20change%20the%20website's%20files.%20Ask%20me%20before%20changing%20allowed%20origins%2C%20designs%20or%20channels%20in%20the%20Caplo%20console%3B%20you%20cannot%20do%20that%20from%20the%20code.%0A-%20Ask%20before%20deploying%20or%20publishing%20the%20site.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20add%20the%20Caplo%20website%20widget%20to%20this%20website%20so%20visitors%20can%20chat%20with%20our%20agent.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Ftroubleshooting.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%20\(from%20the%20Install%20tab%20of%20the%20website%20entry%20point%20in%20the%20Caplo%20console\)%0A-%20Display%20mode%3A%20%3CPOPUP_OR_INLINE%3E%0A-%20For%20an%20inline%20design%2C%20where%20the%20conversation%20should%20appear%3A%20%3CPAGE_AND_POSITION%3E%0A%0ASteps%3A%0A1.%20Find%20the%20HTML%20templates%20or%20layout%20files%20that%20render%20every%20page%20that%20should%20show%20the%20widget.%20Prefer%20one%20shared%20layout%20or%20footer%20include%20over%20editing%20each%20page.%0A2.%20For%20a%20popup%20design%2C%20add%20this%20just%20before%20%60%3C%2Fbody%3E%60%3A%0A%20%20%20%60%60%60html%0A%20%20%20%3Cscript%0A%20%20%20%20%20src%3D%22https%3A%2F%2Fapi.caplo.si%2Fv1%2Fmessaging%2Fwidget%2Floader.js%22%0A%20%20%20%20%20data-widget-id%3D%22%3CWIDGET_ID%3E%22%0A%20%20%20%20%20async%0A%20%20%20%3E%3C%2Fscript%3E%0A%20%20%20%60%60%60%0A%20%20%20For%20an%20inline%20design%2C%20add%20%60%3Cdiv%20id%3D%22caplo-%3CWIDGET_ID%3E%22%3E%3C%2Fdiv%3E%60%20where%20the%20conversation%20should%20appear%2C%20and%20the%20script%20after%20it%20with%20%60data-container%3D%22%23caplo-%3CWIDGET_ID%3E%22%60.%20If%20the%20widget%20ID%20contains%20a%20dot%2C%20escape%20it%20in%20the%20selector%20\(%60%5C.%60\).%0A3.%20Look%20for%20a%20Content-Security-Policy%2C%20in%20server%20config%2C%20a%20meta%20tag%20or%20framework%20headers.%20If%20there%20is%20one%2C%20add%20%60https%3A%2F%2Fapi.caplo.si%60%20to%20%60script-src%60%2C%20%60connect-src%60%20and%20%60font-src%60%2C%20add%20%60blob%3A%60%20to%20%60img-src%60%20and%20%60worker-src%60%2C%20and%20keep%20every%20existing%20source.%20If%20the%20policy%20uses%20nonces%2C%20add%20the%20page's%20nonce%20attribute%20to%20the%20script%20tag.%20If%20voice%20is%20enabled%20for%20this%20channel%2C%20also%20add%20%60wss%3A%2F%2Flivekit.caplo.si%60%20to%20%60connect-src%60.%0A4.%20Do%20not%20add%20any%20API%20key%2C%20token%20or%20credential.%20The%20widget%20ID%20is%20public%20and%20is%20the%20only%20value%20the%20snippet%20needs.%0A%0AVerify%3A%0A-%20Serve%20the%20site%20on%20an%20origin%20that%20is%20listed%20as%20an%20allowed%20origin%20of%20the%20entry%20point%20\(for%20local%20testing%2C%20ask%20me%20to%20add%20%60http%3A%2F%2Flocalhost%3A%3CPORT%3E%60%20in%20the%20console\).%0A-%20Open%20a%20page%20and%20confirm%20the%20launcher%20or%20inline%20conversation%20appears%2C%20and%20the%20browser%20console%20shows%20no%20CSP%20errors.%0A-%20If%20you%20see%20%22Chat%20unavailable%20%C2%B7%20Try%20again%22%2C%20check%20the%20POST%20to%20%60%2Fv1%2Fmessaging%2Fwidget%2Fpresentation%60%20in%20the%20Network%20tab%20and%20use%20the%20troubleshooting%20page%20to%20explain%20the%20cause%20to%20me.%0A%0ARules%3A%0A-%20Only%20change%20the%20website's%20files.%20Ask%20me%20before%20changing%20allowed%20origins%2C%20designs%20or%20channels%20in%20the%20Caplo%20console%3B%20you%20cannot%20do%20that%20from%20the%20code.%0A-%20Ask%20before%20deploying%20or%20publishing%20the%20site.)

Show prompt

````
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
````

AI prompt

Add the Caplo widget to my Next.js app

Adds the website widget to a Next.js App Router project with next/script or a client component, updates the CSP, and checks that it loads.

[Open in Claude](https://claude.ai/new?q=Goal%3A%20add%20the%20Caplo%20website%20widget%20to%20this%20Next.js%20\(App%20Router\)%20app.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Ftroubleshooting.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%20\(from%20the%20Install%20tab%20of%20the%20website%20entry%20point%20in%20the%20Caplo%20console\)%0A-%20Display%20mode%3A%20%3CPOPUP_OR_INLINE%3E%0A-%20For%20an%20inline%20design%2C%20the%20route%20and%20position%20for%20the%20conversation%3A%20%3CROUTE_AND_POSITION%3E%0A%0ASteps%3A%0A1.%20Put%20the%20widget%20ID%20in%20configuration%20that%20is%20safe%20to%20expose%20to%20the%20browser%2C%20for%20example%20%60NEXT_PUBLIC_CAPLO_WIDGET_ID%60.%20It%20is%20a%20public%20identifier%2C%20not%20a%20secret.%0A2.%20For%20a%20popup%20design%2C%20add%20to%20%60app%2Flayout.tsx%60%2C%20inside%20%60%3Cbody%3E%60%20after%20%60%7Bchildren%7D%60%3A%0A%20%20%20%60%60%60tsx%0A%20%20%20%3CScript%0A%20%20%20%20%20src%3D%22https%3A%2F%2Fapi.caplo.si%2Fv1%2Fmessaging%2Fwidget%2Floader.js%22%0A%20%20%20%20%20data-widget-id%3D%7Bprocess.env.NEXT_PUBLIC_CAPLO_WIDGET_ID%7D%0A%20%20%20%20%20strategy%3D%22afterInteractive%22%0A%20%20%20%2F%3E%0A%20%20%20%60%60%60%0A%20%20%20with%20%60import%20Script%20from%20'next%2Fscript'%60.%0A3.%20For%20an%20inline%20design%2C%20do%20not%20use%20%60next%2Fscript%60%20\(it%20loads%20a%20script%20only%20once%20per%20session%2C%20so%20the%20widget%20would%20not%20return%20after%20navigation\).%20Create%20a%20client%20component%20\(%60'use%20client'%60\)%20that%20renders%20a%20%60div%60%20whose%20id%20is%20%60caplo-%60%20followed%20by%20the%20widget%20ID%20and%2C%20in%20a%20%60useEffect%60%2C%20appends%20a%20script%20element%20with%20%60src%60%20set%20to%20the%20loader%20URL%2C%20%60async%20%3D%20true%60%2C%20%60dataset.widgetId%60%20and%20%60dataset.container%20%3D%20'%23'%20%2B%20CSS.escape\(containerId\)%60%2C%20and%20removes%20the%20script%20element%20on%20cleanup.%20Render%20it%20on%20%3CROUTE_AND_POSITION%3E.%0A4.%20If%20the%20app%20sets%20a%20Content-Security-Policy%20\(middleware%2C%20%60next.config%60%20headers%20or%20a%20meta%20tag\)%2C%20add%20%60https%3A%2F%2Fapi.caplo.si%60%20to%20%60script-src%60%2C%20%60connect-src%60%20and%20%60font-src%60%2C%20add%20%60blob%3A%60%20to%20%60img-src%60%20and%20%60worker-src%60%2C%20and%20keep%20every%20existing%20source.%20If%20it%20uses%20a%20per-request%20nonce%2C%20pass%20it%20to%20%60%3CScript%20nonce%3D%7Bnonce%7D%20%2F%3E%60%20or%20set%20%60script.nonce%60%20in%20the%20component.%20If%20voice%20is%20enabled%20for%20this%20channel%2C%20also%20add%20%60wss%3A%2F%2Flivekit.caplo.si%60%20to%20%60connect-src%60.%0A5.%20Optionally%2C%20if%20I%20have%20a%20%22Help%22%20or%20%22Chat%20with%20us%22%20button%2C%20open%20the%20widget%20from%20it%20with%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\).open\(\)%60%20once%20the%20loader%20has%20loaded.%0A%0AVerify%3A%0A-%20Run%20the%20dev%20server%20on%20an%20origin%20listed%20as%20an%20allowed%20origin%20of%20the%20entry%20point%20\(ask%20me%20to%20add%20%60http%3A%2F%2Flocalhost%3A%3CPORT%3E%60%20in%20the%20console%20if%20needed\).%0A-%20Load%20the%20page%2C%20navigate%20to%20another%20route%20and%20back%2C%20and%20confirm%20the%20widget%20stays%20\(popup\)%20or%20comes%20back%20\(inline\).%20The%20browser%20console%20must%20show%20no%20CSP%20errors.%0A-%20If%20you%20see%20%22Chat%20unavailable%20%C2%B7%20Try%20again%22%2C%20inspect%20the%20POST%20to%20%60%2Fv1%2Fmessaging%2Fwidget%2Fpresentation%60%20in%20the%20Network%20tab%20and%20explain%20the%20cause%20using%20the%20troubleshooting%20page.%0A%0ARules%3A%0A-%20No%20API%20keys%2C%20tokens%20or%20credentials%20in%20code%2C%20environment%20files%20or%20chat.%20The%20widget%20needs%20none.%0A-%20Ask%20me%20before%20changing%20anything%20in%20the%20Caplo%20console%2C%20and%20before%20deploying.)[Open in ChatGPT](https://chatgpt.com/?q=Goal%3A%20add%20the%20Caplo%20website%20widget%20to%20this%20Next.js%20\(App%20Router\)%20app.%0A%0ARead%20these%20pages%20first%3A%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Finstall.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Fjavascript-api.md%0A-%20https%3A%2F%2Fdocs.caplo.si%2Fchannels%2Fwebsite-widget%2Ftroubleshooting.md%0A%0AValues%20I%20will%20give%20you%3A%0A-%20Widget%20ID%3A%20%3CWIDGET_ID%3E%20\(from%20the%20Install%20tab%20of%20the%20website%20entry%20point%20in%20the%20Caplo%20console\)%0A-%20Display%20mode%3A%20%3CPOPUP_OR_INLINE%3E%0A-%20For%20an%20inline%20design%2C%20the%20route%20and%20position%20for%20the%20conversation%3A%20%3CROUTE_AND_POSITION%3E%0A%0ASteps%3A%0A1.%20Put%20the%20widget%20ID%20in%20configuration%20that%20is%20safe%20to%20expose%20to%20the%20browser%2C%20for%20example%20%60NEXT_PUBLIC_CAPLO_WIDGET_ID%60.%20It%20is%20a%20public%20identifier%2C%20not%20a%20secret.%0A2.%20For%20a%20popup%20design%2C%20add%20to%20%60app%2Flayout.tsx%60%2C%20inside%20%60%3Cbody%3E%60%20after%20%60%7Bchildren%7D%60%3A%0A%20%20%20%60%60%60tsx%0A%20%20%20%3CScript%0A%20%20%20%20%20src%3D%22https%3A%2F%2Fapi.caplo.si%2Fv1%2Fmessaging%2Fwidget%2Floader.js%22%0A%20%20%20%20%20data-widget-id%3D%7Bprocess.env.NEXT_PUBLIC_CAPLO_WIDGET_ID%7D%0A%20%20%20%20%20strategy%3D%22afterInteractive%22%0A%20%20%20%2F%3E%0A%20%20%20%60%60%60%0A%20%20%20with%20%60import%20Script%20from%20'next%2Fscript'%60.%0A3.%20For%20an%20inline%20design%2C%20do%20not%20use%20%60next%2Fscript%60%20\(it%20loads%20a%20script%20only%20once%20per%20session%2C%20so%20the%20widget%20would%20not%20return%20after%20navigation\).%20Create%20a%20client%20component%20\(%60'use%20client'%60\)%20that%20renders%20a%20%60div%60%20whose%20id%20is%20%60caplo-%60%20followed%20by%20the%20widget%20ID%20and%2C%20in%20a%20%60useEffect%60%2C%20appends%20a%20script%20element%20with%20%60src%60%20set%20to%20the%20loader%20URL%2C%20%60async%20%3D%20true%60%2C%20%60dataset.widgetId%60%20and%20%60dataset.container%20%3D%20'%23'%20%2B%20CSS.escape\(containerId\)%60%2C%20and%20removes%20the%20script%20element%20on%20cleanup.%20Render%20it%20on%20%3CROUTE_AND_POSITION%3E.%0A4.%20If%20the%20app%20sets%20a%20Content-Security-Policy%20\(middleware%2C%20%60next.config%60%20headers%20or%20a%20meta%20tag\)%2C%20add%20%60https%3A%2F%2Fapi.caplo.si%60%20to%20%60script-src%60%2C%20%60connect-src%60%20and%20%60font-src%60%2C%20add%20%60blob%3A%60%20to%20%60img-src%60%20and%20%60worker-src%60%2C%20and%20keep%20every%20existing%20source.%20If%20it%20uses%20a%20per-request%20nonce%2C%20pass%20it%20to%20%60%3CScript%20nonce%3D%7Bnonce%7D%20%2F%3E%60%20or%20set%20%60script.nonce%60%20in%20the%20component.%20If%20voice%20is%20enabled%20for%20this%20channel%2C%20also%20add%20%60wss%3A%2F%2Flivekit.caplo.si%60%20to%20%60connect-src%60.%0A5.%20Optionally%2C%20if%20I%20have%20a%20%22Help%22%20or%20%22Chat%20with%20us%22%20button%2C%20open%20the%20widget%20from%20it%20with%20%60window.CaploWidget.get\('%3CWIDGET_ID%3E'\).open\(\)%60%20once%20the%20loader%20has%20loaded.%0A%0AVerify%3A%0A-%20Run%20the%20dev%20server%20on%20an%20origin%20listed%20as%20an%20allowed%20origin%20of%20the%20entry%20point%20\(ask%20me%20to%20add%20%60http%3A%2F%2Flocalhost%3A%3CPORT%3E%60%20in%20the%20console%20if%20needed\).%0A-%20Load%20the%20page%2C%20navigate%20to%20another%20route%20and%20back%2C%20and%20confirm%20the%20widget%20stays%20\(popup\)%20or%20comes%20back%20\(inline\).%20The%20browser%20console%20must%20show%20no%20CSP%20errors.%0A-%20If%20you%20see%20%22Chat%20unavailable%20%C2%B7%20Try%20again%22%2C%20inspect%20the%20POST%20to%20%60%2Fv1%2Fmessaging%2Fwidget%2Fpresentation%60%20in%20the%20Network%20tab%20and%20explain%20the%20cause%20using%20the%20troubleshooting%20page.%0A%0ARules%3A%0A-%20No%20API%20keys%2C%20tokens%20or%20credentials%20in%20code%2C%20environment%20files%20or%20chat.%20The%20widget%20needs%20none.%0A-%20Ask%20me%20before%20changing%20anything%20in%20the%20Caplo%20console%2C%20and%20before%20deploying.)

Show prompt

````
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
````
