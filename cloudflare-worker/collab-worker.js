/**
 * Cloudflare Worker - Widget Collaboration Rooms
 * 
 * Room-based collaboration with multiple widgets per room.
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
  'https://lemon-water-0adbcca0f.1.azurestaticapps.net',
  'https://d365-modern-chat-widget.azurewebsites.net',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:4280' // Azure SWA CLI
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : null;
  return {
    'Access-Control-Allow-Origin': allowed || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Generate a friendly 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate a widget ID
function generateWidgetId() {
  return 'w_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
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
        const { config, creatorName, widgetName, roomName } = body;
        
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
        
        // Create initial widget if config provided
        const widgets = [];
        if (config) {
          const widgetId = generateWidgetId();
          widgets.push({
            id: widgetId,
            name: widgetName || 'Default Widget',
            config: config,
            createdAt: new Date().toISOString(),
            createdBy: creatorName || 'Anonymous',
            updatedAt: new Date().toISOString(),
            updatedBy: creatorName || 'Anonymous',
            version: 1
          });
        }
        
        // Store room data
        const roomData = {
          code: roomCode,
          name: roomName || 'My Room',
          widgets: widgets,
          createdAt: new Date().toISOString(),
          createdBy: creatorName || 'Anonymous',
          lastUpdated: new Date().toISOString(),
          updatedBy: creatorName || 'Anonymous',
          version: 1,
          // Legacy support - keep config at room level for backwards compatibility
          config: config || null
        };
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(roomData));
        
        return new Response(JSON.stringify({ 
          success: true, 
          roomCode,
          roomName: roomData.name,
          widgetId: widgets.length > 0 ? widgets[0].id : null,
          message: `Room created! Share code: ${roomCode}`
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== JOIN/GET ROOM =====
      // GET /room/:code
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}$/i) && request.method === 'GET') {
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
        
        // Migrate old room format to new format with widgets array
        const room = JSON.parse(roomData);
        if (!room.widgets && room.config) {
          // Old format - migrate to widgets array
          room.widgets = [{
            id: generateWidgetId(),
            name: 'Default Widget',
            config: room.config,
            createdAt: room.createdAt,
            createdBy: room.createdBy,
            updatedAt: room.lastUpdated,
            updatedBy: room.updatedBy,
            version: room.version
          }];
          // Save migrated data
          await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(room));
        }
        
        return new Response(JSON.stringify(room), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== UPDATE ROOM (legacy - updates first widget or room-level config) =====
      // PUT /room/:code
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}$/i) && request.method === 'PUT') {
        const roomCode = url.pathname.split('/')[2]?.toUpperCase();
        const body = await request.json();
        const { config, updaterName, expectedVersion } = body;
        
        if (!roomCode || roomCode.length !== 6) {
          return new Response(JSON.stringify({ error: 'Invalid room code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const existing = JSON.parse(existingData);
        
        // Optimistic locking
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
        
        // Update room (and first widget if exists)
        const updatedRoom = {
          ...existing,
          config: config, // Legacy support
          lastUpdated: new Date().toISOString(),
          updatedBy: updaterName || 'Anonymous',
          version: existing.version + 1
        };
        
        // Also update first widget if widgets array exists
        if (updatedRoom.widgets && updatedRoom.widgets.length > 0) {
          updatedRoom.widgets[0].config = config;
          updatedRoom.widgets[0].updatedAt = new Date().toISOString();
          updatedRoom.widgets[0].updatedBy = updaterName || 'Anonymous';
          updatedRoom.widgets[0].version = (updatedRoom.widgets[0].version || 0) + 1;
        }
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(updatedRoom));
        
        return new Response(JSON.stringify({ 
          success: true, 
          version: updatedRoom.version,
          message: 'Room updated'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== ADD WIDGET TO ROOM =====
      // POST /room/:code/widgets
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}\/widgets$/i) && request.method === 'POST') {
        const roomCode = url.pathname.split('/')[2]?.toUpperCase();
        const body = await request.json();
        const { config, name, creatorName } = body;
        
        if (!roomCode || roomCode.length !== 6) {
          return new Response(JSON.stringify({ error: 'Invalid room code' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        if (!name) {
          return new Response(JSON.stringify({ error: 'Widget name is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const room = JSON.parse(existingData);
        
        // Initialize widgets array if needed
        if (!room.widgets) {
          room.widgets = [];
        }
        
        // Create new widget
        const widgetId = generateWidgetId();
        const newWidget = {
          id: widgetId,
          name: name,
          config: config || {},
          createdAt: new Date().toISOString(),
          createdBy: creatorName || 'Anonymous',
          updatedAt: new Date().toISOString(),
          updatedBy: creatorName || 'Anonymous',
          version: 1
        };
        
        room.widgets.push(newWidget);
        room.lastUpdated = new Date().toISOString();
        room.updatedBy = creatorName || 'Anonymous';
        room.version = (room.version || 0) + 1;
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(room));
        
        return new Response(JSON.stringify({ 
          success: true, 
          widgetId: widgetId,
          message: `Widget "${name}" added to room`
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== GET SINGLE WIDGET FROM ROOM =====
      // GET /room/:code/widgets/:widgetId
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}\/widgets\/[\w_]+$/i) && request.method === 'GET') {
        const parts = url.pathname.split('/');
        const roomCode = parts[2]?.toUpperCase();
        const widgetId = parts[4];
        
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const room = JSON.parse(existingData);
        const widget = room.widgets?.find(w => w.id === widgetId);
        
        if (!widget) {
          return new Response(JSON.stringify({ error: 'Widget not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        return new Response(JSON.stringify(widget), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== UPDATE WIDGET IN ROOM =====
      // PUT /room/:code/widgets/:widgetId
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}\/widgets\/[\w_]+$/i) && request.method === 'PUT') {
        const parts = url.pathname.split('/');
        const roomCode = parts[2]?.toUpperCase();
        const widgetId = parts[4];
        const body = await request.json();
        const { config, name, updaterName, expectedVersion } = body;
        
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const room = JSON.parse(existingData);
        const widgetIndex = room.widgets?.findIndex(w => w.id === widgetId);
        
        if (widgetIndex === -1 || widgetIndex === undefined) {
          return new Response(JSON.stringify({ error: 'Widget not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const widget = room.widgets[widgetIndex];
        
        // Optimistic locking
        if (expectedVersion && widget.version !== expectedVersion) {
          return new Response(JSON.stringify({ 
            error: 'Conflict - widget was updated by someone else',
            currentVersion: widget.version,
            updatedBy: widget.updatedBy
          }), {
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Update widget
        if (config !== undefined) widget.config = config;
        if (name !== undefined) widget.name = name;
        widget.updatedAt = new Date().toISOString();
        widget.updatedBy = updaterName || 'Anonymous';
        widget.version = (widget.version || 0) + 1;
        
        room.lastUpdated = new Date().toISOString();
        room.updatedBy = updaterName || 'Anonymous';
        room.version = (room.version || 0) + 1;
        
        // Keep legacy config in sync with first widget
        if (widgetIndex === 0) {
          room.config = widget.config;
        }
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(room));
        
        return new Response(JSON.stringify({ 
          success: true, 
          version: widget.version,
          message: 'Widget updated'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== DELETE WIDGET FROM ROOM =====
      // DELETE /room/:code/widgets/:widgetId
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}\/widgets\/[\w_]+$/i) && request.method === 'DELETE') {
        const parts = url.pathname.split('/');
        const roomCode = parts[2]?.toUpperCase();
        const widgetId = parts[4];
        const updaterName = url.searchParams.get('updaterName') || 'Anonymous';
        
        const existingData = await env.ROOMS.get(`room:${roomCode}`);
        if (!existingData) {
          return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const room = JSON.parse(existingData);
        const widgetIndex = room.widgets?.findIndex(w => w.id === widgetId);
        
        if (widgetIndex === -1 || widgetIndex === undefined) {
          return new Response(JSON.stringify({ error: 'Widget not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Remove widget
        room.widgets.splice(widgetIndex, 1);
        room.lastUpdated = new Date().toISOString();
        room.updatedBy = updaterName;
        room.version = (room.version || 0) + 1;
        
        await env.ROOMS.put(`room:${roomCode}`, JSON.stringify(room));
        
        return new Response(JSON.stringify({ success: true, message: 'Widget deleted' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // ===== DELETE ROOM =====
      // DELETE /room/:code
      if (url.pathname.match(/^\/room\/[A-Z0-9]{6}$/i) && request.method === 'DELETE') {
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
        version: '2.0',
        endpoints: [
          'POST /room/create - Create a new room',
          'GET /room/:code - Get room with all widgets',
          'PUT /room/:code - Update room (legacy)',
          'DELETE /room/:code - Delete room',
          'POST /room/:code/widgets - Add widget to room',
          'GET /room/:code/widgets/:id - Get specific widget',
          'PUT /room/:code/widgets/:id - Update widget',
          'DELETE /room/:code/widgets/:id - Delete widget'
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
