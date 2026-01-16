# Collaboration Rooms Worker

A simple Cloudflare Worker that enables real-time collaboration on widget configurations using 6-character room codes. No accounts needed!

## Features

- 🚀 **Create Room** - Get a unique 6-character code instantly
- 🔗 **Join Room** - Enter a code to sync with teammates
- 🔄 **Sync/Push** - Pull latest changes or push your updates
- ⚡ **Conflict Detection** - Prevents accidental overwrites
- ♾️ **Persistent** - Rooms never expire

## Setup

### 1. Create KV Namespace

```bash
cd cloudflare-worker
npx wrangler kv:namespace create "ROOMS"
```

Copy the namespace ID from the output.

### 2. Update wrangler-collab.toml

Replace `YOUR_KV_NAMESPACE_ID` with your actual namespace ID:

```toml
[[kv_namespaces]]
binding = "ROOMS"
id = "abc123..."  # Your ID here
```

### 3. Deploy

```bash
npx wrangler deploy -c wrangler-collab.toml
```

### 4. Update Frontend

After deploying, update the `COLLAB_API_URL` in `index.html`:

```javascript
const COLLAB_API_URL = 'https://d365-widget-collab.YOUR-SUBDOMAIN.workers.dev';
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/room/create` | Create a new room |
| GET | `/room/:code` | Get room config |
| PUT | `/room/:code` | Update room config |
| DELETE | `/room/:code` | Delete room |

## How It Works

1. **Create Room**: User clicks "Create Room", their current config is saved with a generated 6-character code
2. **Share Code**: User shares the code (e.g., "ABC123") with teammates via chat, email, etc.
3. **Join Room**: Teammate enters the code, instantly loads the shared config
4. **Collaborate**: Use Sync to pull latest, Push to save changes
5. **Conflict Handling**: If two people edit simultaneously, they're prompted to resolve

## Room Code Format

- 6 characters
- Uses: A-Z (excluding O, I, L) and 2-9 (excluding 0, 1)
- Easy to read aloud: "Alpha-Bravo-Charlie-2-3-4"

## Storage

- Uses Cloudflare KV for persistent storage
- Rooms never expire (delete manually if needed)
