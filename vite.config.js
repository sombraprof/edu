import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  publicDir: "../public",
  base: "/algi/",
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js"),
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {}
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
        "images/icon.svg",
        "images/icon-192.png",
        "images/icon-512.png",
      ],
      devOptions: { enabled: false },
      strategies: "generateSW",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "Course – Institution",
        short_name: "Course",
        description: "Course materials, lessons and exercises.",
        theme_color: "#1976d2",
        background_color: "#fafafa",
        icons: [
          {
            src: "images/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "images/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    hmr: {
      clientPort: 5173,
    },
  },
});
