/**
 * D365 Modern Chat Widget - Core
 * This is the main widget code that gets loaded via the loader
 * Version: 2.0.0
 */
(function() {
  'use strict';
  
  // Prevent double initialization
  if (window.D365ModernChatWidget) {
    console.log('D365 Widget already initialized');
    return;
  }
  
  window.D365ModernChatWidget = {
    version: '2.0.0',
    initialized: false
  };

  // Get config from global or wait for it
  function getConfig() {
    return window.D365WidgetConfig || {};
  }

  // Icon SVG paths
  var iconPaths = {
    chat_multiple: 'M9.56158 3C5.41944 3 2.06158 6.35786 2.06158 10.5C2.06158 11.6329 2.31325 12.7088 2.76423 13.6734C2.5102 14.6714 2.22638 15.7842 2.03999 16.5147C1.80697 17.428 2.6294 18.2588 3.54374 18.039C4.29396 17.8587 5.44699 17.5819 6.47447 17.337C7.41678 17.7631 8.46241 18 9.56158 18C13.7037 18 17.0616 14.6421 17.0616 10.5C17.0616 6.35786 13.7037 3 9.56158 3ZM3.56158 10.5C3.56158 7.18629 6.24787 4.5 9.56158 4.5C12.8753 4.5 15.5616 7.18629 15.5616 10.5C15.5616 13.8137 12.8753 16.5 9.56158 16.5C8.60084 16.5 7.69487 16.2748 6.89161 15.8749L6.6482 15.7537L6.38368 15.8167C5.46095 16.0363 4.39489 16.2919 3.59592 16.4838C3.79467 15.7047 4.05784 14.6724 4.28601 13.7757L4.35619 13.4998L4.22568 13.2468C3.80145 12.4246 3.56158 11.4914 3.56158 10.5ZM14.5616 21.0001C12.5922 21.0001 10.8001 20.241 9.46191 18.9995C9.49511 18.9999 9.52835 19.0001 9.56163 19.0001C10.2796 19.0001 10.9768 18.911 11.6427 18.7434C12.5067 19.2254 13.5021 19.5001 14.5616 19.5001C15.5223 19.5001 16.4283 19.2748 17.2316 18.8749L17.475 18.7537L17.7395 18.8167C18.6611 19.0361 19.7046 19.2625 20.4162 19.4262C20.2412 18.6757 20.0025 17.6711 19.7747 16.7757L19.7045 16.4999L19.835 16.2469C20.2592 15.4247 20.4991 14.4915 20.4991 13.5001C20.4991 11.3853 19.4051 9.52617 17.7521 8.45761C17.5738 7.73435 17.3028 7.04756 16.9525 6.41052C19.8898 7.42684 21.9991 10.2171 21.9991 13.5001C21.9991 14.6332 21.7473 15.7094 21.2961 16.6741C21.5492 17.6821 21.8054 18.774 21.9679 19.4773C22.1723 20.3623 21.3929 21.1633 20.5005 20.9768C19.7733 20.8248 18.6308 20.581 17.587 20.3367C16.6445 20.763 15.5986 21.0001 14.5616 21.0001Z',
    chat: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z',
    close: 'm4.21 4.387.083-.094a1 1 0 0 1 1.32-.083l.094.083L12 10.585l6.293-6.292a1 1 0 1 1 1.414 1.414L13.415 12l6.292 6.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083L12 13.415l-6.293 6.292a1 1 0 0 1-1.414-1.414L10.585 12 4.293 5.707a1 1 0 0 1-.083-1.32l.083-.094-.083.094Z'
  };

  // Font mappings
  var fontFamilies = {
    'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'inter': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'poppins': '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'open-sans': '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  // Default config
  var defaults = {
    headerTitle: 'Support Chat',
    headerSubtitle: "We're here to help",
    fontFamily: 'system',
    useGradient: true,
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    primaryColor: '#667eea',
    userBubbleColor: '#667eea',
    userTextColor: '#ffffff',
    agentBubbleColor: '#ffffff',
    agentTextColor: '#2d3748',
    chatBgColor: '#f8fafc',
    badgeColor: '#ff4757',
    launcherIcon: 'chat_multiple',
    enablePrechatForm: true,
    welcomeTitle: 'Welcome!',
    welcomeMessage: 'Please fill in your details to start chatting.',
    nameFieldLabel: 'Name *',
    emailFieldLabel: 'Email *',
    startBtnText: 'Start Chat'
  };

  function init() {
    var config = Object.assign({}, defaults, getConfig());
    
    // Validate required D365 settings
    if (!config.orgId || !config.orgUrl || !config.widgetId) {
      console.error('D365 Widget: Missing required config (orgId, orgUrl, widgetId)');
      return;
    }

    var fontFamily = fontFamilies[config.fontFamily] || fontFamilies.system;
    var launcherIcon = iconPaths[config.launcherIcon] || iconPaths.chat_multiple;
    var gradient = config.useGradient ? 
      'linear-gradient(135deg, ' + config.gradientStart + ' 0%, ' + config.gradientEnd + ' 100%)' : 
      config.primaryColor;

    // Inject styles
    injectStyles(config, fontFamily, gradient);
    
    // Inject HTML
    injectHTML(config, launcherIcon, gradient);
    
    // Load dependencies then init widget
    loadDependencies(function() {
      initWidget(config);
    });

    window.D365ModernChatWidget.initialized = true;
  }

  function injectStyles(c, fontFamily, gradient) {
    var css = document.createElement('style');
    css.textContent = [
      '[id^="Microsoft_Omnichannel"],[class^="lcw-"]{display:none!important;visibility:hidden!important}',
      '@keyframes d365pulse{0%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 0 rgba(102,126,234,.4)}50%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 12px rgba(102,126,234,0)}100%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 0 rgba(102,126,234,0)}}',
      '@keyframes d365spin{to{transform:rotate(360deg)}}',
      '@keyframes d365fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes d365bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}',
      '.d365-launcher{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:999999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .3s,box-shadow .3s;background:'+gradient+';animation:d365pulse 2.5s ease-in-out infinite}',
      '.d365-launcher:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(0,0,0,.4);animation:none}',
      '.d365-launcher.open{animation:none}',
      '.d365-launcher svg{width:28px;height:28px;fill:#fff}',
      '.d365-launcher .chat-icon{display:block}.d365-launcher .close-icon{display:none}',
      '.d365-launcher.open .chat-icon{display:none}.d365-launcher.open .close-icon{display:block}',
      '.d365-badge{position:absolute;top:-4px;right:-4px;background:'+c.badgeColor+';color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);transition:all .2s}',
      '.d365-badge.show{opacity:1;transform:scale(1)}',
      '.d365-container{position:fixed;bottom:100px;right:24px;width:400px;height:700px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(20px) scale(.95);transition:all .3s;pointer-events:none;z-index:999998;font-family:'+fontFamily+'}',
      '.d365-container.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}',
      '.d365-header{padding:16px 20px;display:flex;align-items:center;gap:12px;background:'+gradient+'}',
      '.d365-header-avatar{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(255,255,255,.5)}',
      '.d365-header-avatar svg{width:26px;height:26px;fill:#fff}',
      '.d365-header-avatar img{width:100%;height:100%;object-fit:cover}',
      '.d365-header-info{flex:1}',
      '.d365-header-title{color:#fff;font-weight:600;font-size:16px}',
      '.d365-header-status{color:rgba(255,255,255,.8);font-size:12px;margin-top:2px}',
      '.d365-header-actions{display:flex;gap:8px}',
      '.d365-header-btn{background:rgba(255,255,255,.2);border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}',
      '.d365-header-btn:hover{background:rgba(255,255,255,.3)}',
      '.d365-header-btn svg{width:18px;height:18px;fill:#fff}',
      '.d365-body{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}',
      '.d365-prechat{padding:24px;display:flex;flex-direction:column;gap:16px;flex:1;justify-content:center}',
      '.d365-prechat.hidden{display:none}',
      '.d365-form-title{font-size:20px;font-weight:600;color:#2d3748;text-align:center}',
      '.d365-form-subtitle{font-size:14px;color:#718096;text-align:center;margin-bottom:16px}',
      '.d365-form-group{display:flex;flex-direction:column;gap:6px}',
      '.d365-form-group label{font-size:13px;font-weight:500;color:#4a5568}',
      '.d365-form-group input,.d365-form-group textarea{padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit}',
      '.d365-form-group input:focus,.d365-form-group textarea:focus{outline:none;border-color:'+c.primaryColor+';box-shadow:0 0 0 3px '+c.primaryColor+'22}',
      '.d365-form-group textarea{resize:none;min-height:80px}',
      '.d365-start-btn{color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;background:'+gradient+';transition:transform .2s,box-shadow .2s}',
      '.d365-start-btn:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(0,0,0,.2)}',
      '.d365-start-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}',
      '.d365-connecting{display:none;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:16px;padding:24px;text-align:center}',
      '.d365-connecting.active{display:flex}',
      '.d365-spinner{width:48px;height:48px;border:3px solid #e2e8f0;border-top-color:'+c.primaryColor+';border-radius:50%;animation:d365spin 1s linear infinite}',
      '.d365-messages{display:none;flex-direction:column;flex:1;overflow-y:auto;padding:16px;gap:12px;background:'+c.chatBgColor+';scroll-behavior:smooth}',
      '.d365-messages.active{display:flex}',
      '.d365-msg-wrap{display:flex;gap:10px;max-width:85%;animation:d365fadeIn .3s ease;align-items:flex-start}',
      '.d365-msg-wrap.user{flex-direction:row-reverse;align-self:flex-end}',
      '.d365-msg-wrap.agent{align-self:flex-start}',
      '.d365-msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0;overflow:hidden;margin-top:18px;box-shadow:0 2px 6px rgba(0,0,0,.12)}',
      '.d365-msg-avatar.agent{background:linear-gradient(135deg,'+c.gradientStart+' 0%,'+c.gradientEnd+' 100%);color:#fff}',
      '.d365-msg-avatar.bot{background:linear-gradient(135deg,#00b4d8 0%,#0077b6 100%);color:#fff}',
      '.d365-msg-avatar.user{background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);color:#fff}',
      '.d365-msg-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}',
      '.d365-msg-content{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.d365-msg-sender{font-size:12px;font-weight:600;color:#64748b;padding:0 4px}',
      '.d365-msg-wrap.user .d365-msg-sender{text-align:right}',
      '.d365-msg{padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap}',
      '.d365-msg.agent{background:'+c.agentBubbleColor+';color:'+c.agentTextColor+';border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
      '.d365-msg.user{background:'+c.userBubbleColor+';color:'+c.userTextColor+';border-bottom-right-radius:4px}',
      '.d365-msg-time{font-size:10px;color:#94a3b8;padding:0 4px}',
      '.d365-msg-wrap.user .d365-msg-time{text-align:right}',
      '.d365-adaptive-card{background:#fff!important;padding:0!important;overflow:hidden;border-radius:12px}',
      '.d365-adaptive-card .ac-pushButton{padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;border:none;display:block;width:100%;margin-top:8px;background:'+gradient+';color:#fff}',
      '.d365-adaptive-card .ac-pushButton:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.2)}',
      '.d365-adaptive-card .ac-actionSet{display:flex!important;flex-direction:column!important;gap:8px!important}',
      '.d365-hero-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);max-width:280px}',
      '.d365-hero-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.15)}',
      '.d365-hero-card img{width:100%;height:160px;object-fit:cover;background:#f0f4f8}',
      '.d365-hero-card-body{padding:12px}',
      '.d365-hero-card-title{font-size:14px;font-weight:600;color:#1a202c;margin-bottom:4px;line-height:1.3}',
      '.d365-hero-card-subtitle{font-size:12px;color:#64748b;margin-bottom:8px;line-height:1.4}',
      '.d365-hero-card-text{font-size:13px;color:#4a5568;margin-bottom:8px;line-height:1.4}',
      '.d365-hero-card-buttons{display:flex;flex-direction:column;gap:6px}',
      '.d365-hero-card-btn{padding:10px 12px;background:'+gradient+';color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;text-align:center;transition:all .2s}',
      '.d365-hero-card-btn:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(102,126,234,.3)}',
      '.d365-hero-card-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.d365-hero-carousel-wrap{position:relative;width:100%}',
      '.d365-hero-carousel{display:flex;gap:12px;overflow-x:auto;padding:8px 4px;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}',
      '.d365-hero-carousel::-webkit-scrollbar{display:none}',
      '.d365-hero-carousel .d365-hero-card{flex:0 0 auto;scroll-snap-align:start;min-width:220px;max-width:240px}',
      '.d365-carousel-btn{position:absolute;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:#fff;border:none;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all .2s;opacity:.9}',
      '.d365-carousel-btn:hover{background:#f8f9fa;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:1}',
      '.d365-carousel-btn.prev{left:-6px}',
      '.d365-carousel-btn.next{right:-6px}',
      '.d365-carousel-btn svg{width:14px;height:14px;fill:#4a5568}',
      '.d365-suggested-actions{display:flex;flex-direction:column;gap:8px;margin-top:12px}',
      '.d365-suggested-btn{padding:10px 16px;background:'+gradient+';color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;transition:all .2s;font-weight:500;text-align:center}',
      '.d365-suggested-btn:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(102,126,234,.3)}',
      '.d365-suggested-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.d365-typing{display:none;padding:8px 0;align-items:center;gap:8px}',
      '.d365-typing.active{display:flex}',
      '.d365-typing-dots{display:flex;gap:4px;padding:12px 16px;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-left:46px}',
      '.d365-typing-dots span{width:8px;height:8px;background:#a0aec0;border-radius:50%;animation:d365bounce 1.4s infinite ease-in-out}',
      '.d365-typing-dots span:nth-child(1){animation-delay:-.32s}',
      '.d365-typing-dots span:nth-child(2){animation-delay:-.16s}',
      '.d365-input-area{display:none;background:#fff;border-top:1px solid #e2e8f0}',
      '.d365-input-area.active{display:block}',
      '.d365-input-wrap{padding:12px 16px}',
      '.d365-input{width:100%;padding:10px 14px;background:#f1f5f9;border:none;border-radius:12px;font-size:14px;font-family:inherit;outline:none;resize:none;min-height:44px;max-height:120px}',
      '.d365-input:focus{background:#e2e8f0}',
      '.d365-input-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px}',
      '.d365-input-actions{display:flex;gap:8px}',
      '.d365-action-btn{width:36px;height:36px;border-radius:50%;background:#f1f5f9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}',
      '.d365-action-btn:hover{background:#e2e8f0}',
      '.d365-action-btn svg{width:20px;height:20px;fill:#64748b}',
      '.d365-send-btn{width:36px;height:36px;border-radius:50%;background:'+c.primaryColor+';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}',
      '.d365-send-btn:hover{opacity:.9;transform:scale(1.05)}',
      '.d365-send-btn svg{width:18px;height:18px;fill:#fff}',
      '.d365-ended{display:none;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:16px;padding:24px;text-align:center}',
      '.d365-ended.active{display:flex}',
      '.d365-new-btn{color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;background:'+gradient+'}',
      '.d365-confirm{position:absolute;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:200}',
      '.d365-confirm.show{display:flex}',
      '.d365-confirm-box{background:#fff;padding:24px;border-radius:16px;text-align:center;max-width:280px;margin:20px}',
      '.d365-confirm-title{font-size:16px;font-weight:600;color:#2d3748;margin-bottom:8px}',
      '.d365-confirm-text{font-size:14px;color:#64748b;margin-bottom:20px}',
      '.d365-confirm-btns{display:flex;gap:12px;justify-content:center}',
      '.d365-confirm-btn{padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;border:none}',
      '.d365-confirm-btn.cancel{background:#e2e8f0;color:#4a5568}',
      '.d365-confirm-btn.end{background:#ef4444;color:#fff}',
      '.d365-system-msg{text-align:center;padding:8px 16px;color:#64748b;font-size:12px;background:#e2e8f0;border-radius:12px;margin:8px auto;max-width:fit-content}',
      '@media(max-width:480px){.d365-container{width:100%;height:100%;max-height:100%;bottom:0;right:0;border-radius:0}.d365-launcher{bottom:16px;right:16px}}'
    ].join('');
    document.head.appendChild(css);
  }

  function injectHTML(c, launcherIcon, gradient) {
    var html = [
      '<button class="d365-launcher" id="d365Launcher">',
        '<span class="d365-badge" id="d365Badge">0</span>',
        '<svg class="chat-icon" viewBox="0 0 24 24"><path d="'+launcherIcon+'"/></svg>',
        '<svg class="close-icon" viewBox="0 0 24 24"><path d="'+iconPaths.close+'"/></svg>',
      '</button>',
      '<div class="d365-container" id="d365Container">',
        '<div class="d365-header">',
          '<div class="d365-header-avatar">'+(c.headerLogo?'<img src="'+c.headerLogo+'" alt="">':'<svg viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12z"/></svg>')+'</div>',
          '<div class="d365-header-info">',
            '<div class="d365-header-title">'+c.headerTitle+'</div>',
            '<div class="d365-header-status">'+c.headerSubtitle+'</div>',
          '</div>',
          '<div class="d365-header-actions">',
            '<button class="d365-header-btn" id="d365Minimize" title="Minimize"><svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg></button>',
            '<button class="d365-header-btn" id="d365Close" title="Close"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>',
          '</div>',
        '</div>',
        '<div class="d365-body">',
          '<form class="d365-prechat" id="d365Prechat">',
            '<div class="d365-form-title">'+c.welcomeTitle+'</div>',
            '<div class="d365-form-subtitle">'+c.welcomeMessage+'</div>',
            '<div class="d365-form-group"><label>'+c.nameFieldLabel+'</label><input type="text" id="d365Name" required></div>',
            '<div class="d365-form-group"><label>'+c.emailFieldLabel+'</label><input type="email" id="d365Email" required></div>',
            '<div class="d365-form-group"><label>'+(c.questionFieldLabel||'How can we help?')+'</label><textarea id="d365Question"></textarea></div>',
            '<button type="button" class="d365-start-btn" id="d365StartBtn">'+c.startBtnText+'</button>',
          '</form>',
          '<div class="d365-connecting" id="d365Connecting">',
            '<div class="d365-spinner"></div>',
            '<div style="color:#4a5568;font-size:14px">Connecting you with an agent...</div>',
          '</div>',
          '<div class="d365-messages" id="d365Messages">',
            '<div class="d365-typing" id="d365Typing"><div class="d365-typing-dots"><span></span><span></span><span></span></div></div>',
          '</div>',
          '<div class="d365-input-area" id="d365InputArea">',
            '<div class="d365-input-wrap">',
              '<textarea class="d365-input" id="d365Input" placeholder="Type your message..." rows="1"></textarea>',
              '<div class="d365-input-row">',
                '<div class="d365-input-actions">',
                  '<input type="file" id="d365File" style="display:none">',
                  '<button type="button" class="d365-action-btn" id="d365AttachBtn" title="Attach"><svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg></button>',
                  '<button type="button" class="d365-action-btn" id="d365EmojiBtn" title="Emoji"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>',
                '</div>',
                '<button type="button" class="d365-send-btn" id="d365SendBtn" title="Send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>',
              '</div>',
            '</div>',
          '</div>',
          '<div class="d365-ended" id="d365Ended">',
            '<div style="font-size:48px">👋</div>',
            '<div style="font-size:18px;font-weight:600;color:#2d3748">Chat Ended</div>',
            '<div style="font-size:14px;color:#718096">Thank you for chatting!</div>',
            '<button class="d365-new-btn" id="d365NewBtn">Start New Chat</button>',
          '</div>',
        '</div>',
        '<div class="d365-confirm" id="d365Confirm">',
          '<div class="d365-confirm-box">',
            '<div class="d365-confirm-title">End Chat?</div>',
            '<div class="d365-confirm-text">Are you sure you want to end this conversation?</div>',
            '<div class="d365-confirm-btns">',
              '<button class="d365-confirm-btn cancel" id="d365ConfirmNo">Cancel</button>',
              '<button class="d365-confirm-btn end" id="d365ConfirmYes">End Chat</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    var container = document.createElement('div');
    container.id = 'd365WidgetRoot';
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  function loadDependencies(callback) {
    var loaded = 0;
    var total = 2;

    function checkDone() {
      loaded++;
      if (loaded >= total) callback();
    }

    // Load Adaptive Cards - use multiple sources with fallback
    var acSources = [
      'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/adaptivecards.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/adaptivecards/3.0.2/adaptivecards.min.js',
      'https://unpkg.com/adaptivecards@3.0.2/dist/adaptivecards.min.js'
    ];
    var acIndex = 0;

    function loadAC() {
      if (acIndex >= acSources.length) {
        console.warn('D365 Widget: AdaptiveCards failed to load from all sources');
        checkDone();
        return;
      }
      var script = document.createElement('script');
      script.src = acSources[acIndex];
      script.onload = function() {
        console.log('D365 Widget: AdaptiveCards loaded from', acSources[acIndex]);
        checkDone();
      };
      script.onerror = function() {
        console.warn('D365 Widget: AdaptiveCards failed from', acSources[acIndex]);
        acIndex++;
        loadAC();
      };
      document.head.appendChild(script);
    }
    loadAC();

    // Load Chat SDK
    var sdkSources = [
      'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/chat-sdk-bundle.js',
      'https://raw.githubusercontent.com/moliveirapinto/d365-modern-chat-widget/main/dist/chat-sdk-bundle.js'
    ];
    var sdkIndex = 0;

    function loadSDK() {
      if (sdkIndex >= sdkSources.length) {
        console.error('D365 Widget: Failed to load Chat SDK');
        checkDone();
        return;
      }
      var script = document.createElement('script');
      script.src = sdkSources[sdkIndex];
      script.onload = function() {
        console.log('D365 Widget: SDK loaded from', sdkSources[sdkIndex]);
        checkDone();
      };
      script.onerror = function() {
        sdkIndex++;
        loadSDK();
      };
      document.head.appendChild(script);
    }
    loadSDK();
  }

  function initWidget(config) {
    var chatSDK = null, chatStarted = false, userName = '', userEmail = '';
    var processedMsgs = {};
    var unreadCount = 0;

    // DOM refs
    var $ = function(id) { return document.getElementById(id); };
    var launcher = $('d365Launcher');
    var container = $('d365Container');
    var badge = $('d365Badge');
    var prechat = $('d365Prechat');
    var connecting = $('d365Connecting');
    var messages = $('d365Messages');
    var inputArea = $('d365InputArea');
    var typing = $('d365Typing');
    var input = $('d365Input');
    var ended = $('d365Ended');
    var confirm = $('d365Confirm');

    function showView(v) {
      prechat.classList.add('hidden');
      connecting.classList.remove('active');
      messages.classList.remove('active');
      inputArea.classList.remove('active');
      ended.classList.remove('active');
      if (v === 'prechat') prechat.classList.remove('hidden');
      else if (v === 'connecting') connecting.classList.add('active');
      else if (v === 'chat') { messages.classList.add('active'); inputArea.classList.add('active'); }
      else if (v === 'ended') { ended.classList.add('active'); chatStarted = false; }
    }

    function getInitials(name) {
      if (!name) return '?';
      var p = name.trim().split(' ');
      return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
    }

    function formatTime(d) {
      return new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    }

    function isBot(name) {
      if (!name) return false;
      var n = name.toLowerCase();
      return n.includes('bot') || n.includes('copilot') || n.includes('virtual') || n.includes('assistant');
    }

    function addMessage(text, isUser, senderName) {
      var wrap = document.createElement('div');
      wrap.className = 'd365-msg-wrap ' + (isUser ? 'user' : 'agent');

      var avatar = document.createElement('div');
      var avatarType = isUser ? 'user' : (isBot(senderName) ? 'bot' : 'agent');
      avatar.className = 'd365-msg-avatar ' + avatarType;

      if (isUser && config.customerAvatar) avatar.innerHTML = '<img src="'+config.customerAvatar+'">';
      else if (!isUser && isBot(senderName) && config.botAvatar) avatar.innerHTML = '<img src="'+config.botAvatar+'">';
      else if (!isUser && config.agentAvatar) avatar.innerHTML = '<img src="'+config.agentAvatar+'">';
      else avatar.textContent = getInitials(isUser ? userName : senderName);

      var content = document.createElement('div');
      content.className = 'd365-msg-content';
      content.innerHTML = '<div class="d365-msg-sender">'+(isUser?userName:(senderName||'Agent'))+'</div>'+
        '<div class="d365-msg '+(isUser?'user':'agent')+'">'+text+'</div>'+
        '<div class="d365-msg-time">'+formatTime(new Date())+'</div>';

      wrap.appendChild(avatar);
      wrap.appendChild(content);
      typing.parentNode.insertBefore(wrap, typing);
      messages.scrollTop = messages.scrollHeight;

      if (!isUser && !container.classList.contains('open')) {
        unreadCount++;
        badge.textContent = unreadCount;
        badge.classList.add('show');
      }
    }

    function isAdaptiveCard(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        if (p.type === 'AdaptiveCard') return true;
        if (p.attachments) return p.attachments.some(function(a) {
          return a.contentType === 'application/vnd.microsoft.card.adaptive';
        });
      } catch(e) {}
      return false;
    }

    function isHeroCard(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        if (p.contentType === 'application/vnd.microsoft.card.hero') return true;
        if (p.attachments) return p.attachments.some(function(a) {
          return a.contentType === 'application/vnd.microsoft.card.hero' ||
                 a.contentType === 'application/vnd.microsoft.card.thumbnail';
        });
      } catch(e) {}
      return false;
    }

    function isSuggestedActions(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        return p.suggestedActions && p.suggestedActions.actions && p.suggestedActions.actions.length > 0;
      } catch(e) {}
      return false;
    }

    function addAdaptiveCard(content, senderName) {
      var wrap = document.createElement('div');
      wrap.className = 'd365-msg-wrap agent';

      var avatar = document.createElement('div');
      avatar.className = 'd365-msg-avatar ' + (isBot(senderName) ? 'bot' : 'agent');
      avatar.textContent = getInitials(senderName || 'Agent');

      var contentDiv = document.createElement('div');
      contentDiv.className = 'd365-msg-content';

      // Create sender div
      var senderDiv = document.createElement('div');
      senderDiv.className = 'd365-msg-sender';
      senderDiv.textContent = senderName || 'Agent';
      contentDiv.appendChild(senderDiv);

      var cardBox = document.createElement('div');
      cardBox.className = 'd365-msg agent d365-adaptive-card';

      try {
        var parsed = JSON.parse(content);
        var payload = parsed.type === 'AdaptiveCard' ? parsed : null;
        
        // Check for attachments format
        if (!payload && parsed.attachments) {
          var cardAtt = parsed.attachments.find(function(a) {
            return a.contentType === 'application/vnd.microsoft.card.adaptive' && a.content;
          });
          if (cardAtt) payload = cardAtt.content;
        }

        if (payload && typeof AdaptiveCards !== 'undefined') {
          var card = new AdaptiveCards.AdaptiveCard();
          
          // Configure host config for better styling
          card.hostConfig = new AdaptiveCards.HostConfig({
            fontFamily: "inherit",
            spacing: { small: 8, default: 12, medium: 16, large: 20, extraLarge: 24, padding: 16 },
            separator: { lineThickness: 1, lineColor: "#e2e8f0" },
            fontSizes: { small: 12, default: 14, medium: 16, large: 18, extraLarge: 20 },
            containerStyles: {
              default: { backgroundColor: "#ffffff", foregroundColors: { default: { default: "#2d3748", subtle: "#64748b" } } }
            }
          });
          
          card.parse(payload);
          
          card.onExecuteAction = function(action) {
            console.log('Adaptive Card action triggered:', action);
            console.log('Action type:', action.getJsonTypeName ? action.getJsonTypeName() : 'unknown');
            console.log('Action data:', action.data);
            console.log('chatSDK:', chatSDK ? 'exists' : 'null');
            console.log('chatStarted:', chatStarted);
            
            // Handle Submit actions - check multiple ways since constructor.name is unreliable
            var isSubmit = (action.data !== undefined) || 
                          (action.getJsonTypeName && action.getJsonTypeName() === 'Action.Submit') ||
                          (action instanceof AdaptiveCards.SubmitAction);
            
            if (isSubmit) {
              var data = action.data;
              console.log('Processing submit with data:', data);
              if (chatSDK && chatStarted) {
                // Disable the card after clicking
                cardBox.style.opacity = '0.6';
                cardBox.style.pointerEvents = 'none';
                
                var actionLabel = (data && data.actionSubmitId) || action.title || 'Submit';
                var sendContent = JSON.stringify({value: data});
                
                console.log('Sending message:', sendContent);
                chatSDK.sendMessage({ 
                  content: sendContent,
                  metadata: { 'microsoft.azure.communication.chat.bot.contenttype': 'azurebotservice.adaptivecard' }
                }).then(function() {
                  console.log('Message sent successfully');
                  addMessage(actionLabel, true, userName);
                }).catch(function(err) {
                  console.error('Error sending card response:', err);
                  cardBox.style.opacity = '1';
                  cardBox.style.pointerEvents = 'auto';
                });
              } else {
                console.warn('Cannot send - chatSDK or chatStarted is false');
              }
            } else if (action.url) {
              console.log('Opening URL:', action.url);
              window.open(action.url, '_blank');
            }
          };
          
          var rendered = card.render();
          if (rendered) {
            cardBox.appendChild(rendered);
            console.log('Adaptive Card rendered with action handler');
          }
        } else {
          console.warn('AdaptiveCards library not available or no payload');
        }
      } catch(e) {
        console.error('Error rendering Adaptive Card:', e);
        cardBox.innerHTML = '<p style="color:#e74c3c">Error displaying card</p>';
      }

      // Append cardBox BEFORE adding time (don't use innerHTML += which destroys event listeners!)
      contentDiv.appendChild(cardBox);
      
      // Create time div
      var timeDiv = document.createElement('div');
      timeDiv.className = 'd365-msg-time';
      timeDiv.textContent = formatTime(new Date());
      contentDiv.appendChild(timeDiv);

      wrap.appendChild(avatar);
      wrap.appendChild(contentDiv);
      typing.parentNode.insertBefore(wrap, typing);
      messages.scrollTop = messages.scrollHeight;
    }

    function createHeroCardElement(cardData, gradient) {
      var card = document.createElement('div');
      card.className = 'd365-hero-card';

      // Image
      if (cardData.images && cardData.images.length > 0 && cardData.images[0].url) {
        var img = document.createElement('img');
        img.src = cardData.images[0].url;
        img.alt = cardData.title || '';
        img.onerror = function() { this.style.display = 'none'; };
        card.appendChild(img);
      }

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'd365-hero-card-body';

      // Title
      if (cardData.title) {
        var titleDiv = document.createElement('div');
        titleDiv.className = 'd365-hero-card-title';
        titleDiv.textContent = cardData.title;
        bodyDiv.appendChild(titleDiv);
      }

      // Subtitle
      if (cardData.subtitle) {
        var subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'd365-hero-card-subtitle';
        subtitleDiv.textContent = cardData.subtitle;
        bodyDiv.appendChild(subtitleDiv);
      }

      // Text
      if (cardData.text) {
        var textDiv = document.createElement('div');
        textDiv.className = 'd365-hero-card-text';
        textDiv.textContent = cardData.text;
        bodyDiv.appendChild(textDiv);
      }

      // Buttons
      if (cardData.buttons && cardData.buttons.length > 0) {
        var btnsDiv = document.createElement('div');
        btnsDiv.className = 'd365-hero-card-buttons';

        cardData.buttons.forEach(function(btn) {
          var button = document.createElement('button');
          button.className = 'd365-hero-card-btn';
          button.textContent = btn.title || btn.text || 'Click';
          
          button.onclick = function() {
            console.log('Hero card button clicked:', btn);
            var value = btn.value || btn.title;
            
            if (btn.type === 'openUrl' && btn.value) {
              window.open(btn.value, '_blank');
            } else if (chatSDK && chatStarted) {
              btnsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
              card.style.opacity = '0.7';
              
              chatSDK.sendMessage({ content: value }).then(function() {
                addMessage(btn.title || value, true, userName);
              }).catch(function(err) {
                console.error('Error sending hero card response:', err);
                btnsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = false; });
                card.style.opacity = '1';
              });
            }
          };
          
          btnsDiv.appendChild(button);
        });

        bodyDiv.appendChild(btnsDiv);
      }

      card.appendChild(bodyDiv);
      return card;
    }

    function addHeroCard(content, senderName) {
      try {
        var parsed = JSON.parse(content);
        var heroCards = [];
        var isCarousel = false;
        
        // Extract hero cards from different formats
        if (parsed.contentType === 'application/vnd.microsoft.card.hero' && parsed.content) {
          heroCards.push(parsed.content);
        } else if (parsed.attachments && Array.isArray(parsed.attachments)) {
          heroCards = parsed.attachments
            .filter(function(att) {
              return (att.contentType === 'application/vnd.microsoft.card.hero' ||
                      att.contentType === 'application/vnd.microsoft.card.thumbnail') && att.content;
            })
            .map(function(att) { return att.content; });
          isCarousel = heroCards.length > 1 || parsed.attachmentLayout === 'carousel';
        }
        
        if (heroCards.length === 0) {
          console.warn('No hero cards found');
          addMessage(content, false, senderName);
          return;
        }
        
        console.log('Rendering', heroCards.length, 'hero card(s), isCarousel:', isCarousel);
        
        // Create single message wrapper for all cards
        var wrap = document.createElement('div');
        wrap.className = 'd365-msg-wrap agent';

        var avatar = document.createElement('div');
        avatar.className = 'd365-msg-avatar ' + (isBot(senderName) ? 'bot' : 'agent');
        avatar.textContent = getInitials(senderName || 'Agent');

        var contentDiv = document.createElement('div');
        contentDiv.className = 'd365-msg-content';

        var senderDiv = document.createElement('div');
        senderDiv.className = 'd365-msg-sender';
        senderDiv.textContent = senderName || 'Agent';
        contentDiv.appendChild(senderDiv);

        if (isCarousel) {
          // Multiple cards - render as horizontal carousel
          var carouselWrap = document.createElement('div');
          carouselWrap.className = 'd365-hero-carousel-wrap';
          
          var carousel = document.createElement('div');
          carousel.className = 'd365-hero-carousel';
          
          heroCards.forEach(function(cardData) {
            carousel.appendChild(createHeroCardElement(cardData));
          });
          
          // Navigation buttons
          var prevBtn = document.createElement('button');
          prevBtn.className = 'd365-carousel-btn prev';
          prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
          prevBtn.onclick = function() { carousel.scrollBy({ left: -240, behavior: 'smooth' }); };
          
          var nextBtn = document.createElement('button');
          nextBtn.className = 'd365-carousel-btn next';
          nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
          nextBtn.onclick = function() { carousel.scrollBy({ left: 240, behavior: 'smooth' }); };
          
          carouselWrap.appendChild(prevBtn);
          carouselWrap.appendChild(carousel);
          carouselWrap.appendChild(nextBtn);
          contentDiv.appendChild(carouselWrap);
        } else {
          // Single card
          contentDiv.appendChild(createHeroCardElement(heroCards[0]));
        }

        var timeDiv = document.createElement('div');
        timeDiv.className = 'd365-msg-time';
        timeDiv.textContent = formatTime(new Date());
        contentDiv.appendChild(timeDiv);

        wrap.appendChild(avatar);
        wrap.appendChild(contentDiv);
        typing.parentNode.insertBefore(wrap, typing);
        messages.scrollTop = messages.scrollHeight;

        // Handle any text that came with the attachments
        if (parsed.text) {
          addMessage(parsed.text, false, senderName);
        }
      } catch(e) {
        console.error('Error rendering Hero Card:', e);
        addMessage(content, false, senderName);
      }
    }

    function addSuggestedActions(content, senderName) {
      try {
        var parsed = JSON.parse(content);
        var text = parsed.text || '';
        var actions = parsed.suggestedActions.actions;

        var wrap = document.createElement('div');
        wrap.className = 'd365-msg-wrap agent';

        var avatar = document.createElement('div');
        avatar.className = 'd365-msg-avatar ' + (isBot(senderName) ? 'bot' : 'agent');
        avatar.textContent = getInitials(senderName || 'Agent');

        var contentDiv = document.createElement('div');
        contentDiv.className = 'd365-msg-content';

        var senderDiv = document.createElement('div');
        senderDiv.className = 'd365-msg-sender';
        senderDiv.textContent = senderName || 'Agent';
        contentDiv.appendChild(senderDiv);

        var bubble = document.createElement('div');
        bubble.className = 'd365-msg agent';
        if (text) bubble.textContent = text;

        var actionsDiv = document.createElement('div');
        actionsDiv.className = 'd365-suggested-actions';
        actions.forEach(function(a) {
          var btn = document.createElement('button');
          btn.className = 'd365-suggested-btn';
          btn.textContent = a.title || a.text;
          btn.onclick = function() {
            var val = a.value || a.title;
            if (chatSDK && chatStarted) {
              // Disable all buttons
              actionsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
              chatSDK.sendMessage({ content: val }).then(function() {
                addMessage(val, true, userName);
              });
            }
          };
          actionsDiv.appendChild(btn);
        });
        bubble.appendChild(actionsDiv);
        contentDiv.appendChild(bubble);

        var timeDiv = document.createElement('div');
        timeDiv.className = 'd365-msg-time';
        timeDiv.textContent = formatTime(new Date());
        contentDiv.appendChild(timeDiv);

        wrap.appendChild(avatar);
        wrap.appendChild(contentDiv);
        typing.parentNode.insertBefore(wrap, typing);
        messages.scrollTop = messages.scrollHeight;
      } catch(e) {
        addMessage(content, false, senderName);
      }
    }

    function processMessage(msg) {
      if (!msg) return;
      var id = msg.messageId || msg.id || msg.clientmessageid;
      if (id && processedMsgs[id]) return;
      if (id) processedMsgs[id] = true;

      var content = msg.content || msg.text || msg.body;
      if (!content) return;

      var role = msg.role || msg.senderRole;
      var senderName = msg.senderDisplayName || 'Agent';

      // Skip user messages
      if (role === 'user' || role === 'User' || role === 1) return;

      // Handle system messages (centered, no avatar)
      var isSystem = role === 'system' || role === 'System' || role === 0;
      if (isSystem) {
        addSystemMessage(content);
        return;
      }

      if (isAdaptiveCard(content)) addAdaptiveCard(content, senderName);
      else if (isHeroCard(content)) addHeroCard(content, senderName);
      else if (isSuggestedActions(content)) addSuggestedActions(content, senderName);
      else addMessage(content, false, senderName);
    }

    function addSystemMessage(text) {
      var wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.width = '100%';
      wrapper.style.animation = 'd365fadeIn .3s ease';
      
      var msg = document.createElement('div');
      msg.className = 'd365-system-msg';
      msg.textContent = text;
      
      wrapper.appendChild(msg);
      typing.parentNode.insertBefore(wrapper, typing);
      messages.scrollTop = messages.scrollHeight;
    }

    async function pollMessages() {
      if (!chatSDK || !chatStarted) return;
      try {
        var msgs = await chatSDK.getMessages();
        if (msgs && msgs.length) msgs.forEach(processMessage);
      } catch(e) {}
    }

    async function initChat(name, email, question) {
      userName = name;
      userEmail = email;
      showView('connecting');

      try {
        var SDKClass = typeof OmnichannelChatSDK !== 'undefined' ?
          (typeof OmnichannelChatSDK === 'function' ? OmnichannelChatSDK : OmnichannelChatSDK.default || OmnichannelChatSDK.OmnichannelChatSDK) :
          (typeof Microsoft !== 'undefined' && Microsoft.OmnichannelChatSDK ? Microsoft.OmnichannelChatSDK : null);

        if (!SDKClass) throw new Error('Chat SDK not loaded');

        chatSDK = new SDKClass({ orgId: config.orgId, orgUrl: config.orgUrl, widgetId: config.widgetId });
        await chatSDK.initialize();

        chatSDK.onNewMessage(function(m) {
          if (m && m.content) addMessage(m.content, false, m.senderDisplayName);
        });
        chatSDK.onTypingEvent(function() {
          typing.classList.add('active');
          setTimeout(function() { typing.classList.remove('active'); }, 3000);
        });
        chatSDK.onAgentEndSession(function() { showView('ended'); });

        await chatSDK.startChat({
          customContext: {
            'emailaddress1': { value: email, isDisplayable: true },
            'Name': { value: name, isDisplayable: true }
          }
        });

        chatStarted = true;
        showView('chat');
        if (question) {
          addMessage(question, true, name);
          await chatSDK.sendMessage({ content: question });
        }
        setInterval(pollMessages, 3000);
      } catch(e) {
        console.error('D365 Widget init error:', e);
        alert('Failed to connect: ' + e.message);
        showView('prechat');
        $('d365StartBtn').disabled = false;
        $('d365StartBtn').textContent = config.startBtnText;
      }
    }

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || !chatSDK || !chatStarted) return;
      input.value = '';
      addMessage(text, true, userName);
      try { await chatSDK.sendMessage({ content: text }); } catch(e) {
        addMessage('Failed to send. Try again.', false, 'System');
      }
    }

    // Event listeners
    launcher.onclick = function() {
      container.classList.toggle('open');
      launcher.classList.toggle('open');
      if (container.classList.contains('open')) {
        unreadCount = 0;
        badge.textContent = '0';
        badge.classList.remove('show');
        if (!config.enablePrechatForm && !chatStarted) initChat('Anonymous', 'anon@example.com', '');
      }
    };

    $('d365Minimize').onclick = function() {
      container.classList.remove('open');
      launcher.classList.remove('open');
    };

    $('d365Close').onclick = function() {
      if (chatStarted) confirm.classList.add('show');
      else { container.classList.remove('open'); launcher.classList.remove('open'); }
    };

    $('d365ConfirmNo').onclick = function() { confirm.classList.remove('show'); };
    $('d365ConfirmYes').onclick = async function() {
      confirm.classList.remove('show');
      if (chatSDK) try { await chatSDK.endChat(); } catch(e) {}
      showView('ended');
    };

    $('d365StartBtn').onclick = function() {
      var name = $('d365Name').value.trim();
      var email = $('d365Email').value.trim();
      var q = $('d365Question').value.trim();
      if (!name || !email) { alert('Please fill all required fields'); return; }
      this.disabled = true;
      this.textContent = 'Starting...';
      initChat(name, email, q);
    };

    $('d365SendBtn').onclick = sendMessage;
    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    $('d365AttachBtn').onclick = function() { $('d365File').click(); };
    $('d365File').onchange = function(e) {
      var file = e.target.files[0];
      if (!file || !chatSDK || !chatStarted) return;
      if (file.size > 25000000) { alert('File too large (max 25MB)'); return; }
      var reader = new FileReader();
      reader.onload = function(evt) {
        chatSDK.uploadFileAttachment({ name: file.name, type: file.type, data: evt.target.result })
          .then(function() { addMessage('📎 ' + file.name, true, userName); })
          .catch(function(err) { alert('Upload failed: ' + err.message); });
      };
      reader.readAsDataURL(file);
      this.value = '';
    };

    $('d365NewBtn').onclick = function() {
      chatStarted = false;
      chatSDK = null;
      processedMsgs = {};
      $('d365StartBtn').disabled = false;
      $('d365StartBtn').textContent = config.startBtnText;
      $('d365Name').value = '';
      $('d365Email').value = '';
      $('d365Question').value = '';
      while (messages.firstChild !== typing) messages.removeChild(messages.firstChild);
      showView('prechat');
    };

    if (!config.enablePrechatForm) prechat.classList.add('hidden');
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
