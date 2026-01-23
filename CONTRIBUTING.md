I need# Contributing to D365 Modern Chat Widget

## ⚠️ CRITICAL: Visual & Feature Parity Rule

**This project has MULTIPLE implementations that MUST stay in sync:**

| File/Location | Purpose | Users |
|---------------|---------|-------|
| `index.html` (Preview) | Admin panel live preview | Admins configuring widgets |
| `index.html` (SDK Export) | Generated embed code | Sites using exported SDK |
| `live.html` | Direct website widget | Your hosted site |
| `dist/widget-core.js` | TamperMonkey / Embedded | Third-party sites (M&S, etc.) |
| Demo pages (`financial.html`, etc.) | Industry demos | Demo/showcase purposes |

### 🚨 THE GOLDEN RULES

> **1. Any feature, fix, or change made to ONE implementation MUST also be made to ALL OTHER implementations.**

> **2. ALL VISUAL CHANGES must apply to ALL rendering methods - preview, embedded, Tampermonkey, SDK export, and demo pages.**

This is non-negotiable. Users on embedded sites deserve the same experience as users on the direct site.

---

## Visual Change Checklist

Before committing ANY visual/styling change, verify it applies to:

### Preview & Configuration
- [ ] `index.html` - `updatePreview()` function (admin preview panel)
- [ ] `index.html` - SDK export template (the generated embed code)

### Runtime Widgets
- [ ] `live.html` - Dynamic style injection (applyAdminSettings or similar)
- [ ] `dist/widget-core.js` - Embedded widget styles

### Demo Pages (if applicable)
- [ ] `financial.html`, `healthcare.html`, `retail.html`, `government.html`

### Key Visual Properties to Check
- [ ] Colors (primary, gradient, bubbles, text)
- [ ] Gradients (header gradient vs bubble gradient - they're independent!)
- [ ] Fonts and typography
- [ ] Spacing and layout
- [ ] Avatars and images
- [ ] Animations and transitions

### Common Visual Variables
| Setting | Preview Location | Export Location | Runtime Location |
|---------|------------------|-----------------|------------------|
| `useGradient` | `updatePreview()` | SDK template | `applyAdminSettings()` |
| `useBubbleGradient` | `updatePreview()` | SDK template `.d365-message.user` | `bubbleGradient` variable |
| `gradientStart/End` | Both gradient usages | Both gradient usages | Both gradient usages |
| `userBubbleColor` | When `useBubbleGradient=false` | When `useBubbleGradient=false` | When `useBubbleGradient=false` |

---

## Feature Parity Checklist

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

## Visual Change Example: Bubble Gradient Fix (Jan 2026)

When fixing the bubble gradient toggle, changes were required in:

1. **`index.html` preview** - Created separate `bubbleGradient` variable in `updatePreview()`
2. **`live.html`** - Created separate `bubbleGradient` variable in style injection
3. **`index.html` SDK export** - Already correct (verified)

The bug: `useBubbleGradient` was using the header's `gradient` variable, which became solid color when header gradient was off. The fix required ensuring bubble gradient always uses `gradientStart`/`gradientEnd` regardless of header settings.

---

## Automated Checks (Future)

TODO: Consider adding:
- [ ] Lint rule to check function existence in both files
- [ ] Pre-commit hook to warn about single-file changes
- [ ] CI test that compares feature lists

---

## Questions?

If you're unsure whether a change needs parity, **assume it does** and sync both files.
