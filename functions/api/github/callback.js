/**
 * GET /api/github/callback
 *
 * Cloudflare Pages Function. Completes the OAuth web flow: validates CSRF
 * state, exchanges the code for an access token, fetches /user, redirects
 * back to the SPA with the token in the URL fragment.
 *
 * Env (CF Pages → Settings → Environment variables):
 *   GITHUB_OAUTH_CLIENT_ID       (required)
 *   GITHUB_OAUTH_CLIENT_SECRET   (required, encrypted)
 *   GITHUB_OAUTH_REDIRECT_URI    (optional override; must match login's value)
 */
export async function onRequestGet(context) {
    const { request, env } = context;

    const clientId = env.GITHUB_OAUTH_CLIENT_ID;
    const clientSecret = env.GITHUB_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return redirectToApp('/', { error: 'oauth_not_configured' });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const stateRaw = url.searchParams.get('state') || '';
    if (!code || !stateRaw) {
        return redirectToApp('/', { error: 'missing_params' });
    }

    // CSRF check.
    const cookieState = parseCookie(request.headers.get('cookie') || '', 'gh_oauth_state');
    const [stateNonce, returnEncoded] = stateRaw.split('.', 2);
    if (!cookieState || !stateNonce || cookieState !== stateNonce) {
        return redirectToApp('/', { error: 'state_mismatch' });
    }

    let returnTo = '/';
    try {
        const decoded = base64urlDecode(returnEncoded || '');
        if (decoded.startsWith('/') && !decoded.startsWith('//')) returnTo = decoded;
    } catch (_) { /* ignore */ }

    const redirectUri = env.GITHUB_OAUTH_REDIRECT_URI || `${url.origin}/api/github/callback`;

    // 1. Exchange code -> token.
    let tokenJson;
    try {
        const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'd365-widget-studio'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri
            })
        });
        if (!tokenResp.ok) {
            console.error('Token exchange HTTP error:', tokenResp.status);
            return redirectToApp(returnTo, { error: 'exchange_failed' });
        }
        tokenJson = await tokenResp.json();
    } catch (e) {
        console.error('Token exchange network error:', e && e.message);
        return redirectToApp(returnTo, { error: 'exchange_failed' });
    }

    const accessToken = tokenJson && tokenJson.access_token;
    if (!accessToken) {
        console.error('No access_token in GitHub response:', JSON.stringify(tokenJson));
        return redirectToApp(returnTo, { error: tokenJson.error || 'no_token' });
    }

    // 2. Fetch the user profile.
    let user = null;
    try {
        const uResp = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'd365-widget-studio'
            }
        });
        if (uResp.ok) {
            const u = await uResp.json();
            user = {
                id: u.id,
                name: u.name || u.login,
                login: u.login,
                avatar: u.avatar_url
            };
        }
    } catch (e) {
        console.warn('User fetch failed, continuing without profile:', e && e.message);
    }

    const params = new URLSearchParams();
    params.set('gh_token', accessToken);
    if (user) params.set('gh_user', base64urlEncode(JSON.stringify(user)));

    return new Response(null, {
        status: 302,
        headers: {
            'Location': `${returnTo}#${params.toString()}`,
            'Set-Cookie': 'gh_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
            'Cache-Control': 'no-store'
        }
    });
}

function redirectToApp(path, extra) {
    const safePath = (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) ? path : '/';
    const qs = new URLSearchParams(extra || {}).toString();
    const loc = qs ? `${safePath}${safePath.includes('?') ? '&' : '?'}${qs}` : safePath;
    return new Response(null, {
        status: 302,
        headers: {
            'Location': loc,
            'Set-Cookie': 'gh_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
            'Cache-Control': 'no-store'
        }
    });
}

function parseCookie(header, name) {
    if (!header) return null;
    const parts = header.split(/;\s*/);
    for (const p of parts) {
        const eq = p.indexOf('=');
        if (eq === -1) continue;
        if (p.slice(0, eq) === name) {
            try { return decodeURIComponent(p.slice(eq + 1)); }
            catch (_) { return p.slice(eq + 1); }
        }
    }
    return null;
}

function base64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}
