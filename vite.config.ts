import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import Markdown from 'vite-plugin-md';
import prism from 'markdown-it-prism';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/edu/' : '/';

  return {
    base,
    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/], // Allow md files to be treated as Vue components
      }),
      Markdown({
        headEnabled: true,
        frontmatter: true, // Enable frontmatter parsing
        markdownItSetup(md) {
          // Enable Prism for syntax highlighting
          md.use(prism);
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'EDU - Courses Hub',
          short_name: 'EDU',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#0B0F19',
          theme_color: '#0B0F19',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          // Ensure SPA fallback works on static hosts like GitHub Pages
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173
    },
    preview: {
      base: '/edu/',
    },
  };
});