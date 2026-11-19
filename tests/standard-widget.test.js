'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('        const NSW_BOOTSTRAPPER');
const end = html.indexOf('        function updateFontPreview', start);
assert.ok(start >= 0 && end > start);
const loader = fs.readFileSync(path.join(__dirname, '..', 'standard-widget-loader.js'), 'utf8');
const connection = { widgetId: 'test-app', orgId: 'test-org', orgUrl: 'https://org.example.test' };
const contact = { Name: { value: 'Test Customer', isDisplayable: true }, emailaddress1: { value: 'customer@example.test', isDisplayable: true } };

function generator(enabled = true, name = 'Test Customer', email = 'customer@example.test') {
    const fields = {
        enableStandardAuth: { checked: enabled },
        standardAuthName: { value: name },
        standardAuthEmail: { value: email }
    };
    const context = vm.createContext({
        settings: { ...connection, enableStandardAuth: false, standardAuthName: 'stale name' },
        document: { readyState: 'loading', addEventListener() {}, getElementById(id) { return fields[id] || null; } }
    });
    vm.runInContext(html.slice(start, end), context);
    return { context, config: context.nswGather() };
}

function page() {
    const listeners = new Map();
    const scripts = [];
    const providers = [];
    const warnings = [];
    const events = [];
    const window = {
        Microsoft: { Omnichannel: { LiveChatWidget: { SDK: { setContextProvider(provider) { providers.push(provider); } } } } },
        addEventListener(name, callback, options) {
            const handlers = listeners.get(name) || [];
            handlers.push({ callback, once: options && options.once });
            listeners.set(name, handlers);
        }
    };
    function ready() {
        events.push('ready');
        const handlers = listeners.get('lcw:ready') || [];
        listeners.set('lcw:ready', handlers.filter(handler => !handler.once));
        handlers.forEach(handler => handler.callback());
    }
    const document = {
        getElementById(id) { return scripts.find(script => script.id === id) || null; },
        createElement() {
            return {
                attributes: {}, textContent: '',
                setAttribute(key, value) { this.attributes[key] = value; if (key === 'id') this.id = value; },
                addEventListener() {}
            };
        }
    };
    const context = vm.createContext({
        window, document,
        localStorage: { getItem() { return null; } },
        console: { log() {}, warn(...args) { warnings.push(args); }, error(...args) { warnings.push(args); } }
    });
    document.body = document.documentElement = {
        appendChild(script) {
            scripts.push(script);
            if (script.textContent) vm.runInContext(script.textContent, context);
            if (script.src || script.attributes.src) ready();
        }
    };
    return { context, window, document, scripts, providers, warnings, events, ready };
}

function runEmbed(embed, target) {
    const tags = [...embed.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    for (const [, attributes, source] of tags) {
        if (/\bsrc=/.test(attributes)) target.ready();
        else vm.runInContext(source, target.context);
    }
    return tags;
}

function suppliedContext(target) {
    assert.equal(target.providers.length, 1, 'register one context provider after the widget is ready');
    return JSON.parse(JSON.stringify(target.providers[0]()));
}

test('NextGen gathering reads current contact controls, not stale debounced settings', () => {
    const { config } = generator(true, ' Test Customer ', ' customer@example.test ');
    assert.equal(config.enableStandardAuth, true);
    assert.equal(config.standardAuthName, 'Test Customer');
    assert.equal(config.standardAuthEmail, 'customer@example.test');
});

test('embed registers displayable name and email before an immediately ready bootstrapper', () => {
    const { context, config } = generator();
    const embed = context.nswGenerate(config, null);
    const target = page();
    assert.equal(runEmbed(embed, target).length, 2);
    assert.deepEqual(suppliedContext(target), contact);
    target.ready();
    assert.equal(target.providers.length, 1);
});

test('contact strings cannot close the inline embed script or execute code', () => {
    const name = 'Test </script><script>window.injected = true;</script> "Customer"';
    const { context, config } = generator(true, name);
    const target = page();
    assert.equal(runEmbed(context.nswGenerate(config, null), target).length, 2);
    assert.equal(suppliedContext(target).Name.value, name);
    assert.equal(target.window.injected, undefined);
});

test('disabled contact context is absent from both exports, even when fields contain values', () => {
    const { context, config } = generator(false);
    const embed = context.nswGenerate(config, null);
    const userscript = context.nswGenerateTampermonkey(config, null);
    for (const output of [embed, userscript]) {
        assert.ok(!output.includes('customer@example.test'));
        assert.ok(!output.includes('Test Customer'));
        assert.ok(!output.includes('setContextProvider'));
    }
    const target = page();
    assert.equal(runEmbed(embed, target).length, 1);
    assert.equal(target.providers.length, 0);
});

test('empty optional fields are not replaced with anonymous identities or authenticated markers', () => {
    const { context, config } = generator(true, '', 'customer@example.test');
    const target = page();
    runEmbed(context.nswGenerate(config, null), target);
    assert.deepEqual(suppliedContext(target), { emailaddress1: contact.emailaddress1 });
});

for (const useGM of [false, true]) {
    test(`userscript configures page-realm context before loading the widget (${useGM ? 'GM_addElement' : 'DOM fallback'})`, () => {
        const { context, config } = generator();
        const target = page();
        if (useGM) {
            target.context.GM_addElement = (parent, tag, attributes) => {
                const script = target.document.createElement(tag);
                for (const [key, value] of Object.entries(attributes)) {
                    if (key === 'textContent') script.textContent = value;
                    else script.setAttribute(key, value);
                }
                parent.appendChild(script);
            };
        }
        vm.runInContext(context.nswGenerateTampermonkey(config, null), target.context);
        assert.deepEqual(suppliedContext(target), contact);
        assert.equal(target.events.length, 1);
    });
}

test('enabled context reports an unavailable SDK instead of claiming authentication succeeded', () => {
    const { context, config } = generator();
    const target = page();
    delete target.window.Microsoft;
    runEmbed(context.nswGenerate(config, null), target);
    assert.equal(target.warnings.length, 1);
    assert.equal(target.providers.length, 0);
});

test('demo loader uses the same displayable context shape without an authentication claim', () => {
    const target = page();
    vm.runInContext(loader, target.context);
    assert.equal(target.window.D365StandardWidgetLoader.load({
        ...connection, enableStandardAuth: true, standardAuthName: 'Test Customer', standardAuthEmail: 'customer@example.test'
    }), true);
    assert.deepEqual(suppliedContext(target), contact);
});

test('demo loader does not invent contact data for blank fields or enable disabled context', () => {
    for (const enabled of [false, true]) {
        const target = page();
        vm.runInContext(loader, target.context);
        target.window.D365StandardWidgetLoader.load({ ...connection, enableStandardAuth: enabled });
        assert.equal(target.providers.length, enabled ? 1 : 0);
        for (const provider of target.providers) assert.deepEqual(JSON.parse(JSON.stringify(provider())), {});
    }
});
