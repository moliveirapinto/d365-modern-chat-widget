/**
 * GET /api/github/login
 *
 * Cloudflare Pages Function. Mirrors the Azure version: builds the GitHub
 * OAuth authorize URL, plants an HttpOnly state cookie for CSRF, and 302s.
 *
 * Env (set in CF Pages → Settings → Environment variables):
 *   GITHUB_OAUTH_CLIENT_ID     (required)
 *   GITHUB_OAUTH_REDIRECT_URI  (optional override)
 */
export async function onRequestGet(context) {
    const { request, env } = context;

    const clientId = env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) {
        // Bounce back so the SPA can show a friendly error + the PAT fallback.
        return redirect302('/?oauth_error=not_configured');
    }

    const url = new URL(request.url);
    let returnTo = url.searchParams.get('return_to') || '/';
    // Open-redirect protection.
    if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
        returnTo = '/';
    }

    const redirectUri = env.GITHUB_OAUTH_REDIRECT_URI || `${url.origin}/api/github/callback`;

    const state = randomHex(16);
    const statePayload = `${state}.${base64urlEncode(returnTo)}`;

    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('redirect_uri', redirectUri);
    authorize.searchParams.set('scope', 'gist read:user');
    authorize.searchParams.set('state', statePayload);
    authorize.searchParams.set('allow_signup', 'true');

    return new Response(null, {
        status: 302,
        headers: {
            'Location': authorize.toString(),
            'Set-Cookie': `gh_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
            'Cache-Control': 'no-store'
        }
    });
}

function redirect302(loc) {
    return new Response(null, {
        status: 302,
        headers: { 'Location': loc, 'Cache-Control': 'no-store' }
    });
}

function randomHex(bytes) {
    const a = new Uint8Array(bytes);
    crypto.getRandomValues(a);
    let s = '';
    for (let i = 0; i < a.length; i++) s += a[i].toString(16).padStart(2, '0');
    return s;
}

function base64urlEncode(str) {
    // utf-8 safe
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
