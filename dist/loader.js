/**
 * D365 Modern Chat Widget - Loader
 * Tiny loader script that fetches config from user's Gist and initializes widget
 * 
 * Usage in embed code:
 * <script>var D365WidgetGist="GIST_ID";</script>
 * <script src="https://YOUR_DOMAIN/loader.js"></script>
 * 
 * Or with inline config:
 * <script>
 * var D365WidgetConfig = { orgId: "...", orgUrl: "...", widgetId: "...", ... };
 * </script>
 * <script src="https://YOUR_DOMAIN/loader.js"></script>
 */
(function() {
  'use strict';
  
  var WIDGET_CORE_URL = 'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/widget-core.js';
  
  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = function() {
      console.error('D365 Widget: Failed to load', url);
    };
    document.head.appendChild(script);
  }
  
  function initWidget() {
    // Config is already set, load the widget core
    loadScript(WIDGET_CORE_URL, function() {
      console.log('D365 Widget: Core loaded');
    });
  }
  
  // Check if config is provided inline
  if (window.D365WidgetConfig) {
    initWidget();
    return;
  }
  
  // Check if Gist ID is provided
  if (window.D365WidgetGist) {
    var gistId = window.D365WidgetGist;
    var configUrl = 'https://gist.githubusercontent.com/raw/' + gistId + '/config.json';
    
    // Try to fetch from Gist
    fetch(configUrl)
      .then(function(res) {
        if (!res.ok) throw new Error('Gist not found');
        return res.json();
      })
      .then(function(config) {
        window.D365WidgetConfig = config;
        initWidget();
      })
      .catch(function(err) {
        console.error('D365 Widget: Failed to load config from Gist', err);
        // Try alternate URL format
        var altUrl = 'https://api.github.com/gists/' + gistId;
        fetch(altUrl)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.files && data.files['config.json']) {
              window.D365WidgetConfig = JSON.parse(data.files['config.json'].content);
              initWidget();
            }
          })
          .catch(function(e) {
            console.error('D365 Widget: Could not load config', e);
          });
      });
    return;
  }
  
  console.error('D365 Widget: No config provided. Set D365WidgetConfig or D365WidgetGist');
})();
