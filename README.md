# 🚀 Modern Dynamics 365 Live Chat Widget

> **A beautiful, modern custom chat widget UI for Microsoft Dynamics 365 Omnichannel** with an intuitive admin panel, advanced session persistence, and contact authentication. This implementation completely replaces the out-of-the-box (OOTB) chat widget with a sleek, contemporary design.

[![D365 Compatible](https://img.shields.io/badge/D365-Omnichannel-0078D4?style=flat-square&logo=microsoft)](https://dynamics.microsoft.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2.15.0-blue?style=flat-square)](package.json)

![Chat Widget Preview](preview.png)

---


## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🎯 Why Choose This Widget?](#-why-choose-this-widget)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🎨 Admin Panel Guide](#-admin-panel-guide)
- [🔑 Advanced Features](#-advanced-features)
- [🔧 SDK Integration](#-sdk-integration)
- [📱 Mobile Support](#-mobile-support)
- [🧪 Demo Mode](#-demo-mode)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Documentation](#-documentation)
- [🤝 Support](#-support)
- [👥 Contributing](#-contributing)

---

## ✨ Key Features

### 🎯 Core Capabilities

<table>
<tr>
<td width="50%">

#### Chat Widget
- ✅ **Modern Design** - Clean, minimalist interface with smooth animations
- 🎨 **Gradient Accents** - Beautiful purple/blue gradient theme (fully customizable)
- 📱 **Responsive** - Works seamlessly on desktop and mobile devices
- 📝 **Pre-Chat Form** - Collects user information with customizable fields
- 💬 **Real-time Messaging** - Full integration with D365 Omnichannel Chat SDK
- ⌨️ **Typing Indicators** - Shows when agent is typing
- 📎 **File Attachments** - Upload and download files with drag-and-drop support
- 🖼️ **Image Preview** - Preview images with optional caption before sending
- 😊 **Emoji Support** - Native OS emoji picker with helpful tooltips
- 📞 **Voice/Video Calling** - Agent-initiated calls with accept/decline UI
- 🎥 **Video Conferencing** - Full WebRTC support with call controls
- 🔢 **Queue Position** - Displays queue status with animated UI
- 📄 **Chat Transcript** - Download conversation history
- 🔔 **Toast Notifications** - User-friendly feedback messages
- 🔴 **Notification Badge** - Unread message counter
- 🎴 **Adaptive Cards** - Full support for Copilot Studio interactive cards with robust error handling
- 🌐 **Cross-Browser** - Works on Chrome, Edge, Firefox, Safari (Edge 143+ crash fix included)

</td>
<td width="50%">

#### Admin Panel (Chat Widget Studio Analytics)
- 🎭 **Widget Profiles** - Save and switch between multiple customer configurations
- 👥 **Room Collaboration** - Share multiple widget profiles with 6-character room codes (no accounts needed)
- 🔄 **Widget Mode Selector** - Choose between Standard (native D365 LCW) or Custom (styled widget)
- 🔤 **Font Library** - 30 professional fonts in 4 categories (Sans-Serif, Serif, Monospace, Display)
- 🔌 **D365 Configuration** - Easy setup with connection validation
- 👤 **Contact Authentication** - Configure default contact info for D365
- 👁️ **Live Theme Preview** - See changes in real-time
- 🎨 **Color Customization** - Full control with 4 tabs (Primary, Messages, UI Elements, Launcher) with blue-cyan gradient theme
- 🏷️ **Branding** - Custom header titles, subtitles, and logos with custom icon support
- 📋 **Pre-chat Form Toggle** - Enable/disable with customizable fields
- 👥 **Avatar Management** - Upload custom agent and customer avatars
- 🌍 **Localization** - Customize all UI text and choose 12h/24h time format for international audiences
- 💾 **Import/Export** - Share configurations or backup settings
- 📋 **Quick Embed Code** - Copy integration code with one click
- 📚 **Quick Start Guide** - Interactive tutorial for new users with 3 deployment methods (Go To Widget, TamperMonkey, Embed)
- 📊 **Analytics Dashboard** - Track widget usage with Cloudflare D1 SQL backend (sessions, chats, calls by domain)
- 🔗 **Room Collaboration** - Share multiple widgets with a 6-character code, syncs across devices!
- 🏪 **Industry Demo Pages** - Test widgets in realistic industry contexts (Retail, Financial, Healthcare, Government)

</td>
</tr>
</table>

### 🚀 Advanced Capabilities

#### 🔄 Session Persistence with D365 Reconnection
**Prevents ghost chats and duplicate sessions** by automatically saving chat sessions and reconnecting to the same D365 conversation on page refresh.

- Saves messages, user info, D365 `liveChatContext`, and timestamps
- Restores and reconnects to the SAME D365 conversation seamlessly
- Automatically expires after 1 hour of inactivity
- No duplicate sessions or lost conversations

#### 👤 Contact Authentication
**Seamlessly authenticate customers** using D365 contact records (`emailaddress1`, `Name` fields) for personalized service.

- Skip pre-chat form for authenticated users
- Pass logged-in portal user credentials automatically
- Supports SSO and portal integration scenarios
- Default contact info for quick demos

#### 🎨 30 Font Options
Choose from professionally curated fonts organized in **4 categories**:
- **Sans-Serif** (9 fonts): Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Source Sans Pro, Nunito, Work Sans
- **Serif** (6 fonts): Merriweather, Playfair Display, Lora, Crimson Text, EB Garamond, Libre Baskerville
- **Monospace** (5 fonts): Roboto Mono, Source Code Pro, IBM Plex Mono, JetBrains Mono, Fira Code
- **Display** (10 fonts): Raleway, Bebas Neue, Oswald, Archivo Black, Anton, Righteous, Lobster, Pacifico, Dancing Script

#### 🔀 Widget Mode Selector
Switch between **Standard mode** (native D365 LCW) and **Custom mode** (fully styled widget) instantly.

#### ✨ Premium UI Features
- **Elegant Custom Scrollbar** - Premium scrollbar styling with soft gray tones
- **Native OS Emoji Picker** - Full emoji support (Win+. or Cmd+Ctrl+Space)
- **Demo Mode** - Works without D365 for testing/presentations

---


## 🎯 Why Choose This Widget?

| Feature | Out-of-the-Box Widget | Modern Chat Widget ✨ |
|---------|----------------------|----------------------|
| **Customization** | Limited styling options | Full control over colors, fonts, and branding |
| **Session Persistence** | ❌ Lost on refresh | ✅ Reconnects to same D365 conversation |
| **Admin Panel** | ❌ None | ✅ Comprehensive configuration interface with Quick Start Guide |
| **Font Options** | ❌ Default only | ✅ 30 professional fonts in 4 categories |
| **Multi-Config Support** | ❌ Single config | ✅ Demo profiles for multiple customers |
| **Contact Auth** | Basic | ✅ Advanced with default contact support |
| **Pre-chat Toggle** | ❌ Always on | ✅ Enable/disable dynamically |
| **Mobile Support** | Basic | ✅ Fully responsive with touch-friendly controls |
| **Demo Mode** | ❌ None | ✅ Full demo without D365 connection |
| **Widget Modes** | Single mode | ✅ Standard or Custom mode selector |
| **Analytics** | ❌ None | ✅ Cloudflare D1 SQL backend tracking (100K writes/day, 5M reads/day) |

---

## 🚀 Quick Start

### Prerequisites

- Microsoft Dynamics 365 Omnichannel for Customer Service
- Modern web browser (Chrome, Edge, Firefox, Safari)
- (Optional) Node.js 16+ for building from source

### Installation

#### Option 1: Direct Download (Recommended for Quick Start)

1. **Download the repository** or clone it:
   ```bash
   git clone https://github.com/moliveirapinto/d365-modern-chat-widget.git
   cd d365-modern-chat-widget
   ```

2. **Open the Admin Panel**:
   - Open `index.html` in your browser (or visit the hosted version)
   - Configure your D365 connection details
   - Customize appearance and branding
   - Copy the embed code

3. **Deploy the Widget**:
   - Host the files on your web server
   - Paste the embed code into your website/portal
   - Done! 🎉

#### Option 2: Build from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/moliveirapinto/d365-modern-chat-widget.git
   cd d365-modern-chat-widget
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the bundle** (optional):
   ```bash
   npm run build
   ```

4. **Configure and deploy** using `index.html`

---

### Configuration Steps

#### 1️⃣ Get Your D365 Configuration Values

Find these values in **Dynamics 365 Admin Center**:

1. Navigate to **Customer Service admin center** or **Omnichannel admin center**
2. Go to **Channels** → **Chat**
3. Select your chat widget
4. Click **Copy Widget Script**
5. Extract the values:
   - `data-org-url` → **Organization URL**
   - `data-org-id` → **Organization ID**
   - `data-app-id` → **Widget ID**

#### 2️⃣ Configure via Admin Panel (Recommended)

1. **Open `index.html`** in your browser
2. **Set D365 Connection**:
   - Enter your Organization ID
   - Enter your Organization URL  
   - Enter your Widget ID
   - Watch the status indicator turn green ✅
3. **Customize Appearance**:
   - Choose from 30 fonts
   - Select colors and gradients
   - Upload company logo
   - Set header text
4. **Configure Pre-chat Form**:
   - Toggle enable/disable
   - Edit welcome message
   - Customize field labels
   - Set default contact info for authenticated scenarios
5. **Upload Avatars**:
   - Add default agent photo
   - Add default customer avatar
6. **Save as Profile**:
   - Create demo profiles for different customers
7. **Export Settings**:
   - Download configuration JSON for sharing/backup
8. **Get Embed Code**:
   - Click "Copy Embed Code"
   - Paste into your website

#### 3️⃣ Configure Manually (Alternative)

Open [`src/chat-widget.js`](src/chat-widget.js) and update:

```javascript
window.chatWidget = new ModernChatWidget({
    orgUrl: "https://yourorg.crm.dynamics.com",
    orgId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    widgetId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
});
```

---


## 📁 Project Structure

```
d365-modern-chat-widget/
├── 📄 index.html                    # Admin configuration panel (Chat Widget Studio)
├── 🎬 live.html                     # Live chat widget UI (blank page)
├── 🛍️ retail.html                   # Industry demo - Retail/E-commerce (LUXE & CO.)
├── 📊 analytics.html                # Analytics dashboard (private, in .gitignore)
├── 📘 D365-CHAT-SDK-GUIDE.md        # SDK implementation guide
├── 📦 package.json                  # NPM dependencies
├── ⚙️ webpack.config.js             # Build configuration
├── 🗂️ src/
│   ├── chat-widget.js               # Widget core logic (892 lines)
│   └── sdk-entry.js                 # SDK entry point
├── 📁 dist/                         # Built bundles (generated)
├── 📁 cloudflare-worker/            # Analytics backend (Cloudflare Workers + D1)
│   ├── analytics-worker-d1.js       # Worker script with SQL queries
│   ├── schema.sql                   # D1 database schema
│   └── wrangler.toml                # Cloudflare Worker configuration
├── 📁 img/
│   ├── icon/                        # Custom section icons (form.png, typography.png, etc.)
│   └── Logo/                        # Branding assets (logo.png, tampermonkey.png)
└── 📖 README.md                     # This file
```

### File Descriptions

#### [`index.html`](index.html)
Comprehensive admin configuration panel (formerly admin.html) featuring:
- 🎭 **Demo Profiles** section for saving/loading configurations
- 🔀 **Widget Mode Selector** (Standard vs Custom)
- 📚 **Quick Start Guide** - Interactive tutorial modal with 3 deployment methods:
  - 🌐 **Go To Widget** - Direct link to the hosted widget
  - 🛠️ **TamperMonkey** - Browser extension installation with Edge store link
  - 📦 **Embed** - Copy/paste integration code
- 🔤 **Font Library** with 30 professional fonts in 4 categories
- 🔌 **D365 Connection** settings with real-time status indicator
- 👤 **Contact Authentication** with default name/email
- 🏷️ **Header & Branding** customization with custom logo support
- 🎨 **Colors** tabs (Primary, Messages, UI Elements, Launcher) with blue-cyan gradient theme
- 📋 **Pre-chat Form** toggle and field customization with custom icons (form.png)
- 🔧 **Section Icons** - Custom branded PNG/SVG icons for all sections
- 👥 **Avatars** upload for agent and customer
- 💾 **Import/Export** functionality and embed code generator
- 👁️ **Live Preview** panel showing real-time changes

#### [`live.html`](live.html)
The main chat widget interface (formerly index.html) containing:
- 🎨 Chat widget UI and layout with customizable styling
- 📝 Pre-chat form with dynamic field labels
- 💬 Message area with typing indicators and file support
- 🎮 Input controls with emoji, file, and voice options
- ⏳ Loading states and connection indicators
- 🔄 **Automatically loads and applies admin settings from localStorage**

#### [`src/chat-widget.js`](src/chat-widget.js)
The widget core logic (892 lines) including:
- 🔌 SDK initialization and management
- 💾 **Session persistence** with D365 liveChatContext reconnection
- 👤 **Contact authentication** provider for D365 integration
- 📡 Event handling and message processing
- 🎨 Message rendering with file attachment support
- 🧪 Demo mode for testing without D365
- ⚙️ **Settings loading and application** from admin panel

#### [`D365-CHAT-SDK-GUIDE.md`](D365-CHAT-SDK-GUIDE.md)
Comprehensive SDK implementation guide covering:
- ⚙️ SDK setup and configuration
- 📩 Message handling and deduplication
- 👤 Sender information parsing
- 📎 File attachment processing
- 🎧 Event listener setup
- ⚠️ Common pitfalls and solutions

---


## 🔑 Advanced Features

### 🔄 Session Persistence with D365 Reconnection

**Prevents ghost chats and duplicate sessions** by maintaining conversation continuity across page refreshes.

#### How It Works

1. **During Active Chat**: Session data is saved to localStorage every time a message is sent/received
2. **On Page Refresh**: Widget checks for an existing session
3. **If Found**: Reconnects to the SAME D365 conversation using saved `liveChatContext`
4. **Result**: Messages and conversation history are restored seamlessly

#### What Gets Saved

| Data | Description |
|------|-------------|
| 📩 **Messages** | Full conversation history |
| 👤 **User Info** | Name, email, authenticated status |
| 🔑 **liveChatContext** | D365 session identifier for reconnection |
| ⏰ **Timestamps** | Session start and last activity |

#### Benefits

- ✅ **No Ghost Chats** - Refreshing doesn't create duplicate D365 sessions
- ✅ **Conversation Continuity** - Users can refresh without losing context
- ✅ **Better UX** - Seamless experience across page navigation
- ⏰ **Auto Expiry** - Sessions automatically expire after 1 hour of inactivity

---

### 👤 Contact Authentication

**Seamlessly authenticate customers** using D365 contact records for personalized service.

#### Field Mapping

| Widget Field | D365 Contact Field | Purpose |
|-------------|-------------------|---------|
| Email | `emailaddress1` | Primary identifier |
| Name | `Name` | Display name |
| Authenticated | `Authenticated` | Auth status flag |

#### Configuration

**Via Admin Panel** ([index.html](index.html)):

1. Navigate to **"Pre-chat Form Settings"**
2. **Toggle** "Enable Pre-chat Form":
   - **ON** → Shows pre-chat form to collect info
   - **OFF** → Auto-starts chat with default contact info
3. Set **"Default Contact Name"** and **"Default Contact Email"**
4. These values are passed to D365 as the authenticated contact

#### Use Cases

| Scenario | Configuration | Benefit |
|----------|--------------|---------|
| 🔓 **Anonymous Visitors** | Pre-chat ON | Collect user information |
| 🔐 **Authenticated Portal** | Pre-chat OFF, Default contact set | Skip form, use logged-in credentials |
| 🎬 **Quick Demos** | Pre-chat OFF, Default contact set | Fast demo without form friction |
| 🔁 **Return Customers** | Pre-chat OFF, Saved profile | Seamless re-engagement |

---

### 🎭 Widget Mode Selector

Choose how the chat widget appears and integrates with D365.

#### Standard Mode
- Uses native **Dynamics 365 Live Chat Widget (LCW)** with OOTB styling
- Best for organizations wanting Microsoft's standard UX
- Minimal custom styling, follows D365 design guidelines

#### Custom Mode ✨
- **Fully styled custom widget** with all advanced features
- Complete branding control
- Includes: Custom colors, 30 fonts, pre-chat toggle, session persistence
- Changes apply immediately in live preview

**How to Switch**: In admin panel, locate "Widget Mode" section and toggle between "Standard" and "Custom"

---

### 🔤 Font Customization (30 Fonts)

Choose from a professional font library to match your brand identity.

<table>
<tr>
<td width="25%">

**Sans-Serif** (9)  
*Modern & Clean*
- Inter
- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins
- Source Sans Pro
- Nunito
- Work Sans

</td>
<td width="25%">

**Serif** (6)  
*Traditional & Elegant*
- Merriweather
- Playfair Display
- Lora
- Crimson Text
- EB Garamond
- Libre Baskerville

</td>
<td width="25%">

**Monospace** (5)  
*Technical & Code*
- Roboto Mono
- Source Code Pro
- IBM Plex Mono
- JetBrains Mono
- Fira Code

</td>
<td width="25%">

**Display** (10)  
*Bold & Stylish*
- Raleway
- Bebas Neue
- Oswald
- Archivo Black
- Anton
- Righteous
- Lobster
- Pacifico
- Dancing Script

</td>
</tr>
</table>

#### Use Cases

- 🏢 **Corporate Branding** - Match brand guidelines
- 👓 **Accessibility** - Improve readability for specific audiences
- 🎨 **Brand Personality** - Playful vs. professional
- 📏 **Consistency** - Align with website typography

---


## 🎨 Admin Panel Guide

The admin panel ([index.html](index.html)) provides a comprehensive interface for configuring every aspect of the chat widget.

### 🎭 Demo Profiles

**Save multiple configuration sets** for different customer demonstrations or environments.

#### Features
- 💾 **Save** configurations with custom names
- 🔄 **Switch** between profiles instantly
- 📝 **Update** existing profiles with current settings
- 🗑️ **Delete** profiles you no longer need

#### How to Use

1. Configure your D365 connection, colors, and branding
2. Enter a profile name (e.g., "Contoso Demo", "Production Config")
3. Click **Save** to create the profile
4. Click on any profile name to load its configuration
5. Use 💾 icon to update, 🗑️ icon to delete

#### Use Cases

| Scenario | Benefit |
|----------|---------|
| 🎬 **Customer Demos** | Different branding per customer |
| 🌍 **Multi-Environment** | Dev, QA, Prod configs |
| 🎨 **A/B Testing** | Test different themes |
| 👥 **Team Collaboration** | Share configs via export |

---

### 🔌 D365 Configuration

Store and validate your **Dynamics 365 Omnichannel** connection details.

#### Required Fields

| Field | Description | Where to Find |
|-------|-------------|---------------|
| **Organization ID** | GUID identifier | D365 Admin → Chat Widget Script |
| **Organization URL** | D365 org domain | `https://yourorg.crm.dynamics.com` |
| **Widget ID (App ID)** | Chat widget identifier | D365 Admin → Chat Widget Script |

#### Connection Status Indicator

| Status | Meaning |
|--------|---------|
| 🟢 **"Configuration complete"** | All required fields configured |
| 🔴 **"Missing..."** | Shows which fields need to be filled |
| ⚪ **"Not configured"** | Demo mode will be used |

**Tip**: The widget works in demo mode even without D365 configuration for testing!

---

### 🎨 Color Customization

**Four tabs** for comprehensive theming with modern **blue-cyan gradient** as the default theme:

#### 1️⃣ Primary Colors Tab

- 🎨 **Toggle** between **Gradient** and **Solid Color** modes
- **Gradient Mode**: Set start and end colors - default is blue-cyan (#4f46e5 to #06b6d4) for headers, buttons, user bubbles
- **Solid Mode**: Choose a single primary color
- 👁️ Live preview updates in real-time

#### 2️⃣ Message Colors Tab

| Color | Applied To |
|-------|-----------|
| **User message bubble** | Customer messages background |
| **User text** | Text within user messages |
| **Agent message bubble** | Agent messages background |
| **Agent text** | Text within agent messages |
| **System message background** | Notifications (e.g., "Agent joined") |
| **System text** | System notification text |

#### 3️⃣ UI Elements Tab

| Element | Description |
|---------|-------------|
| **Chat background** | Main message area background |
| **Input background** | Message input field background |
| **Input border** | Input field border color |
| **Send button** | Send message button color |

#### 4️⃣ Launcher Tab

| Element | Description |
|---------|-------------|
| **Launcher button** | Chat widget launcher button color |
| **Notification badge** | Unread message counter background |

---

### 📝 Pre-chat Form Customization

Control the user experience **before chat starts**.

#### Enable/Disable Toggle

- **ON** (default): Shows pre-chat form to collect Name, Email, and Question
- **OFF**: Skips form and starts chat immediately with default contact info

#### When to Disable

✅ Authenticated user scenarios (logged into portal)  
✅ Quick demo/testing without form friction  
✅ Anonymous chat scenarios  
✅ When using default contact authentication

#### Customizable Fields

| Field | Description | Default |
|-------|-------------|---------|
| **Welcome Title** | Main heading | "Start a conversation" |
| **Welcome Message** | Introductory text | Explains the form |
| **Name Field Label** | Name input label | "Your Name" |
| **Email Field Label** | Email input label | "Your Email" |
| **Question Field Label** | Message textarea label | "How can we help?" |
| **Start Button Text** | Submit button label | "Begin Chat" |

#### Default Contact Info (Authentication)

When pre-chat form is **disabled**, these values authenticate the user in D365:

- **Default Contact Name**: Auto-populated name sent to D365
- **Default Contact Email**: Auto-populated email sent to D365
- Maps to D365 contact fields: `Name` and `emailaddress1`

---

### 👥 Avatar Management

Upload custom images for a personalized experience.

#### Avatar Types

| Avatar | Usage | Fallback |
|--------|-------|----------|
| **Default Agent Avatar** | Message bubbles when agent photo unavailable | Agent initials |
| **Default Customer Avatar** | User message bubbles | User initials |

#### Specifications

- ✅ **Format**: JPG, PNG, GIF, SVG
- 📏 **Recommended**: Square images (100x100px minimum)
- 📦 **Maximum**: 2MB file size
- ⚙️ **Optional**: Initials used if not provided

---

### 💾 Import/Export

Share configurations or backup your settings.

#### Export Settings

1. Click **Export JSON**
2. Downloads a `.json` file with:
   - All current settings
   - All saved demo profiles
   - Timestamp of export
3. Use for backup or sharing with team

#### Import Settings

1. Click **Import JSON**
2. Select a previously exported `.json` file
3. Automatically merges profiles by name
4. Updates existing settings

#### Copy Embed Code

1. Click **Copy Embed Code**
2. HTML/JavaScript snippet is copied to clipboard
3. Includes your D365 configuration
4. Ready to paste into your website/portal

---

## � Analytics Dashboard

**Track widget usage across all domains** with the Cloudflare D1 SQL-powered analytics backend.

### Features

- 📈 **Real-time Metrics**
  - Total widget loads (sessions)
  - Total chat interactions
  - Total voice/video calls
- 🌐 **Domain Breakdown** - Sessions grouped by domain
- 📊 **Event Timeline** - Chronological event history with source tracking
- 🎯 **Cross-domain Tracking** - Works across multiple websites

### Cloudflare D1 Backend

The analytics system uses **Cloudflare D1** (SQL database) for scalable, cost-effective tracking:

| Metric | Free Tier Limit |
|--------|----------------|
| **Daily Writes** | 100,000 operations |
| **Daily Reads** | 5,000,000 operations |
| **Storage** | 500 MB |
| **Databases** | 10 |

#### Database Schema

```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,        -- 'load', 'chat', 'call'
    domain TEXT NOT NULL,      -- originating domain
    source TEXT,               -- referrer/source
    timestamp TEXT NOT NULL    -- ISO 8601 format
);
```

#### Deployment

The analytics worker is deployed as a Cloudflare Worker:

```bash
# Deploy the analytics worker
npx wrangler deploy

# View the worker endpoint
# https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics
```

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/track` | POST | Record widget event (load, chat, call) |
| `/analytics` | GET | Retrieve analytics dashboard HTML |
| `/stats` | GET | Get JSON statistics |
| `/reset` | POST | Clear all analytics data |

### Analytics Privacy

- The `analytics.html` file is excluded from the public repository (listed in `.gitignore`)
- Only you can access your analytics dashboard
- No personally identifiable information (PII) is tracked
- Analytics track domain-level usage only

### Viewing Analytics

1. **Deploy the worker** to Cloudflare Workers (see cloudflare-worker/ directory)
2. **Configure your widget** to send tracking events to the worker endpoint
3. **Access the dashboard** at your worker's `/analytics` endpoint
4. **View real-time metrics** for all domains using your widget

---

## �🔧 SDK Integration

This widget uses the **@microsoft/omnichannel-chat-sdk** for headless connectivity to Dynamics 365 Omnichannel.

### SDK Methods Used

| Method | Description | Usage |
|--------|-------------|-------|
| `initialize()` | Initializes the Chat SDK | Called on widget load |
| `startChat()` | Starts a new chat session | Pre-chat form submission or auto-start |
| `sendMessage()` | Sends a message to the agent | User sends text message |
| `endChat()` | Ends the current chat | User clicks end chat button |
| `uploadFileAttachment()` | Uploads a file attachment | User attaches file |
| `downloadFileAttachment()` | Downloads a file attachment | User clicks download |
| `getLiveChatTranscript()` | Gets the chat transcript | Download transcript feature |
| `sendTypingEvent()` | Sends typing indicator | User types in input field |
| `getMessages()` | Retrieves all messages | Polling for new messages |

### Event Subscriptions

| Event | Handler | Description |
|-------|---------|-------------|
| `onNewMessage` | Message display | Renders incoming messages in real-time |
| `onTypingEvent` | Typing indicator | Shows "Agent is typing..." |
| `onAgentEndSession` | Session cleanup | Handles agent-initiated session end |

### Authentication Provider

The widget implements a **custom authentication provider** for contact authentication:

```javascript
const authSettings = {
    authClientFunction: async () => {
        return {
            getToken: async () => {
                // Returns JWT token or contact info
                return {
                    emailaddress1: "user@example.com",
                    Name: "John Doe",
                    Authenticated: true
                };
            }
        };
    }
};
```

This enables:
- ✅ Contact record matching in D365
- ✅ Authenticated chat sessions
- ✅ Pre-filled contact information
- ✅ Portal/SSO integration

### Session Persistence Implementation

The widget saves and restores the **D365 liveChatContext** to maintain conversation continuity:

```javascript
// During chat
const liveChatContext = await chatSDK.getCurrentLiveChatContext();
localStorage.setItem('chatWidgetSession', JSON.stringify({
    liveChatContext,
    messages,
    userInfo,
    timestamp
}));

// On page refresh
const session = JSON.parse(localStorage.getItem('chatWidgetSession'));
if (session && !isExpired(session)) {
    await chatSDK.startChat({
        liveChatContext: session.liveChatContext
    });
}
```

**Result**: Same D365 conversation is resumed, preventing ghost chats.

---

## 📱 Mobile Support

The widget and admin panel are **fully responsive** and optimized for mobile devices.

### Chat Widget Mobile Features

- 📱 **Full-screen mode** on mobile devices
- 👆 **Touch-friendly controls** and inputs
- ⌨️ **Optimized keyboard handling** (no viewport issues)
- 📐 **Proper viewport configuration**
- 🎨 **Adaptive UI** that scales gracefully
- 📎 **Mobile file picker** integration
- 😊 **Native emoji keyboard** support

### Admin Panel Mobile Features

- 📊 **Responsive layout** for tablets and phones
- 🖱️ **Touch-optimized controls**
- 📱 **Scrollable sections** for smaller screens
- 🎨 **Collapsible panels** for better space management

### Supported Devices

| Device | Experience |
|--------|-----------|
| 💻 **Desktop** | Full features, optimal experience |
| 📱 **Mobile** | Full-screen chat, all features supported |
| 📱 **Tablet** | Hybrid experience, admin panel accessible |

---

## 🧪 Demo Mode

The widget **automatically runs in demo mode** if D365 is not configured or SDK fails to load.

### Demo Mode Features

- 🤖 **Simulated agent responses** (realistic delays)
- 🎨 **Working UI interactions** (all buttons, animations)
- 📊 **Queue position simulation**
- 💬 **Echo bot behavior** for testing
- ✅ **No connection errors or warnings**
- 🎬 **Perfect for presentations and demos**

### When Demo Mode Activates

- ❌ D365 configuration is missing or incorrect
- ❌ SDK fails to initialize
- ❌ Network connectivity issues
- ✅ Admin panel status shows "Not configured"

### How to Use Demo Mode

1. Open [live.html](live.html) without configuring D365
2. Widget automatically detects missing config
3. Chat functions with simulated responses
4. Perfect for:
   - 🎨 Testing UI customizations
   - 🎬 Customer demonstrations
   - 🧪 Development without D365 access
   - 📚 Training and onboarding

---

## �️ Troubleshooting

### Session Persistence Issues

**Problem**: Chat session not restoring after page refresh
- **Check**: Browser localStorage is enabled (required for session persistence)
- **Check**: Session hasn't expired (1 hour timeout)
- **Solution**: Clear localStorage and start a fresh chat session

**Problem**: "Ghost chats" or duplicate sessions in D365
- **Cause**: This was a known issue that has been fixed
- **Solution**: The widget now saves and restores D365 `liveChatContext` to reconnect to the same conversation
- **Verification**: Check browser console for "Restoring chat session" message on refresh

**Problem**: Session persists when I don't want it to
- **Solution**: Clear browser localStorage or use incognito/private browsing mode
- **Manual Clear**: Open browser console and run: `localStorage.removeItem('chatWidgetSession')`

### Contact Authentication Issues

**Problem**: D365 not recognizing authenticated contact
- **Check**: Contact record exists in D365 with matching `emailaddress1` field
- **Check**: Email format is valid
- **Check**: "Default Contact Email" in admin panel matches D365 record exactly
- **Solution**: Verify contact record in D365 Customer Service and ensure email matches

**Problem**: Pre-chat form still shows when disabled
- **Check**: "Enable Pre-chat Form" toggle is OFF in admin panel
- **Check**: Default contact name and email are configured
- **Solution**: Save settings and refresh the chat widget page

### Emoji Picker

**Problem**: Emoji picker doesn't show
- **Note**: Widget uses native OS emoji picker, not a custom UI component
- **Windows**: Press `Win + .` or `Win + ;` to open emoji picker
- **Mac**: Press `Cmd + Ctrl + Space` to open emoji picker
- **Tooltip**: Hover over the emoji icon for instructions specific to your OS

---

## 🔒 Security Best Practices

### Client-Side Security

| Practice | Description |
|----------|-------------|
| 🔑 **No Credentials** | Never expose API keys or secrets in client-side code |
| 🔐 **Authenticated Chat** | Use authenticated sessions for sensitive data |
| 📋 **CSP Headers** | Implement Content Security Policy headers |
| 🎭 **Data Masking** | Mask PII (personally identifiable information) |

### Data Storage Security

| Component | Security Notes |
|-----------|----------------|
| 💾 **localStorage** | Stores settings locally only, not transmitted externally |
| 💬 **Session Data** | Includes chat history - ensure localStorage is secured |
| 📤 **Export Configs** | Share only with trusted recipients |
| 🎨 **Admin Panel** | Restrict access to authorized users only |

### Authentication Security

⚠️ **Important**: Default contact info should only be used in:
- ✅ Trusted/authenticated scenarios (e.g., logged-in portals)
- ✅ SSO-protected environments
- ✅ Internal testing/demos

❌ **Never use** for public-facing anonymous widgets with pre-filled admin credentials.

### HTTPS Requirement

🔒 Always host the widget on **HTTPS** to ensure:
- Encrypted communication with D365
- localStorage security
- Protection against MITM attacks

---

## 📚 Documentation

### Official Microsoft Documentation

| Resource | Link |
|----------|------|
| 📘 **D365 Live Chat SDK Reference** | [Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/omnichannel-reference) |
| 💻 **Omnichannel Chat SDK (GitHub)** | [GitHub Repo](https://github.com/microsoft/omnichannel-chat-sdk) |
| 🎨 **Customize Live Chat Widgets** | [Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/develop-live-chat-widget) |
| 🧩 **Live Chat Widget UI Components** | [GitHub Repo](https://github.com/microsoft/omnichannel-chat-widget) |

### Project Documentation

| Document | Description |
|----------|-------------|
| 📖 [README.md](README.md) | This file - complete project guide |
| 📘 [D365-CHAT-SDK-GUIDE.md](D365-CHAT-SDK-GUIDE.md) | SDK implementation guide & best practices |
| 🎴 [ADAPTIVE-CARDS-GUIDE.md](ADAPTIVE-CARDS-GUIDE.md) | Copilot Studio Adaptive Cards integration |
| 📞 [VOICE-VIDEO-GUIDE.md](VOICE-VIDEO-GUIDE.md) | Voice/Video calling feature documentation |
| 🎯 [AGENT-CALLING-IMPLEMENTATION.md](AGENT-CALLING-IMPLEMENTATION.md) | Agent-initiated calling implementation details |

---

## 🎯 Real-World Use Cases

### 🎬 Customer Demonstrations

**Scenario**: Sales team demos the widget to multiple prospects

| Feature | Benefit |
|---------|----------|
| 🎭 Demo Profiles | Save separate profile for each customer |
| 🔄 Instant Switching | Switch branding during live demos |
| 📤 Export Configs | Share configs with clients |
| 🚫 Pre-chat Toggle | Skip forms for faster demos |

**Result**: Professional, customized demos that win deals.

---

### 🏢 Multi-Tenant Deployments

**Scenario**: SaaS platform with multiple customer organizations

| Feature | Benefit |
|---------|----------|
| 📁 One Codebase | Single widget for all customers |
| 🔌 Per-Customer D365 | Different D365 org per tenant |
| 👥 Team Management | Team members update individual configs |
| 🔄 Session Persistence | Uninterrupted experience across refreshes |

**Result**: Scalable, maintainable multi-tenant solution.

---

### 🔐 Authenticated Portal Integration

**Scenario**: Customer portal with logged-in users

| Feature | Benefit |
|---------|----------|
| 👤 Contact Auth | Match portal user to D365 contact |
| 🚫 Skip Pre-chat | No duplicate info entry |
| 🔄 Session Continuity | Chat persists across page navigation |
| 🔑 SSO Support | Integrates with existing authentication |

**Result**: Seamless, personalized customer experience.

---

### 🧪 A/B Testing

**Scenario**: Optimize widget for conversion and engagement

| Feature | Benefit |
|---------|----------|
| 🎨 Multiple Themes | Test different color schemes |
| 🔤 Font Testing | Compare readability and brand fit |
| 💾 Save Variants | Keep successful configurations |
| 📊 Quick Switching | A/B test in real-time |

**Result**: Data-driven design decisions.

---

### 🎨 Brand Consistency

**Scenario**: Enterprise with strict brand guidelines

| Feature | Benefit |
|---------|----------|
| 🎨 Centralized Admin | Single source of truth for branding |
| 🔤 30 Fonts | Match corporate font guidelines |
| 🎨 Color Control | Exact brand colors (gradients/solid) |
| 💾 Export/Backup | Version control for branding |

**Result**: Consistent brand experience across all touchpoints.

---

## 🤝 Support & Community

### Getting Help

| Issue Type | Resource |
|------------|----------|
| 🔧 **Widget Issues** | Review [Troubleshooting](#️-troubleshooting) section |
| 📘 **SDK Questions** | Read [D365-CHAT-SDK-GUIDE.md](D365-CHAT-SDK-GUIDE.md) |
| 🔌 **D365 Service** | Contact [Microsoft Support](https://support.microsoft.com/) |
| 🎨 **Customization** | Review [Admin Panel Guide](#-admin-panel-guide) |
| 💾 **Session Persistence** | See [Advanced Features](#-advanced-features) |
| 👤 **Contact Auth** | Check [Contact Authentication](#-contact-authentication) |

### Quick Reference

| Topic | Section |
|-------|----------|
| 🚀 Getting Started | [Quick Start](#-quick-start) |
| 🎨 Appearance | [Admin Panel Guide](#-admin-panel-guide) |
| 🔑 Advanced Features | [Session Persistence](#-session-persistence-with-d365-reconnection) |
| 📁 File Structure | [Project Structure](#-project-structure) |
| 🔧 SDK Integration | [SDK Integration](#-sdk-integration) |
| 🛠️ Troubleshooting | [Troubleshooting](#️-troubleshooting) |

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| 📄 **Admin Panel** | index.html (comprehensive config) |
| 🎬 **Live Widget** | live.html (full-featured UI) |
| 💻 **Core Logic** | src/chat-widget.js (892 lines) |
| 🔤 **Font Options** | 30 professional fonts |
| 🎨 **Color Options** | Unlimited (gradients + solid) |
| 🔌 **D365 SDK** | @microsoft/omnichannel-chat-sdk v1.11+ |
| 📱 **Mobile Support** | Fully responsive |
| 🧪 **Demo Mode** | Built-in, no D365 required |

---

## 🗺️ Roadmap

### Completed Features ✅

- [x] 📊 **Analytics dashboard** - Cloudflare D1 SQL backend (v1.5.0)
- [x] 🎨 **Blue-cyan gradient theme** - Modern color scheme replacing purple (v1.5.0)
- [x] 📚 **Quick Start Guide** - Interactive tutorial for new users (v1.5.0)
- [x] 🎨 **Custom icon support** - Branded PNG/SVG icons for admin sections (v1.5.0)

### Planned Features

- [ ] 🌍 **Multi-language support** with dynamic translations
- [ ] 🎤 **Voice message recording** (in addition to text)
- [ ] 🎨 **Theme marketplace** (pre-built color schemes)
- [ ] 🔔 **Browser notifications** (desktop notifications for new messages)
- [ ] 💬 **Canned responses** (quick reply templates)
- [ ] 📷 **Screenshot/screen sharing** integration
- [ ] 🤖 **Bot builder integration** (Visual bot flow designer)
- [ ] 📈 **Advanced analytics** (funnel analysis, conversion tracking, A/B testing)

---

## 📄 License

**MIT License** - Free to use, modify, and distribute.

This custom widget implementation is provided **as-is** for educational and commercial purposes. Modify and use according to your needs.

### Attribution

While not required, attribution is appreciated:

```
Based on Modern D365 Live Chat Widget
https://github.com/moliveirapinto/d365-modern-chat-widget
```

---

## ⭐ Show Your Support

If this widget helped you, consider:

- ⭐ **Starring** this repository
- 🍴 **Forking** to customize for your needs
- 🐛 **Reporting issues** you encounter
- 💡 **Suggesting features** you'd like to see
- 📤 **Sharing** with others who might benefit

---

## � Contributing

> ⚠️ **IMPORTANT: This project has TWO implementations that MUST stay in sync!**

| File | Purpose |
|------|---------|
| `live.html` | Direct website widget |
| `dist/widget-core.js` | TamperMonkey / Embedded widget |

**Any feature or fix in one file MUST also be applied to the other.**

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for:
- Complete sync checklist
- Feature mapping between files
- Testing requirements

---

## 📝 Changelog

### v2.15.0 (March 18, 2026)

#### 🔄 Context Variables & Post-Chat Survey Support
- **NEW:** Context Variables — pass custom context variables from bot/config to D365 Omnichannel via `customContext` in `startChat()`. Supports both simple values and structured `{value, isDisplayable}` format
- **NEW:** Post-Chat Survey — automatically renders D365 Customer Voice survey (iframe) after chat ends, if configured in Omnichannel admin center
- **NEW:** Post-chat survey includes a Skip button to dismiss and go straight to the ended view
- **IMPROVED:** Survey state properly resets when starting a new chat session
- **IMPROVED:** Feature parity maintained across `widget-core.js`, `chat-widget.js`, `live.html`, and all embed modes

---

### v2.12.0 (February 17, 2026)

#### 🔐 Authentication Fix & Background Image Improvement
- **FIX:** Contact Authentication now works correctly — `enableCustomAuth`, `customAuthName`, and `customAuthEmail` settings are now properly passed to `widget-core.js` via `live.html`, so chats arrive with the customer record populated in Dynamics instead of as "visitor"
- **FIX:** Email context field changed from `'Email'` to `'emailaddress1'` in `chat-widget.js` to match the D365 contact entity field, enabling proper contact record lookup
- **FIX:** "New Chat" button in generated embed code now respects `enablePrechatForm` and `enableCustomAuth` settings instead of always showing the pre-chat form
- **FIX:** "Your Background" image no longer appears stretched/cropped — changed from `background-size: cover` to `contain` so the full image is displayed without distortion

---

### v2.11.0 (January 30, 2026)

#### 🤖 Custom Bot Name SDK Fix
- **FIX:** Custom Bot Name now works in SDK widget (`chat-widget.js`) - the `customBotName` config option was not being passed to the widget
- **NEW:** Added `isBotSender()` helper method to detect bot messages by sender name keywords
- **IMPROVED:** Bot name detection checks for: `bot`, `copilot`, `virtual`, `assistant`, `ai` in sender name

---

### v2.10.0 (January 30, 2026)

#### 📝 Message Input & Color Palette Improvements
- **NEW:** Message Input Placeholder - customize the "Type your message..." placeholder text
- **NEW:** Bubble Gradient UX hints - clear warning when gradient overrides User Bubble color
- **FIX:** Color palette selection now properly passes `useBubbleGradient` to all deployment methods
- **FIX:** `useBubbleGradient` config now included in compact embed code generation
- **IMPROVED:** Cache-busting for widget-core.js - ensures fresh code loads after updates
- **IMPROVED:** Enhanced debug logging for color settings in widget-core.js
- **IMPROVED:** Pre-chat form labels (Name, Email, Question) now pass to all template pages
- **IMPROVED:** Auto-save when applying color palettes - changes persist immediately

---

### v2.9.0 (January 28, 2026)

#### 🌍 Localization & Time Format Settings
- **NEW:** Localization & Time section in Chat Widget Studio - customize all UI text for international audiences
- **NEW:** Time Format selector - choose between 12-hour (2:30 PM) and 24-hour (14:30) formats for message timestamps
- **NEW:** Customizable Connecting View text - "Connecting you with an agent..."
- **NEW:** Customizable Chat Ended View - title, message, and "Start New Chat" button text
- **NEW:** Customizable End Chat Confirmation Dialog - title, message, cancel button, and end chat button text
- **NEW:** All localization settings are saved per profile and sync across devices
- **IMPROVED:** live.html now uses embedded widget-core.js (same as industry templates) - eliminates maintenance duplication
- **IMPROVED:** Consistent widget experience across all deployment methods

---

### v2.8.0 (January 28, 2026)

#### 🎴 Adaptive Card Rendering Fix
- **FIX:** Resolved "data.indexOf is not a function" error that caused complex Adaptive Cards to fail rendering
- **NEW:** Custom markdown processor for Adaptive Cards - safely handles any input type to prevent crashes
- **IMPROVED:** Robust payload sanitization - text properties (`text`, `title`, `altText`, `placeholder`, `label`, etc.) are now safely converted to strings
- **IMPROVED:** Preserved `action.data` as objects - form submissions with `Action.Submit` buttons now work correctly
- **IMPROVED:** Debug logging for Adaptive Cards - original and sanitized payloads are logged to console for troubleshooting

---

### v2.7.0 (January 23, 2026)

#### 🤖 Custom Bot Name & UI Polish
- **NEW:** Custom Bot Name - override Microsoft Copilot Studio bot names with your own branding
- **NEW:** User Bubble Gradient toggle - enable/disable gradient on user messages independently from header
- **IMPROVED:** Embed code changes now properly clear old connection values (fixes widget malfunction)
- **IMPROVED:** Visual parity enforced across all rendering methods (preview, live.html, embedded/Tampermonkey)
- **IMPROVED:** CONTRIBUTING.md updated with Visual Change Checklist for developers
- **FIX:** Bubble gradient now uses correct colors when header gradient is disabled
- **FIX:** Room widget embed code changes now sync properly to global settings
- **FIX:** Profile embed code updates no longer keep stale orgId/orgUrl/widgetId values

---

### v2.6.0 (January 22, 2026)

#### 🎯 Room Widget LCW Integration & UI Polish
- **NEW:** LCW Embed Code section in Room Widgets - paste D365 embed code directly in team widgets
- **NEW:** Connection status indicator for room widgets - shows configured/partial/not configured state
- **NEW:** Extracted D365 values display (App ID, Org ID, Org URL) for room widgets
- **NEW:** Apply to Settings button - parse embed code and extract D365 connection values automatically
- **NEW:** Professional delete confirmation modals with danger/warning styling
- **IMPROVED:** Room header layout - title/details on left, action icons on far right for consistency
- **IMPROVED:** Add Widget to Room modal redesigned with cleaner, professional styling
- **IMPROVED:** Better spacing and alignment in room list items
- **FIX:** Delete confirmation callbacks now execute properly (race condition fixed)
- **FIX:** Hidden D365 connection values no longer appear randomly on page

#### 🏪 Industry Demo Pages
- **NEW:** "Go to Widget" dropdown with industry selector - launch widget in different business contexts
- **NEW:** Retail / E-commerce demo page (`retail.html`) - LUXE & CO. premium clothing store
  - Full ecommerce website layout with Home, Shop, FAQ, Support, Contact pages
  - Mock customer support portal with case history (7 cases: 2 open, 1 pending, 4 resolved)
  - Professional navigation with tabbed interface
  - Widget loads from saved localStorage settings
  - "Back to Studio" navigation link
- **COMING SOON:** Financial Services, Healthcare, Education industry demos

---

### v2.3.0 (January 16, 2026)

#### ⚡ Performance & Stability Improvements
- **OPTIMIZED:** Content Security Policy (CSP) simplified with broad wildcards (`*.microsoft.com`, `*.azure.com`, `*.skype.com`)
- **FIXED:** Eliminated CSP-related connection delays during chat startup
- **IMPROVED:** Faster initial connection to D365 Omnichannel services

#### 🔧 Message Ordering Fix
- **FIXED:** Messages now display in correct chronological order using `messageId` (millisecond precision) instead of `timestamp` field (second precision only)
- **IMPROVED:** 3-tier fallback system: `messageId` → `timestamp` → `createdOn` for reliable sorting

#### 📹 Video Calling Enhancements
- **NEW:** ACS (Azure Communication Services) keepalive mechanism during tab visibility changes
- **FIXED:** Default bot avatar path corrected (`bot1.png`)
- **IMPROVED:** Video call stability with proper endpoint maintenance

#### 🛡️ CSP Configuration
- Simplified CSP rules prevent future connectivity issues with Microsoft services
- Broad wildcards ensure compatibility with SDK updates and new service endpoints

#### 🔄 Feature Parity (widget-core.js sync)
- **NEW:** Session persistence - chat survives page refresh (1 hour expiry)
- **NEW:** Message queue system with proper sorting
- **NEW:** VoiceVideo keepalive - prevents call failures after 5 min
- **NEW:** Visibility handler - fixes 480/10077 errors
- **NEW:** Full markdown rendering with citation support

---

### v2.5.0 (January 22, 2026)

#### 🎯 Multi-Widget Rooms & Cloud Sync
- **NEW:** Multiple widgets per room - each room can now hold unlimited widget profiles
- **NEW:** Copy Personal → Room - share your personal profiles with teammates in one click
- **NEW:** Copy Room → Personal - save room widgets to your personal collection
- **NEW:** Cloud profile sync - profiles now sync across browsers/devices via GitHub Gists
- **NEW:** Refresh button - manually sync profiles from cloud at any time
- **NEW:** 60-second background sync - keeps your profiles up-to-date automatically
- **IMPROVED:** Expandable room list - click room to see all widgets inside
- **IMPROVED:** Profile deletion syncs across devices - delete on one, removed everywhere
- **IMPROVED:** Better error handling for GitHub token scope issues
- **FIX:** Logout now immediately clears UI (page refresh)
- **FIX:** Profiles no longer disappear after re-login on different devices
- **FIX:** Fixed 403/404 errors when cloudId belongs to different account

---

### v2.4.0 (January 16, 2026)

#### 🔗 Room Collaboration - Simplified Team Sharing
- **NEW:** Room Collaboration - share widget settings with a simple 6-character code
- **NEW:** Multiple rooms support - create and join unlimited rooms
- **NEW:** Push/Sync buttons - push your changes or pull latest from teammates
- **REPLACED:** GitHub Team Repository with simpler Room Code system (no accounts needed!)
- **IMPROVED:** Fluent UI icons for room actions (Cloud Sync, Cloud Upload, Clipboard, Delete)
- **IMPROVED:** Team tab shows helpful explanation of what Rooms are for
- **FIX:** Team count badge now shows correct number of rooms
- **FIX:** Feedback form CSP updated to allow forms.office.com

---

### v2.3.0 (January 16, 2026)

#### 🔄 Session Persistence & Reliability
- **NEW:** Session persistence - chat survives page refresh (1 hour expiry)
- **NEW:** VoiceVideo keepalive - prevents call failures after 5 minutes
- **NEW:** Visibility handler - fixes 480/10077 errors when tab in background
- **IMPROVED:** Message ordering uses messageId (millisecond precision)
- **IMPROVED:** CSP simplified with broad wildcards for faster connections
- **IMPROVED:** Full markdown rendering with citation/reference support
- **FIX:** TamperMonkey/embedded widget now has feature parity with live.html
- **FIX:** Bot avatar path corrected

---

### v2.0.0 (December 31, 2025)

#### 👥 Team Mode - Multi-User Collaboration
- **NEW:** Team Mode for sharing widget configurations with teammates
- **NEW:** GitHub repository-based team storage (separate from personal Gists)
- **NEW:** One-click "Create Team Repository" with automatic setup
- **NEW:** "Join Existing Repository" by pasting URL
- **NEW:** Personal vs Team tabs in Widget Profiles section
- **NEW:** Profile badges (Personal / Team) for clear organization

#### 🔧 Token Scope Detection
- Automatic detection of GitHub token permissions
- Clear prompts to upgrade token if repo scope is needed
- Direct link to create new token with all required scopes

#### 📝 UI Improvements
- Renamed "Demo Profiles" to "Widget Profiles" for clarity
- Team connected state shows repository name with disconnect option
- Empty state guidance for team setup

---

### v1.9.0 (December 31, 2025)

#### 🖼️ Image Preview Before Sending
- **NEW:** Preview modal when attaching images - see your image before sending
- **NEW:** Optional caption input - add context to your images
- **NEW:** Send with Enter key or click Send button
- Cancel option to choose a different image

#### 📁 Drag-and-Drop File Upload
- **NEW:** Drag files directly onto the chat input area
- Visual drop zone overlay with upload icon
- Works across all deployment modes (live.html, embedded, Tampermonkey)

#### 🌐 Edge Browser Compatibility Fix
- **FIXED:** Critical crash in Microsoft Edge 143+ when clicking attach button
- Implemented label-based file input (avoids programmatic `click()` bug)
- Uses native `<label for="input">` which triggers file picker without JavaScript
- Drag-and-drop uses separate browser code path unaffected by the bug
- Workaround for [Chromium bug #466331742](https://issues.chromium.org/issues/466331742)

#### 🔧 Technical Improvements
- Unified file handling with deferred processing for browser stability
- Small timeout after file selection to ensure dialog closes properly
- Consistent fix applied to: live.html, index.html preview, dist/widget-core.js

---

### v1.8.0 (December 22, 2025)

#### 🎨 Quick Color Palettes
- **NEW:** Color palette gallery with 24 curated professional color combinations
- One-click palette application to all widget colors (header, buttons, launcher, pre-chat)
- "Show All" / "Show Less" toggle to expand/collapse palette gallery
- Visual selection feedback with highlighted active palette
- Link to coolors.co for additional color inspiration
- Styled gradient button for better visibility

#### 🔄 Reset to Default Improvements
- **FIXED:** Reset to Default now properly clears all settings
- Auto-refreshes page after reset for guaranteed clean state
- No manual refresh or cache clearing needed

#### 🐛 Bug Fixes
- **FIXED:** Character count warning only shows when generating embed code (not when downloading HTML)

---

### v1.7.0 (December 21, 2025)

#### 🎨 Pre-chat Hero Customization
- **NEW:** Configurable pre-chat hero gradient toggle (gradient vs solid color)
- **NEW:** Custom gradient start/end colors for pre-chat hero section
- **NEW:** Solid background color option for pre-chat hero
- **NEW:** Customizable title, subtitle, badge, and status dot colors
- **NEW:** Configurable avatar border color
- **NEW:** Name and email field placeholder settings
- Updated hero avatars to use GitHub-hosted images with config fallbacks

#### 🚀 Embed Code Improvements
- **Download HTML button** now only appears after generating embed code
- TamperMonkey mode hides download button to avoid confusion
- Download HTML always generates functional full embed code
- Green gradient styling on Download HTML button for visibility
- Fixed avatar image paths in embed code (now use GitHub raw URLs)

#### 🐒 TamperMonkey Enhancements
- Pre-chat hero colors now work in TamperMonkey/Compact mode
- Field placeholders now configurable and work across all output modes
- widget-core.js updated with all new customization options

#### 🐛 Bug Fixes
- Fixed embedded code avatar images using local paths (now GitHub URLs)
- Fixed Download HTML producing broken pages with TamperMonkey code
- Fixed placeholders not appearing in downloaded HTML files

---

### v1.6.0 (December 2025)

#### 🎨 Visual Improvements
- Updated color scheme to blue-cyan gradient theme throughout admin panel
- Modernized preview tab menu with clean underline design and gradient borders
- Improved widget mode cards with consistent blue-cyan styling
- Enhanced LCW Embed Code textarea with gradient background and better focus states
- Updated tab buttons (Primary, Messages, UI Elements, Launcher) to blue-cyan theme
- Refined launcher preview section layout for better spacing

#### 🔧 UI/UX Enhancements
- Fixed preview send button to match actual widget (transparent background, no gradient override)
- Aligned all avatar styles in preview with actual widget (gradients, borders, hover effects)
- Removed JavaScript overrides that were affecting preview accuracy
- Updated widget mode icons (Standard: git-commit.svg, Custom: loader.svg)
- Improved "Go to Live Widget" button text for clarity
- Removed gray background from connection status for cleaner appearance
- Optimized launcher preview spacing and side-by-side layout

#### 🐛 Bug Fixes
- Fixed avatar preview colors not matching generated widget
- Resolved send button purple background showing in preview despite CSS
- Corrected avatar CSS classes (bot, user, agent) for proper gradient application
- Fixed scrollbar issue in live preview by adjusting padding

---

<div align="center">

**Built with ❤️ for a better customer service experience**

🚀 **[Get Started](#-quick-start)** | 📖 **[Read Docs](#-documentation)** | 🎨 **[View Demo](live.html)**

---

*Powered by Microsoft Dynamics 365 Omnichannel for Customer Service*

</div>
