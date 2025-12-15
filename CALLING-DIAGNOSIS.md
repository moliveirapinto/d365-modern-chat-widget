# Voice/Video Calling Diagnosis Guide

## Understanding the Error

When you click the voice/video call button and it "closes immediately," this indicates that:

1. **The SDK method doesn't exist** - `chatSDK.getVoiceVideoCalling()` is not available
2. **The error is caught** - Widget shows error message and closes the call UI
3. **Calling API not supported** - Headless chat SDK may not support client-initiated calling

## Why This Happens

### D365 Omnichannel Voice/Video Architecture

D365 Omnichannel handles voice/video calling through a **server-controlled** system:

```
Customer Widget → Server Control Message → Omnichannel Platform → Agent Desktop
```

**NOT** through:
```
Customer Widget → Direct SDK Call → Agent Desktop ❌
```

### The Logs Reveal

From your error log (`error.txt`):

```
[CONVCTRL] Button clicked: 'startvideocall'
[CONVCTRL] Start secondary channel 192380000 success.
```

This shows:
- ✅ The native D365 widget uses **control messages**
- ✅ It establishes a **secondary channel** for calling
- ❌ This is **internal to D365**, not exposed to custom widgets

## Checking SDK Capabilities

When the call button is clicked, the widget now logs all available SDK methods:

```javascript
console.log('Available SDK methods:', Object.keys(chatSDK));
```

**Look for these methods** in your browser console:
- `getVoiceVideoCalling` - Voice/video calling support
- `requestVoiceCall` - Initiate voice call
- `requestVideoCall` - Initiate video call
- `initiateCall` - Generic call initiation

**If these don't exist**, the SDK doesn't support calling.

## Solutions

### Option 1: Use Native D365 Widget (Recommended)

The official D365 Omnichannel Chat Widget has built-in calling support:

```html
<script
    id="Microsoft_Omnichannel_LCWidget"
    src="https://oc-cdn-ocprod.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
    data-app-id="YOUR_APP_ID"
    data-org-id="YOUR_ORG_ID"
    data-org-url="https://yourorg.crm.dynamics.com">
</script>
```

Benefits:
- ✅ Full voice/video support
- ✅ Microsoft-maintained
- ✅ Automatic updates
- ✅ Complete feature parity

### Option 2: Agent-Initiated Calling

Instead of customer clicking a call button:

1. Customer sends message: "I'd like to talk to someone"
2. Agent sees request in D365
3. **Agent initiates call** from their desktop
4. Customer receives call invitation
5. Customer accepts and joins

This works because:
- Agent has full D365 platform access
- Calling infrastructure is server-side
- No custom SDK methods needed

### Option 3: Callback Request

Implement a "Request Callback" button instead:

```javascript
async function requestCallback() {
    await chatSDK.sendMessage({
        content: '[CALLBACK REQUEST] Customer requests voice/video callback',
        tags: ['callback_request', 'voice_video']
    });
    
    alert('Callback requested! An agent will call you shortly.');
}
```

Agent sees this as a tagged message and initiates call.

### Option 4: External Calling Solution

Use a separate calling platform:
- **Microsoft Teams**: Direct calling link
- **Twilio**: WebRTC calling widget
- **Vonage**: Video API integration
- **Zoom**: Embedded SDK

Then pass call details through chat:

```javascript
const callLink = await createExternalCall(); // Your calling service
await chatSDK.sendMessage({
    content: `Call started: ${callLink}`
});
```

## Verifying Your Configuration

### 1. Check Omnichannel Admin Center

Go to: **Omnichannel Admin Center** → **Channels** → **Chat**

Look for:
- [ ] Voice calling enabled
- [ ] Video calling enabled
- [ ] Calling provider configured (Teams, etc.)

### 2. Check Licensing

Required licenses:
- Dynamics 365 Customer Service
- Digital Messaging add-on
- **Voice Channel add-on** ⚠️ (Required for calling)

### 3. Check SDK Version

In browser console:

```javascript
console.log('SDK Version:', OmnichannelChatSDK.version);
console.log('SDK Methods:', Object.keys(chatSDK));
```

### 4. Test with Native Widget First

Before using custom widget, test if calling works with the native D365 widget.

If it doesn't work there either:
- ❌ Calling not configured in Omnichannel
- ❌ Missing licenses
- ❌ Channel not enabled

## Current Widget Status

Your custom widget has:

✅ **Complete UI** - Buttons, video elements, controls  
✅ **Media Handling** - WebRTC, getUserMedia, stream management  
✅ **Call Controls** - Mute, camera toggle, duration tracking  
✅ **Error Handling** - Helpful messages when SDK doesn't support calling  

❌ **SDK API** - Depends on D365 configuration and SDK version  
❌ **Server Integration** - Requires Omnichannel calling channel setup  

## Recommended Next Steps

1. **Check available SDK methods** in browser console when chat starts
2. **Test with native D365 widget** to confirm calling works
3. **Contact Microsoft Support** to ask about calling in headless SDK
4. **Verify Omnichannel configuration** in Admin Center
5. **Confirm licensing** includes voice channel add-on

If calling must work through custom widget:
- Request Microsoft documentation for headless SDK calling APIs
- Consider hybrid approach (your UI + native widget calling)
- Use agent-initiated calls instead of customer-initiated

## Questions to Ask Microsoft Support

1. "Does the headless Omnichannel Chat SDK support client-initiated voice/video calling?"
2. "What SDK methods enable voice/video calling from a custom widget?"
3. "Is `getVoiceVideoCalling()` available in the latest SDK version?"
4. "Can customers initiate calls, or must agents initiate them?"
5. "What's the recommended approach for custom widget calling integration?"

---

**Bottom Line**: The custom widget has all the **UI and media handling** ready. The missing piece is the **SDK API** for actually initiating calls, which may not be available in the headless chat SDK. Native D365 widget or agent-initiated calls are likely your best options.
