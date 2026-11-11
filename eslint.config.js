import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  { ignores: [".agents/**", ".claude/**", ".pnpm-store/**", "examples/**", "dist/**", "dist-*/**", ".qa-source/**", "node_modules/**", "playwright-report/**", "test-results/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports", disallowTypeAnnotations: false }],
      eqeqeq: ["error", "smart"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Nested label content (<span><strong/></span>) is common in the design system.
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either", depth: 4 }],
      // role="list" is deliberate: Safari/VoiceOver drops list semantics when list-style is none.
      "jsx-a11y/no-redundant-roles": ["error", { ol: ["list"], ul: ["list"] }],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "e2e/**/*.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,mjs,ts}", "vite.config.ts"],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } },
  },
);
