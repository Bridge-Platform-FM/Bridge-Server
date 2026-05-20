// eslint.config.js

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: globals.node
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            indent: ['error', 4],
            'no-unused-vars': 'warn',
            'comma-dangle': ['error', 'never'],
            'no-console': ['error', { allow: ['warn', 'error', 'info'] }]
        }
    }
];