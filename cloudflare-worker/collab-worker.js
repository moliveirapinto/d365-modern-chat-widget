/**
 * Cloudflare Worker - Widget Collaboration Rooms
 * 
 * Simple room-based collaboration using KV storage.
 * No accounts needed - just share a 6-character room code!
 * 
 * Setup:
 * 1. Create KV namespace: npx wrangler kv:namespace create "ROOMS"
 * 2. Add to wrangler.toml:
 *    [[kv_namespaces]]
 *    binding = "ROOMS"
 *    id = "your-namespace-id"
 * 3. Deploy: npx wrangler deploy -c wrangler-collab.toml
 */

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://moliveirapinto.github.io',
  'https://d365-modern-chat-widget.azurewebsites.net',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:4280' // Azure SWA CLI
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.find(o => origin?.startsWith(o.replace(/:\d+$/, '')));
  return {
    'Access-Control-Allow-Origin': allowed || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Generate a friendly 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0/O, 1/I/L)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    try {
      // ===== CREATE ROOM =====
      // POST /room/create
      if (url.pathname === '/room/create' && request.method === 'POST') {
        const body = await request.json();
        const { config, creatorName } = body;
        
        // Generate unique room code
        let roomCode;
        let attempts = 0;
        do {
          roomCode = generateRoomCode();
          const existing = await env.ROOMS.get(`room:${roomCode}`);
          if (!existing) break;
          attempts++;
        } while (attempts < 10);
        
        if (attempts >= 10) {
          return new Response(JSON.stringify({ error: 'Could not generate unique room code' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Store room data (expires in 7 days)
        const roomData = {
          code: roomCode,
          config: config,
          createdAt: new Date().toISOString(),
          createdBy: creatorName || 'Anonymous',
          lastUpdated: new Date().toISOString(),
          updatedBy: creatorName || 'Anonymous',
          version: 1
        };
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(roomData));
        
        return new Response(JSON.stringify({ 
          success: true, 
          roomCode,
          message: `Room created! Share code: ${roomCode}`
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== JOIN/GET ROOM =====
      // GET /room/:code
      if (url.pathname.startsWith('/room/') && request.method === 'GET') {
        const roomCode = url.pathname.split('/')[2]?.toUpperCase();
        
        if (!roomCode || roomCode.length !== 6) {
          return new Response(JSON.stringify({ error: 'Invalid room code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const roomData = await env.ROOMS.get(`room:${roomCode}`);
        
        if (!roomData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        return new Response(roomData, {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== UPDATE ROOM =====
      // PUT /room/:code
      if (url.pathname.startsWith('/room/') && request.method === 'PUT') {
        const roomCode = url.pathname.split('/')[2]?.toUpperCase();
        const body = await request.json();
        const { config, updaterName, expectedVersion } = body;
        
        if (!roomCode || roomCode.length !== 6) {
          return new Response(JSON.stringify({ error: 'Invalid room code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Get existing room
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const existing = JSON.parse(existingData);
        
        // Optimistic locking - check version
        if (expectedVersion && existing.version !== expectedVersion) {
          return new Response(JSON.stringify({ 
            error: 'Conflict - room was updated by someone else',
            currentVersion: existing.version,
            updatedBy: existing.updatedBy
          }), {
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Update room
        const updatedRoom = {
          ...existing,
          config: config,
          lastUpdated: new Date().toISOString(),
          updatedBy: updaterName || 'Anonymous',
          version: existing.version + 1
        };
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(updatedRoom));
        
        return new Response(JSON.stringify({ 
          success: true, 
          version: updatedRoom.version,
          message: 'Room updated'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== DELETE ROOM =====
      // DELETE /room/:code
      if (url.pathname.startsWith('/room/') && request.method === 'DELETE') {
        const roomCode = url.pathname.split('/')[2]?.toUpperCase();
        
        if (!roomCode || roomCode.length !== 6) {
          return new Response(JSON.stringify({ error: 'Invalid room code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        await env.ROOMS.delete(`room:${roomCode}`);
        
        return new Response(JSON.stringify({ success: true, message: 'Room deleted' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Default response
      return new Response(JSON.stringify({ 
        service: 'D365 Widget Collaboration',
        endpoints: [
          'POST /room/create - Create a new room',
          'GET /room/:code - Get room config',
          'PUT /room/:code - Update room config',
          'DELETE /room/:code - Delete room'
        ]
      }), { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }
  }
};
