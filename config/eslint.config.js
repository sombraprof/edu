import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  {
    // Ignora globalmente os diretórios que não são código-fonte
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "src/dist/**",
      "docs/**",
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        afterAll: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        test: "readonly",
        vi: "readonly",
        DOMPurify: "readonly",
        hljs: "readonly",
      },
    },
    rules: {
      "vue/no-unused-vars": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],
      "vue/no-mutating-props": "warn",
      "vue/multi-word-component-names": "off",
    },
  },
];
