// Import the SDK
const SDKModule = require('@microsoft/omnichannel-chat-sdk');

// Find the constructor - based on console logs it's in SDKModule.default somewhere
let OmnichannelChatSDK = null;

// Check all possible locations
if (typeof SDKModule === 'function') {
    OmnichannelChatSDK = SDKModule;
} else if (typeof SDKModule.default === 'function') {
    OmnichannelChatSDK = SDKModule.default;
} else if (SDKModule.default && typeof SDKModule.default.default === 'function') {
    OmnichannelChatSDK = SDKModule.default.default;
} else if (SDKModule.default && typeof SDKModule.default.OmnichannelChatSDK === 'function') {
    OmnichannelChatSDK = SDKModule.default.OmnichannelChatSDK;
} else if (SDKModule.default) {
    // Search through default export properties
    for (const key in SDKModule.default) {
        if (typeof SDKModule.default[key] === 'function' && SDKModule.default[key].prototype) {
            OmnichannelChatSDK = SDKModule.default[key];
            console.log('Found SDK at SDKModule.default.' + key);
            break;
        }
    }
}

// Final assignment
if (typeof OmnichannelChatSDK === 'function') {
    window.OmnichannelChatSDK = OmnichannelChatSDK;
    console.log('SDK successfully attached to window.OmnichannelChatSDK');
} else {
    console.error('Could not find SDK constructor!');
    console.log('SDKModule:', SDKModule);
    console.log('SDKModule.default:', SDKModule.default);
    // Attach the whole module for debugging
    window.OmnichannelChatSDK = SDKModule;
}
