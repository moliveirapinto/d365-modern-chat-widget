/**
 * Modern D365 Live Chat Widget with Full Custom UI
 * Uses @microsoft/omnichannel-chat-sdk for headless connectivity
 */

import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';

class ModernChatWidget {
    constructor(config) {
        this.config = {
            orgId: config.orgId || '',
            orgUrl: config.orgUrl || '',
            widgetId: config.widgetId || ''
        };

        this.chatSDK = null;
        this.state = {
            isOpen: false,
            isChatActive: false,
            isChatEnded: false,
            isConnecting: false,
            unreadMessages: 0,
            agentName: 'Support Agent',
            messages: []
        };

        this.elements = {};
        this.init();
    }

    async init() {
        this.injectStyles();
        this.injectHTML();
        this.cacheElements();
        this.bindEvents();
        await this.initializeSDK();
    }

    async initializeSDK() {
        try {
            const omnichannelConfig = {
                orgId: this.config.orgId,
                orgUrl: this.config.orgUrl,
                widgetId: this.config.widgetId
            };

            this.chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
            await this.chatSDK.initialize();
            console.log("✅ Chat SDK initialized!");
            this.updateStatus("Ready to help");
        } catch (error) {
            console.error("❌ SDK init failed:", error);
            this.updateStatus("Demo Mode");
        }
    }

    injectStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            :root {
                --mcw-primary: #6366f1;
                --mcw-primary-dark: #4f46e5;
                --mcw-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                --mcw-bg: #ffffff;
                --mcw-text: #1f2937;
                --mcw-text-light: #6b7280;
                --mcw-border: #e5e7eb;
                --mcw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }

            .mcw-container * { box-sizing: border-box; margin: 0; padding: 0; }
            .mcw-container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

            /* Launcher */
            .mcw-launcher {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: var(--mcw-gradient);
                border: none;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 999998;
            }

            .mcw-launcher:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5); }
            .mcw-launcher:active { transform: scale(0.95); }
            .mcw-launcher svg { width: 28px; height: 28px; color: white; }
            .mcw-launcher.open .mcw-icon-chat { display: none; }
            .mcw-launcher.open .mcw-icon-close { display: block; }
            .mcw-launcher .mcw-icon-close { display: none; }

            .mcw-launcher::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: var(--mcw-gradient);
                opacity: 0;
                animation: mcw-ripple 2s infinite;
            }

            @keyframes mcw-ripple {
                0% { transform: scale(1); opacity: 0.4; }
                100% { transform: scale(1.8); opacity: 0; }
            }

            .mcw-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: white;
                font-size: 12px;
                font-weight: 600;
                min-width: 22px;
                height: 22px;
                border-radius: 11px;
                display: none;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
            }
            .mcw-badge.show { display: flex; }

            /* Chat Window */
            .mcw-window {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: 380px;
                height: 600px;
                max-height: calc(100vh - 120px);
                background: var(--mcw-bg);
                border-radius: 16px;
                box-shadow: var(--mcw-shadow);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 999999;
                animation: mcw-slideUp 0.3s ease;
            }

            .mcw-window.open { display: flex; }

            @keyframes mcw-slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Header */
            .mcw-header {
                background: var(--mcw-gradient);
                color: white;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .mcw-avatar {
                width: 48px;
                height: 48px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .mcw-avatar svg { width: 24px; height: 24px; }

            .mcw-header-info { flex: 1; }
            .mcw-header-title { font-size: 18px; font-weight: 600; }
            .mcw-header-status { font-size: 13px; opacity: 0.9; }

            .mcw-header-actions { display: flex; gap: 8px; }
            .mcw-header-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: background 0.2s;
            }
            .mcw-header-btn:hover { background: rgba(255,255,255,0.3); }
            .mcw-header-btn svg { width: 18px; height: 18px; }

            /* Pre-chat Form */
            .mcw-prechat {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }

            /* Pre-chat Hero Section */
            .mcw-prechat-hero {
                background: var(--mcw-prechat-gradient, var(--mcw-gradient));
                padding: 32px 24px 28px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            .mcw-prechat-hero::before {
                content: ''; position: absolute; top: 0; left: -100%; width: 200%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: mcwShimmer 3s infinite;
            }
            @keyframes mcwShimmer { 0% { left: -100%; } 100% { left: 100%; } }
            .mcw-prechat-hero-content { position: relative; z-index: 1; }
            .mcw-prechat-avatar-group { position: relative; display: flex; justify-content: center; margin-bottom: 16px; }
            .mcw-prechat-avatar {
                width: 48px; height: 48px; border-radius: 50%; border: 3px solid var(--mcw-prechat-avatar-border, rgba(255,255,255,0.9));
                background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
                margin: 0 -8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;
            }
            .mcw-prechat-avatar:first-child { z-index: 3; }
            .mcw-prechat-avatar:nth-child(2) { z-index: 2; }
            .mcw-prechat-avatar:nth-child(3) { z-index: 1; }
            .mcw-prechat-avatar img { width: 100%; height: 100%; object-fit: cover; }
            .mcw-prechat-avatar svg { width: 24px; height: 24px; fill: white; }
            .mcw-prechat-status {
                position: absolute; top: 0; right: 0; display: flex; align-items: center; gap: 5px;
                background: var(--mcw-prechat-badge-bg, rgba(255,255,255,0.2)); padding: 6px 12px 6px 8px;
                border-radius: 20px; font-size: 12px; color: var(--mcw-prechat-badge-text, white); font-weight: 500; white-space: nowrap;
            }
            .mcw-prechat-status-dot {
                width: 8px; height: 8px; background: var(--mcw-prechat-status-dot, #10b981); border-radius: 50%;
                animation: mcwPulseDot 1.5s ease-in-out infinite; box-shadow: 0 0 0 2px var(--mcw-prechat-status-dot-shadow, rgba(16, 185, 129, 0.3));
            }
            @keyframes mcwPulseDot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
            .mcw-prechat-hero-title { font-size: 22px; font-weight: 700; color: var(--mcw-prechat-title-color, white); margin-bottom: 8px; letter-spacing: -0.3px; }
            .mcw-prechat-hero-subtitle { font-size: 14px; color: var(--mcw-prechat-subtitle-color, rgba(255,255,255,0.9)); line-height: 1.5; }

            /* Pre-chat Form Body */
            .mcw-prechat-form-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
            .mcw-prechat h3 { font-size: 18px; color: var(--mcw-text); margin-bottom: 4px; }
            .mcw-prechat p { color: var(--mcw-text-light); font-size: 13px; margin-bottom: 8px; }

            .mcw-form { display: flex; flex-direction: column; gap: 16px; }

            .mcw-input-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
            .mcw-input-group label { font-size: 13px; font-weight: 600; color: var(--mcw-text); display: flex; align-items: center; gap: 4px; }
            .mcw-input-group label .required { color: #ef4444; }
            .mcw-input-with-icon { position: relative; width: 100%; }
            .mcw-input-with-icon input { padding-left: 44px; width: 100%; }
            .mcw-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #9ca3af; pointer-events: none; }

            .mcw-input {
                width: 100%;
                box-sizing: border-box;
                padding: 14px 16px;
                border: 2px solid var(--mcw-border);
                border-radius: 12px;
                font-size: 14px;
                background: #f9fafb;
                transition: all 0.2s ease;
            }
            .mcw-input:hover { border-color: #d1d5db; background: white; }
            .mcw-input:focus {
                outline: none;
                border-color: var(--mcw-primary);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                background: white;
            }
            .mcw-input::placeholder { color: #9ca3af; }

            .mcw-start-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 14px 24px;
                background: var(--mcw-gradient);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-top: 8px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.15);
            }
            .mcw-start-btn svg { width: 18px; height: 18px; fill: white; }
            .mcw-start-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

            /* Messages */
            .mcw-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: none;
                flex-direction: column;
                gap: 12px;
            }
            .mcw-messages.active { display: flex; }

            .mcw-message {
                display: flex;
                gap: 8px;
                max-width: 85%;
            }

            .mcw-message.customer { align-self: flex-end; flex-direction: row-reverse; }
            .mcw-message.agent { align-self: flex-start; }
            .mcw-message.system { align-self: center; max-width: 100%; }

            .mcw-msg-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f0f1ff 0%, #e8e9ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .mcw-msg-avatar svg { width: 16px; height: 16px; color: var(--mcw-primary); }

            .mcw-msg-content { display: flex; flex-direction: column; gap: 4px; }

            .mcw-msg-bubble {
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .mcw-message.customer .mcw-msg-bubble {
                background: var(--mcw-gradient);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .mcw-message.agent .mcw-msg-bubble {
                background: #f3f4f6;
                color: var(--mcw-text);
                border-bottom-left-radius: 4px;
            }

            .mcw-message.system .mcw-msg-bubble {
                background: transparent;
                color: var(--mcw-text-light);
                font-size: 12px;
                text-align: center;
            }

            .mcw-msg-time { font-size: 11px; color: var(--mcw-text-light); }
            .mcw-message.customer .mcw-msg-time { text-align: right; }

            /* Typing Indicator */
            .mcw-typing {
                display: none;
                align-items: center;
                gap: 8px;
                padding: 8px 0;
            }
            .mcw-typing.show { display: flex; }

            .mcw-typing-dots {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: #f3f4f6;
                border-radius: 16px;
            }

            .mcw-typing-dots span {
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                animation: mcw-bounce 1.4s infinite;
            }
            .mcw-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .mcw-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes mcw-bounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }

            /* Input Area */
            .mcw-input-area {
                padding: 16px;
                border-top: 1px solid var(--mcw-border);
                display: none;
            }
            .mcw-input-area.active { display: block; }

            .mcw-input-container {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                background: #f9fafb;
                border-radius: 12px;
                padding: 8px 12px;
            }

            .mcw-message-input {
                flex: 1;
                border: none;
                background: transparent;
                resize: none;
                font-size: 14px;
                line-height: 1.5;
                max-height: 100px;
                outline: none;
                font-family: inherit;
            }

            .mcw-send-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--mcw-gradient);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: transform 0.2s;
                flex-shrink: 0;
            }
            .mcw-send-btn:hover { transform: scale(1.05); }
            .mcw-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .mcw-send-btn svg { width: 18px; height: 18px; }

            /* Loading */
            .mcw-loading {
                flex: 1;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
            }
            .mcw-loading.active { display: flex; }

            .mcw-spinner {
                width: 48px;
                height: 48px;
                border: 3px solid var(--mcw-border);
                border-top-color: var(--mcw-primary);
                border-radius: 50%;
                animation: mcw-spin 1s linear infinite;
            }

            @keyframes mcw-spin { to { transform: rotate(360deg); } }

            .mcw-loading p { color: var(--mcw-text-light); font-size: 14px; }

            /* Chat Ended */
            .mcw-ended {
                flex: 1;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 24px;
                text-align: center;
                gap: 16px;
            }
            .mcw-ended.active { display: flex; }

            .mcw-ended-icon {
                width: 64px;
                height: 64px;
                background: #dcfce7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .mcw-ended-icon svg { width: 32px; height: 32px; color: #22c55e; }

            .mcw-ended h3 { font-size: 20px; color: var(--mcw-text); }
            .mcw-ended p { color: var(--mcw-text-light); font-size: 14px; }

            .mcw-new-chat-btn {
                padding: 12px 24px;
                background: var(--mcw-gradient);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 8px;
            }

            .mcw-hidden { display: none !important; }

            @media (max-width: 480px) {
                .mcw-window {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    bottom: 0;
                    right: 0;
                    border-radius: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    injectHTML() {
        const container = document.createElement('div');
        container.className = 'mcw-container';
        container.innerHTML = `
            <button class="mcw-launcher" id="mcw-launcher">
                <svg class="mcw-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg class="mcw-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span class="mcw-badge" id="mcw-badge">0</span>
            </button>

            <div class="mcw-window" id="mcw-window">
                <div class="mcw-header">
                    <div class="mcw-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                        </svg>
                    </div>
                    <div class="mcw-header-info">
                        <div class="mcw-header-title">Support Team</div>
                        <div class="mcw-header-status" id="mcw-status">Ready to help</div>
                    </div>
                    <div class="mcw-header-actions">
                        <button class="mcw-header-btn" id="mcw-minimize">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button class="mcw-header-btn" id="mcw-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mcw-prechat" id="mcw-prechat">
                    <div class="mcw-prechat-hero">
                        <div class="mcw-prechat-hero-content">
                            <div class="mcw-prechat-status">
                                <div class="mcw-prechat-status-dot"></div>
                                <span>Online</span>
                            </div>
                            <div class="mcw-prechat-avatar-group">
                                <div class="mcw-prechat-avatar">
                                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                                <div class="mcw-prechat-avatar">
                                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                                <div class="mcw-prechat-avatar">
                                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                            </div>
                            <div class="mcw-prechat-hero-title">Start a conversation</div>
                            <div class="mcw-prechat-hero-subtitle">We're here to help!<br>Fill out the form below to chat with our team.</div>
                        </div>
                    </div>
                    <div class="mcw-prechat-form-body">
                        <h3>Welcome!</h3>
                        <p>Please fill in your details to start chatting with us.</p>
                        <form class="mcw-form" id="mcw-form">
                            <div class="mcw-input-group">
                                <label>Your Name <span class="required">*</span></label>
                                <div class="mcw-input-with-icon">
                                    <input type="text" class="mcw-input" id="mcw-name" placeholder="Enter your name" required>
                                    <svg class="mcw-input-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                            </div>
                            <div class="mcw-input-group">
                                <label>Email Address <span class="required">*</span></label>
                                <div class="mcw-input-with-icon">
                                    <input type="email" class="mcw-input" id="mcw-email" placeholder="Enter your email" required>
                                    <svg class="mcw-input-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                </div>
                            </div>
                            <div class="mcw-input-group">
                                <label>How can we help? <span style="font-weight: 400; color: #9ca3af;">(optional)</span></label>
                                <textarea class="mcw-input" id="mcw-question" placeholder="Describe your question or issue..." rows="3"></textarea>
                            </div>
                            <button type="submit" class="mcw-start-btn">
                                <span>Start Chat</span>
                                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </button>
                        </form>
                    </div>
                </div>

                <div class="mcw-loading" id="mcw-loading">
                    <div class="mcw-spinner"></div>
                    <p id="mcw-loading-text">Connecting you to an agent...</p>
                </div>

                <div class="mcw-messages" id="mcw-messages">
                    <div class="mcw-typing" id="mcw-typing">
                        <div class="mcw-msg-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div class="mcw-typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>

                <div class="mcw-input-area" id="mcw-input-area">
                    <div class="mcw-input-container">
                        <textarea class="mcw-message-input" id="mcw-message-input" placeholder="Type your message..." rows="1"></textarea>
                        <button class="mcw-send-btn" id="mcw-send" disabled>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mcw-ended" id="mcw-ended">
                    <div class="mcw-ended-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h3>Chat Ended</h3>
                    <p>Thank you for chatting with us!</p>
                    <button class="mcw-new-chat-btn" id="mcw-new-chat">Start New Chat</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    cacheElements() {
        this.elements = {
            launcher: document.getElementById('mcw-launcher'),
            badge: document.getElementById('mcw-badge'),
            window: document.getElementById('mcw-window'),
            status: document.getElementById('mcw-status'),
            minimize: document.getElementById('mcw-minimize'),
            close: document.getElementById('mcw-close'),
            prechat: document.getElementById('mcw-prechat'),
            form: document.getElementById('mcw-form'),
            name: document.getElementById('mcw-name'),
            email: document.getElementById('mcw-email'),
            question: document.getElementById('mcw-question'),
            loading: document.getElementById('mcw-loading'),
            loadingText: document.getElementById('mcw-loading-text'),
            messages: document.getElementById('mcw-messages'),
            typing: document.getElementById('mcw-typing'),
            inputArea: document.getElementById('mcw-input-area'),
            messageInput: document.getElementById('mcw-message-input'),
            send: document.getElementById('mcw-send'),
            ended: document.getElementById('mcw-ended'),
            newChat: document.getElementById('mcw-new-chat')
        };
    }

    bindEvents() {
        this.elements.launcher.addEventListener('click', () => this.toggleChat());
        this.elements.minimize.addEventListener('click', () => this.toggleChat());
        this.elements.close.addEventListener('click', () => this.endChat());
        this.elements.form.addEventListener('submit', (e) => this.startChat(e));
        this.elements.messageInput.addEventListener('input', () => this.onInputChange());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.elements.send.addEventListener('click', () => this.sendMessage());
        this.elements.newChat.addEventListener('click', () => this.resetChat());
    }

    toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        this.elements.window.classList.toggle('open', this.state.isOpen);
        this.elements.launcher.classList.toggle('open', this.state.isOpen);
        
        if (this.state.isOpen) {
            this.state.unreadMessages = 0;
            this.elements.badge.classList.remove('show');
            if (this.state.isChatActive) {
                this.elements.messageInput.focus();
            }
        }
    }

    async startChat(e) {
        e.preventDefault();

        const name = this.elements.name.value.trim();
        const email = this.elements.email.value.trim();
        const question = this.elements.question.value.trim();

        if (!name || !email) return;

        this.showLoading('Connecting you to an agent...');

        try {
            if (this.chatSDK) {
                await this.chatSDK.startChat({
                    customContext: {
                        'Name': { value: name, isDisplayable: true },
                        'Email': { value: email, isDisplayable: true }
                    }
                });

                this.chatSDK.onNewMessage((msg) => this.handleIncomingMessage(msg));
                this.chatSDK.onTypingEvent((e) => e.isTyping ? this.showTyping() : this.hideTyping());
                this.chatSDK.onAgentEndSession(() => this.showEnded());
            }

            this.showChatView();
            this.addSystemMessage('Connected! An agent will be with you shortly.');
            
            if (question) {
                setTimeout(() => this.sendMessage(question), 500);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            // Demo mode fallback
            this.showChatView();
            this.addSystemMessage('Demo Mode - Connected with Sarah');
            this.state.agentName = 'Sarah';
            this.updateStatus('Connected with Sarah');
            
            setTimeout(() => {
                this.addAgentMessage(`Hi ${name}! 👋 I'm Sarah. How can I help you today?`);
            }, 1000);
        }
    }

    handleIncomingMessage(message) {
        this.hideTyping();
        
        if (message.sender?.type === 'Agent') {
            this.state.agentName = message.sender.displayName || 'Agent';
            this.addAgentMessage(message.content || message.text);
            
            if (!this.state.isOpen) {
                this.state.unreadMessages++;
                this.elements.badge.textContent = this.state.unreadMessages;
                this.elements.badge.classList.add('show');
            }
        }
    }

    async sendMessage(content = null) {
        const text = content || this.elements.messageInput.value.trim();
        if (!text) return;

        if (!content) {
            this.elements.messageInput.value = '';
            this.onInputChange();
        }

        this.addCustomerMessage(text);

        if (this.chatSDK) {
            try {
                await this.chatSDK.sendMessage({ content: text });
            } catch (error) {
                console.error('Send failed:', error);
            }
        } else {
            // Demo mode response
            this.simulateResponse();
        }
    }

    addCustomerMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'mcw-message customer';
        msg.innerHTML = `
            <div class="mcw-msg-content">
                <div class="mcw-msg-bubble">${this.escapeHtml(text)}</div>
                <span class="mcw-msg-time">${this.formatTime()}</span>
            </div>
        `;
        this.elements.messages.insertBefore(msg, this.elements.typing);
        this.scrollToBottom();
    }

    addAgentMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'mcw-message agent';
        msg.innerHTML = `
            <div class="mcw-msg-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="mcw-msg-content">
                <div class="mcw-msg-bubble">${this.escapeHtml(text)}</div>
                <span class="mcw-msg-time">${this.formatTime()}</span>
            </div>
        `;
        this.elements.messages.insertBefore(msg, this.elements.typing);
        this.scrollToBottom();
    }

    addSystemMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'mcw-message system';
        msg.innerHTML = `<div class="mcw-msg-bubble">${this.escapeHtml(text)}</div>`;
        this.elements.messages.insertBefore(msg, this.elements.typing);
        this.scrollToBottom();
    }

    simulateResponse() {
        setTimeout(() => this.showTyping(), 500);
        setTimeout(() => {
            this.hideTyping();
            const responses = [
                "I understand. Let me look into that for you.",
                "That's a great question! Here's what I can tell you...",
                "Thanks for the information. I'm checking our system now.",
                "I'd be happy to help with that!",
            ];
            this.addAgentMessage(responses[Math.floor(Math.random() * responses.length)]);
        }, 2000 + Math.random() * 1500);
    }

    showLoading(text) {
        this.elements.prechat.classList.add('mcw-hidden');
        this.elements.loadingText.textContent = text;
        this.elements.loading.classList.add('active');
    }

    hideLoading() {
        this.elements.loading.classList.remove('active');
    }

    showChatView() {
        this.state.isChatActive = true;
        this.hideLoading();
        this.elements.prechat.classList.add('mcw-hidden');
        this.elements.messages.classList.add('active');
        this.elements.inputArea.classList.add('active');
        this.updateStatus('Connected');
        setTimeout(() => this.elements.messageInput.focus(), 100);
    }

    showTyping() {
        this.elements.typing.classList.add('show');
        this.scrollToBottom();
    }

    hideTyping() {
        this.elements.typing.classList.remove('show');
    }

    showEnded() {
        this.state.isChatActive = false;
        this.elements.messages.classList.remove('active');
        this.elements.inputArea.classList.remove('active');
        this.elements.ended.classList.add('active');
        this.updateStatus('Chat ended');
    }

    async endChat() {
        if (this.state.isChatActive) {
            if (confirm('End this chat?')) {
                if (this.chatSDK) {
                    try { await this.chatSDK.endChat(); } catch (e) {}
                }
                this.showEnded();
            }
        } else {
            this.toggleChat();
        }
    }

    resetChat() {
        this.state.isChatActive = false;
        this.state.messages = [];
        
        // Clear messages except typing indicator
        const messages = this.elements.messages.querySelectorAll('.mcw-message');
        messages.forEach(m => m.remove());
        
        this.elements.ended.classList.remove('active');
        this.elements.prechat.classList.remove('mcw-hidden');
        this.elements.form.reset();
        this.updateStatus('Ready to help');
    }

    onInputChange() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        this.elements.send.disabled = !hasText;
        
        // Auto-resize
        this.elements.messageInput.style.height = 'auto';
        this.elements.messageInput.style.height = Math.min(this.elements.messageInput.scrollHeight, 100) + 'px';
    }

    updateStatus(status) {
        this.elements.status.textContent = status;
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    formatTime() {
        return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use
window.ModernChatWidget = ModernChatWidget;

export default ModernChatWidget;
