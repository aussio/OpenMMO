module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'no-param-reassign': ['error', { props: false }],
    'max-len': ['error', { code: 120 }],
    'import/extensions': ['error', { js: 'always' }],
  },
};
