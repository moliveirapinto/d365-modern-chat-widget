'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const generatorStart = html.indexOf('        function generateTamperMonkeyScript(');
const generatorEnd = html.indexOf('        // ============ USER MANAGEMENT', generatorStart);
assert.ok(generatorStart >= 0 && generatorEnd > generatorStart);
const generatorContext = vm.createContext({ settings: { headerTitle: 'Test' } });
vm.runInContext(html.slice(generatorStart, generatorEnd), generatorContext);
const userscript = generatorContext.generateTamperMonkeyScript({}, '{}', 'https://example.test/*');
new vm.Script(userscript);
const proxyStart = userscript.indexOf('  var PROXY_HOSTS');
const proxyEnd = userscript.indexOf('  // --- Pre-fetch config images', proxyStart);
assert.ok(proxyStart >= 0 && proxyEnd > proxyStart);
const proxySource = userscript.slice(proxyStart, proxyEnd);
const chatUrl = 'https://test.communication.azure.com/chat/threads/test/messages';

class NativeXHR extends EventTarget {
    constructor() {
        super();
        this.state = { readyState: 0, status: 0, statusText: '', responseText: '', response: '', responseURL: '', responseXML: null };
        this.responseType = '';
        this.timeout = 0;
        this.withCredentials = false;
        this.upload = new EventTarget();
        this.headers = {};
    }
    open(method, url) {
        this.method = method;
        this.url = String(url);
        this.state.readyState = 1;
        this.dispatchEvent(new Event('readystatechange'));
    }
    send(body) {
        this.body = body;
        this.state = { ...this.state, readyState: 4, status: 200, responseText: 'host response', response: 'host response', responseURL: this.url };
        this.dispatchEvent(new Event('readystatechange'));
        this.dispatchEvent(new Event('load'));
        this.dispatchEvent(new Event('loadend'));
    }
    abort() {
        this.state.readyState = 0;
    }
    setRequestHeader(name, value) {
        this.headers[name] = value;
    }
    getAllResponseHeaders() {
        return 'Content-Type: text/plain\r\n';
    }
    getResponseHeader(name) {
        return name.toLowerCase() === 'content-type' ? 'text/plain' : null;
    }
    overrideMimeType() {}
}
for (const key of ['readyState', 'status', 'statusText', 'responseText', 'response', 'responseURL', 'responseXML']) {
    Object.defineProperty(NativeXHR.prototype, key, { configurable: true, get() { return this.state[key]; } });
}
for (const [index, name] of ['UNSENT', 'OPENED', 'HEADERS_RECEIVED', 'LOADING', 'DONE'].entries()) {
    NativeXHR[name] = index;
}
for (const type of ['readystatechange', 'loadstart', 'progress', 'load', 'error', 'abort', 'timeout', 'loadend']) {
    Object.defineProperty(NativeXHR.prototype, 'on' + type, {
        configurable: true,
        get() { return this['handler_' + type] || null; },
        set(handler) {
            if (this['handler_' + type]) this.removeEventListener(type, this['handler_' + type]);
            this['handler_' + type] = handler;
            if (typeof handler === 'function') this.addEventListener(type, handler);
        }
    });
}

function setup(gmBehavior) {
    const requests = [];
    const warnings = [];
    const logs = [];
    const timers = new Map();
    let timerId = 0;
    const nativeFetch = async () => new Response('native fetch response');
    const pageWindow = {
        XMLHttpRequest: NativeXHR, URL, Request, Response, Event, EventTarget, DOMException, TypeError,
        fetch: nativeFetch, D365TM: {}
    };
    const context = vm.createContext({
        pageWindow,
        Blob,
        console: { log(...args) { logs.push(args); }, warn(...args) { warnings.push(args); }, error(...args) { warnings.push(args); } },
        setTimeout(fn, ms) { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
        clearTimeout(id) { timers.delete(id); },
        GM_xmlhttpRequest(options) {
            const request = { options, aborted: false };
            requests.push(request);
            if (gmBehavior) gmBehavior(options, request);
            return { abort() { request.aborted = true; if (options.onabort) options.onabort(); } };
        }
    });
    vm.runInContext(proxySource, context);
    return {
        pageWindow, requests, warnings, logs, timers, nativeFetch,
        runTimers(ms) {
            for (const [id, timer] of [...timers]) {
                if (timer.ms <= ms) { timers.delete(id); timer.fn(); }
            }
        }
    };
}

function respond(options, status = 201) {
    options.onload({
        status, statusText: 'Created', finalUrl: chatUrl,
        responseHeaders: 'Content-Type: application/json\r\nX-Request-Id: test\r\n',
        responseText: '{"id":"message-1"}',
        response: new TextEncoder().encode('{"id":"message-1"}').buffer
    });
}

test('host XHR stays a native object and supplies native event targets to instrumentation', () => {
    const { pageWindow, requests, warnings } = setup();
    const xhr = new pageWindow.XMLHttpRequest();
    assert.ok(xhr instanceof NativeXHR);
    assert.ok(xhr instanceof pageWindow.XMLHttpRequest);
    const events = [];
    xhr.onreadystatechange = event => {
        assert.equal(event.target, xhr);
        assert.equal(event.currentTarget, xhr);
        events.push(event.target.status);
    };
    xhr.open('GET', 'https://customer.test/bootstrap');
    xhr.send();
    assert.deepEqual(events, [0, 200]);
    assert.equal(xhr.responseText, 'host response');
    assert.equal(requests.length, 0);
    assert.equal(warnings.length, 0);
});

test('proxied POST delivers status, headers, response and correctly targeted native events', () => {
    const { pageWindow, requests, warnings } = setup();
    const xhr = new pageWindow.XMLHttpRequest();
    const states = [];
    let loads = 0;
    xhr.addEventListener('readystatechange', event => {
        assert.equal(event.target, xhr);
        assert.equal(event.currentTarget, xhr);
        states.push(xhr.readyState);
    });
    xhr.addEventListener('load', () => { loads++; }, { once: true });
    xhr.open('POST', chatUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('{"content":"hello"}');
    respond(requests[0].options);
    assert.deepEqual(states, [1, 2, 3, 4]);
    assert.equal(xhr.status, 201);
    assert.equal(xhr.getResponseHeader('content-type'), 'application/json');
    assert.equal(xhr.responseText, '{"id":"message-1"}');
    xhr.dispatchEvent(new Event('load'));
    assert.equal(loads, 1);
    assert.equal(warnings.length, 0);
});

test('a completed proxied XHR can be reused for an unmodified host request', () => {
    const { pageWindow, requests } = setup();
    const xhr = new pageWindow.XMLHttpRequest();
    xhr.open('POST', chatUrl);
    xhr.send('hello');
    respond(requests[0].options);
    xhr.open('GET', 'https://customer.test/article');
    xhr.send();
    assert.equal(xhr.status, 200);
    assert.equal(xhr.responseText, 'host response');
    assert.equal(xhr.getResponseHeader('content-type'), 'text/plain');
    assert.equal(requests.length, 1);
});

test('Trouter push long-polls still bypass the GM bridge', () => {
    const { pageWindow, requests } = setup();
    const xhr = new pageWindow.XMLHttpRequest();
    xhr.open('GET', 'https://pub.trouter.teams.microsoft.com/socket.io/1/xhr-polling/session');
    xhr.send();
    assert.equal(xhr.responseText, 'host response');
    assert.equal(requests.length, 0);
});

test('fetch preserves POST data and HTTP error responses for the SDK', async () => {
    const { pageWindow, requests } = setup(options => queueMicrotask(() => respond(options, 401)));
    const response = await pageWindow.fetch(chatUrl, { method: 'POST', body: '{"content":"hello"}', headers: new Headers({ 'Content-Type': 'application/json' }) });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('content-type'), 'application/json');
    assert.equal(await response.text(), '{"id":"message-1"}');
    assert.equal(requests[0].options.data, '{"content":"hello"}');
    assert.equal(requests[0].options.headers['content-type'], 'application/json');
});

test('fetch(Request) serializes JSON bytes into a supported Blob instead of forwarding a stream', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    const content = '{"content":"hello \u00e9"}';
    const request = new Request(chatUrl, {
        method: 'POST', body: content,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' }
    });
    const response = await harness.pageWindow.fetch(request);
    const options = harness.requests[0].options;
    assert.equal(response.status, 201);
    assert.ok(options.data instanceof Blob, 'GM must receive a supported Blob, never Request.body');
    assert.equal(await options.data.text(), content);
    assert.equal(options.data.type, 'application/json');
    assert.equal(options.method, 'POST');
    assert.equal(options.url, chatUrl);
    assert.equal(options.headers.authorization, 'Bearer test-token');
    const diagnostic = harness.logs.flat().join(' ');
    assert.ok(!diagnostic.includes(content));
    assert.ok(!diagnostic.includes('test-token'));
});

test('fetch(Request, init) honors body, method and header overrides', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    const request = new Request(chatUrl, { method: 'POST', body: 'original', headers: { 'X-Old': 'old' } });
    await harness.pageWindow.fetch(request, { method: 'PUT', body: 'replacement', headers: { 'X-New': 'new' } });
    const options = harness.requests[0].options;
    assert.equal(options.method, 'PUT');
    assert.equal(options.data, 'replacement');
    assert.equal(options.headers['x-new'], 'new');
    assert.equal(options.headers['x-old'], undefined);
    assert.match(options.headers['content-type'], /^text\/plain/);
    await request.body.cancel();
});

test('binary BodyInit data preserves every byte in a supported Blob', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    const bytes = new Uint8Array([0, 255, 1, 233]);
    await harness.pageWindow.fetch(chatUrl, { method: 'POST', body: bytes });
    const body = harness.requests[0].options.data;
    assert.ok(body instanceof Blob);
    assert.deepEqual(new Uint8Array(await body.arrayBuffer()), bytes);
});

test('URL inputs and URLSearchParams bodies use native request serialization', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    await harness.pageWindow.fetch(new URL(chatUrl), { method: 'POST', body: new URLSearchParams({ message: 'hello world' }) });
    assert.equal(harness.requests.length, 1);
    const options = harness.requests[0].options;
    assert.ok(options.data instanceof Blob);
    assert.equal(await options.data.text(), 'message=hello+world');
    assert.match(options.headers['content-type'], /^application\/x-www-form-urlencoded/);
});

test('multipart Request bodies retain the native boundary and content bytes', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    const form = new FormData();
    form.append('message', 'hello');
    const request = new Request(chatUrl, { method: 'POST', body: form });
    const expected = await request.clone().arrayBuffer();
    const contentType = request.headers.get('content-type');
    await harness.pageWindow.fetch(request);
    const options = harness.requests[0].options;
    assert.ok(options.data instanceof Blob);
    assert.equal(options.headers['content-type'], contentType);
    assert.deepEqual(new Uint8Array(await options.data.arrayBuffer()), new Uint8Array(expected));
});

test('body read failures reject explicitly before starting a GM request', async () => {
    const harness = setup(options => queueMicrotask(() => respond(options)));
    const request = new Request(chatUrl, {
        method: 'POST', duplex: 'half',
        body: new ReadableStream({ start(controller) { controller.error(new Error('body read failed')); } })
    });
    await assert.rejects(harness.pageWindow.fetch(request), /body read failed/);
    assert.equal(harness.requests.length, 0);
    assert.equal(harness.timers.size, 0);
    assert.ok(harness.warnings.length > 0);
});

test('cancelling while preparing a streamed body stops its reader and never starts GM', async () => {
    const harness = setup();
    const controller = new AbortController();
    let cancelled = false;
    const request = new Request(chatUrl, {
        method: 'POST', duplex: 'half', signal: controller.signal,
        body: new ReadableStream({ cancel() { cancelled = true; } })
    });
    const result = harness.pageWindow.fetch(request);
    const rejected = assert.rejects(result, error => error.name === 'AbortError');
    await new Promise(setImmediate);
    controller.abort();
    await rejected;
    await new Promise(setImmediate);
    assert.equal(cancelled, true);
    assert.equal(harness.requests.length, 0);
    assert.equal(harness.timers.size, 0);
});

test('the request watchdog also bounds stalled body preparation', async () => {
    const harness = setup();
    let cancelled = false;
    const request = new Request(chatUrl, {
        method: 'POST', duplex: 'half',
        body: new ReadableStream({ cancel() { cancelled = true; } })
    });
    const rejected = assert.rejects(harness.pageWindow.fetch(request), /timed out/i);
    await new Promise(setImmediate);
    harness.runTimers(30000);
    await rejected;
    await new Promise(setImmediate);
    assert.equal(cancelled, true);
    assert.equal(harness.requests.length, 0);
    assert.equal(harness.timers.size, 0);
});

test('aborting an SDK fetch aborts the GM request and rejects instead of hanging', async () => {
    const { pageWindow, requests, timers } = setup();
    const controller = new AbortController();
    let error;
    const result = pageWindow.fetch(chatUrl, { signal: controller.signal }).catch(reason => { error = reason; });
    await new Promise(setImmediate);
    controller.abort();
    await new Promise(setImmediate);
    assert.equal(error && error.name, 'AbortError');
    await result;
    assert.equal(requests[0].aborted, true);
    assert.equal(timers.size, 0);
});

test('a pre-aborted SDK fetch never starts a GM request', async () => {
    const { pageWindow, requests } = setup();
    const controller = new AbortController();
    controller.abort();
    let error;
    const result = pageWindow.fetch(chatUrl, { signal: controller.signal }).catch(reason => { error = reason; });
    await new Promise(setImmediate);
    assert.equal(error && error.name, 'AbortError');
    await result;
    assert.equal(requests.length, 0);
});

test('a silent GM bridge failure times out, aborts and rejects the fetch within 30 seconds', async () => {
    const harness = setup();
    let error;
    const result = harness.pageWindow.fetch(chatUrl).catch(reason => { error = reason; });
    await new Promise(setImmediate);
    harness.runTimers(30000);
    await new Promise(setImmediate);
    assert.ok(error, 'the fetch must reject even if GM never invokes a callback');
    await result;
    assert.match(error.message, /timed out/i);
    assert.equal(harness.requests[0].aborted, true);
    assert.equal(harness.timers.size, 0);
    assert.ok(harness.warnings.length > 0);
});

test('a synchronous GM exception reaches the XHR SDK error listener registered after send', () => {
    const harness = setup(() => { throw new Error('bridge failed'); });
    const xhr = new harness.pageWindow.XMLHttpRequest();
    xhr.open('POST', chatUrl);
    let errorEvent;
    xhr.send('hello');
    xhr.addEventListener('error', event => { errorEvent = event; });
    harness.runTimers(0);
    assert.equal(errorEvent && errorEvent.target, xhr);
    assert.equal(xhr.status, 0);
    assert.equal(xhr.readyState, 4);
    assert.ok(harness.warnings.length > 0);
});

test('XHR bridge silence produces a targeted timeout event and ignores late success', () => {
    const harness = setup();
    const xhr = new harness.pageWindow.XMLHttpRequest();
    const events = [];
    for (const type of ['timeout', 'load', 'loadend']) xhr.addEventListener(type, event => { events.push(event.type); assert.equal(event.target, xhr); });
    xhr.open('POST', chatUrl);
    xhr.send('hello');
    harness.runTimers(30000);
    assert.deepEqual(events, ['timeout', 'loadend']);
    assert.equal(xhr.status, 0);
    respond(harness.requests[0].options);
    assert.deepEqual(events, ['timeout', 'loadend']);
    assert.equal(harness.requests[0].aborted, true);
});

test('aborting during loadstart never sends the POST through the bridge', () => {
    const harness = setup();
    const xhr = new harness.pageWindow.XMLHttpRequest();
    xhr.addEventListener('loadstart', () => xhr.abort());
    xhr.open('POST', chatUrl);
    xhr.send('hello');
    assert.equal(harness.requests.length, 0);
    assert.equal(xhr.readyState, 0);
    assert.equal(harness.timers.size, 0);
});

test('aborting at HEADERS_RECEIVED suppresses loading and success events', () => {
    const harness = setup();
    const xhr = new harness.pageWindow.XMLHttpRequest();
    const events = [];
    xhr.addEventListener('readystatechange', () => {
        events.push('state:' + xhr.readyState);
        if (xhr.readyState === 2) xhr.abort();
    });
    for (const type of ['abort', 'load', 'loadend']) xhr.addEventListener(type, () => events.push(type));
    xhr.open('POST', chatUrl);
    xhr.send('hello');
    respond(harness.requests[0].options);
    assert.deepEqual(events, ['state:1', 'state:2', 'state:4', 'abort', 'loadend']);
    assert.equal(xhr.readyState, 0);
});

test('failed text sends expose the error and clear the waiting indicator', async () => {
    const core = fs.readFileSync(path.join(__dirname, '..', 'dist', 'widget-core.js'), 'utf8');
    const start = core.indexOf('    async function sendMessage()');
    const end = core.indexOf('    // Event listeners', start);
    assert.ok(start >= 0 && end > start);
    const notices = [];
    const errors = [];
    const removedClasses = [];
    const context = vm.createContext({
        input: { value: 'hello' }, userName: 'Test', chatStarted: true, awaitingReply: false,
        chatSDK: { async sendMessage() { throw new Error('bridge failed'); } },
        chatMessages: [], addMessage() {}, boostPolling() {}, saveChatSession() {},
        rememberOwnMessage() { assert.fail('a failed send must not be marked delivered'); },
        addSystemMessage(text) { notices.push(text); },
        console: { error(...args) { errors.push(args); } },
        typing: { classList: { remove(name) { removedClasses.push(name); } } }
    });
    vm.runInContext(core.slice(start, end), context);
    await context.sendMessage();
    assert.equal(context.awaitingReply, false);
    assert.deepEqual(removedClasses, ['active']);
    assert.equal(notices.length, 1);
    assert.match(notices[0], /Failed to send/);
    assert.equal(errors.length, 1);
    assert.match(errors[0][1].message, /bridge failed/);
});
