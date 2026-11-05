# Modern Dynamics 365 Live Chat Widget

**Widget Studio:** [Azure](https://zealous-hill-0409bdc0f.7.azurestaticapps.net/) · [GitHub Pages](https://moliveirapinto.github.io/d365-modern-chat-widget/)

> A customizable chat widget for Microsoft Dynamics 365 Omnichannel that replaces the default widget with a modern, branded experience — no coding required. Fork this repo to get started.

[![D365 Compatible](https://img.shields.io/badge/D365-Omnichannel-0078D4?style=flat-square&logo=microsoft)](https://dynamics.microsoft.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v3.6.0-blue?style=flat-square)](package.json)

---

## What Is This?

This project gives you a **fully customizable live chat widget** for Dynamics 365 Customer Service. It comes with a visual configuration panel (Chat Widget Studio) where you can set up everything — colors, fonts, branding, and connection settings — then embed the widget on your website.

Choose between the **Custom Widget**, which uses the shared runtime in this repository, and the **New Standard Widget**, which loads Microsoft's NextGen web messaging widget with supported branding options.

**No coding knowledge is needed** to configure and deploy the widget.

---

## Key Features

- **Visual Admin Panel** — configure everything through a point-and-click interface
- **Full Branding Control** — custom colors, gradients, logos, fonts (30 options), and avatars
- **Session Persistence** — conversations survive page refreshes (no lost chats)
- **Customer Context** — pass configured customer names, email addresses, and context variables to D365
- **Pre-Chat Form** — collect customer info before chat starts (or skip it entirely)
- **File Attachments** — drag-and-drop file sharing with image preview
- **Voice & Video Calling** — agent-initiated calls with accept/decline
- **Adaptive Cards** — supports Copilot Studio interactive cards
- **Demo Mode** — test the widget without a D365 connection
- **Widget Profiles** — save and switch between multiple configurations
- **Room Collaboration** — share widget setups with your team using a simple 6-character code
- **Analytics Dashboard** — track widget usage across domains (Cloudflare D1 backend)
- **Industry Demo Pages** — preview the widget in realistic business contexts (Retail, Financial, Healthcare, Government, Telecom, Education)
- **Mobile Friendly** — responsive design that works on any device

---

## Getting Started

### What You Need

- Microsoft Dynamics 365 Omnichannel for Customer Service
- A modern web browser (Chrome, Edge, Firefox, or Safari)
- The Tampermonkey browser extension if you want to inject the widget on a website for testing

### Step 1: Get Your D365 Connection Details

1. Go to **Dynamics 365 Admin Center**
2. Navigate to **Channels** → **Chat**
3. Select your chat widget and click **Copy Widget Script**
4. Keep the complete script to paste into Studio. These values identify the connection:
   - `data-org-url` → **Organization URL**
   - `data-org-id` → **Organization ID**
   - `data-app-id` → **Widget ID**

### Step 2: Configure the Widget

1. Open the hosted [Widget Studio](https://zealous-hill-0409bdc0f.7.azurestaticapps.net/).
2. In **Widget Profiles**, paste your complete D365 widget script. Studio extracts and applies the Org ID, Org URL, and Widget ID automatically. Use **Apply to Settings** if you need to reapply the connection.
3. Choose **Custom Widget** or **New Standard Widget**.
4. Customize the options available for your selected mode:
   - Pick your brand colors (gradient or solid)
   - Choose a font
   - Upload your logo and avatars
   - Set header text and branding
5. Configure the pre-chat options and review the live preview.

### Step 3: Deploy

Choose a deployment method:

- **Embed:** click **Generate Embed Code**, then **Copy to Clipboard**, and paste the code into your website or portal.
- **Demo Portal:** use Studio's **Quick Start Guide** to open the live demo with your configuration.
- **Tampermonkey:** follow the instructions below to inject the widget on a target website.

> **Tip:** You can also use the **Quick Start Guide** inside the admin panel for step-by-step instructions with three deployment methods: direct link, TamperMonkey browser extension, or embed code.

---

## Tampermonkey Installation and Updates

For the **Custom Widget**, the current generated userscript is **v1.16**. This is separate from the project's **v3.6.0** package version.

1. Configure the **Custom Widget** in Studio.
2. Click **Generate TamperMonkey Code** and enter the target URL pattern, for example `https://example.com/*`.
3. Create a new script in Tampermonkey, replace its template with the generated code, and save it. To upgrade an existing script, replace its entire contents instead.
4. Disable old or duplicate D365 widget injector scripts. Only one injector should run on the target page.
5. Reload the target website and check DevTools Console for:

   ```text
   [D365 TM] userscript v1.16 starting on <hostname>
   [D365 TM] Network proxy installed for Omnichannel hosts
   ```

6. Start a conversation and test both the bot greeting and a reply to a customer message. A greeting alone does not confirm that outgoing messages work.

**Installed userscripts do not automatically receive generator changes.** After a userscript update is published, hard-refresh Studio, generate a fresh script, verify its `@version`, replace the installed script, and reload the target page. Refreshing only the hosted runtime is not enough.

Version 1.16 preserves native XHR event targets for host-page instrumentation and adds cancellation and timeout handling for the Omnichannel HTTP bridge. It fixes the reproduced null-target XHR incompatibility; customer-site behavior still needs to be tested.

On restrictive sites, the Custom Widget bridges supported Omnichannel HTTP requests through Tampermonkey. Real-time push connections may remain blocked by Content Security Policy (CSP), so the widget also polls for messages. Survey frames, images, or voice/video resources can have separate CSP restrictions. For production embedding, work with the site owner to allow the required resources rather than disabling CSP.

---

## Admin Panel Overview

The Chat Widget Studio (`index.html`) lets you configure:

| Section | What It Does |
|---------|-------------|
| **Widget Profiles** | Paste your D365 embed script, apply connection settings, and save or switch configurations |
| **Widget Mode** | Switch between New Standard Widget (Microsoft NextGen) and Custom Widget |
| **Colors** | Set colors for header, messages, UI elements, and launcher |
| **Fonts** | Choose from 30 professional fonts in 4 categories |
| **Branding** | Custom header title, subtitle, and logo |
| **Pre-Chat Form** | Toggle on/off, customize fields and welcome message |
| **Contact Auth** | Set the customer name and email passed as context; these fields alone do not authenticate users |
| **Avatars** | Upload agent and customer avatar images |
| **Room Collaboration** | Share configurations with teammates via room codes |
| **Import/Export** | Backup or share your settings as JSON |
| **Live Preview** | See your changes in real-time |

---

## How Session Persistence Works

When a customer refreshes the page, the Custom Widget attempts to reconnect to the saved D365 conversation if its session context is still valid.

- Saved sessions expire **1 hour after the last session save**.
- The browser stores the session context and displayed message history.
- Reconnection depends on browser storage being available and D365 accepting the saved context.

---

## Customer Context and Authentication

If your website already knows who the customer is (e.g., they're logged into a portal), you can:

1. Turn **off** the pre-chat form in the admin panel
2. Set the **Default Contact Name** and **Default Contact Email**
3. The widget passes these values to D365 as customer context

This lets a trusted website supply customer context and skip the form. **A default name or email is not proof of identity.** Authenticated chat requires the appropriate Dynamics 365 workstream authentication configuration; these defaults alone do not authenticate a customer.

---

## Demo Mode

Use Studio's demo preview to explore the appearance without a D365 connection — perfect for:

- Testing your design and branding
- Running customer demos and presentations
- Training new team members

Live D365 conversations require a configured connection. A design preview is not a test of customer-site networking, authentication, or message delivery.

---

## Data Storage and External Services

- **Browser storage:** Studio saves settings locally, and the Custom Widget saves chat session context, customer name/email, and displayed message history. Consider this when using shared devices.
- **Dynamics 365:** live chat messages and configured customer context are sent to your D365 service.
- **Cloudflare analytics:** the Custom Widget sends usage event type, domain, timestamp, and runtime source to the analytics backend. This event payload does not include chat messages, customer names, or email addresses.
- **GitHub cloud sync:** when signed in and using profile cloud sync, configuration is uploaded to non-public ("secret") GitHub Gists. Secret Gists are accessible to anyone with their URL; do not treat them as private storage for credentials or sensitive customer data.
- **Hosted-page analytics:** production pages conditionally load Google Analytics and Microsoft Clarity. Review the relevant privacy and consent requirements before deployment.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chat doesn't reconnect after refresh | Check that browser localStorage is enabled and the session is less than 1 hour old |
| D365 doesn't recognize the contact | Make sure the email in Default Contact Email matches the D365 contact record exactly |
| Pre-chat form shows when it shouldn't | Verify toggle is OFF and default contact info is filled in |
| Emoji picker doesn't appear | Use your keyboard shortcut: `Win + .` on Windows, `Cmd + Ctrl + Space` on Mac |
| Tampermonkey shows a greeting but no reply to a customer message | First verify the Custom Widget injector is v1.16 and old/duplicate scripts are disabled. Check Console and Network for the outgoing send failure; the greeting does not prove the message was delivered |
| Console still says `userscript v1.15` after an update | Hard-refresh Studio, regenerate the script, replace its entire contents in Tampermonkey, and reload the target page |
| Older Tampermonkey script reports `Cannot read properties of null (reading 'status')` | Upgrade the Custom Widget injector to v1.16, which fixes its null-target XHR event handling |
| Console reports blocked CSP resources | Identify the blocked endpoint. Push-channel warnings can occur while message polling works; blocked chat HTTP calls or optional frames/media need separate investigation |
| A send fails or an exception appears in `content.js` | Capture the userscript version, full source URL of the failing script, and relevant Console/Network errors. Remove tokens, credentials, and customer conversation data before sharing logs |

---

## Project Files

| File | Purpose |
|------|---------|
| [index.html](index.html) | Chat Widget Studio, preview, embed exports, and userscript generation |
| [live.html](live.html) | Demo Portal; loads the selected widget runtime |
| [dist/widget-core.js](dist/widget-core.js) | Shared Custom Widget runtime used by embeds, Tampermonkey, and demo pages |
| [dist/loader.js](dist/loader.js) | Custom Widget embed loader |
| [src/sdk-entry.js](src/sdk-entry.js) | Entry point used to bundle the Omnichannel Chat SDK |
| [dist/chat-sdk-bundle.js](dist/chat-sdk-bundle.js) | Pre-bundled Omnichannel Chat SDK |
| [standard-widget-loader.js](standard-widget-loader.js) | New Standard Widget loader |
| [src/chat-widget.js](src/chat-widget.js) | Alternate widget source implementation, not the shared deployed Custom Widget runtime |
| [industries/](industries/) | Retail, Financial Services, Healthcare, Government, Telecom, and Education demos |
| [cloudflare-worker/](cloudflare-worker/) | Analytics and collaboration backends |
| [api/](api/) | Hosted API functions, including GitHub OAuth |
| [tests/tampermonkey.test.js](tests/tampermonkey.test.js) | Custom Widget userscript and failed-send regression tests |

---

## For Developers

<details>
<summary>Click to expand technical details</summary>

### Local Development

Use **Node.js 20 or newer**. Clone the repository and restore its dependencies:

```bash
git clone https://github.com/moliveirapinto/d365-modern-chat-widget.git
cd d365-modern-chat-widget
npm ci
```

The repository ships pre-bundled runtime files. **`npm run build` currently prints a message; it does not compile or regenerate those files.** Serve the repository over HTTP(S) for local browser testing rather than relying on `file://` pages.

If you change the SDK dependency or its entry point, rebuild the SDK bundle with the existing webpack configuration:

```bash
npx webpack --config webpack.config.js
```

This rebuilds `dist/chat-sdk-bundle.js`, not `dist/widget-core.js`.

### Regression Tests

Run the dependency-free userscript tests with Node.js:

```bash
node --test tests/tampermonkey.test.js
```

These exercise generated proxy behavior, request cancellation/timeouts, native XHR compatibility, and failed-send feedback. They do not replace testing actual Tampermonkey on the customer's website.

### SDK Integration

The Custom Widget uses `@microsoft/omnichannel-chat-sdk` for headless D365 connectivity. Its bundle entry point is [src/sdk-entry.js](src/sdk-entry.js), with build settings in [webpack.config.js](webpack.config.js). The shared runtime in [dist/widget-core.js](dist/widget-core.js) handles chat startup, message polling/rendering, cards, session persistence, and calling integration.

### Technical Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) — Release history and Tampermonkey upgrade notes

### Security Notes

- Always host the widget on **HTTPS**
- Never expose API keys in client-side code
- Default contact info should only be used in authenticated/trusted environments
- Do not store secrets in shared profiles or secret Gists
- Review [Data Storage and External Services](#data-storage-and-external-services) for browser storage and external data flows

</details>

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Custom Widget embeds, Tampermonkey, and demo portals share [dist/widget-core.js](dist/widget-core.js). Also check Studio preview/export and any other affected rendering paths when changing behavior or appearance.

---

## License

**MIT License** — free to use, modify, and distribute.

---

<div align="center">

**[Get Started](#getting-started)** · **[Open Studio](https://zealous-hill-0409bdc0f.7.azurestaticapps.net/)** · **[Read Docs](#for-developers)**

*Powered by Microsoft Dynamics 365 Omnichannel for Customer Service*

</div>
