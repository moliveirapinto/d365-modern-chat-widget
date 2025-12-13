# Modern Dynamics 365 Live Chat Widget

A beautiful, modern custom chat widget UI for Microsoft Dynamics 365 Omnichannel for Customer Service with an intuitive admin panel for managing multiple customer configurations. This implementation completely replaces the out-of-the-box (OOTB) chat widget with a sleek, contemporary design.

![Chat Widget Preview](preview.png)

## ✨ Features

### Chat Widget
- **Modern Design** - Clean, minimalist interface with smooth animations
- **Gradient Accents** - Beautiful purple/blue gradient theme
- **Responsive** - Works on desktop and mobile devices
- **Pre-Chat Form** - Collects user information before starting chat
- **Real-time Messaging** - Full integration with D365 Omnichannel Chat SDK
- **Typing Indicators** - Shows when agent is typing
- **File Attachments** - Upload and download files
- **Emoji Picker** - Built-in emoji selector
- **Queue Position** - Displays queue status with animated UI
- **Chat Transcript** - Download conversation history
- **Toast Notifications** - User-friendly feedback messages
- **Notification Badge** - Unread message counter
- **Demo Mode** - Works without D365 for testing/demo purposes
- **Theme Support** - Automatically applies admin panel customizations

### Admin Panel
- **Demo Profiles** - Save and switch between multiple customer configurations instantly
- **D365 Configuration** - Easy setup of Organization ID, URL, and Widget ID
- **Live Theme Preview** - See changes in real-time as you customize
- **Color Customization** - Full control over widget colors and gradients
- **Branding** - Custom header titles, subtitles, and logos
- **Pre-chat Form Customization** - Personalize welcome messages and field labels
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
5. **Upload Avatars**:
   - Add default agent photo
   - Add default customer avatar
6. **Save as Profile**: Create demo profiles for different customers
7. **Export Settings**: Download configuration JSON for sharing

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
- **D365 Connection** settings with status indicator
- **Header & Branding** customization
- **Colors** tabs (Primary, Messages, UI Elements) with gradient and solid color options
- **Pre-chat Form** field customization (titles, labels, button text)
- **Avatars** upload area for agent and customer
- **Import/Export** functionality and embed code generator
- **Live Preview** panel showing real-time changes
- Settings management with save/reset options

### `src/chat-widget.js`
The widget logic including:
- SDK initialization and management
- Event handling
- Message rendering
- File attachment support
- Demo mode for testing
- **Settings loading and application from admin panel**

## 🎨 Admin Panel Guide

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

Modify the form that appears before starting a chat:
- **Welcome Title**: Main heading (e.g., "Start a conversation")
- **Welcome Message**: Introductory text explaining the form
- **Name Field Label**: Label for customer name input
- **Email Field Label**: Label for email input
- **Question Field Label**: Label for message/question textarea
- **Start Button Text**: Label for the button that starts the chat (e.g., "Begin Chat")

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

## 🔒 Security Notes

1. **Never expose credentials** in client-side code
2. Use **authenticated chat** for sensitive data
3. Implement **Content Security Policy** headers
4. Consider using **data masking** for PII
5. **localStorage** stores settings locally - doesn't transmit to external servers
6. Export configurations only to trusted recipients
7. Admin panel should be restricted to authorized users only

## 📚 Documentation Links

- [Dynamics 365 Live Chat SDK Reference](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/omnichannel-reference)
- [Omnichannel Chat SDK (GitHub)](https://github.com/microsoft/omnichannel-chat-sdk)
- [Customize Live Chat Widgets](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/develop-live-chat-widget)
- [Live Chat Widget UI Components](https://github.com/microsoft/omnichannel-chat-widget)

## 🎯 Use Cases

### Customer Demonstrations
- Save separate profiles for each customer
- Switch between customer branding instantly
- Show customization capabilities live
- Export configs to share with clients

### Multi-Tenant Deployments
- One codebase, multiple customer configs
- Manage different D365 orgs per customer
- Team members can update individual customer settings
- No code changes needed

### A/B Testing
- Create different themed versions
- Switch between variants instantly
- Save results in profile names
- Import successful configurations

### Brand Consistency
- Centralized admin panel for all branding
- Ensures consistency across deployments
- Easy updates to colors and messaging
- Quick rollback to previous versions

## 🤝 Support

For issues specific to the Dynamics 365 Omnichannel service, contact Microsoft Support. 

For help with:
- **Admin panel customization** - Review the configuration guide above
- **Widget appearance** - Check the Color Customization and Pre-chat Form sections
- **D365 configuration** - Verify your org ID, URL, and widget ID values
- **Import/Export issues** - Ensure the JSON file is valid and correctly formatted

## 📄 License

This custom widget implementation is provided as-is for educational and development purposes. Modify and use according to your needs.

---

Built with ❤️ for a better customer service experience
