# Voice & Video Calling Guide

## Overview

Your D365 Modern Chat Widget now includes **full voice and video calling capabilities** powered by the Microsoft Dynamics 365 Omnichannel SDK. Agents and customers can seamlessly escalate from text chat to voice or video calls.

# Voice & Video Calling Support

## Overview

This D365 Modern Chat Widget supports **agent-initiated voice and video calling**, allowing agents to call customers directly from the D365 Omnichannel Agent Desktop. When an agent initiates a call, the customer sees an incoming call notification with options to accept or decline.

## ✅ Fully Supported: Agent-Initiated Calls

### How It Works

1. **Agent starts call** from D365 Omnichannel Agent Desktop
2. **Customer receives notification** in the chat widget
3. **Customer can accept or decline** the call
4. **Call connects** with full voice/video capabilities
5. **Both parties** can use call controls (mute, camera, end)

### Customer Experience

#### Incoming Call Notification

When an agent initiates a call, customers see:
- 🔔 **Prominent notification banner** at the top of chat
- 📞 **Call type indicator** (Voice Call or Video Call)
- 👤 **Agent name** ("Agent is calling you...")
- ✅ **Accept button** (green)
- ❌ **Decline button** (red)
- 🔊 **Notification sound** (optional audio beep)

#### Accepting a Call

When customer clicks **Accept**:
1. Browser requests **microphone/camera permissions**
2. Widget shows **connecting status**
3. **Local video preview** appears (for video calls)
4. **Remote video/audio** connects
5. **Call controls** become available

#### During the Call

**Voice Call View:**
- 🎤 **Mute/Unmute microphone**
- 👤 **Agent avatar** with initials
- ⏱️ **Call duration timer**
- 🔴 **End call button**

**Video Call View:**
- 🎤 **Mute/Unmute microphone**
- 📹 **Turn camera on/off**
- 📺 **Remote video** (agent's camera)
- 📱 **Local video preview** (customer's camera)
- ⏱️ **Call duration timer**
- 🔴 **End call button**

## ⚠️ Important Limitations

### Customer-Initiated Calls

**The D365 Omnichannel headless chat SDK may NOT support direct customer-initiated voice/video calling.**

Voice/video calling in D365 Omnichannel typically works through:
- **Agent-initiated flow** ✅ SUPPORTED
- **Server-side control** (Omnichannel platform)
- **Special configuration** (Admin Center setup required)

**Customer-initiated calling** (clicking voice/video buttons) may show an error if:
- SDK doesn't expose calling APIs
- Omnichannel not configured for customer-initiated calls
- Licensing doesn't include customer calling

### Recommended Approach

For production use:
1. ✅ **Use agent-initiated calls** (fully supported)
2. ❌ **Disable customer call buttons** if not supported by your SDK
3. 📝 **Customer requests callback** via chat message
4. 📞 **Agent initiates the call** from D365

---

## Features

### ✅ Voice Calling
- **One-click voice calls** directly from the chat interface
- **Microphone mute/unmute** controls
- **Real-time call duration** tracking
- **Clean audio-only interface** with avatar display
- **Automatic microphone access** handling

### ✅ Video Calling
- **HD video calling** with automatic quality adjustment
- **Picture-in-picture** local video preview
- **Camera on/off toggle** for privacy
- **Microphone mute controls** during video
- **Full-screen remote video** display
- **Responsive video layout** optimized for the widget

### ✅ Call Management
- **Call status indicators** (Connecting, Connected, Duration)
- **End call** button with immediate cleanup
- **Automatic reconnection** handling
- **Stream management** with proper resource cleanup
- **Error handling** with user-friendly messages

## User Interface

### Call Buttons Location
When a chat session is active, two new buttons appear in the chat header:
- **📞 Voice Call Button** - Initiates audio-only call
- **📹 Video Call Button** - Initiates video call with camera

### Call Interface
Once a call is initiated, a full-screen call interface appears with:

#### Header
- **Call Status** - Shows connection state
- **Call Duration** - Live timer in MM:SS format

#### Video Area
- **Remote Video** - Agent's video (full screen)
- **Local Video** - Your video (picture-in-picture, top-right)
- **Avatar** - Displayed during voice-only calls

#### Controls (Bottom Bar)
- **🎤 Mute/Unmute Microphone** - Toggle audio
- **📹 Camera On/Off** - Toggle video (video calls only)
- **🔴 End Call** - Terminate the call

## Technical Implementation

### Incoming Call Detection

The widget listens for incoming calls through multiple methods:

```javascript
function setupIncomingCallListener(sdk) {
    // Method 1: Voice/Video Calling SDK events
    if (sdk.getVoiceVideoCalling) {
        sdk.getVoiceVideoCalling().then(voiceVideoCall => {
            voiceVideoCall.onCallAdded((callData) => {
                showIncomingCallNotification(callData);
            });
        });
    }
    
    // Method 2: Control messages (secondary channel)
    if (sdk.onControlMessage) {
        sdk.onControlMessage((message) => {
            if (message.type === 'VoiceVideoCall') {
                showIncomingCallNotification(message.data);
            }
        });
    }
    
    // Method 3: Tagged messages
    sdk.onNewMessage((msg) => {
        if (msg.tags?.includes('voicecall') || msg.tags?.includes('videocall')) {
            showIncomingCallNotification({ 
                isVideo: msg.tags.includes('videocall'),
                agentName: msg.sender
            });
        }
    });
}
```

### Accepting Calls

When customer accepts an incoming call:

```javascript
async function acceptIncomingCall() {
    // 1. Request media permissions
    const mediaConstraints = {
        audio: true,
        video: isVideoCall ? { width: 1280, height: 720 } : false
    };
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    
    // 2. Accept through SDK
    const voiceVideoCall = await chatSDK.getVoiceVideoCalling();
    await voiceVideoCall.acceptCall(pendingCallData);
    
    // 3. Setup event listeners
    voiceVideoCall.onCallConnected(() => {
        callStatus.textContent = 'Connected';
    });
    
    voiceVideoCall.onRemoteVideoStreamAdded((stream) => {
        remoteVideo.srcObject = stream;
    });
    
    // 4. Start call UI
    callContainer.classList.add('active');
    startCallDuration();
}
```

### Declining Calls

```javascript
function declineIncomingCall() {
    const voiceVideoCall = await chatSDK.getVoiceVideoCalling();
    await voiceVideoCall.rejectCall(pendingCallData);
    incomingCallNotification.style.display = 'none';
}
```

### SDK Integration

The widget uses the D365 Omnichannel Chat SDK's voice/video calling APIs:

```javascript
// Get the voice/video calling object
const voiceVideoCall = await chatSDK.getVoiceVideoCalling();

// Listen for incoming calls
voiceVideoCall.onCallAdded((callData) => {
    // Show notification to customer
});

// Accept incoming call
await voiceVideoCall.acceptCall(callData);

// Reject incoming call
await voiceVideoCall.rejectCall(callData);

// End active call
await voiceVideoCall.stopCall();
```

### Event Handling

```javascript
// Call connected
voiceVideoCall.onCallConnected(() => {
    console.log('Call successfully connected');
});

// Call disconnected
voiceVideoCall.onCallDisconnected(() => {
    console.log('Call ended by remote party');
    endCall();
});

// Remote video stream added
voiceVideoCall.onRemoteVideoStreamAdded((stream) => {
    remoteVideo.srcObject = stream;
});
```

### Required SDK Configuration

Ensure your D365 configuration has:
- Voice/Video calling enabled in Omnichannel Admin Center
- Latest SDK version with `getVoiceVideoCalling()` support
- Proper Teams integration configured

### Media Stream Management

The widget properly manages WebRTC media streams:

```javascript
// Request media permissions
localStream = await navigator.mediaDevices.getUserMedia({ 
    audio: true, 
    video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
});

// Attach to video elements
localVideo.srcObject = localStream;

// Cleanup on call end
localStream.getTracks().forEach(track => track.stop());
```

### Call Event Handlers

The SDK provides events for call lifecycle management:

```javascript
// Call connected
voiceVideoCall.onCallConnected(() => {
    console.log('Call successfully connected');
});

// Call disconnected
voiceVideoCall.onCallDisconnected(() => {
    console.log('Call ended by remote party');
    endCall();
});

// Remote video stream added
voiceVideoCall.onRemoteVideoStreamAdded((stream) => {
    remoteVideo.srcObject = stream;
});
```

## Browser Compatibility

### Supported Browsers
✅ **Chrome/Edge** 74+ (Recommended)  
✅ **Firefox** 66+  
✅ **Safari** 12+ (macOS/iOS)  
✅ **Opera** 62+

### Required Permissions
- **Microphone** - Required for both voice and video calls
- **Camera** - Required for video calls only
- **HTTPS** - WebRTC requires secure connection (except localhost)

### Browser Permission Prompts
Users will see permission prompts when starting calls:
- First time: Browser asks for camera/microphone access
- Subsequent calls: Uses previously granted permissions
- Denied: Error message displayed with instructions

## Agent Requirements

For agents to receive voice/video calls, the D365 Omnichannel environment must have:

1. **Voice/Video Calling Enabled** in Omnichannel Admin Center
2. **Proper Licensing** - Requires Digital Messaging + Voice add-on
3. **Agent Desktop** - Omnichannel for Customer Service app
4. **WebRTC Support** - Modern browser with media permissions

## Usage Examples

### Starting a Voice Call

```javascript
// User clicks voice call button
voiceCallBtn.addEventListener('click', async () => {
    try {
        await startVoiceCall();
    } catch (error) {
        console.error('Voice call failed:', error);
    }
});
```

### Starting a Video Call

```javascript
// User clicks video call button
videoCallBtn.addEventListener('click', async () => {
    try {
        await startVideoCall();
    } catch (error) {
        console.error('Video call failed:', error);
    }
});
```

### Muting Microphone During Call

```javascript
function toggleMic() {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    // Update UI to show muted state
}
```

### Turning Off Camera During Video Call

```javascript
function toggleCamera() {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    // Hide local video preview when off
}
```

## UI Customization

### Call Button Colors
Modify the active state colors in CSS:

```css
.header-btn.active { 
    background: #48bb78;  /* Green when active */
}
.header-btn.active:hover { 
    background: #38a169;  /* Darker green on hover */
}
```

### Call Container Background
Change the call interface background:

```css
.call-container {
    background: #1a202c;  /* Dark background */
}
```

### Video Display Size
Adjust local video preview dimensions:

```css
.local-video {
    width: 120px;   /* Adjust width */
    height: 160px;  /* Adjust height */
    top: 20px;      /* Position from top */
    right: 20px;    /* Position from right */
}
```

## Security & Privacy

### Encryption
- All voice/video streams use **WebRTC DTLS-SRTP encryption**
- Media never passes through third-party servers unencrypted
- End-to-end encrypted communication

### Permission Management
- **Camera/Mic access** requested only when needed
- **Permissions can be revoked** at any time via browser settings
- **No recording** on client side (agent side may record per compliance)

### Data Privacy
- **No media storage** on client device
- **Streams cleaned up** immediately on call end
- **Compliant** with GDPR, HIPAA (when configured)

## Troubleshooting

### Call Button Not Showing
**Issue**: Voice/video buttons don't appear in header  
**Solution**: 
- Ensure chat session is active (`chatStarted = true`)
- Check that buttons are set to `display: flex` after chat starts
- Verify D365 SDK initialized successfully

### Permission Denied Error
**Issue**: "Permission denied" when starting call  
**Solution**:
- Check browser permission settings
- Ensure site is served over HTTPS
- Ask user to manually grant permissions in browser

### No Audio/Video
**Issue**: Call connects but no audio or video  
**Solution**:
- Check microphone/camera are not in use by another application
- Verify correct devices selected in browser settings
- Check OS-level permissions (Windows Privacy, macOS System Preferences)

### Call Fails to Connect
**Issue**: "Could not start call" error  
**Solution**:
- Verify D365 Omnichannel voice/video is enabled
- Check network firewall allows WebRTC traffic
- Ensure agent is available and accepting calls
- Review browser console for detailed error messages

### Poor Video Quality
**Issue**: Pixelated or laggy video  
**Solution**:
- Check network bandwidth (min 1 Mbps recommended)
- Close other bandwidth-intensive applications
- Reduce video quality in code if needed:
  ```javascript
  video: { width: { ideal: 640 }, height: { ideal: 480 } }
  ```

### Echo or Feedback
**Issue**: Audio echo during call  
**Solution**:
- Use headphones instead of speakers
- Ensure only one tab has the call active
- Check browser echo cancellation is enabled

## Best Practices

### 1. **Pre-Call Checks**
- Verify microphone/camera before offering call buttons
- Test devices and show status to user
- Provide fallback to text if devices unavailable

### 2. **User Guidance**
- Show tooltips on first use
- Provide visual feedback during connection
- Display clear call status messages

### 3. **Resource Management**
- Always stop media tracks on call end
- Clean up event listeners
- Handle browser tab close/reload gracefully

### 4. **Error Handling**
- Catch and display user-friendly error messages
- Log detailed errors for debugging
- Provide retry options when appropriate

### 5. **Accessibility**
- Use proper ARIA labels on call buttons
- Ensure keyboard navigation works
- Provide text alternatives to visual indicators

## Future Enhancements

Potential additions to the calling feature:

- **Screen sharing** - Allow customer to share screen with agent
- **Call recording** - Record calls for quality/compliance
- **Call transfer** - Transfer call to another agent
- **Conference calling** - Add multiple participants
- **Call analytics** - Track call duration, quality metrics
- **Device selection** - UI to choose microphone/camera
- **Noise suppression** - Enhanced audio filtering
- **Virtual backgrounds** - Custom video backgrounds

## API Reference

### Functions

#### `startVoiceCall()`
Initiates an audio-only call with the agent.

**Returns**: `Promise<void>`  
**Throws**: Error if SDK not initialized or permissions denied

#### `startVideoCall()`
Initiates a video call with camera and audio.

**Returns**: `Promise<void>`  
**Throws**: Error if SDK not initialized or permissions denied

#### `toggleMic()`
Mutes or unmutes the microphone during an active call.

**Returns**: `void`  
**Requires**: Active call with local audio stream

#### `toggleCamera()`
Turns the camera on or off during an active video call.

**Returns**: `void`  
**Requires**: Active video call with local video stream

#### `endCall()`
Terminates the active call and cleans up all resources.

**Returns**: `Promise<void>`  
**Side Effects**: Stops all media tracks, clears UI state

### Events

The widget handles these SDK call events:

- `onCallConnected` - Fired when call successfully connects
- `onCallDisconnected` - Fired when call ends (either party)
- `onRemoteVideoStreamAdded` - Fired when remote video available
- `onRemoteAudioStreamAdded` - Fired when remote audio available

### State Variables

```javascript
isInCall          // Boolean - Is call currently active
isVideoCall       // Boolean - Is current call a video call
isMicMuted        // Boolean - Is microphone muted
isCameraOff       // Boolean - Is camera turned off
callStartTime     // Number - Timestamp when call started
localStream       // MediaStream - Local audio/video stream
remoteStream      // MediaStream - Remote audio/video stream
```

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Review D365 Omnichannel admin center settings
3. Verify agent availability and proper configuration
4. Contact Microsoft Support for SDK-related issues

## Version History

### v1.0.0 (Current)
- ✅ Voice calling support
- ✅ Video calling support
- ✅ Mic mute/unmute
- ✅ Camera on/off
- ✅ Call duration tracking
- ✅ Proper resource cleanup
- ✅ Error handling
- ✅ Responsive UI
