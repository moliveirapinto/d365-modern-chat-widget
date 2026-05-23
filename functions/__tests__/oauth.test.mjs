/* Offline unit tests for the Cloudflare Pages OAuth Functions.
 * Run: node functions/__tests__/oauth.test.mjs
 *
 * Uses Node 20+ which already provides fetch, Request, Response, btoa, atob,
 * crypto.getRandomValues, TextEncoder/TextDecoder globally — same surface as
 * Cloudflare Workers.
 */
import assert from 'node:assert/strict';
import { onRequestGet as loginHandler } from '../api/github/login.js';
import { onRequestGet as callbackHandler } from '../api/github/callback.js';

function ctx(url, env, extraHeaders) {
    const headers = { 'host': new URL(url).host, ...(extraHeaders || {}) };
    return {
        request: new Request(url, { method: 'GET', headers }),
        env: env || {}
    };
}

function base64url(str) {
    return Buffer.from(str).toString('base64url');
}

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

// ---------- /api/github/login ----------

test('login: missing env -> bounce with oauth_error', async () => {
    const res = await loginHandler(ctx('https://example.com/api/github/login', {}));
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('Location'), '/?oauth_error=not_configured');
});

test('login: redirects to authorize with correct params + state cookie', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'test_client_id' };
    const res = await loginHandler(ctx(
        'https://widget.example.com/api/github/login?return_to=/dashboard', env
    ));
    assert.equal(res.status, 302);
    const loc = res.headers.get('Location');
    const u = new URL(loc);
    assert.equal(u.origin + u.pathname, 'https://github.com/login/oauth/authorize');
    assert.equal(u.searchParams.get('client_id'), 'test_client_id');
    assert.equal(u.searchParams.get('scope'), 'gist read:user');
    assert.equal(u.searchParams.get('redirect_uri'), 'https://widget.example.com/api/github/callback');

    const setCookie = res.headers.get('Set-Cookie');
    const m = /gh_oauth_state=([0-9a-f]+);/.exec(setCookie || '');
    assert.ok(m, 'state cookie set');
    const cookieNonce = m[1];

    const statePayload = u.searchParams.get('state');
    assert.ok(statePayload.includes('.'), 'state has nonce.return format');
    const [nonce, encReturn] = statePayload.split('.');
    assert.equal(nonce, cookieNonce, 'state nonce matches cookie');
    assert.equal(Buffer.from(encReturn, 'base64url').toString(), '/dashboard');
});

test('login: open-redirect attempt collapses return_to to /', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'cid' };
    const res = await loginHandler(ctx(
        'https://widget.example.com/api/github/login?return_to=//evil.example.com/x', env
    ));
    const u = new URL(res.headers.get('Location'));
    const encReturn = u.searchParams.get('state').split('.')[1];
    assert.equal(Buffer.from(encReturn, 'base64url').toString(), '/');
});

// ---------- /api/github/callback ----------

test('callback: missing code -> bounce', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'cid', GITHUB_OAUTH_CLIENT_SECRET: 'sec' };
    const res = await callbackHandler(ctx('https://h.example/api/github/callback', env));
    assert.equal(res.status, 302);
    assert.match(res.headers.get('Location'), /error=missing_params/);
});

test('callback: state mismatch -> bounce', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'cid', GITHUB_OAUTH_CLIENT_SECRET: 'sec' };
    const res = await callbackHandler(ctx(
        `https://h.example/api/github/callback?code=x&state=bbbb.${base64url('/')}`,
        env,
        { 'cookie': 'gh_oauth_state=aaaa' }
    ));
    assert.match(res.headers.get('Location'), /error=state_mismatch/);
});

test('callback: happy path -> #gh_token + #gh_user, state cookie cleared', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'test_client_id', GITHUB_OAUTH_CLIENT_SECRET: 'test_secret' };
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
        if (url === 'https://github.com/login/oauth/access_token') {
            const body = JSON.parse(opts.body);
            assert.equal(body.code, 'happycode');
            assert.equal(body.client_id, 'test_client_id');
            assert.equal(body.client_secret, 'test_secret');
            return new Response(JSON.stringify({
                access_token: 'gho_FAKE_42',
                scope: 'gist,read:user',
                token_type: 'bearer'
            }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        if (url === 'https://api.github.com/user') {
            assert.equal(opts.headers.Authorization, 'token gho_FAKE_42');
            return new Response(JSON.stringify({
                id: 99, login: 'octocat', name: 'Mona', avatar_url: 'https://x/a.png'
            }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        throw new Error('Unexpected fetch URL: ' + url);
    };
    try {
        const stateNonce = 'abc123';
        const res = await callbackHandler(ctx(
            `https://widget.example.com/api/github/callback?code=happycode&state=${stateNonce}.${base64url('/')}`,
            env,
            { 'cookie': `gh_oauth_state=${stateNonce}` }
        ));
        assert.equal(res.status, 302);
        const loc = res.headers.get('Location');
        assert.ok(loc.startsWith('/#'), `expected /# prefix, got ${loc}`);
        const hash = new URLSearchParams(loc.slice(2));
        assert.equal(hash.get('gh_token'), 'gho_FAKE_42');
        const user = JSON.parse(Buffer.from(hash.get('gh_user'), 'base64url').toString());
        assert.deepEqual(user, { id: 99, name: 'Mona', login: 'octocat', avatar: 'https://x/a.png' });

        const setCookie = res.headers.get('Set-Cookie');
        assert.match(setCookie, /gh_oauth_state=; .* Max-Age=0/);
    } finally {
        globalThis.fetch = realFetch;
    }
});

test('callback: GitHub returns error payload -> surfaced as oauth_error', async () => {
    const env = { GITHUB_OAUTH_CLIENT_ID: 'cid', GITHUB_OAUTH_CLIENT_SECRET: 'sec' };
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(
        JSON.stringify({ error: 'bad_verification_code' }),
        { status: 200, headers: { 'content-type': 'application/json' } }
    );
    try {
        const nonce = 'deadbeef';
        const res = await callbackHandler(ctx(
            `https://h.example/api/github/callback?code=bad&state=${nonce}.${base64url('/')}`,
            env,
            { 'cookie': `gh_oauth_state=${nonce}` }
        ));
        assert.match(res.headers.get('Location'), /error=bad_verification_code/);
    } finally {
        globalThis.fetch = realFetch;
    }
});

// ---------- run ----------
for (const t of tests) {
    try {
        await t.fn();
        console.log('  ✓', t.name);
        passed++;
    } catch (e) {
        console.error('  ✗', t.name);
        console.error('    ', e && e.message);
        process.exitCode = 1;
    }
}
console.log(`\n${passed}/${tests.length} tests passed.`);
