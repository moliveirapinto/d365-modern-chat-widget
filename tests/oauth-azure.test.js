/* Offline unit tests for the GitHub OAuth Functions.
 * Mocks the Functions runtime context and global fetch.
 * Run: node api/__tests__/oauth.test.js
 */
'use strict';

const assert = require('assert');
const path = require('path');

function makeContext() {
    return {
        log: Object.assign(function noop() {}, {
            error: function () {},
            warn: function () {},
            info: function () {}
        }),
        res: undefined
    };
}

function loadFresh(modPath) {
    delete require.cache[require.resolve(modPath)];
    return require(modPath);
}

async function run() {
    const loginPath = path.resolve(__dirname, '../api/github-login/index.js');
    const cbPath = path.resolve(__dirname, '../api/github-callback/index.js');

    // ---------- /api/github/login ----------

    // 1. Missing client id → redirect to /?oauth_error=not_configured
    delete process.env.GITHUB_OAUTH_CLIENT_ID;
    delete process.env.GITHUB_OAUTH_CLIENT_SECRET;
    {
        const login = loadFresh(loginPath);
        const ctx = makeContext();
        await login(ctx, { headers: { host: 'example.com' }, query: {} });
        assert.strictEqual(ctx.res.status, 302, 'login: status 302');
        assert.strictEqual(ctx.res.headers.Location, '/?oauth_error=not_configured');
        console.log('  ✓ login: missing env → bounce with oauth_error');
    }

    // 2. With client id → redirect to GitHub authorize + sets state cookie
    process.env.GITHUB_OAUTH_CLIENT_ID = 'test_client_id';
    process.env.GITHUB_OAUTH_CLIENT_SECRET = 'test_client_secret';
    let stateCookieValue = null;
    let returnTo = '/dashboard';
    {
        const login = loadFresh(loginPath);
        const ctx = makeContext();
        await login(ctx, {
            headers: { host: 'widget.example.com', 'x-forwarded-proto': 'https' },
            query: { return_to: returnTo }
        });
        assert.strictEqual(ctx.res.status, 302);
        const loc = ctx.res.headers.Location;
        assert.ok(loc.startsWith('https://github.com/login/oauth/authorize?'), 'login: redirects to GitHub authorize');
        const u = new URL(loc);
        assert.strictEqual(u.searchParams.get('client_id'), 'test_client_id');
        assert.strictEqual(u.searchParams.get('scope'), 'gist read:user');
        assert.strictEqual(u.searchParams.get('redirect_uri'), 'https://widget.example.com/api/github/callback');
        const stateParam = u.searchParams.get('state');
        assert.ok(stateParam && stateParam.includes('.'), 'login: state has nonce.returnTo format');
        const setCookie = ctx.res.headers['Set-Cookie'];
        assert.ok(setCookie && /gh_oauth_state=([0-9a-f]+);/.test(setCookie), 'login: sets state cookie');
        stateCookieValue = /gh_oauth_state=([0-9a-f]+);/.exec(setCookie)[1];
        // Confirm state nonce matches cookie
        assert.strictEqual(stateParam.split('.')[0], stateCookieValue, 'login: state nonce matches cookie');
        // Confirm returnTo round-trips
        const encoded = stateParam.split('.')[1];
        const decoded = Buffer.from(encoded, 'base64url').toString();
        assert.strictEqual(decoded, returnTo, 'login: returnTo round-trips');
        console.log('  ✓ login: redirects with correct authorize URL + state cookie');
    }

    // 3. Open redirect protection: //evil.com should be rejected, default to '/'
    {
        const login = loadFresh(loginPath);
        const ctx = makeContext();
        await login(ctx, {
            headers: { host: 'widget.example.com' },
            query: { return_to: '//evil.example.com/' }
        });
        const u = new URL(ctx.res.headers.Location);
        const stateParam = u.searchParams.get('state');
        const decoded = Buffer.from(stateParam.split('.')[1], 'base64url').toString();
        assert.strictEqual(decoded, '/', 'login: open-redirect attempt collapses to /');
        console.log('  ✓ login: open-redirect attempt rejected');
    }

    // ---------- /api/github/callback ----------

    // 4. Missing code → bounce with missing_params
    {
        const cb = loadFresh(cbPath);
        const ctx = makeContext();
        await cb(ctx, { headers: { host: 'h' }, query: {} });
        assert.strictEqual(ctx.res.status, 302);
        assert.ok(ctx.res.headers.Location.includes('error=missing_params'), 'callback: bounces missing params');
        console.log('  ✓ callback: missing code → bounce');
    }

    // 5. State mismatch → bounce
    {
        const cb = loadFresh(cbPath);
        const ctx = makeContext();
        await cb(ctx, {
            headers: { host: 'h', cookie: 'gh_oauth_state=aaaa' },
            query: { code: 'x', state: 'bbbb.aGVsbG8' }
        });
        assert.ok(ctx.res.headers.Location.includes('error=state_mismatch'), 'callback: state mismatch caught');
        console.log('  ✓ callback: state mismatch → bounce');
    }

    // 6. Happy path: code exchange + user fetch → redirect with #gh_token + #gh_user
    const realFetch = global.fetch;
    global.fetch = async function (url, opts) {
        if (url === 'https://github.com/login/oauth/access_token') {
            assert.strictEqual(opts.method, 'POST');
            const body = JSON.parse(opts.body);
            assert.strictEqual(body.code, 'happycode');
            assert.strictEqual(body.client_id, 'test_client_id');
            assert.strictEqual(body.client_secret, 'test_client_secret');
            return {
                ok: true,
                json: async () => ({ access_token: 'gho_FAKE_TOKEN_42', scope: 'gist,read:user', token_type: 'bearer' })
            };
        }
        if (url === 'https://api.github.com/user') {
            assert.ok(opts.headers.Authorization === 'token gho_FAKE_TOKEN_42');
            return {
                ok: true,
                json: async () => ({ id: 99, login: 'octocat', name: 'Mona', avatar_url: 'https://x/a.png' })
            };
        }
        throw new Error('Unexpected fetch URL: ' + url);
    };

    try {
        const cb = loadFresh(cbPath);
        const ctx = makeContext();
        const stateValid = 'abc123';
        const returnEncoded = Buffer.from('/').toString('base64url');
        await cb(ctx, {
            headers: { host: 'widget.example.com', cookie: `gh_oauth_state=${stateValid}` },
            query: { code: 'happycode', state: `${stateValid}.${returnEncoded}` }
        });

        assert.strictEqual(ctx.res.status, 302);
        const loc = ctx.res.headers.Location;
        assert.ok(loc.startsWith('/#'), 'callback: redirects to /#…');
        const hash = new URLSearchParams(loc.slice(2));
        assert.strictEqual(hash.get('gh_token'), 'gho_FAKE_TOKEN_42');
        const userEncoded = hash.get('gh_user');
        assert.ok(userEncoded, 'callback: gh_user present');
        const user = JSON.parse(Buffer.from(userEncoded, 'base64url').toString());
        assert.deepStrictEqual(user, { id: 99, name: 'Mona', login: 'octocat', avatar: 'https://x/a.png' });
        const setCookie = ctx.res.headers['Set-Cookie'];
        assert.ok(/gh_oauth_state=; .* Max-Age=0/.test(setCookie), 'callback: clears state cookie');
        console.log('  ✓ callback: happy path → redirect with token + user, cookie cleared');
    } finally {
        global.fetch = realFetch;
    }

    // 7. Token exchange returns error payload → bounce with that error code
    global.fetch = async function () {
        return { ok: true, json: async () => ({ error: 'bad_verification_code' }) };
    };
    try {
        const cb = loadFresh(cbPath);
        const ctx = makeContext();
        const stateValid = 'deadbeef';
        await cb(ctx, {
            headers: { host: 'h', cookie: `gh_oauth_state=${stateValid}` },
            query: { code: 'bad', state: `${stateValid}.${Buffer.from('/').toString('base64url')}` }
        });
        assert.ok(ctx.res.headers.Location.includes('error=bad_verification_code'), 'callback: surfaces GitHub error');
        console.log('  ✓ callback: GitHub error surfaces as ?oauth_error=…');
    } finally {
        global.fetch = realFetch;
    }

    console.log('\nAll OAuth flow tests passed.');
}

run().catch((e) => {
    console.error('TEST FAILED:', e);
    process.exit(1);
});
