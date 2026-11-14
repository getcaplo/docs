# Provider sign-in with OpenID Connect

> Let website visitors verify by signing in with your OpenID Connect provider in a popup window.

With **Provider sign-in**, the visitor signs in with your own OpenID Connect provider, such as the one your customer app uses. The widget opens the provider’s sign-in page in a separate window; Caplo runs the authorization code flow with PKCE, checks the ID token, and verifies the visitor as the provider’s `sub`. Use it when visitors are not already signed in on the pages that show the widget. If they are, [host sign-in](/identity/signed-assertions/) is smoother.

## What your provider needs

* The authorization code flow with PKCE (`S256`), returning the code in the query string.
* The `iss` parameter in the authorization response (RFC 9207). Caplo refuses a callback without it.
* ID tokens signed with `RS256`, `PS256` or `ES256`, with a `kid` in the header, from keys published at the provider’s JWKS URL, and valid for at most an hour.
* A client registered for Caplo. Use a public client that needs no client secret. See [Client authentication](#client-authentication).

Caplo calls your provider’s discovery, token and JWKS endpoints from the internet over HTTPS, without following redirects, so they must be publicly reachable.

## Set it up

1. **Register a client at your provider** with:

   * Redirect URI: `https://api.caplo.si/v1/messaging/customer-login/callback`. The connection editor shows the same value as **Callback URL to register**; register it exactly.
   * Grant type: authorization code, with PKCE required.
   * Client type: public (no secret).
   * The scopes Caplo will ask for: `openid`, plus `profile` or `email` if you want the visitor’s name or email address.

2. **Create the connection.** In the console, go to **Settings**, **Customer identity**, select **Add connection**, and choose **Provider sign-in**:

   | Field                          | What to enter                                                                                                                                                                                                                   |
   | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Connection name**            | Shown on the widget’s sign-in button unless the channel sets a button label.                                                                                                                                                    |
   | **Subject namespace**          | Optional; defaults to the provider’s issuer. Fixed once created.                                                                                                                                                                |
   | **Provider configuration**     | **Discovery URL**, such as `https://login.example.com/.well-known/openid-configuration`. Caplo reads the issuer and endpoints from it when you save. Or **Enter endpoints** for the issuer, authorization, token and JWKS URLs. |
   | **Client ID**                  | The client you registered.                                                                                                                                                                                                      |
   | **Client authentication**      | **None (public client with PKCE)**.                                                                                                                                                                                             |
   | **Requested scopes**           | Space-separated, including `openid`.                                                                                                                                                                                            |
   | **Authorization details type** | Optional. When set, a step-up for a specific action sends an RFC 9396 `authorization_details` entry of this type with the action’s summary, for providers that show it.                                                         |
   | **Assurance mapping**          | Each `acr` value your provider returns and its level, and the level **When acr is absent**. See [Assurance levels](/identity/#assurance-levels).                                                                                |
   | **Accepted profile claims**    | Which of `name`, `email`, `email_verified` and `locale` Caplo keeps from the ID token. Others are ignored.                                                                                                                      |

   Select **Create connection**.

3. **Add it to the policy.** In **Verification policy**, turn on **Verify customers in support conversations**, add the connection, make sure **Allowed scopes** includes `identity:bind`, and select **Save policy**. **Provider renewal period** sets how often Caplo renews a provider sign-in on its own, from 30 to 300 seconds.

4. **Turn it on for the channel.** On the website channel’s **Conversation** tab, allow verification under **Customer verification**, select **Choose sign-in methods and consent for this channel**, add the connection as a sign-in method with an optional button label, and select **Save entry point**. See [Website widget settings](/channels/website-widget/settings/#customer-verification).

5. **Test it** on a test channel: open the widget, sign in, and check **Activity** on the **Customer identity** page. Provider sign-in connections have no **Test assertion** action.

## Claims mapping

| ID token claim                              | How Caplo uses it                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `sub`                                       | Becomes the customer’s ID, the `externalSubject` and `sub` your tools and API receive. It must be stable.                 |
| `acr`                                       | Mapped to a level. An `acr` value that is not in the mapping refuses the sign-in.                                         |
| `auth_time`                                 | When the customer authenticated. Required when Caplo asks for a recent sign-in (`max_age`).                               |
| `sid`                                       | Lets your provider’s [back-channel logout](/identity/account-links-and-revocation/#back-channel-logout) end this sign-in. |
| `amr`                                       | Kept with the verification, up to 16 values.                                                                              |
| `name`, `email`, `email_verified`, `locale` | Kept only when listed under **Accepted profile claims**. The widget shows `name` as “Signed in as”.                       |

The ID token’s `aud` must be your client ID, and its `nonce` must match the one Caplo sent. The provider’s access and refresh tokens are not given to tools or agents.

## Step-up

When an operation needs a higher level or a more recent sign-in, Caplo starts a new sign-in with `acr_values` set to the mapped `acr` values that meet the level, and `max_age` set to the freshness, if any. Without a requirement, Caplo sends neither and no `prompt`, so a visitor already signed in at your provider is not asked again. Make sure your provider honors `acr_values` and `max_age` for the levels you map, and returns `acr` and `auth_time` in the ID token.

## What customers see

1. The widget shows a button with the connection name or the channel’s button label.
2. With the consent mode **Ask for agreement before the first verification**, the visitor reads your consent text and ticks **I agree to the terms above.**
3. Selecting the button opens your provider’s sign-in page in a separate window (“Sign-in opens in a separate secure window.”). If the browser blocks the window, the widget offers **Continue sign-in**.
4. After the visitor signs in, the window closes and the widget shows them as signed in, by name when the `name` claim is accepted.
5. For a step-up, the widget shows **Confirm it’s you**, and the same window opens again.

## Client authentication

Use **None (public client with PKCE)**. **Client secret (basic)** needs Caplo to store the client secret for the connection, which you cannot do yourself yet: contact [support](/resources/support/) if your provider requires a confidential client. **Private key JWT** is not supported for provider sign-in yet.

Note

A provider sign-in is renewed on Caplo’s side, without the visitor, until the session timeout for its level in the verification policy. To end it earlier from your provider, use [back-channel logout or Shared Signals](/identity/account-links-and-revocation/).
