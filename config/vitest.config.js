import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const setupFile = path.resolve(__dirname, "../src/tests/setup.js");
const domSetupFile = path.resolve(__dirname, "../tests/setup-dom.ts");

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      'virtual:pwa-register': path.resolve(__dirname, '../tests/mocks/virtual-pwa-register.ts'),
      '/style.css': path.resolve(__dirname, '../src/style.css'),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [domSetupFile, setupFile],
    coverage: {
      provider: "v8",
      reports: ["text", "html", "lcov"],
      all: true,
      include: [
        "src/stores/**/*.js",
        "src/js/**/*.js",
      ],
      exclude: [
        "src/dist/**",
        "src/dist/assets/**",
        "src/**/*.vue",
        "**/node_modules/**",
        "**/*.config.*",
        "**/vitest.config.*",
        "src/sw.js",
        "src/**/*.d.ts",
      ],
      lines: 85,
      functions: 85,
      branches: 75,
      statements: 85,
    },
  },
});
