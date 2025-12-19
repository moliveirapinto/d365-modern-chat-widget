# Cloudflare Worker Setup for Analytics

This guide will help you deploy the analytics backend to Cloudflare Workers (FREE tier available).

## Why Cloudflare Workers?

- ✅ **100,000 requests/day FREE**
- ✅ Global CDN - fast everywhere
- ✅ KV storage included
- ✅ No credit card required for free tier
- ✅ Deploy in < 5 minutes

## Step-by-Step Setup

### 1. Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up (free, no credit card needed)
3. Verify your email

### 2. Create KV Namespace

1. In Cloudflare Dashboard, click **Workers & Pages**
2. Click **KV** in the sidebar
3. Click **Create namespace**
4. Name it: `ANALYTICS`
5. Click **Add**

### 3. Create Worker

1. Click **Workers & Pages** → **Create application**
2. Click **Create Worker**
3. Name it: `d365-widget-analytics` (or any name you like)
4. Click **Deploy** (it will create a template)
5. Click **Edit code**
6. **Delete all the template code**
7. **Copy the entire content** from `cloudflare-worker/analytics-worker.js`
8. **Paste it** into the editor
9. Click **Save and Deploy**

### 4. Bind KV Namespace to Worker

1. Still in the Worker editor, click **Settings** tab
2. Click **Variables** in the sidebar
3. Scroll to **KV Namespace Bindings**
4. Click **Add binding**
5. Set:
   - **Variable name:** `ANALYTICS`
   - **KV namespace:** Select your `ANALYTICS` namespace
6. Click **Save**
7. Click **Deploy** again

### 5. Get Your Worker URL

After deployment, you'll see a URL like:
```
https://d365-widget-analytics.YOUR-USERNAME.workers.dev
```

**Copy this URL!** You'll need it in the next step.

### 6. Update Widget Code

Now update your widget files to use the Cloudflare Worker:

#### Update `dist/widget-core.js`

Find this section (around line 40):
```javascript
// TODO: Send to Cloudflare Worker endpoint when configured
// fetch('YOUR_CLOUDFLARE_WORKER_URL/analytics', {
```

**Replace** `YOUR_CLOUDFLARE_WORKER_URL` with your actual worker URL:
```javascript
fetch('https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event)
}).catch(function() { /* silently fail */ });
```

**Uncomment** those lines (remove the `//`).

#### Update `index.html`

Find the same section in index.html (around line 1315) and make the same change.

#### Update `analytics.html`

Find this section (around line 280):
```javascript
// Uncomment when Cloudflare Worker is deployed:
// const response = await fetch('YOUR_CLOUDFLARE_WORKER_URL/analytics');
```

**Replace and uncomment:**
```javascript
const response = await fetch('https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics');
const data = await response.json();
updateDashboard(data);
```

Also **comment out or remove** the localStorage code since you won't need it anymore.

### 7. Remove localStorage Code (Optional)

Since you don't want localStorage, you can remove these lines from the `trackEvent` function:

```javascript
// Remove or comment out:
var analytics = JSON.parse(localStorage.getItem('d365WidgetAnalytics') || '...');
// ... all the localStorage code ...
localStorage.setItem('d365WidgetAnalytics', JSON.stringify(analytics));
```

Just keep the `fetch()` call that sends to Cloudflare.

### 8. Test It!

1. Commit and push your changes
2. Wait for GitHub Pages to update
3. Open your widget somewhere
4. Open `analytics.html`
5. You should see real data! 🎉

## Verify It's Working

### Check Worker Logs
1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your worker
3. Click **Logs** tab (real-time)
4. Open your widget and watch requests come in

### Test API Directly
Open your browser console and test:

```javascript
// Test POST
fetch('https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'load',
    domain: 'test.com',
    timestamp: new Date().toISOString()
  })
}).then(r => r.json()).then(console.log);

// Test GET
fetch('https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics')
  .then(r => r.json())
  .then(console.log);
```

## Reset Analytics (If Needed)

To clear all analytics data:

```javascript
fetch('https://d365-widget-analytics.YOUR-USERNAME.workers.dev/analytics/reset', {
  method: 'POST'
}).then(r => r.json()).then(console.log);
```

⚠️ **Warning:** This deletes all your analytics data!

## Troubleshooting

### "KV namespace not found"
- Make sure you created the KV binding named exactly `ANALYTICS`
- Redeploy the worker after adding the binding

### "CORS error"
- The worker already has CORS headers configured
- If you still see errors, check browser console for details

### "No data showing"
- Check Cloudflare Worker logs for incoming requests
- Verify your worker URL is correct in the widget code
- Test the API directly (see above)

## Monitoring & Limits

### Free Tier Limits
- **100,000 requests/day**
- **1 GB KV storage**
- This is MORE than enough for widget analytics!

### Check Usage
1. Cloudflare Dashboard → Workers & Pages
2. Click your worker
3. See request metrics and usage

## Cost (FREE!)

You won't pay anything unless you exceed:
- 100,000 requests/day
- 1,000 KV writes/day (unlikely with analytics)
- 100,000 KV reads/day

For a widget, you'll likely never hit these limits on free tier.

## Next Steps

After setup, you can:
- Customize the worker to add more analytics
- Add authentication to protect the reset endpoint
- Export data for further analysis
- Set up alerts for high usage

---

**Questions?** Check the main [ANALYTICS.md](../ANALYTICS.md) or create an issue on GitHub.
