import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setupTests.js"],
    globals: true,
    css: false,
    coverage: {
      reporter: ["text", "html", "lcov"],
      lines: 75, // pragmatic baseline; raise gradually
      functions: 75,
      statements: 75,
      branches: 65,
      exclude: [
        "src/test/**",
        "src/**/index.{js,jsx,ts,tsx}",
        "src/**/__mocks__/**",
        "src/**/*.d.ts",
        "src/**/types/**",
        "src/**/dev/**",
        "src/**/stories/**",
        "vite.config.*",
        "tailwind.config.*",
        "postcss.config.*",
        "**/eslint.config.*",
      ],
    },
  },
});
