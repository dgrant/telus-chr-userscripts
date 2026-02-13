import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.user.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",

      // Stricter rules
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      curly: "error",
      "no-implicit-globals": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-throw-literal": "error",
      "prefer-template": "warn",
      "no-useless-concat": "error",
      "no-duplicate-imports": "error",
    },
  },
  eslintConfigPrettier,
];
