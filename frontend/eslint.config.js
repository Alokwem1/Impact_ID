import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignore build artifacts and config files
  {
    ignores: [
      "dist/**",
      "public/**",
      "vite.config.js",
      "tailwind.config.js",
      "src/**/*.test.{js,jsx,ts,tsx}",
    ],
  },
  // Base JS/React rules
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Project overrides
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Vite define globals (optional)
        __APP_VERSION__: "readonly",
        __BUILD_TIME__: "readonly",
        __DEV__: "readonly",
        __PROD__: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Keep JSX runtime flexible under Vite/React 18
      "react/react-in-jsx-scope": "off",
      // Relax noisy rules during stabilization (can re-enable later or per-file)
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-undef": "off",
      "no-unused-vars": "off",
    },
  },
]);
