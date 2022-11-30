/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-debugger': isProd ? 'error' : 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': isProd ? 'error' : 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      { types: { '{}': false }, extendDefaults: true },
    ],
  },
};
