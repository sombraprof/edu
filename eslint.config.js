import js from '@eslint/js';
import vuePlugin from 'eslint-plugin-vue';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const typescriptRules = {
  ...tsPlugin.configs['recommended'].rules,
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_|^error$',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_|^error$',
    },
  ],
};

const browserGlobals = {
  ...globals.browser,
  ...globals.es2021,
  RequestInit: 'readonly',
  Headers: 'readonly',
};

const nodeGlobals = {
  ...globals.node,
  ...globals.es2021,
  fetch: 'readonly',
  URL: 'readonly',
  RequestInit: 'readonly',
  Headers: 'readonly',
};

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', 'reports', 'public', 'src/content', 'scripts'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
    },
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: browserGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...typescriptRules,
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: typescriptRules,
  },
  {
    files: ['scripts/**/*.ts', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: typescriptRules,
  },
  {
    files: [
      'scripts/**/*.{js,cjs,mjs}',
      'postcss.config.cjs',
      'tailwind.config.cjs',
      'eslint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
  },
  {
    rules: prettierConfig.rules,
  },
  {
    rules: {
      'vue/attributes-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/no-required-prop-with-default': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'off',
      'vue/no-dupe-keys': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
