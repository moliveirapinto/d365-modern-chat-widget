'use strict';

/**
 * GET /api/github/callback?code=...&state=...
 *
 * Completes the GitHub OAuth web flow: validates CSRF state, exchanges the
 * code for an access token, fetches the user profile, then redirects back
 * to the SPA with the token in the URL fragment (#gh_token=...&gh_user=...).
 *
 * The fragment is never sent to the server. The SPA's existing bootstrap
 * picks it up, stores it in localStorage (same keys as the PAT flow), and
 * clears the hash immediately.
 */
module.exports = async function (context, req) {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return redirectToApp(context, '/', { error: 'oauth_not_configured' });
    }

    const code = req.query && req.query.code;
    const stateRaw = (req.query && req.query.state) || '';
    if (!code || !stateRaw) {
        return redirectToApp(context, '/', { error: 'missing_params' });
    }

    // CSRF check: the random half of the state must match the cookie we set.
    const cookieState = parseCookie(req.headers.cookie || '', 'gh_oauth_state');
    const [stateNonce, returnEncoded] = String(stateRaw).split('.', 2);
    if (!cookieState || !stateNonce || cookieState !== stateNonce) {
        return redirectToApp(context, '/', { error: 'state_mismatch' });
    }

    let returnTo = '/';
    try {
        const decoded = Buffer.from(returnEncoded || '', 'base64url').toString('utf8');
        if (decoded.startsWith('/') && !decoded.startsWith('//')) returnTo = decoded;
    } catch (_) { /* ignore */ }

    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || `${proto}://${host}/api/github/callback`;

    // 1. Exchange the code for an access token.
    let tokenResp;
    try {
        tokenResp = await fetch('https://github.com/login/oauth/access_token', {
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
    } catch (e) {
        context.log.error('Token exchange network error:', e && e.message);
        return redirectToApp(context, returnTo, { error: 'exchange_failed' });
    }

    if (!tokenResp.ok) {
        context.log.error('Token exchange HTTP error:', tokenResp.status);
        return redirectToApp(context, returnTo, { error: 'exchange_failed' });
    }

    let tokenJson;
    try {
        tokenJson = await tokenResp.json();
    } catch (_) {
        return redirectToApp(context, returnTo, { error: 'exchange_parse' });
    }

    const accessToken = tokenJson && tokenJson.access_token;
    if (!accessToken) {
        context.log.error('No access_token in GitHub response:', JSON.stringify(tokenJson));
        return redirectToApp(context, returnTo, { error: tokenJson.error || 'no_token' });
    }

    // 2. Fetch the user profile so the SPA can show name/avatar without an
    //    extra round-trip and without having to call /user itself first.
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
        context.log.warn('User fetch failed, continuing without profile:', e && e.message);
    }

    const fragment = new URLSearchParams({
        gh_token: accessToken,
        gh_user: user ? Buffer.from(JSON.stringify(user)).toString('base64url') : ''
    }).toString();

    context.res = {
        status: 302,
        headers: {
            'Location': `${returnTo}#${fragment}`,
            // Clear the CSRF cookie so it can't be replayed.
            'Set-Cookie': 'gh_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
            'Cache-Control': 'no-store'
        }
    };
};

function parseCookie(header, name) {
    if (!header) return null;
    const parts = header.split(/;\s*/);
    for (const p of parts) {
        const eq = p.indexOf('=');
        if (eq === -1) continue;
        if (p.slice(0, eq) === name) return decodeURIComponent(p.slice(eq + 1));
    }
    return null;
}

function redirectToApp(context, path, extra) {
    const safePath = (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) ? path : '/';
    const qs = new URLSearchParams(extra || {}).toString();
    context.res = {
        status: 302,
        headers: {
            'Location': `${safePath}${qs ? (safePath.includes('?') ? '&' : '?') + qs : ''}`,
            'Set-Cookie': 'gh_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
            'Cache-Control': 'no-store'
        }
    };
}
