(function () {
    'use strict';

    const DEFAULT_BOOTSTRAPPER_URL = 'https://oc-cdn-ocprod.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js';
    const WIDGET_SCRIPT_ID = 'Microsoft_Omnichannel_LCWidget';

    function findWidgetScript(lcwCode) {
        if (!lcwCode || !lcwCode.trim()) return null;

        const parser = new DOMParser();
        const documentFragment = parser.parseFromString(lcwCode, 'text/html');
        return documentFragment.querySelector(`script#${WIDGET_SCRIPT_ID}`) ||
            documentFragment.querySelector('script[data-app-id][data-org-id][data-org-url]');
    }

    function buildWidgetScript(config) {
        const sourceScript = findWidgetScript(config.lcwCode);
        const widgetScript = document.createElement('script');

        if (sourceScript) {
            Array.from(sourceScript.attributes).forEach(attribute => {
                widgetScript.setAttribute(attribute.name, attribute.value);
            });
        } else if (config.widgetId && config.orgId && config.orgUrl) {
            widgetScript.src = DEFAULT_BOOTSTRAPPER_URL;
            widgetScript.setAttribute('data-app-id', config.widgetId);
            widgetScript.setAttribute('data-lcw-version', 'prod');
            widgetScript.setAttribute('data-org-id', config.orgId);
            widgetScript.setAttribute('data-org-url', config.orgUrl);
        } else {
            return null;
        }

        widgetScript.id = WIDGET_SCRIPT_ID;
        widgetScript.async = true;
        return widgetScript;
    }

    function configureAuthentication(config, pageName) {
        if (config.enableStandardAuth !== true || typeof Microsoft === 'undefined') return;

        Microsoft.Omnichannel.LiveChatWidget.SDK.setContextProvider(function contextProvider() {
            const authName = config.standardAuthName || 'Anonymous User';
            const authEmail = config.standardAuthEmail || 'anonymous@example.com';
            console.log(`Standard widget authentication enabled on ${pageName}`, { authName, authEmail });

            return {
                emailaddress1: authEmail,
                Name: { value: authName, isDisplayable: true },
                Authenticated: { value: 'Authenticated', isDisplayable: true }
            };
        });
    }

    function load(config, options) {
        const pageName = options && options.pageName ? options.pageName : 'demo page';
        const widgetScript = buildWidgetScript(config);

        if (!widgetScript || !widgetScript.src) {
            console.warn('Standard widget requires a valid LCW embed code or widget connection values.');
            if (options && typeof options.onMissingConfiguration === 'function') {
                options.onMissingConfiguration();
            }
            return false;
        }

        window.addEventListener('lcw:ready', function handleLivechatReadyEvent() {
            console.log(`D365 LCW ready on ${pageName}`);
            configureAuthentication(config, pageName);
        }, { once: true });

        widgetScript.addEventListener('load', function () {
            console.log(`D365 LCW bootstrapper loaded on ${pageName}`);
        }, { once: true });
        widgetScript.addEventListener('error', function () {
            console.error(`Failed to load the D365 LCW bootstrapper on ${pageName}: ${widgetScript.src}`);
        }, { once: true });

        document.head.appendChild(widgetScript);
        return true;
    }

    window.D365StandardWidgetLoader = { load };
}());