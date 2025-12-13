# Modern Dynamics 365 Live Chat Widget

A beautiful, modern custom chat widget UI for Microsoft Dynamics 365 Omnichannel for Customer Service with an intuitive admin panel for managing multiple customer configurations. This implementation completely replaces the out-of-the-box (OOTB) chat widget with a sleek, contemporary design.

![Chat Widget Preview](preview.png)

## ✨ Features

### 🚀 Advanced Capabilities
- **🔄 Session Persistence with D365 Reconnection**: Automatically saves chat sessions and reconnects to the same D365 conversation on page refresh - prevents ghost chats and duplicate sessions
- **👤 Contact Authentication**: Seamlessly authenticate customers using D365 contact records (emailaddress1, Name fields) for personalized service
- **🎨 30 Font Options**: Choose from professionally curated fonts organized in 4 categories (Sans-Serif, Serif, Monospace, Display)
- **🔀 Widget Mode Selector**: Switch between Standard mode (native D365 LCW) and Custom mode (fully styled widget)
- **💬 Pre-chat Form Toggle**: Enable/disable pre-chat form with optional default contact info for quick demos
- **😊 Native OS Emoji Picker**: Full emoji support with native OS picker integration (Win+. or Cmd+Ctrl+Space)
- **✨ Elegant Custom Scrollbar**: Premium scrollbar styling with soft gray tones

### Chat Widget
- **Modern Design** - Clean, minimalist interface with smooth animations
- **Gradient Accents** - Beautiful purple/blue gradient theme (fully customizable)
- **Responsive** - Works on desktop and mobile devices
- **Pre-Chat Form** - Collects user information before starting chat (customizable fields)
- **Real-time Messaging** - Full integration with D365 Omnichannel Chat SDK
- **Typing Indicators** - Shows when agent is typing
- **File Attachments** - Upload and download files
- **Emoji Support** - Native OS emoji picker with helpful tooltips
- **Queue Position** - Displays queue status with animated UI
- **Chat Transcript** - Download conversation history
- **Toast Notifications** - User-friendly feedback messages
- **Notification Badge** - Unread message counter
- **Demo Mode** - Works without D365 for testing/demo purposes
- **Theme Support** - Automatically applies admin panel customizations

### Admin Panel
- **Demo Profiles** - Save and switch between multiple customer configurations instantly
- **Widget Mode Selector** - Choose between Standard (native D365 LCW) or Custom (styled widget)
- **Font Library** - 30 professional fonts organized in 4 categories (Sans-Serif, Serif, Monospace, Display)
- **D365 Configuration** - Easy setup of Organization ID, URL, and Widget ID with connection validation
- **Contact Authentication** - Configure default contact info (Name, Email) for D365 authentication
- **Live Theme Preview** - See changes in real-time as you customize
- **Color Customization** - Full control with 3 tabs (Primary, Messages, UI Elements) and gradient/solid options
- **Branding** - Custom header titles, subtitles, and logos
- **Pre-chat Form Toggle** - Enable/disable pre-chat form with customizable welcome messages and field labels
- **Avatar Management** - Upload custom agent and customer avatars
- **Import/Export** - Share configurations across team or backup settings
- **Quick Embed Code** - Copy integration code with one click
- **Connection Status** - Real-time validation of D365 settings

## 🚀 Quick Start

### 1. Clone or Download

Download the files to your project:

```
d365-modern-chat-widget/
├── index.html              # Main chat widget
├── admin.html              # Admin configuration panel
├── package.json            # Dependencies
├── webpack.config.js       # Build configuration
├── src/
│   ├── chat-widget.js      # Widget SDK wrapper
│   └── sdk-entry.js        # SDK entry point
└── README.md              # This file
```

### 2. Configure via Admin Panel (Recommended)

1. **Open the Admin Panel**: Navigate to `admin.html` in your browser
2. **Set D365 Connection**:
   - Enter your Organization ID
   - Enter your Organization URL
   - Enter your Widget ID
3. **Customize Appearance**:
   - Choose colors and gradients
   - Upload company logo
   - Set header text
4. **Personalize Pre-chat Form**:
   - Edit welcome message
   - Customize field labels
   - Set button text
   - **Enable/disable pre-chat form** with toggle switch
   - **Configure default contact info** for demo/authenticated scenarios
5. **Upload Avatars**:
   - Add default agent photo
   - Add default customer avatar
6. **Save as Profile**: Create demo profiles for different customers
7. **Export Settings**: Download configuration JSON for sharing

## 🔑 Session Persistence & Contact Authentication

### Session Persistence
The widget automatically saves and restores chat sessions using localStorage:
- **Saves**: Messages, user info, D365 liveChatContext, and timestamps
- **Restores**: Reconnects to the SAME D365 conversation on page refresh
- **Prevents**: Ghost chats and duplicate sessions
- **Expires**: Automatically after 1 hour of inactivity

**How it works**:
1. During active chat, session data is saved to localStorage every time a message is sent/received
2. On page refresh, the widget checks for an existing session
3. If found and not expired, it reconnects to the same D365 conversation using the saved liveChatContext
4. Messages and conversation history are restored seamlessly

### Contact Authentication
Authenticate customers using D365 contact records:
- **Field Mapping**: emailaddress1 (email), Name (full name), Authenticated (true/false)
- **Pre-chat Toggle**: Enable/disable the pre-chat form
- **Default Contact Info**: Configure default name/email for quick demos or authenticated scenarios
- **Use Case**: When user is already logged into your portal, pass their info to skip pre-chat form

**Configuration in admin.html**:
1. Navigate to "Pre-chat Form Settings"
2. Toggle "Enable Pre-chat Form" (ON = show form, OFF = auto-start with defaults)
3. Set "Default Contact Name" and "Default Contact Email"
4. These values are passed to D365 as the authenticated contact

### 3. Configure Manually (Alternative)

Open `src/chat-widget.js` and update the configuration:

```javascript
window.chatWidget = new ModernChatWidget({
    orgUrl: "https://yourorg.crm.dynamics.com",
    orgId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    widgetId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
});
```

### 4. Get Your D365 Configuration Values

You can find these values in **Copilot Service Admin Center**:

1. Navigate to **Customer Service admin center** or **Omnichannel admin center**
2. Go to **Channels** → **Chat**
3. Select your chat widget
4. Click **Copy Widget Script**
5. Extract the values from the script:
   - `data-org-url` → Organization URL
   - `data-org-id` → Organization ID
   - `data-app-id` → Widget ID

### 5. Deploy

Host the files on your web server or embed them in your website/portal using the embed code from admin panel.

## 📁 File Structure

### `index.html`
The main chat widget containing:
- Chat widget UI and layout with customizable styling
- Pre-chat form with dynamic field labels
- Message area with typing indicators
- Input controls with emoji, file, and voice options
- Loading states and connection indicators
- **Automatically loads and applies admin settings from localStorage**

### `admin.html`
The comprehensive admin configuration panel with:
- **Demo Profiles** section for saving/loading configurations
- **Widget Mode Selector** to switch between Standard (D365 LCW) and Custom (styled widget)
- **Font Library** with 30 professional fonts in 4 categories
- **D365 Connection** settings with status indicator
- **Contact Authentication** with default name/email for authenticated scenarios
- **Header & Branding** customization
- **Colors** tabs (Primary, Messages, UI Elements) with gradient and solid color options
- **Pre-chat Form** toggle and field customization (titles, labels, button text)
- **Avatars** upload area for agent and customer
- **Import/Export** functionality and embed code generator
- **Live Preview** panel showing real-time changes
- Settings management with save/reset options

### `src/chat-widget.js`
The widget logic including:
- SDK initialization and management
- Session persistence with D365 liveChatContext reconnection
- Contact authentication provider for D365 integration
- Event handling
- Message rendering
- File attachment support
- Demo mode for testing
- **Settings loading and application from admin panel**

## 🎨 Admin Panel Guide

### 🎭 Widget Mode Selector

**What it does**: Choose how the chat widget appears and integrates with D365.

**Modes**:
- **Standard Mode**: Uses the native Dynamics 365 Live Chat Widget (LCW) with OOTB styling
  - Best for: Organizations wanting Microsoft's standard UX
  - Integration: Minimal custom styling, follows D365 design guidelines
  
- **Custom Mode**: Fully styled custom widget with all advanced features
  - Best for: Organizations wanting complete branding control
  - Features: Custom colors, fonts, pre-chat form, session persistence

**How to use**:
1. In admin panel, locate "Widget Mode" section
2. Toggle between "Standard" and "Custom"
3. Custom mode unlocks all styling and customization options
4. Changes apply immediately in the live preview

### 🔤 Font Customization (30 Fonts)

**What it does**: Choose from a professional font library to match your brand.

**Categories**:
- **Sans-Serif** (Modern & Clean): Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Source Sans Pro, Nunito, Work Sans
- **Serif** (Traditional & Elegant): Merriweather, Playfair Display, Lora, Crimson Text, EB Garamond, Libre Baskerville
- **Monospace** (Technical & Code): Roboto Mono, Source Code Pro, IBM Plex Mono, JetBrains Mono, Fira Code
- **Display** (Bold & Stylish): Raleway, Bebas Neue, Oswald, Archivo Black, Anton, Righteous, Lobster, Pacifico, Dancing Script

**How to use**:
1. Navigate to "Font Settings" in admin panel
2. Select a font from the dropdown (organized by category)
3. Preview updates in real-time
4. Font applies to entire widget including messages, headers, and buttons

**Use cases**:
- Match corporate brand guidelines
- Improve readability for specific audiences
- Create distinct brand personality (playful vs. professional)
- Accessibility considerations (larger, clearer fonts)

### 📋 Demo Profiles

**What it does**: Save multiple configuration sets for different customer demonstrations.

**How to use**:
1. Configure your D365 connection, colors, and branding
2. Enter a profile name in the input field (e.g., "Contoso Demo")
3. Click "Save" to create the profile
4. Switch between profiles by clicking on them in the list
5. Use the update icon (💾) to save current settings to a profile
6. Use the delete icon (🗑️) to remove a profile

**Use cases**:
- Different branding for different customers
- Pre-configured D365 environments for demos
- Quick demo switching during presentations
- Team member collaboration on customer configs

### 🔌 D365 Configuration

**What it does**: Stores and validates your D365 Omnichannel connection details.

**Fields**:
- **Organization ID**: GUID found in D365 admin center
- **Organization URL**: Your D365 org domain (e.g., https://yourorg.crm.dynamics.com)
- **Widget ID (App ID)**: Omnichannel chat widget identifier

**Connection Status Indicator**:
- 🟢 **Green "Configuration complete"**: All required fields configured
- 🔴 **Red "Missing..."**: Indicates which fields need to be filled
- ⚪ **Gray "Not configured"**: Demo mode will be used, no D365 connection

### 🎨 Color Customization

Three tabs for comprehensive theming:

**Primary Colors Tab**:
- Toggle between **gradient** and **solid color** modes
- Gradient mode: Set start and end colors (used for headers, buttons, user bubbles)
- Solid mode: Choose a single primary color
- Live preview updates in real-time

**Message Colors Tab**:
- **User message bubble**: Color of messages sent by customer
- **User text**: Text color within user messages
- **Agent message bubble**: Color of messages from agent
- **Agent text**: Text color within agent messages
- **System message background**: Notifications and system messages
- **System text**: Text within system messages

**UI Elements Tab**:
- **Chat background**: Main message area background
- **Input background**: Message input field background
- **Input border**: Input field border color
- **Send button**: Color of the send message button
- **Launcher button**: Color of the chat widget launcher button
- **Notification badge**: Unread message counter color

### 📝 Pre-chat Form Customization

**What it does**: Control whether users fill out a form before starting chat, and customize all form fields.

**Enable/Disable Toggle**:
- **ON** (default): Shows pre-chat form to collect Name, Email, and initial Question
- **OFF**: Skips pre-chat form and starts chat immediately using default contact info

**When to disable**:
- Authenticated user scenarios (user already logged into your portal)
- Quick demo/testing without form friction
- Anonymous chat scenarios
- When using default contact authentication

**Customizable Fields**:
- **Welcome Title**: Main heading (e.g., "Start a conversation")
- **Welcome Message**: Introductory text explaining the form
- **Name Field Label**: Label for customer name input
- **Email Field Label**: Label for email input
- **Question Field Label**: Label for message/question textarea
- **Start Button Text**: Label for the button that starts the chat (e.g., "Begin Chat")

**Default Contact Info** (used when pre-chat form is disabled):
- **Default Contact Name**: Auto-populated name sent to D365
- **Default Contact Email**: Auto-populated email sent to D365
- These values authenticate the user in D365 using contact records (emailaddress1, Name fields)

**Use cases**:
- Enable form for anonymous visitors who need to identify themselves
- Disable form for authenticated portal users (pass their logged-in details)
- Quick demos with pre-filled contact info
- Skip form for return customers with saved profiles

### 👥 Avatar Management

Upload custom images for the widget:
- **Default Agent Avatar**: Used in message bubbles when agent photo unavailable
- **Default Customer Avatar**: Used in message bubbles for customer/user messages
- Recommended: Square images (100x100px minimum)
- Maximum: 2MB file size
- Optional: If not provided, initials will be used instead

### 💾 Import/Export

**Export Settings**:
- Click **Export JSON** to download all your settings
- Creates a `.json` file with current settings and all saved profiles
- Useful for backup or sharing with team members
- File includes timestamp of export

**Import Settings**:
- Click **Import JSON** to load previously exported configurations
- Automatically merges profiles by name (avoids duplicates)
- Updates existing settings
- Select a previously exported `.json` file

**Copy Embed Code**:
- Click **Copy Embed Code** to get HTML/JavaScript snippet
- Code includes your D365 configuration (org URL, ID, widget ID)
- Ready to paste directly into your website/portal
- Automatically copied to clipboard

## 🔧 SDK Integration

### Available SDK Methods Used

| Method | Description |
|--------|-------------|
| `initialize()` | Initializes the Chat SDK |
| `startChat()` | Starts a new chat session |
| `sendMessage()` | Sends a message to the agent |
| `endChat()` | Ends the current chat |
| `uploadFileAttachment()` | Uploads a file attachment |
| `downloadFileAttachment()` | Downloads a file attachment |
| `getLiveChatTranscript()` | Gets the chat transcript |
| `sendTypingEvent()` | Sends typing indicator |

### Event Subscriptions

| Event | Handler |
|-------|---------|
| `onNewMessage` | Handles incoming messages |
| `onTypingEvent` | Shows typing indicator |
| `onAgentEndSession` | Handles session end |

## 📱 Mobile Support

The widget and admin panel are fully responsive:
- Full-screen mode on mobile devices
- Touch-friendly controls and inputs
- Optimized keyboard handling
- Proper viewport configuration
- Admin panel works on tablets and phones

## 🧪 Demo Mode

If you don't have D365 configured or the SDK fails to load, the widget automatically runs in demo mode:
- Simulated agent responses
- Working UI interactions
- Queue position simulation
- Perfect for testing and demos
- No connection errors or warnings

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

## 🔒 Security Notes

1. **Never expose credentials** in client-side code
2. Use **authenticated chat** for sensitive data
3. Implement **Content Security Policy** headers
4. Consider using **data masking** for PII
5. **localStorage** stores settings locally - doesn't transmit to external servers
6. Export configurations only to trusted recipients
7. Admin panel should be restricted to authorized users only
8. **Session data** includes chat history - ensure localStorage is properly secured
9. **Default contact info** should only be used in trusted/authenticated scenarios

## 📚 Documentation Links

- [Dynamics 365 Live Chat SDK Reference](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/omnichannel-reference)
- [Omnichannel Chat SDK (GitHub)](https://github.com/microsoft/omnichannel-chat-sdk)
- [Customize Live Chat Widgets](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/develop-live-chat-widget)
- [Live Chat Widget UI Components](https://github.com/microsoft/omnichannel-chat-widget)

## 🎯 Use Cases

### Customer Demonstrations
- Save separate profiles for each customer
### Customer Demonstrations
- Save separate profiles for each customer
- Switch between customer branding instantly
- Show customization capabilities live
- Export configs to share with clients
- Use pre-chat toggle to skip forms during demos

### Multi-Tenant Deployments
- One codebase, multiple customer configs
- Manage different D365 orgs per customer
- Team members can update individual customer settings
- No code changes needed
- Session persistence ensures uninterrupted customer experience

### Authenticated Portal Integration
- Disable pre-chat form for logged-in users
- Pass portal user credentials to D365 for contact matching
- Seamless experience without re-entering information
- Session persistence maintains chat across page navigation
- Single sign-on (SSO) friendly

### A/B Testing
- Create different themed versions
- Switch between variants instantly
- Save results in profile names
- Import successful configurations
- Test font and color combinations for readability

### Brand Consistency
- Centralized admin panel for all branding
- 30 professional fonts to match brand guidelines
- Ensures consistency across deployments
- Easy updates to colors and messaging
- Quick rollback to previous versions

## 🤝 Support

For issues specific to the Dynamics 365 Omnichannel service, contact Microsoft Support. 

For help with:
- **Session persistence** - Review the Troubleshooting section for ghost chats and reconnection issues
- **Contact authentication** - Verify D365 contact records match the email/name configured
- **Admin panel customization** - Review the configuration guide above
- **Widget appearance** - Check the Font Customization and Color Customization sections
- **D365 configuration** - Verify your org ID, URL, and widget ID values
- **Pre-chat form toggle** - See the Pre-chat Form Customization section
- **Import/Export issues** - Ensure the JSON file is valid and correctly formatted

## 📄 License

This custom widget implementation is provided as-is for educational and development purposes. Modify and use according to your needs.

---

Built with ❤️ for a better customer service experience
