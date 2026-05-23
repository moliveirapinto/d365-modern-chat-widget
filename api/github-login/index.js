'use strict';

const crypto = require('crypto');

/**
 * GET /api/github/login
 *
 * Kicks off the GitHub OAuth web flow. Sets a short-lived CSRF cookie and
 * 302-redirects the browser to GitHub's authorize endpoint. The user lands
 * back at /api/github/callback after consent.
 *
 * Required app settings (configured on the SWA):
 *   GITHUB_OAUTH_CLIENT_ID      - GitHub OAuth App client id
 *   GITHUB_OAUTH_CLIENT_SECRET  - used in the callback (not read here)
 *
 * Optional:
 *   GITHUB_OAUTH_REDIRECT_URI   - full https URL of the callback; if unset
 *                                 we derive it from the incoming request host.
 */
module.exports = async function (context, req) {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) {
        // Bounce back to the SPA so it can show a friendly message and
        // fall back to the Personal Access Token flow.
        context.res = {
            status: 302,
            headers: {
                'Location': '/?oauth_error=not_configured',
                'Cache-Control': 'no-store'
            }
        };
        return;
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || `${proto}://${host}/api/github/callback`;

    // Where to send the user after the callback finishes. Constrained to same origin.
    let returnTo = '/';
    try {
        const raw = (req.query && req.query.return_to) || '/';
        if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
            returnTo = raw;
        }
    } catch (_) { /* ignore */ }

    const state = crypto.randomBytes(16).toString('hex');
    const statePayload = `${state}.${Buffer.from(returnTo).toString('base64url')}`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'gist read:user',
        state: statePayload,
        allow_signup: 'true'
    });

    context.res = {
        status: 302,
        headers: {
            'Location': `https://github.com/login/oauth/authorize?${params.toString()}`,
            // HttpOnly + Secure CSRF cookie, expires in 10 minutes
            'Set-Cookie': `gh_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
            'Cache-Control': 'no-store'
        }
    };
};
