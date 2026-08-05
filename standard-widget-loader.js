(function () {
    'use strict';

    const NEXTGEN_BOOTSTRAPPER_URL = 'https://oc-cdn-ocprod.azureedge.net/livechatwidget/v3/scripts/NextGenLiveChatBootstrapper.js';
    const WIDGET_SCRIPT_ID = 'Microsoft_Omnichannel_LCWidget';
    const NEXTGEN_SETTINGS_KEY = 'nsw-config-v1';
    // Attributes this loader derives itself; anything else on the pasted embed is copied through.
    const MANAGED_ATTRIBUTES = [
        'id', 'src', 'async', 'onerror', 'data-app-id', 'data-lcw-version', 'data-org-id',
        'data-org-url', 'data-locale', 'data-hide-button', 'data-custom-font-url',
        'data-disable-telemetry', 'data-color-override', 'data-font-family-override',
        'data-customization-callback'
    ];

    function findWidgetScript(lcwCode) {
        if (!lcwCode || !lcwCode.trim()) return null;

        const parser = new DOMParser();
        const documentFragment = parser.parseFromString(lcwCode, 'text/html');
        return documentFragment.querySelector(`script#${WIDGET_SCRIPT_ID}`) ||
            documentFragment.querySelector('script[data-app-id][data-org-id][data-org-url]');
    }

    function readNextGenSettings() {
        try {
            return JSON.parse(localStorage.getItem(NEXTGEN_SETTINGS_KEY) || '{}') || {};
        } catch (error) {
            console.warn('Ignoring unreadable New Standard Widget settings.', error);
            return {};
        }
    }

    function buildBrand(value, isDisabled) {
        const brand = {};
        if (value('nsw-brand-name')) brand.brandName = value('nsw-brand-name');
        if (value('nsw-logo-url')) brand.logoUrl = value('nsw-logo-url');

        const colors = {};
        if (value('nsw-primary')) colors.primary = value('nsw-primary');
        if (value('nsw-header-text')) colors.headerText = value('nsw-header-text');
        if (value('nsw-btn-color')) colors.chatButtonColor = value('nsw-btn-color');
        if (value('nsw-user-bg')) colors.userMessageBackground = value('nsw-user-bg');
        if (value('nsw-user-text')) colors.userMessageText = value('nsw-user-text');
        if (value('nsw-agent-bg')) colors.agentMessageBackground = value('nsw-agent-bg');
        if (value('nsw-agent-text')) colors.agentMessageText = value('nsw-agent-text');
        if (Object.keys(colors).length) brand.colors = colors;

        const typography = {};
        if (value('nsw-font')) typography.fontFamily = value('nsw-font');
        if (value('nsw-input-font-size')) typography.inputFontSize = value('nsw-input-font-size');
        if (Object.keys(typography).length) brand.typography = typography;

        const text = {};
        if (value('nsw-header-title')) text.headerTitle = value('nsw-header-title');
        if (value('nsw-greeting-title')) text.greetingTitle = value('nsw-greeting-title');
        if (value('nsw-greeting-sub')) text.greetingSubtitle = value('nsw-greeting-sub');
        if (value('nsw-input-placeholder')) text.inputPlaceholder = value('nsw-input-placeholder');
        if (value('nsw-chat-btn-label')) text.chatButtonLabel = value('nsw-chat-btn-label');
        if (value('nsw-disclaimer')) text.disclaimerText = value('nsw-disclaimer');
        if (value('nsw-privacy-url')) text.privacyUrl = value('nsw-privacy-url');
        if (value('nsw-privacy-text')) text.privacyLinkText = value('nsw-privacy-text');
        if (Object.keys(text).length) brand.text = text;

        const sizing = {};
        if (value('nsw-width')) sizing.widgetWidth = value('nsw-width');
        if (value('nsw-height')) sizing.widgetHeight = value('nsw-height');
        if (value('nsw-btn-size')) sizing.chatButtonSize = value('nsw-btn-size');
        if (Object.keys(sizing).length) brand.sizing = sizing;

        const display = {};
        if (isDisabled('nsw-landing')) display.showLandingPage = false;
        if (isDisabled('nsw-avatar')) display.showAgentAvatar = false;
        if (isDisabled('nsw-agent-name')) display.showAgentName = false;
        if (value('nsw-powered-by')) display.poweredByText = value('nsw-powered-by');
        if (Object.keys(display).length) brand.display = display;

        return Object.keys(brand).length ? brand : null;
    }

    function buildWidgetScript(config) {
        const sourceScript = findWidgetScript(config.lcwCode);
        const sourceAttribute = name => (sourceScript ? sourceScript.getAttribute(name) : null);

        // The pasted D365 embed may still be the legacy widget, so take only its IDs.
        const appId = config.widgetId || sourceAttribute('data-app-id');
        const orgId = config.orgId || sourceAttribute('data-org-id');
        const orgUrl = config.orgUrl || sourceAttribute('data-org-url');
        if (!appId || !orgId || !orgUrl) return null;

        const settings = readNextGenSettings();
        const value = key => {
            const setting = settings[key];
            return setting === undefined || setting === null ? '' : String(setting).trim();
        };
        const isEnabled = key => settings[key] === true;
        const isDisabled = key => settings[key] === false;

        const widgetScript = document.createElement('script');

        if (sourceScript) {
            Array.from(sourceScript.attributes).forEach(attribute => {
                if (MANAGED_ATTRIBUTES.indexOf(attribute.name) === -1) {
                    widgetScript.setAttribute(attribute.name, attribute.value);
                }
            });
        }

        widgetScript.src = NEXTGEN_BOOTSTRAPPER_URL;
        widgetScript.setAttribute('data-app-id', appId);
        widgetScript.setAttribute('data-lcw-version', value('nsw-lcw-version') || sourceAttribute('data-lcw-version') || 'prod');
        widgetScript.setAttribute('data-org-id', orgId);
        widgetScript.setAttribute('data-org-url', orgUrl);

        const brand = buildBrand(value, isDisabled);
        if (!brand && value('nsw-primary')) widgetScript.setAttribute('data-color-override', value('nsw-primary'));
        if (!brand && value('nsw-font')) widgetScript.setAttribute('data-font-family-override', value('nsw-font'));
        if (value('nsw-locale')) widgetScript.setAttribute('data-locale', value('nsw-locale'));
        if (isEnabled('nsw-hide-button')) widgetScript.setAttribute('data-hide-button', 'true');
        if (value('nsw-custom-font-url')) widgetScript.setAttribute('data-custom-font-url', value('nsw-custom-font-url'));
        if (isEnabled('nsw-no-telemetry')) widgetScript.setAttribute('data-disable-telemetry', 'true');
        if (brand) widgetScript.setAttribute('data-customization-callback', JSON.stringify(brand));

        widgetScript.id = WIDGET_SCRIPT_ID;
        widgetScript.async = true;
        return widgetScript;
    }

    function configureAuthentication(config, pageName) {
        if (config.enableStandardAuth !== true) return;

        const omnichannel = window.Microsoft && window.Microsoft.Omnichannel;
        const sdk = omnichannel && omnichannel.LiveChatWidget && omnichannel.LiveChatWidget.SDK;
        if (!sdk || typeof sdk.setContextProvider !== 'function') {
            console.warn(`Context provider is unavailable on ${pageName}; skipping authentication.`);
            return;
        }

        sdk.setContextProvider(function contextProvider() {
            return {
                emailaddress1: config.standardAuthEmail || 'anonymous@example.com',
                Name: { value: config.standardAuthName || 'Anonymous User', isDisplayable: true },
                Authenticated: { value: 'Authenticated', isDisplayable: true }
            };
        });
    }

    function load(config, options) {
        const pageName = options && options.pageName ? options.pageName : 'demo page';
        const widgetScript = buildWidgetScript(config);

        if (!widgetScript) {
            console.warn('New Standard Widget needs App ID / Org ID / Org URL — set a Widget Profile in the studio.');
            if (options && typeof options.onMissingConfiguration === 'function') {
                options.onMissingConfiguration();
            }
            return false;
        }

        window.addEventListener('lcw:ready', function handleLivechatReadyEvent() {
            console.log(`New Standard Widget ready on ${pageName}`);
            configureAuthentication(config, pageName);
        }, { once: true });

        widgetScript.addEventListener('error', function () {
            console.error(`Failed to load the New Standard Widget bootstrapper on ${pageName}: ${widgetScript.src}`);
        }, { once: true });

        (document.body || document.head).appendChild(widgetScript);
        console.log(`New Standard Widget injected on ${pageName}`);
        return true;
    }

    window.D365StandardWidgetLoader = { load };
}());