module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['airbnb-base', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  plugins: ['import', 'node', 'prettier'],
  settings: {
    node: {
      version: '>=16.0.0',
    },
    'import/resolver': {
      node: {
        paths: ['.'],
        extensions: ['.js', '.json'],
      },
    },
  },
  rules: {
    'prettier/prettier': ['error'],
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.spec.js',
          '**/test/**',
          '**/scripts/**',
          '**/*.config.js',
          '**/server.js',
          '**/app.js',
        ],
      },
    ],
    'node/no-unsupported-features/es-syntax': 'off',
  },
};
