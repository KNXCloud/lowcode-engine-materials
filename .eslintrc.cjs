require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  overrides: [
    {
      files: ['./builder/**', './packages/**/*.js'],
      env: {
        es6: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
      },
      extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['./packages/**/*.{ts,tsx,vue}'],
      env: {
        browser: true,
        'vue/setup-compiler-macros': true,
      },
      extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        'vue/prop-name-casing': 'off',
        'vue/one-component-per-file': 'off',
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
