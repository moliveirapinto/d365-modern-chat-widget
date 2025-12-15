# 📞 Voice/Video Calling - Quick Reference

## For Developers

### What's Implemented ✅

```javascript
// Incoming call detection (3 methods)
setupIncomingCallListener(chatSDK)

// Accept call
acceptIncomingCall() 
→ Requests camera/mic permissions
→ Connects to D365 call
→ Shows call UI with controls

// Decline call  
declineIncomingCall()
→ Notifies agent
→ Dismisses notification

// Call controls
toggleMic()        // Mute/unmute
toggleCamera()     // Video on/off (video calls only)
endCall()          // Hang up
```

### UI Elements

```html
<!-- Incoming call notification -->
<div id="incomingCallNotification">
  <button id="acceptCallBtn">Accept</button>
  <button id="declineCallBtn">Decline</button>
</div>

<!-- Active call container -->
<div id="callContainer">
  <video id="remoteVideo"></video>  <!-- Agent video -->
  <video id="localVideo"></video>   <!-- Customer video -->
  <button id="muteMicBtn"></button>
  <button id="toggleCameraBtn"></button>
  <button id="endCallBtn"></button>
</div>
```

## For Agents

### How to Call Customers

1. **Open chat** with customer in D365 Agent Desktop
2. **Click voice/video button** in the conversation toolbar
3. **Wait for customer** to accept
4. **Call connects** automatically

### Requirements

- ✅ Voice Channel license
- ✅ Omnichannel Admin Center: Voice/Video enabled
- ✅ Browser: Chrome, Edge (latest)
- ✅ Permissions: Microphone + Camera

## For End Users (Customers)

### Receiving Calls

1. **Notification appears** at top of chat
2. **Click Accept** → grant permissions
3. **Call starts** with agent
4. **Use controls** to mute/camera/end

### Permissions Needed

- 🎤 **Microphone** (voice calls)
- 📹 **Camera** (video calls)  
- 🔒 **HTTPS** (secure connection)

## Configuration

### Enable in D365 Omnichannel

```
Omnichannel Admin Center
  → Channels
    → Chat
      → Voice/Video Settings
        ✅ Enable Voice Calling
        ✅ Enable Video Calling
        → Configure calling provider (Teams)
```

### Hide Customer-Initiated Buttons

If your SDK doesn't support customer-initiated calling:

```javascript
// In admin.html or index.html
voiceCallBtn.style.display = 'none';
videoCallBtn.style.display = 'none';
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No incoming call notification | Check Omnichannel voice/video is enabled |
| Permission denied | Customer must allow camera/microphone |
| No audio/video | Check HTTPS connection, firewall settings |
| Call drops immediately | Verify D365 session active, network stable |

## Testing Checklist

### Voice Call Test
- [ ] Agent initiates voice call
- [ ] Customer sees notification
- [ ] Customer accepts call
- [ ] Microphone permission requested
- [ ] Audio connects both ways
- [ ] Mute/unmute works
- [ ] Call duration timer shows
- [ ] End call works (both sides)

### Video Call Test  
- [ ] Agent initiates video call
- [ ] Customer sees notification  
- [ ] Customer accepts call
- [ ] Camera + mic permissions requested
- [ ] Local video preview appears
- [ ] Remote video shows agent
- [ ] Camera toggle works
- [ ] Mute toggle works
- [ ] Call duration timer shows
- [ ] End call works (both sides)

### Decline Test
- [ ] Agent initiates call
- [ ] Customer sees notification
- [ ] Customer declines call
- [ ] Notification dismissed
- [ ] Agent notified of decline

## API Reference

### SDK Methods

```javascript
// Get calling object
const voiceVideoCall = await chatSDK.getVoiceVideoCalling();

// Events
voiceVideoCall.onCallAdded(callback)       // Incoming call
voiceVideoCall.onCallConnected(callback)   // Call started
voiceVideoCall.onCallDisconnected(callback) // Call ended
voiceVideoCall.onRemoteVideoStreamAdded(callback) // Video stream

// Actions
await voiceVideoCall.acceptCall(callData)  // Accept incoming
await voiceVideoCall.rejectCall(callData)  // Decline incoming
await voiceVideoCall.stopCall()            // End active call
```

### Browser APIs

```javascript
// Request media
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: { width: 1280, height: 720 }
})

// Check permissions
navigator.permissions.query({name: 'microphone'})
navigator.permissions.query({name: 'camera'})
```

## Support Links

- 📘 [VOICE-VIDEO-GUIDE.md](VOICE-VIDEO-GUIDE.md) - Full documentation
- 🎯 [AGENT-CALLING-IMPLEMENTATION.md](AGENT-CALLING-IMPLEMENTATION.md) - Implementation details
- 🐛 [CALLING-DIAGNOSIS.md](CALLING-DIAGNOSIS.md) - Troubleshooting guide

---

**Last Updated**: December 2025  
**Status**: ✅ Agent-initiated calls fully supported
