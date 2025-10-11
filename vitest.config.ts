import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vuedraggable: fileURLToPath(new URL('./tests/stubs/vuedraggable.ts', import.meta.url)),
      '@monaco-editor/loader': fileURLToPath(
        new URL('./tests/stubs/monaco-editor-loader.ts', import.meta.url)
      ),
      'monaco-editor/esm/vs/editor/editor.api': fileURLToPath(
        new URL('./tests/stubs/monaco-editor-api.ts', import.meta.url)
      ),
      fabric: fileURLToPath(new URL('./tests/stubs/fabric.ts', import.meta.url)),
      'lottie-web': fileURLToPath(new URL('./tests/stubs/lottie-web.ts', import.meta.url)),
      'd3-force': fileURLToPath(new URL('./tests/stubs/d3-force.ts', import.meta.url)),
      '@google/model-viewer': fileURLToPath(
        new URL('./tests/stubs/model-viewer.ts', import.meta.url)
      ),
      echarts: fileURLToPath(new URL('./tests/stubs/echarts.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    env: {
      VITE_TEACHER_API_URL: 'https://teacher.local',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 30,
        statements: 30,
        branches: 20,
        functions: 20,
      },
    },
  },
});
