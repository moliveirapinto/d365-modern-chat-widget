# Contributing to D365 Modern Chat Widget

## ⚠️ CRITICAL: Feature Parity Rule

**This project has TWO implementations that MUST stay in sync:**

| File | Purpose | Users |
|------|---------|-------|
| `live.html` | Direct website widget | Your hosted site |
| `dist/widget-core.js` | TamperMonkey / Embedded | Third-party sites (M&S, etc.) |

### 🚨 THE GOLDEN RULE

> **Any feature, fix, or change made to `live.html` MUST also be made to `dist/widget-core.js` (and vice versa).**

This is non-negotiable. Users on embedded sites deserve the same experience as users on the direct site.

---

## Feature Sync Checklist

Before committing ANY change, verify parity for these areas:

### Message Handling
- [ ] `getMessageTimestamp()` - timestamp extraction logic
- [ ] `queueMessage()` / `processMessageQueue()` - message batching
- [ ] `processMessage()` / `processMessageImmediate()` - message processing
- [ ] `formatBotMessage()` - markdown rendering
- [ ] Message deduplication logic

### Session Management
- [ ] `saveChatSession()` - save to localStorage
- [ ] `restoreChatSession()` - restore from localStorage
- [ ] Session expiry (1 hour)
- [ ] `liveChatContext` handling

### Voice/Video Calling
- [ ] `preloadVoiceVideoCallingSDK()` - pre-load SDK
- [ ] `initializeVoiceVideoCallingSDK()` - initialize after startChat
- [ ] `startVoiceVideoKeepalive()` - token refresh every 4 min
- [ ] `setupVisibilityHandler()` - re-register on tab visible
- [ ] `stopVoiceVideoKeepalive()` - cleanup
- [ ] Incoming call UI and handlers
- [ ] Call controls (mute, camera, end)

### UI Components
- [ ] Avatar handling (bot, agent, user)
- [ ] Typing indicators
- [ ] Notification sounds
- [ ] Adaptive Cards rendering
- [ ] Hero Cards rendering
- [ ] Suggested Actions
- [ ] System messages
- [ ] Pre-chat form

### Bot Detection
- [ ] `isBot()` - name-based detection
- [ ] `isBotRole()` - role-based detection

---

## How to Make Changes

### 1. Identify the change location

```
live.html          →  Look for the function/feature
dist/widget-core.js →  Find the equivalent location
```

### 2. Make the change in BOTH files

The implementations may differ slightly due to:
- `live.html` uses modern ES6+ syntax
- `widget-core.js` uses ES5 for broader compatibility

### 3. Test BOTH implementations

- Test `live.html` on your hosted site
- Test `widget-core.js` via TamperMonkey on a third-party site

### 4. Commit with sync confirmation

Include in your commit message:
```
[PARITY] Feature/fix applied to both live.html and widget-core.js
```

---

## File Structure Reference

### live.html Key Sections
```
Lines ~2200-2340   - Message queue and timestamp functions
Lines ~3340-3500   - formatBotMessage() markdown parser
Lines ~3746-3920   - Session persistence functions
Lines ~4185-4300   - VoiceVideo keepalive and visibility handlers
Lines ~4300-4600   - VoiceVideo SDK initialization
```

### dist/widget-core.js Key Sections
```
Lines ~570-620     - State variables (including queue, session, keepalive)
Lines ~930-1200    - Helper functions (timestamp, queue, session, keepalive)
Lines ~1200-1350   - formatBotMessage() markdown parser
Lines ~1350-1500   - Message display functions
Lines ~1700-1800   - processMessage functions
Lines ~1820-1920   - initChat with keepalive setup
```

---

## Why This Matters

In January 2026, we discovered that `widget-core.js` was missing:
- Session persistence (chat lost on page refresh)
- Message queue system (messages out of order)
- VoiceVideo keepalive (calls failed after 5 min)
- Visibility handler (calls failed after tab switch)
- Proper markdown rendering

Users on M&S and other embedded sites had a degraded experience for months.

**Never again.**

---

## Automated Checks (Future)

TODO: Consider adding:
- [ ] Lint rule to check function existence in both files
- [ ] Pre-commit hook to warn about single-file changes
- [ ] CI test that compares feature lists

---

## Questions?

If you're unsure whether a change needs parity, **assume it does** and sync both files.
