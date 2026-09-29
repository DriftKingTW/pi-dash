import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

const isProduction = process.env.NODE_ENV === "production";

export default [
  { ignores: ["dist/", "dev-dist/", ".yarn/", "node_modules/"] },

  js.configs.recommended,
  // The same rule set the Vue 2 project used, now in its Vue 3 form
  ...pluginVue.configs["flat/essential"],

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-console": isProduction ? "warn" : "off",
      "no-debugger": isProduction ? "warn" : "off",
    },
  },

  // Config files run in Node, not the browser
  {
    files: ["*.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
