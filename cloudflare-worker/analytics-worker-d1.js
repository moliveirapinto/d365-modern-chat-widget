/**
 * Cloudflare Worker for D365 Widget Analytics - D1 Version
 * Uses Cloudflare D1 (SQL Database) for better scalability
 * 
 * Free tier: 100,000 writes/day, 5M reads/day, 500MB storage
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /track - Track a new event
    if (url.pathname === '/track' && request.method === 'POST') {
      try {
        const event = await request.json();
        
        if (!event.type || !event.domain) {
          return new Response(JSON.stringify({ error: 'Invalid event' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Insert event into D1
        await env.DB.prepare(
          'INSERT INTO events (type, domain, source, timestamp) VALUES (?, ?, ?, ?)'
        ).bind(
          event.type,
          event.domain,
          event.source || 'unknown',
          new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Track error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /analytics - Get analytics summary and recent events
    if (url.pathname === '/analytics' && request.method === 'GET') {
      try {
        // Get total counts by type
        const totals = await env.DB.prepare(`
          SELECT 
            COUNT(CASE WHEN type = 'load' THEN 1 END) as totalLoads,
            COUNT(CASE WHEN type = 'chat' THEN 1 END) as totalChats,
            COUNT(CASE WHEN type = 'call' THEN 1 END) as totalCalls
          FROM events
        `).first();

        // Get counts by domain
        const domainResults = await env.DB.prepare(`
          SELECT domain, COUNT(*) as count
          FROM events
          GROUP BY domain
          ORDER BY count DESC
        `).all();

        const domains = {};
        domainResults.results.forEach(row => {
          domains[row.domain] = row.count;
        });

        // Get recent 100 events
        const eventsResults = await env.DB.prepare(`
          SELECT type, domain, source, timestamp
          FROM events
          ORDER BY id DESC
          LIMIT 100
        `).all();

        const analytics = {
          totalLoads: totals.totalLoads || 0,
          totalChats: totals.totalChats || 0,
          totalCalls: totals.totalCalls || 0,
          domains: domains,
          events: eventsResults.results
        };

        return new Response(JSON.stringify(analytics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Analytics error:', error);
        return new Response(JSON.stringify({ 
          error: error.message,
          totalLoads: 0,
          totalChats: 0,
          totalCalls: 0,
          domains: {},
          events: []
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST /reset - Delete all events
    if (url.pathname === '/reset' && request.method === 'POST') {
      try {
        await env.DB.prepare('DELETE FROM events').run();
        return new Response(JSON.stringify({ success: true, message: 'All events deleted' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /stats - Get detailed statistics
    if (url.pathname === '/stats' && request.method === 'GET') {
      try {
        // Get stats by domain and type
        const stats = await env.DB.prepare(`
          SELECT 
            domain,
            COUNT(CASE WHEN type = 'load' THEN 1 END) as loads,
            COUNT(CASE WHEN type = 'chat' THEN 1 END) as chats,
            COUNT(CASE WHEN type = 'call' THEN 1 END) as calls,
            COUNT(*) as total
          FROM events
          GROUP BY domain
          ORDER BY total DESC
        `).all();

        return new Response(JSON.stringify(stats.results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Root - API info
    return new Response(JSON.stringify({ 
      status: 'D365 Widget Analytics API (D1)',
      endpoints: {
        'POST /track': 'Track an event',
        'GET /analytics': 'Get analytics data',
        'GET /stats': 'Get detailed statistics',
        'POST /reset': 'Delete all events'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
