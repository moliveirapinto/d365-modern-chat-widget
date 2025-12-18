/**
 * D365 Chat Widget Studio - Application
 */
(function() {
  'use strict';

  // App State
  const state = {
    user: null,
    widgets: [],
    currentWidget: null,
    isDirty: false,
    deviceFlowPollTimer: null
  };

  // Config
  const GIST_PREFIX = 'd365-widget-';
  const WIDGET_CORE_URL = 'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/widget-core.js';

  // DOM Elements
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // Screens
  const screens = {
    login: $('loginScreen'),
    dashboard: $('dashboardScreen'),
    editor: $('editorScreen')
  };

  // Initialize app
  async function init() {
    setupEventListeners();
    await checkAuth();
  }

  // Check authentication
  async function checkAuth() {
    try {
      // Try Azure Static Web Apps auth first
      const res = await fetch('/.auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.clientPrincipal) {
          state.user = {
            id: data.clientPrincipal.userId,
            name: data.clientPrincipal.userDetails,
            provider: data.clientPrincipal.identityProvider
          };
          await getGitHubToken();
          showDashboard();
          return;
        }
      }
    } catch (e) {
      console.log('Not using Azure SWA auth');
    }

    // Check localStorage for saved session
    const savedUser = localStorage.getItem('d365_user');
    const savedToken = localStorage.getItem('d365_github_token');
    
    if (savedUser && savedToken) {
      state.user = JSON.parse(savedUser);
      state.githubToken = savedToken;
      
      // Verify token is still valid
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': 'token ' + savedToken }
        });
        if (res.ok) {
          showDashboard();
          return;
        }
      } catch (e) {
        console.log('Saved token invalid');
      }
      
      // Clear invalid session
      localStorage.removeItem('d365_user');
      localStorage.removeItem('d365_github_token');
    }

    showScreen('login');
  }

  async function getGitHubToken() {
    state.githubToken = localStorage.getItem('d365_github_token');
  }

  // Event Listeners
  function setupEventListeners() {
    // Login
    $('loginBtn').onclick = showTokenEntry;
    $('logoutBtn').onclick = logout;
    $('cancelTokenBtn').onclick = hideTokenEntry;
    $('connectBtn').onclick = connectWithToken;
    $('toggleTokenBtn').onclick = toggleTokenVisibility;
    
    // Allow Enter key to submit
    $('tokenInput').onkeypress = (e) => {
      if (e.key === 'Enter') connectWithToken();
    };

    // Dashboard
    $('newWidgetBtn').onclick = () => createNewWidget();
    $('emptyNewBtn').onclick = () => createNewWidget();

    // Editor
    $('backBtn').onclick = goBack;
    $('saveBtn').onclick = saveWidget;
    $('previewBtn').onclick = togglePreview;
    $('closeModal').onclick = () => $('embedModal').classList.remove('show');
    $('copyCodeBtn').onclick = copyEmbedCode;

    // Tab navigation
    $$('.nav-item').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Form changes
    $$('#editorScreen input, #editorScreen textarea').forEach(el => {
      el.oninput = () => {
        state.isDirty = true;
        updatePreview();
      };
    });

    // Toggle handlers
    $('useGradient').onchange = function() {
      $('gradientColors').style.display = this.checked ? 'grid' : 'none';
      updatePreview();
    };

    $('enablePrechat').onchange = function() {
      $('prechatFields').style.display = this.checked ? 'block' : 'none';
      updatePreview();
    };
  }

  // Screen Management
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ==========================================
  // Token-based Authentication (Nice UI)
  // ==========================================
  
  function showTokenEntry() {
    $('loginInitial').style.display = 'none';
    $('tokenEntryUI').style.display = 'block';
    $('tokenInput').value = '';
    $('tokenStatus').style.display = 'none';
    $('tokenInput').focus();
  }
  
  function hideTokenEntry() {
    $('loginInitial').style.display = 'block';
    $('tokenEntryUI').style.display = 'none';
  }
  
  function toggleTokenVisibility() {
    const input = $('tokenInput');
    const icon = $('eyeIcon');
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = '<path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
    } else {
      input.type = 'password';
      icon.innerHTML = '<path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    }
  }
  
  async function connectWithToken() {
    const token = $('tokenInput').value.trim();
    const statusEl = $('tokenStatus');
    const btnText = $('connectBtnText');
    const spinner = $('connectSpinner');
    const btn = $('connectBtn');
    
    if (!token) {
      statusEl.className = 'token-status error';
      statusEl.innerHTML = '⚠️ Please enter your GitHub token';
      statusEl.style.display = 'flex';
      return;
    }
    
    // Show loading state
    btn.disabled = true;
    btnText.textContent = 'Connecting...';
    spinner.style.display = 'block';
    statusEl.style.display = 'none';
    
    try {
      // Verify token works
      const res = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': 'token ' + token }
      });
      
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Invalid token' : 'GitHub API error');
      }
      
      const user = await res.json();
      
      // Check if token has gist scope
      const scopeCheck = await fetch('https://api.github.com/gists', {
        headers: { 'Authorization': 'token ' + token }
      });
      
      if (!scopeCheck.ok) {
        throw new Error('Token needs "gist" scope. Please create a new token with the gist permission.');
      }
      
      // Success!
      statusEl.className = 'token-status success';
      statusEl.innerHTML = '✓ Connected! Welcome, ' + (user.name || user.login);
      statusEl.style.display = 'flex';
      
      state.user = {
        id: user.id,
        name: user.name || user.login,
        login: user.login,
        avatar: user.avatar_url
      };
      state.githubToken = token;
      
      localStorage.setItem('d365_user', JSON.stringify(state.user));
      localStorage.setItem('d365_github_token', token);
      
      // Navigate to dashboard after brief delay
      setTimeout(() => showDashboard(), 800);
      
    } catch (err) {
      statusEl.className = 'token-status error';
      statusEl.innerHTML = '❌ ' + (err.message || 'Failed to connect. Check your token and try again.');
      statusEl.style.display = 'flex';
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Connect';
      spinner.style.display = 'none';
    }
  }
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Code', 2000);
    });
  }

  function logout() {
    state.user = null;
    state.githubToken = null;
    localStorage.removeItem('d365_user');
    localStorage.removeItem('d365_github_token');
    
    // Reset login UI
    $('loginInitial').style.display = 'block';
    $('tokenEntryUI').style.display = 'none';
    
    showScreen('login');
  }

  // Dashboard
  async function showDashboard() {
    showScreen('dashboard');
    
    // Update user info
    $('userName').textContent = state.user.name || state.user.login || 'User';
    if (state.user.avatar) {
      $('userAvatar').src = state.user.avatar;
      $('userAvatar').style.display = 'block';
    }

    await loadWidgets();
  }

  async function loadWidgets() {
    const list = $('widgetsList');
    const empty = $('emptyState');
    
    list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    empty.style.display = 'none';

    try {
      state.widgets = await fetchUserGists();
      
      if (state.widgets.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'flex';
        return;
      }

      list.innerHTML = state.widgets.map(w => `
        <div class="widget-card" data-id="${w.id}">
          <div class="widget-card-header">
            <div class="widget-card-icon" style="background: linear-gradient(135deg, ${w.config.gradientStart || '#667eea'} 0%, ${w.config.gradientEnd || '#764ba2'} 100%)">
              <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div>
              <div class="widget-card-title">${escapeHtml(w.name)}</div>
              <div class="widget-card-date">Updated ${formatDate(w.updated)}</div>
            </div>
          </div>
          <div class="widget-card-actions">
            <button class="btn-secondary" onclick="app.editWidget('${w.id}')">Edit</button>
            <button class="btn-secondary" onclick="app.getCode('${w.id}')">Get Code</button>
            <button class="btn-text" onclick="app.deleteWidget('${w.id}')" style="color: var(--danger)">Delete</button>
          </div>
        </div>
      `).join('');
      
    } catch (e) {
      console.error('Error loading widgets:', e);
      list.innerHTML = '<p style="color: var(--danger); padding: 24px;">Error loading widgets. Please try again.</p>';
    }
  }

  async function fetchUserGists() {
    if (!state.githubToken) return [];

    const res = await fetch('https://api.github.com/gists', {
      headers: { 'Authorization': 'token ' + state.githubToken }
    });

    if (!res.ok) throw new Error('Failed to fetch gists');

    const gists = await res.json();
    
    // Filter for our widget gists
    return gists
      .filter(g => g.description && g.description.startsWith(GIST_PREFIX))
      .map(g => ({
        id: g.id,
        name: g.description.replace(GIST_PREFIX, ''),
        updated: g.updated_at,
        config: g.files['config.json'] ? JSON.parse(g.files['config.json'].content || '{}') : {}
      }));
  }

  // Widget Editor
  function createNewWidget() {
    state.currentWidget = {
      id: null,
      name: 'My Chat Widget',
      config: getDefaultConfig()
    };
    showEditor();
  }

  function editWidget(id) {
    const widget = state.widgets.find(w => w.id === id);
    if (!widget) return;
    
    state.currentWidget = { ...widget };
    showEditor();
  }

  function showEditor() {
    showScreen('editor');
    
    const w = state.currentWidget;
    const c = w.config;

    // Populate form
    $('widgetName').value = w.name;
    $('orgId').value = c.orgId || '';
    $('orgUrl').value = c.orgUrl || '';
    $('widgetId').value = c.widgetId || '';
    $('headerTitle').value = c.headerTitle || 'Support Chat';
    $('headerSubtitle').value = c.headerSubtitle || "We're here to help";
    $('useGradient').checked = c.useGradient !== false;
    $('gradientStart').value = c.gradientStart || '#667eea';
    $('gradientEnd').value = c.gradientEnd || '#764ba2';
    $('primaryColor').value = c.primaryColor || '#667eea';
    $('chatBgColor').value = c.chatBgColor || '#f8fafc';
    $('userBubbleColor').value = c.userBubbleColor || '#667eea';
    $('agentBubbleColor').value = c.agentBubbleColor || '#ffffff';
    $('enablePrechat').checked = c.enablePrechatForm !== false;
    $('welcomeTitle').value = c.welcomeTitle || 'Welcome!';
    $('welcomeMessage').value = c.welcomeMessage || 'Please fill in your details to start chatting.';
    $('nameFieldLabel').value = c.nameFieldLabel || 'Name *';
    $('emailFieldLabel').value = c.emailFieldLabel || 'Email *';
    $('startBtnText').value = c.startBtnText || 'Start Chat';
    $('headerLogo').value = c.headerLogo || '';
    $('agentAvatar').value = c.agentAvatar || '';
    $('botAvatar').value = c.botAvatar || '';
    $('customerAvatar').value = c.customerAvatar || '';

    // Update UI state
    $('gradientColors').style.display = c.useGradient !== false ? 'grid' : 'none';
    $('prechatFields').style.display = c.enablePrechatForm !== false ? 'block' : 'none';

    state.isDirty = false;
    switchTab('connection');
    updatePreview();
  }

  function getFormConfig() {
    return {
      orgId: $('orgId').value.trim(),
      orgUrl: $('orgUrl').value.trim(),
      widgetId: $('widgetId').value.trim(),
      headerTitle: $('headerTitle').value,
      headerSubtitle: $('headerSubtitle').value,
      useGradient: $('useGradient').checked,
      gradientStart: $('gradientStart').value,
      gradientEnd: $('gradientEnd').value,
      primaryColor: $('primaryColor').value,
      chatBgColor: $('chatBgColor').value,
      userBubbleColor: $('userBubbleColor').value,
      agentBubbleColor: $('agentBubbleColor').value,
      enablePrechatForm: $('enablePrechat').checked,
      welcomeTitle: $('welcomeTitle').value,
      welcomeMessage: $('welcomeMessage').value,
      nameFieldLabel: $('nameFieldLabel').value,
      emailFieldLabel: $('emailFieldLabel').value,
      startBtnText: $('startBtnText').value,
      headerLogo: $('headerLogo').value.trim(),
      agentAvatar: $('agentAvatar').value.trim(),
      botAvatar: $('botAvatar').value.trim(),
      customerAvatar: $('customerAvatar').value.trim()
    };
  }

  function getDefaultConfig() {
    return {
      orgId: '',
      orgUrl: '',
      widgetId: '',
      headerTitle: 'Support Chat',
      headerSubtitle: "We're here to help",
      useGradient: true,
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      primaryColor: '#667eea',
      chatBgColor: '#f8fafc',
      userBubbleColor: '#667eea',
      agentBubbleColor: '#ffffff',
      enablePrechatForm: true,
      welcomeTitle: 'Welcome!',
      welcomeMessage: 'Please fill in your details to start chatting.',
      nameFieldLabel: 'Name *',
      emailFieldLabel: 'Email *',
      startBtnText: 'Start Chat'
    };
  }

  // Tab Navigation
  function switchTab(tab) {
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'tab-' + tab));
  }

  // Preview
  function updatePreview() {
    const frame = $('previewFrame');
    const config = getFormConfig();
    
    // Clear previous preview
    frame.innerHTML = '';
    
    // Create preview widget
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = 'position:absolute;bottom:20px;right:20px;';
    
    const gradient = config.useGradient ? 
      `linear-gradient(135deg, ${config.gradientStart} 0%, ${config.gradientEnd} 100%)` : 
      config.primaryColor;

    previewContainer.innerHTML = `
      <div style="width:60px;height:60px;border-radius:50%;background:${gradient};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);cursor:pointer" onclick="this.nextElementSibling.classList.toggle('open')">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </div>
      <div class="preview-widget" style="position:absolute;bottom:70px;right:0;width:340px;background:white;border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,0.3);overflow:hidden;transform:scale(0);opacity:0;transition:all 0.3s;transform-origin:bottom right">
        <div style="padding:16px;background:${gradient};color:white">
          <div style="font-weight:600;font-size:14px">${escapeHtml(config.headerTitle)}</div>
          <div style="font-size:12px;opacity:0.8">${escapeHtml(config.headerSubtitle)}</div>
        </div>
        <div style="padding:20px;background:${config.chatBgColor};min-height:200px">
          <div style="text-align:center;padding:20px">
            <div style="font-size:16px;font-weight:600;color:#2d3748;margin-bottom:8px">${escapeHtml(config.welcomeTitle)}</div>
            <div style="font-size:13px;color:#718096">${escapeHtml(config.welcomeMessage)}</div>
          </div>
        </div>
        <div style="padding:12px;border-top:1px solid #e2e8f0">
          <input type="text" placeholder="Type your message..." style="width:100%;padding:10px;border:none;background:#f1f5f9;border-radius:8px;font-size:14px">
        </div>
      </div>
    `;

    frame.appendChild(previewContainer);

    // Add click handler styling
    const style = document.createElement('style');
    style.textContent = '.preview-widget.open{transform:scale(1)!important;opacity:1!important}';
    frame.appendChild(style);
  }

  function togglePreview() {
    const widget = $('previewFrame').querySelector('.preview-widget');
    if (widget) widget.classList.toggle('open');
  }

  // Save Widget
  async function saveWidget() {
    const name = $('widgetName').value.trim();
    const config = getFormConfig();

    // Validate
    if (!name) {
      showToast('Please enter a widget name');
      return;
    }
    if (!config.orgId || !config.orgUrl || !config.widgetId) {
      showToast('Please fill in all D365 connection settings');
      switchTab('connection');
      return;
    }

    $('saveBtn').disabled = true;
    $('saveBtn').textContent = 'Saving...';

    try {
      const gistData = {
        description: GIST_PREFIX + name,
        public: false,
        files: {
          'config.json': {
            content: JSON.stringify(config, null, 2)
          },
          'README.md': {
            content: `# ${name}\n\nD365 Chat Widget Configuration\n\nGenerated by [D365 Widget Studio](https://moliveirapinto.github.io/d365-modern-chat-widget/)`
          }
        }
      };

      let res;
      if (state.currentWidget.id) {
        // Update existing gist
        res = await fetch('https://api.github.com/gists/' + state.currentWidget.id, {
          method: 'PATCH',
          headers: {
            'Authorization': 'token ' + state.githubToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
      } else {
        // Create new gist
        res = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': 'token ' + state.githubToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
      }

      if (!res.ok) throw new Error('Failed to save');

      const gist = await res.json();
      state.currentWidget.id = gist.id;
      state.currentWidget.name = name;
      state.currentWidget.config = config;
      state.isDirty = false;

      showEmbedCode(gist.id, config);
      showToast('Widget saved!');

    } catch (e) {
      console.error('Save error:', e);
      showToast('Failed to save widget');
    } finally {
      $('saveBtn').disabled = false;
      $('saveBtn').textContent = 'Save & Get Code';
    }
  }

  // Embed Code
  function showEmbedCode(gistId, config) {
    const embedCode = generateEmbedCode(gistId, config);
    
    $('embedCode').textContent = embedCode;
    $('codeSize').textContent = embedCode.length.toLocaleString();
    $('embedModal').classList.add('show');
  }

  function generateEmbedCode(gistId, config) {
    // Option 1: Tiny loader with Gist ID (~200 chars)
    // return `<script>var D365WidgetGist="${gistId}";</script>\n<script src="${WIDGET_CORE_URL.replace('widget-core.js', 'loader.js')}"></script>`;

    // Option 2: Inline config with loader (~1-2KB) - more reliable
    const inlineConfig = JSON.stringify(config);
    return `<!-- D365 Chat Widget -->
<script>
var D365WidgetConfig = ${inlineConfig};
</script>
<script src="${WIDGET_CORE_URL}"></script>`;
  }

  function getCode(id) {
    const widget = state.widgets.find(w => w.id === id);
    if (!widget) return;
    showEmbedCode(id, widget.config);
  }

  function copyEmbedCode() {
    const code = $('embedCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
      $('copyCodeBtn').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!';
      setTimeout(() => {
        $('copyCodeBtn').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> Copy';
      }, 2000);
    });
  }

  // Delete Widget
  async function deleteWidget(id) {
    if (!confirm('Are you sure you want to delete this widget?')) return;

    try {
      await fetch('https://api.github.com/gists/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'token ' + state.githubToken }
      });

      showToast('Widget deleted');
      loadWidgets();
    } catch (e) {
      showToast('Failed to delete widget');
    }
  }

  // Navigation
  function goBack() {
    if (state.isDirty) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }
    showDashboard();
  }

  // Utilities
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString();
  }

  function showToast(msg) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Expose to window for onclick handlers
  window.app = {
    editWidget,
    getCode,
    deleteWidget
  };

  // Start app
  init();
})();
