# D365 Omnichannel Chat SDK - Implementation Guide

This document covers common pitfalls and best practices when implementing a custom chat widget using the Microsoft Dynamics 365 Omnichannel Chat SDK.

## Table of Contents
1. [SDK Setup](#sdk-setup)
2. [Message Handling](#message-handling)
3. [Sender Information](#sender-information)
4. [File Attachments](#file-attachments)
5. [Event Listeners](#event-listeners)
6. [Common Pitfalls](#common-pitfalls)

---

## SDK Setup

### Basic Configuration
```javascript
const omnichannelConfig = {
    orgId: 'your-org-id',
    widgetId: 'your-widget-id',
    orgUrl: 'https://your-org.omnichannelengagementhub.com'
};

const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
await chatSDK.initialize();
```

### Event Listeners Order
**IMPORTANT:** Set up event listeners AFTER `initialize()` but BEFORE `startChat()`:

```javascript
await chatSDK.initialize();

// Set up listeners BEFORE starting chat
chatSDK.onNewMessage((msg) => { /* handle message */ });
chatSDK.onTypingEvent(() => { /* show typing indicator */ });
chatSDK.onAgentEndSession(() => { /* handle session end */ });

await chatSDK.startChat({ customContext });
```

---

## Message Handling

### Message Structure
Messages from the SDK have the following structure:

```javascript
{
    id: '1765599314470',                    // Message ID (use for deduplication)
    messageId: undefined,                    // May be undefined
    messageid: undefined,                    // May be undefined
    clientmessageid: undefined,              // May be undefined
    content: 'Message text',                 // Text content (undefined for file-only messages)
    role: 'agent' | 'user' | 'system' | 'bot',
    senderId: {                              // OBJECT, not string!
        id: '8:acs:...',
        displayName: 'Agent Name',
        type: 2
    },
    fileMetadata: { /* attachment info */ }  // Present for file messages
}
```

### Message ID for Deduplication
**CRITICAL:** Track processed message IDs to avoid duplicates when polling.

```javascript
let processedMessageIds = new Set();

function processMessage(message) {
    const messageId = message.messageId || message.id || message.clientmessageid || message.messageid;
    
    if (messageId && processedMessageIds.has(messageId)) {
        return; // Skip already processed
    }
    
    if (messageId) {
        processedMessageIds.add(messageId);
    }
    
    // Process message...
}
```

**Why this matters:** The SDK's `getMessages()` returns ALL messages each time, not just new ones. Objects are fresh instances, so you cannot track processing state on the message object itself (e.g., `msg._processed = true` won't persist).

### Message Roles
| Role | Description |
|------|-------------|
| `user` | Customer message |
| `agent` | Human agent message |
| `bot` | Bot/Copilot message |
| `system` | System notifications (e.g., "Agent joined") |

### Content Fields
Try multiple possible content fields:
```javascript
const content = message.content || message.text || message.body;
```

---

## Sender Information

### senderId is an OBJECT
**CRITICAL:** The `senderId` field is an object, NOT a string!

```javascript
// WRONG - will cause errors like "name.trim is not a function"
const senderName = message.senderId;

// CORRECT
const senderId = message.senderId || message.sender;
let senderName = 'Agent';

if (typeof senderId === 'object' && senderId !== null) {
    senderName = senderId.displayName || senderId.name || 'Agent';
} else if (typeof senderId === 'string') {
    senderName = senderId;
}

// Also check direct senderDisplayName field
if (message.senderDisplayName) {
    senderName = message.senderDisplayName;
}
```

### System Message Sender
System messages have `displayName: '__agent__'` - filter this out when updating UI:
```javascript
if (senderName && senderName !== '__agent__') {
    updateHeaderWithAgent(senderName);
}
```

### Defensive String Handling
Always validate strings before calling string methods:
```javascript
function getInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const trimmed = name.trim();
    if (!trimmed) return '?';
    // ...
}
```

---

## File Attachments

### Attachment Structure
File attachments come in the `fileMetadata` field:

```javascript
{
    fileSharingProtocolType: 0,
    id: '0-eus-d11-...',              // File ID for downloading
    name: 'Screenshot.png',            // File name
    size: 0,
    type: 'image/jpeg'                 // MIME type
}
```

### Downloading Attachments
**CRITICAL:** Attachments do NOT have a direct URL. You MUST use `downloadFileAttachment()`:

```javascript
// WRONG - URL fields are undefined
const url = attachment.url || attachment.downloadUrl; // Both undefined!

// CORRECT - Use SDK to download
const blob = await chatSDK.downloadFileAttachment(attachment);
const fileUrl = URL.createObjectURL(blob);
```

### Complete Attachment Handler
```javascript
async function handleAgentAttachment(fileMetadata, senderName) {
    const attachments = Array.isArray(fileMetadata) ? fileMetadata : [fileMetadata];
    
    for (const attachment of attachments) {
        const fileName = attachment.name || 'File';
        const fileType = attachment.type || '';
        const fileId = attachment.id;
        
        let fileUrl = attachment.url || attachment.downloadUrl;
        
        // If no direct URL, use SDK to download
        if (!fileUrl && fileId && chatSDK) {
            try {
                const blob = await chatSDK.downloadFileAttachment(attachment);
                if (blob) {
                    fileUrl = URL.createObjectURL(blob);
                }
            } catch (err) {
                console.error('Error downloading attachment:', err);
            }
        }
        
        if (fileUrl) {
            if (fileType.startsWith('image/')) {
                displayImage(fileUrl, fileName);
            } else {
                displayFileLink(fileUrl, fileName);
            }
        }
    }
}
```

---

## Event Listeners

### Available Events
```javascript
// New message received
chatSDK.onNewMessage((message) => {
    processMessage(message);
});

// Agent/bot is typing
chatSDK.onTypingEvent(() => {
    showTypingIndicator();
    setTimeout(hideTypingIndicator, 3000);
});

// Agent ended the session
chatSDK.onAgentEndSession(() => {
    showChatEndedView();
});
```

### Polling as Backup
The `onNewMessage` event may not always fire reliably. Use polling as a backup:

```javascript
setInterval(async () => {
    if (!chatSDK || !chatStarted) return;
    
    try {
        const messages = await chatSDK.getMessages();
        messages.forEach(msg => processMessage(msg));
    } catch (e) {
        console.error('Poll error:', e);
    }
}, 3000);
```

---

## Common Pitfalls

### 1. Message Deduplication
❌ **Wrong:** Tracking on message object
```javascript
if (msg._processed) return;
msg._processed = true; // Won't persist!
```

✅ **Correct:** Use external Set
```javascript
let processedIds = new Set();
if (processedIds.has(msg.id)) return;
processedIds.add(msg.id);
```

### 2. Sender Name Extraction
❌ **Wrong:** Assuming senderId is a string
```javascript
const name = message.senderId; // Object, not string!
name.trim(); // ERROR: trim is not a function
```

✅ **Correct:** Extract displayName from object
```javascript
const name = message.senderId?.displayName || 'Agent';
```

### 3. File Attachments
❌ **Wrong:** Looking for URL property
```javascript
const url = attachment.url; // undefined!
```

✅ **Correct:** Use SDK download method
```javascript
const blob = await chatSDK.downloadFileAttachment(attachment);
const url = URL.createObjectURL(blob);
```

### 4. Clearing State on New Chat
Remember to clear tracked message IDs when starting a new chat:
```javascript
function startNewChat() {
    processedMessageIds.clear();
    chatMessages = [];
    // ... reset other state
}
```

### 5. Skipping User Messages
User messages are added to UI when sent. Skip them during polling to avoid duplicates:
```javascript
if (message.role === 'user') {
    return; // Already displayed when sent
}
```

---

## Quick Reference

| Field | Type | Notes |
|-------|------|-------|
| `message.id` | string | Primary message identifier |
| `message.content` | string \| undefined | Text content, undefined for file-only |
| `message.role` | string | 'user', 'agent', 'bot', 'system' |
| `message.senderId` | object | `{ id, displayName, type }` |
| `message.fileMetadata` | object | Present for attachments |
| `fileMetadata.id` | string | Use with `downloadFileAttachment()` |
| `fileMetadata.name` | string | Original filename |
| `fileMetadata.type` | string | MIME type |

---

## Sample Complete Message Handler

```javascript
let processedMessageIds = new Set();

function processMessage(message) {
    if (!message) return;
    
    // 1. Deduplicate
    const messageId = message.id || message.messageId;
    if (messageId && processedMessageIds.has(messageId)) return;
    if (messageId) processedMessageIds.add(messageId);
    
    // 2. Get content and attachments
    const content = message.content || message.text;
    const fileMetadata = message.fileMetadata;
    if (!content && !fileMetadata) return;
    
    // 3. Get sender info (object, not string!)
    const senderId = message.senderId;
    const senderName = (typeof senderId === 'object') 
        ? senderId?.displayName || 'Agent'
        : senderId || 'Agent';
    
    // 4. Determine role
    const role = message.role;
    if (role === 'user') return; // Skip user messages
    
    // 5. Handle by type
    if (role === 'system') {
        addSystemMessage(content);
    } else {
        if (fileMetadata) handleAgentAttachment(fileMetadata, senderName);
        if (content) addAgentMessage(content, senderName);
    }
}
```

---

*Last updated: December 12, 2025*
