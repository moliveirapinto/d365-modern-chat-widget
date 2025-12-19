/**
 * Cloudflare Worker for D365 Widget Analytics
 * 
 * Deploy this to Cloudflare Workers to track widget usage across all domains
 * Free tier: 100,000 requests/day
 * 
 * Setup:
 * 1. Create a Cloudflare account (free)
 * 2. Create a KV namespace called "ANALYTICS"
 * 3. Deploy this worker
 * 4. Update widget-core.js and index.html with your worker URL
 */

export default {
  async fetch(request, env) {
    // CORS headers to allow requests from any domain
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /analytics - Track a new event
    if (url.pathname === '/analytics' && request.method === 'POST') {
      try {
        const event = await request.json();
        
        // Validate event
        if (!event.type || !event.domain || !event.timestamp) {
          return new Response(JSON.stringify({ error: 'Invalid event data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get current analytics data from KV
        const analyticsJson = await env.ANALYTICS.get('data') || '{"totalLoads":0,"totalChats":0,"totalCalls":0,"domains":{},"events":[]}';
        const analytics = JSON.parse(analyticsJson);

        // Update counters
        if (event.type === 'load') analytics.totalLoads++;
        if (event.type === 'chat') analytics.totalChats++;
        if (event.type === 'call') analytics.totalCalls++;

        // Track domains
        analytics.domains[event.domain] = (analytics.domains[event.domain] || 0) + 1;

        // Add event to timeline (keep last 100)
        analytics.events.unshift(event);
        if (analytics.events.length > 100) {
          analytics.events = analytics.events.slice(0, 100);
        }

        // Save back to KV
        await env.ANALYTICS.put('data', JSON.stringify(analytics));

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /analytics - Retrieve analytics data
    if (url.pathname === '/analytics' && request.method === 'GET') {
      try {
        const analyticsJson = await env.ANALYTICS.get('data') || '{"totalLoads":0,"totalChats":0,"totalCalls":0,"domains":{},"events":[]}';
        const analytics = JSON.parse(analyticsJson);

        return new Response(JSON.stringify(analytics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /analytics/reset - Reset analytics (admin only - protect this!)
    if (url.pathname === '/analytics/reset' && request.method === 'POST') {
      const emptyData = {
        totalLoads: 0,
        totalChats: 0,
        totalCalls: 0,
        domains: {},
        events: []
      };
      
      await env.ANALYTICS.put('data', JSON.stringify(emptyData));
      
      return new Response(JSON.stringify({ success: true, message: 'Analytics reset' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Root endpoint - health check
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'D365 Widget Analytics API',
      endpoints: {
        'POST /analytics': 'Track an event',
        'GET /analytics': 'Get analytics data',
        'POST /analytics/reset': 'Reset analytics (use carefully!)'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
