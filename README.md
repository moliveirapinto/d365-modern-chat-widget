# Modern Dynamics 365 Live Chat Widget

**Live Demo:** [https://lemon-water-0adbcca0f.1.azurestaticapps.net/](https://lemon-water-0adbcca0f.1.azurestaticapps.net/)

> A customizable chat widget for Microsoft Dynamics 365 Omnichannel that replaces the default widget with a modern, branded experience — no coding required. Fork this repo to get started.

[![D365 Compatible](https://img.shields.io/badge/D365-Omnichannel-0078D4?style=flat-square&logo=microsoft)](https://dynamics.microsoft.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2.16.0-blue?style=flat-square)](package.json)

![Chat Widget Preview](preview.png)

---

## What Is This?

This project gives you a **fully customizable live chat widget** for Dynamics 365 Customer Service. It comes with a visual configuration panel (Chat Widget Studio) where you can set up everything — colors, fonts, branding, and connection settings — then embed the widget on your website.

**No coding knowledge is needed** to configure and deploy the widget.

---

## Key Features

- **Visual Admin Panel** — configure everything through a point-and-click interface
- **Full Branding Control** — custom colors, gradients, logos, fonts (30 options), and avatars
- **Session Persistence** — conversations survive page refreshes (no lost chats)
- **Contact Authentication** — recognizes logged-in portal users automatically
- **Pre-Chat Form** — collect customer info before chat starts (or skip it entirely)
- **File Attachments** — drag-and-drop file sharing with image preview
- **Voice & Video Calling** — agent-initiated calls with accept/decline
- **Adaptive Cards** — supports Copilot Studio interactive cards
- **Demo Mode** — test the widget without a D365 connection
- **Widget Profiles** — save and switch between multiple configurations
- **Room Collaboration** — share widget setups with your team using a simple 6-character code
- **Analytics Dashboard** — track widget usage across domains (Cloudflare D1 backend)
- **Industry Demo Pages** — preview the widget in realistic business contexts (Retail, Financial, Healthcare, Government)
- **Mobile Friendly** — responsive design that works on any device

---

## Getting Started

### What You Need

- Microsoft Dynamics 365 Omnichannel for Customer Service
- A modern web browser (Chrome, Edge, Firefox, or Safari)

### Step 1: Get Your D365 Connection Details

1. Go to **Dynamics 365 Admin Center**
2. Navigate to **Channels** → **Chat**
3. Select your chat widget and click **Copy Widget Script**
4. Note down these three values from the script:
   - `data-org-url` → **Organization URL**
   - `data-org-id` → **Organization ID**
   - `data-app-id` → **Widget ID**

### Step 2: Configure the Widget

1. Open `index.html` in your browser (this is the Chat Widget Studio)
2. Enter your D365 connection details — the status indicator turns green when ready
3. Customize the look and feel:
   - Pick your brand colors (gradient or solid)
   - Choose a font
   - Upload your logo and avatars
   - Set header text and branding
4. Toggle the pre-chat form on or off
5. Click **Copy Embed Code**

### Step 3: Deploy

Paste the embed code into your website or portal. That's it!

> **Tip:** You can also use the **Quick Start Guide** inside the admin panel for step-by-step instructions with three deployment methods: direct link, TamperMonkey browser extension, or embed code.

---

## Admin Panel Overview

The Chat Widget Studio (`index.html`) lets you configure:

| Section | What It Does |
|---------|-------------|
| **D365 Connection** | Enter your Org ID, Org URL, and Widget ID |
| **Widget Mode** | Switch between Standard (native D365) and Custom (fully styled) |
| **Colors** | Set colors for header, messages, UI elements, and launcher |
| **Fonts** | Choose from 30 professional fonts in 4 categories |
| **Branding** | Custom header title, subtitle, and logo |
| **Pre-Chat Form** | Toggle on/off, customize fields and welcome message |
| **Contact Auth** | Set default contact name and email for authenticated users |
| **Avatars** | Upload agent and customer avatar images |
| **Widget Profiles** | Save, load, and switch between configurations |
| **Room Collaboration** | Share configurations with teammates via room codes |
| **Import/Export** | Backup or share your settings as JSON |
| **Live Preview** | See your changes in real-time |

---

## How Session Persistence Works

When a customer refreshes the page or navigates away, the widget **automatically reconnects** to the same D365 conversation. No duplicate chats, no lost messages.

- Sessions expire after **1 hour** of inactivity
- Works by saving the D365 session context in the browser

---

## Contact Authentication

If your website already knows who the customer is (e.g., they're logged into a portal), you can:

1. Turn **off** the pre-chat form in the admin panel
2. Set the **Default Contact Name** and **Default Contact Email**
3. The widget passes these to D365, matching the customer to their contact record

This means authenticated users skip the form and go straight to chatting.

---

## Demo Mode

If D365 isn't configured, the widget runs in **demo mode** automatically — perfect for:

- Testing your design and branding
- Running customer demos and presentations
- Training new team members

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chat doesn't reconnect after refresh | Check that browser localStorage is enabled and the session is less than 1 hour old |
| D365 doesn't recognize the contact | Make sure the email in Default Contact Email matches the D365 contact record exactly |
| Pre-chat form shows when it shouldn't | Verify toggle is OFF and default contact info is filled in |
| Emoji picker doesn't appear | Use your keyboard shortcut: `Win + .` on Windows, `Cmd + Ctrl + Space` on Mac |

---

## Project Files

| File | Purpose |
|------|---------|
| `index.html` | Admin panel (Chat Widget Studio) |
| `live.html` | Live chat widget page |
| `src/chat-widget.js` | Widget core logic |
| `retail.html` | Industry demo — Retail |
| `financial.html` | Industry demo — Financial Services |
| `healthcare.html` | Industry demo — Healthcare |
| `government.html` | Industry demo — Government |
| `cloudflare-worker/` | Analytics backend (Cloudflare Workers + D1) |

---

## For Developers

<details>
<summary>Click to expand technical details</summary>

### Build from Source

```bash
git clone https://github.com/moliveirapinto/d365-modern-chat-widget.git
cd d365-modern-chat-widget
npm install
npm run build
```

### SDK Integration

The widget uses `@microsoft/omnichannel-chat-sdk` for headless D365 connectivity. See [D365-CHAT-SDK-GUIDE.md](D365-CHAT-SDK-GUIDE.md) for implementation details.

### Technical Documentation

- [D365-CHAT-SDK-GUIDE.md](D365-CHAT-SDK-GUIDE.md) — SDK implementation guide
- [ADAPTIVE-CARDS-GUIDE.md](ADAPTIVE-CARDS-GUIDE.md) — Copilot Studio Adaptive Cards
- [VOICE-VIDEO-GUIDE.md](VOICE-VIDEO-GUIDE.md) — Voice/Video calling
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines

### Security Notes

- Always host the widget on **HTTPS**
- Never expose API keys in client-side code
- Default contact info should only be used in authenticated/trusted environments
- localStorage stores settings locally only — nothing is sent externally

</details>

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Important: this project has two implementations (`live.html` and `dist/widget-core.js`) that must stay in sync.

---

## License

**MIT License** — free to use, modify, and distribute.

---

<div align="center">

**[Get Started](#getting-started)** · **[View Demo](live.html)** · **[Read Docs](#for-developers)**

*Powered by Microsoft Dynamics 365 Omnichannel for Customer Service*

</div>
