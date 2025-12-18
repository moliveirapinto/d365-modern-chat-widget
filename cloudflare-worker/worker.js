/**
 * Cloudflare Worker - GitHub OAuth Proxy
 * 
 * Deploy this to Cloudflare Workers (free tier) to enable
 * GitHub Device Flow from the browser.
 * 
 * Setup:
 * 1. Go to https://dash.cloudflare.com/
 * 2. Workers & Pages → Create Application → Create Worker
 * 3. Paste this code and deploy
 * 4. Note your worker URL (e.g., https://your-worker.your-subdomain.workers.dev)
 * 5. Update PROXY_URL in app.js with your worker URL
 */

const GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Replace after creating OAuth App

// Allowed origins (add your domains)
const ALLOWED_ORIGINS = [
  'https://moliveirapinto.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // Route: Get device code
    if (url.pathname === '/device/code' && request.method === 'POST') {
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          scope: 'gist read:user'
        })
      });
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }

    // Route: Poll for token
    if (url.pathname === '/device/token' && request.method === 'POST') {
      const body = await request.json();
      
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code: body.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }

    return new Response('D365 Widget OAuth Proxy', { 
      headers: corsHeaders(origin) 
    });
  }
};
