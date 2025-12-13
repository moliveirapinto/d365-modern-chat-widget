const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/sdk-entry.js',
    output: {
        filename: 'chat-sdk-bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        fallback: {
            "crypto": false,
            "stream": false,
            "buffer": false,
            "util": false,
            "assert": false,
            "http": false,
            "https": false,
            "os": false,
            "url": false,
            "zlib": false
        }
    }
};
