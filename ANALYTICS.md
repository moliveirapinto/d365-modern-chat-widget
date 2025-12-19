# Analytics Dashboard Guide

## Overview
The Analytics Dashboard tracks anonymous usage statistics for your D365 Modern Chat Widget:
- **Total Widget Loads** - How many times the widget has been loaded across all sites
- **Chats Started** - Number of chat conversations initiated
- **Calls Made** - Voice/video calls accepted by users
- **Active Domains** - Which websites are using your widget

## 🚀 Quick Start

### Access the Dashboard
Simply open `analytics.html` in your browser or navigate to:
```
https://moliveirapinto.github.io/d365-modern-chat-widget/analytics.html
```

The dashboard auto-refreshes every 30 seconds and shows real-time activity.

## 📊 What's Tracked

✅ **TRACKED (Anonymous):**
- Widget load events (when someone opens the widget)
- Chat start events (when someone begins a conversation)
- Call initiation events (when someone accepts a voice/video call)
- Domain names where the widget is used
- Timestamps of events

❌ **NOT TRACKED (Privacy-First):**
- User messages or conversation content
- Personal information (names, emails)
- IP addresses
- User browsing behavior outside the widget

## 🔧 Current Setup (Demo Mode)

Right now, the widget is storing analytics in **localStorage** (browser storage). This is perfect for:
- Testing the analytics feature
- Viewing data on your local machine
- Getting familiar with the dashboard

**Limitation:** Data is stored locally in your browser only. Other team members won't see the same data.

## ⚡ Production Setup (Optional)

To track analytics across all users and domains, you can configure a backend:

### Option 1: Cloudflare Workers (Recommended - Free Tier Available)

1. **Create a Cloudflare Worker** to store analytics:
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Create a new Worker
   - Use Cloudflare KV (Key-Value) storage for analytics data

2. **Update widget-core.js** (line ~40):
   ```javascript
   // Uncomment and replace with your Worker URL
   fetch('https://your-worker.your-domain.workers.dev/analytics', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(event)
   }).catch(function() { /* silently fail */ });
   ```

3. **Update analytics.html** (line ~170):
   ```javascript
   // Uncomment and replace with your Worker URL
   const response = await fetch('https://your-worker.your-domain.workers.dev/analytics');
   const data = await response.json();
   ```

### Option 2: Azure Application Insights

If you're using Azure, you can integrate with Application Insights for advanced analytics:
- Custom events tracking
- Real-time monitoring
- Advanced dashboards and reports

### Option 3: Google Analytics

Add Google Analytics to track widget usage alongside your website analytics.

## 📖 Dashboard Features

### Stats Cards
- **Total Widget Loads** - Total number of times the widget has been initialized
- **Chats Started** - How many conversations have been started
- **Calls Made** - Number of voice/video calls accepted
- **Active Domains** - Number of unique websites using the widget

### Domain Usage Table
Shows which domains/websites are using your widget, sorted by usage count.

### Recent Activity Timeline
Live feed of the last 20 widget events with:
- Event type (🚀 loaded, 💬 chat started, 📞 call initiated)
- Timestamp
- Domain where the event occurred

## 🎯 How It Works

1. **Widget Loads**: When `widget-core.js` is loaded on any website, it sends a `load` event
2. **Chat Starts**: When a user fills out the form and starts chatting, it sends a `chat` event
3. **Calls Made**: When a user accepts a voice/video call, it sends a `call` event
4. **Dashboard Displays**: The dashboard fetches all events and shows aggregated statistics

## 🔐 Privacy & Compliance

This analytics system is designed with privacy in mind:
- **No PII (Personally Identifiable Information)** is collected
- **No message content** is logged
- Only aggregated, anonymous usage metrics
- Compliant with privacy regulations (GDPR, CCPA)

## 🛠️ Customization

You can customize the dashboard by editing `analytics.html`:
- Change colors/styling in the `<style>` section
- Modify refresh interval (default: 30 seconds)
- Add custom charts or visualizations
- Filter by date ranges

## 📝 Notes

- Analytics tracking is **non-blocking** - if it fails, the widget continues working normally
- All tracking is wrapped in try-catch blocks to prevent errors
- The dashboard works even with no data (shows "No data yet" messages)

## 🆘 Troubleshooting

**Q: Dashboard shows "No data yet"**
- Make sure the widget has been loaded at least once
- Check browser console for any errors
- Verify localStorage is enabled in your browser

**Q: Data is not persisting**
- localStorage is cleared when you clear browser data
- For persistent storage, set up a backend (see Production Setup)

**Q: Analytics not tracking**
- Open browser console and look for errors
- Verify `trackEvent()` function is being called
- Check if ad blockers are interfering

---

**Questions?** Check the main [README.md](README.md) or open an issue on GitHub.
