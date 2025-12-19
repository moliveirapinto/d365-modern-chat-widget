# D365 Analytics Worker - D1 Migration Guide

## Why Migrate from KV to D1?

**Scalability Issues with KV:**
- KV stores everything in a single JSON blob that must be fully parsed on every read/write
- 50,000 events = ~5MB JSON file = slow parsing and high memory usage
- Free tier: 1,000 writes/day (may be exceeded with moderate traffic)

**D1 Benefits:**
- Free tier: 100,000 writes/day + 5,000,000 reads/day + 500MB storage
- SQL queries: Fast aggregations without parsing entire dataset
- Indexes: Quick lookups by domain, type, or timestamp
- Scales to millions of events efficiently

## Prerequisites

1. Open **PowerShell** terminal in VS Code (or your preferred terminal)
2. Navigate to your project root:
   ```powershell
   cd c:\Users\maoliveira\d365-modern-chat-widget
   ```
3. All commands below should be run from this directory

## Migration Steps

### Step 1: Create D1 Database

**Run from project root** (`c:\Users\maoliveira\d365-modern-chat-widget`):

```bash
# Login to Cloudflare (if not already logged in)
npx wrangler login

# Create D1 database
npx wrangler d1 create d365-analytics
```

**Save the output!** You'll get a database ID like:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: Execute Schema

**Run from project root** (`c:\Users\maoliveira\d365-modern-chat-widget`):

```bash
# Run the SQL schema to create tables and indexes
npx wrangler d1 execute d365-analytics --remote --file=./cloudflare-worker/schema.sql
```

### Step 3: Create wrangler.toml

**Create file at project root**: `c:\Users\maoliveira\d365-modern-chat-widget\wrangler.toml`

Content:

```toml
name = "d365-widget-analytics"
main = "cloudflare-worker/analytics-worker-d1.js"
compatibility_date = "2024-12-19"

[[d1_databases]]
binding = "DB"
database_name = "d365-analytics"
database_id = "YOUR_DATABASE_ID_FROM_STEP_1"
```

**Important:** Replace `YOUR_DATABASE_ID_FROM_STEP_1` with the actual database ID from Step 1.

### Step 4: Deploy Worker

**Run from project root** (`c:\Users\maoliveira\d365-modern-chat-widget`):

```bash
# Deploy the new D1-based worker
npx wrangler deploy
```

### Step 5: Verify Deployment

**Run from PowerShell** (can be any directory):

```powershell
# Test tracking endpoint
$response = Invoke-RestMethod -Uri 'https://d365-widget-analytics.mauricio-o-pinto.workers.dev/track' `
  -Method Post `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"type":"load","domain":"test.com","source":"manual-test","timestamp":"2025-12-19T12:00:00.000Z"}'

Write-Host $response

# Get analytics
$analytics = Invoke-RestMethod -Uri 'https://d365-widget-analytics.mauricio-o-pinto.workers.dev/analytics'
Write-Host ($analytics | ConvertTo-Json -Depth 10)

# Get domain stats
$stats = Invoke-RestMethod -Uri 'https://d365-widget-analytics.mauricio-o-pinto.workers.dev/stats'
Write-Host ($stats | ConvertTo-Json -Depth 10)
```

## Optional: Migrate Existing KV Data to D1

If you want to preserve your existing analytics data:

```bash
# 1. Export current KV data (from Cloudflare Dashboard or API)
# 2. Transform JSON to SQL INSERT statements
# 3. Execute SQL file with wrangler d1 execute
```

Example transformation script (Node.js):

```javascript
// migrate-kv-to-d1.js
const kvData = {
  "events": [
    {"type":"load","domain":"example.com","source":"widget-core","timestamp":"2025-12-19T10:00:00.000Z"},
    {"type":"chat","domain":"example.com","source":"widget-core","timestamp":"2025-12-19T10:01:00.000Z"}
  ]
};

const inserts = kvData.events.map(e => 
  `INSERT INTO events (type, domain, source, timestamp) VALUES ('${e.type}', '${e.domain}', '${e.source}', '${e.timestamp}');`
).join('\n');

console.log(inserts);
```

Save output to `migration.sql` and run:
```bash
npx wrangler d1 execute d365-analytics --remote --file=migration.sql
```

## API Endpoints (No Changes for Widget)

Your widget code doesn't need any changes! Same endpoints:

- **POST /track** - Track widget event
- **GET /analytics** - Get aggregated stats + last 100 events
- **GET /stats** - Get per-domain breakdown
- **POST /reset** - Clear all data (admin only)

## Monitoring

View database stats in Cloudflare Dashboard:
1. Go to Workers & Pages > D1
2. Select "d365-analytics"
3. View Metrics tab for query performance

## Rollback Plan

If you need to rollback to KV:
1. Update `wrangler.toml` to use `cloudflare-worker/analytics-worker.js` (old KV version)
2. Run `npx wrangler deploy`
3. Your KV data is still there unchanged

## Performance Notes

**Before (KV):**
- 50K events = ~5MB JSON blob
- Every read/write parses entire JSON
- 1,000 writes/day limit

**After (D1):**
- 50K events = ~2MB in indexed SQL table
- SQL queries only touch needed rows
- 100,000 writes/day limit
- Sub-10ms query times with proper indexes

## Troubleshooting

**Error: "DB is not defined"**
- Make sure `binding = "DB"` in wrangler.toml matches the code
- Check database_id is correct

**Error: "no such table: events"**
- Run the schema.sql file: `npx wrangler d1 execute d365-analytics --remote --file=cloudflare-worker/schema.sql`

**Slow queries**
- Check indexes exist: `SELECT * FROM sqlite_master WHERE type='index';`
- Add indexes for frequently filtered columns

**Data not showing**
- Check worker logs: `npx wrangler tail`
- Verify database has data: `npx wrangler d1 execute d365-analytics --remote --command="SELECT COUNT(*) FROM events"`
