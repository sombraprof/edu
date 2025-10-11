import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { imagetools } from 'vite-imagetools';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { BASE_COLOR_SCHEMES, FALLBACK_COLOR_TOKENS } from './src/theme/base-palette';
import {
  ELEVATION_SHADOWS,
  STATE_LAYER_OPACITY,
  STRONG_STATE_LAYER_OPACITY,
  type ThemeMode,
} from './src/theme/tokens';

const RESPONSIVE_PRESET_WIDTHS = '360;640;960;1280;1600';
const PRELOAD_PRESET_WIDTH = '1600';

const GENERATED_CSS_PATH = path.resolve(
  __dirname,
  'src/assets/generated/material-base-palette.css'
);
const BASE_PALETTE_SOURCE_FILES = [
  path.resolve(__dirname, 'src/theme/base-palette.ts'),
  path.resolve(__dirname, 'src/theme/tokens.ts'),
];

function camelToKebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toCssVarName(token: string): string {
  return `--md-sys-color-${camelToKebab(token)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const int = parseInt(normalized, 16);
  return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createModeCss(mode: ThemeMode): string {
  const scheme = BASE_COLOR_SCHEMES[mode];
  const selector = mode === 'dark' ? ":root[data-theme='dark']" : ':root';
  const lines = [`${selector} {`, `  color-scheme: ${mode};`];

  for (const token of FALLBACK_COLOR_TOKENS) {
    const value = scheme[token];
    const [r, g, b] = hexToRgb(value);
    lines.push(`  ${toCssVarName(token)}: ${value};`);
    lines.push(`  ${toCssVarName(token)}-rgb: ${r} ${g} ${b};`);
  }

  lines.push(
    `  --md-sys-state-layer-primary: ${rgba(scheme.primary, STATE_LAYER_OPACITY[mode].primary)};`
  );
  lines.push(
    `  --md-sys-state-layer-primary-strong: ${rgba(
      scheme.primary,
      STRONG_STATE_LAYER_OPACITY[mode]
    )};`
  );
  lines.push(
    `  --md-sys-state-layer-on-surface: ${rgba(
      scheme.onSurface,
      STATE_LAYER_OPACITY[mode].onSurface
    )};`
  );

  const elevation = ELEVATION_SHADOWS[mode];
  lines.push(`  --md-sys-elevation-level0: ${elevation.level0};`);
  lines.push(`  --md-sys-elevation-level1: ${elevation.level1};`);
  lines.push(`  --md-sys-elevation-level2: ${elevation.level2};`);
  lines.push(`  --md-sys-elevation-level3: ${elevation.level3};`);
  lines.push(`  --md-sys-elevation-level4: ${elevation.level4};`);
  lines.push(`  --md-sys-elevation-level5: ${elevation.level5};`);

  lines.push('}');
  return lines.join('\n');
}

async function writeBasePaletteCss() {
  const code = `${createModeCss('light')}\n\n${createModeCss('dark')}\n`;
  await mkdir(path.dirname(GENERATED_CSS_PATH), { recursive: true });
  await writeFile(GENERATED_CSS_PATH, code, 'utf8');
}

function materialBasePalettePlugin(): PluginOption {
  return {
    name: 'material-base-palette',
    async buildStart() {
      await writeBasePaletteCss();
    },
    async configureServer(server) {
      await writeBasePaletteCss();

      const reload = () => {
        void writeBasePaletteCss().then(() => {
          server.ws.send({ type: 'full-reload' });
        });
      };

      BASE_PALETTE_SOURCE_FILES.forEach((file) => server.watcher.add(file));
      server.watcher.on('change', (file) => {
        if (BASE_PALETTE_SOURCE_FILES.includes(file)) {
          reload();
        }
      });
    },
    async handleHotUpdate(ctx) {
      if (BASE_PALETTE_SOURCE_FILES.includes(ctx.file)) {
        await writeBasePaletteCss();
      }
    },
  };
}

function serviceWorkerPlugin(base: string): PluginOption {
  return {
    name: 'edu-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      const precache = new Set<string>();

      for (const file of Object.values(bundle)) {
        if ((file.type === 'chunk' || file.type === 'asset') && !file.fileName.endsWith('.map')) {
          precache.add(`${normalizedBase}${file.fileName}`);
        }
      }

      const staticAssets = ['index.html', 'offline.html', 'manifest.webmanifest', 'favicon.svg'];
      staticAssets.forEach((asset) => precache.add(`${normalizedBase}${asset}`));

      const sortedPrecache = Array.from(precache).sort();
      const precacheList = JSON.stringify(sortedPrecache);
      const cacheVersion = createHash('sha256').update(precacheList).digest('hex').slice(0, 8);
      const cacheName = `edu-precache-${cacheVersion}`;
      const offlineUrl = `${normalizedBase}offline.html`;
      const swSource = [
        `const CACHE_NAME = '${cacheName}';`,
        `const PRECACHE_URLS = ${precacheList};`,
        `const OFFLINE_URL = '${offlineUrl}';`,
        "self.addEventListener('install', (event) => {",
        '  event.waitUntil(',
        '    caches',
        '      .open(CACHE_NAME)',
        '      .then((cache) => cache.addAll(PRECACHE_URLS))',
        '      .then(() => self.skipWaiting())',
        '  );',
        '});',
        "self.addEventListener('activate', (event) => {",
        '  event.waitUntil(',
        '    (async () => {',
        '      const keys = await caches.keys();',
        '      await Promise.all(',
        '        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))',
        '      );',
        '      const cache = await caches.open(CACHE_NAME);',
        '      const requests = await cache.keys();',
        '      await Promise.all(',
        '        requests',
        "          .filter((request) => new URL(request.url).pathname.endsWith('service-worker.js'))",
        '          .map((request) => cache.delete(request))',
        '      );',
        '      await self.clients.claim();',
        '    })()',
        '  );',
        '});',
        "self.addEventListener('fetch', (event) => {",
        '  const { request } = event;',
        '  const url = new URL(request.url);',
        "  if (url.pathname.endsWith('service-worker.js')) {",
        '    event.respondWith(fetch(request));',
        '    return;',
        '  }',
        "  if (request.method !== 'GET') {",
        '    return;',
        '  }',
        "  if (request.mode === 'navigate') {",
        '    event.respondWith(',
        '      (async () => {',
        '        try {',
        '          const networkResponse = await fetch(request);',
        '          const cache = await caches.open(CACHE_NAME);',
        '          cache.put(request, networkResponse.clone());',
        '          return networkResponse;',
        '        } catch (error) {',
        '          const cache = await caches.open(CACHE_NAME);',
        '          const cached = await cache.match(request);',
        '          return cached ?? (await cache.match(OFFLINE_URL));',
        '        }',
        '      })()',
        '    );',
        '    return;',
        '  }',
        '  if (url.origin === self.location.origin) {',
        '    event.respondWith(',
        '      (async () => {',
        '        const cached = await caches.match(request);',
        '        if (cached) {',
        '          return cached;',
        '        }',
        '        const response = await fetch(request);',
        '        if (response && response.ok) {',
        '          const cache = await caches.open(CACHE_NAME);',
        '          cache.put(request, response.clone());',
        '        }',
        '        return response;',
        '      })()',
        '    );',
        '  }',
        '});',
        '',
      ].join('\n');

      this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: swSource });
    },
  };
}

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/edu/' : '/';

  return {
    base,
    plugins: [
      materialBasePalettePlugin(),
      imagetools({
        defaultDirectives(url) {
          const params = new URLSearchParams(url.searchParams);
          const preset = params.get('preset');
          if (preset === 'responsive') {
            params.delete('preset');
            if (!params.has('w')) {
              params.set('w', RESPONSIVE_PRESET_WIDTHS);
            }
            if (!params.has('quality')) {
              params.set('quality', '80');
            }
            if (!params.has('as')) {
              params.set('as', 'srcset');
            }
          } else if (preset === 'preload') {
            params.delete('preset');
            if (!params.has('w')) {
              params.set('w', PRELOAD_PRESET_WIDTH);
            }
            if (!params.has('quality')) {
              params.set('quality', '85');
            }
            if (!params.has('as')) {
              params.set('as', 'src');
            }
          } else if (preset) {
            params.delete('preset');
          }
          return params;
        },
      }),
      vue(),
      serviceWorkerPlugin(base),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['@monaco-editor/loader', 'monaco-editor', 'sucrase', 'fabric'],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router'],
            head: ['@vueuse/head'],
            prism: ['prismjs'],
            icons: ['lucide-vue-next'],
            'code-playground': ['@monaco-editor/loader', 'monaco-editor', 'sucrase'],
            whiteboard: ['fabric'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '^/teacher-api': {
          target: 'http://127.0.0.1:4178',
          changeOrigin: true,
          rewrite: (urlPath) => urlPath.replace(/^\/teacher-api/, ''),
        },
      },
    },
    preview: {
      base: '/edu/',
    },
    assetsInclude: [
      '**/*.avif',
      '**/*.heic',
      '**/*.heif',
      '**/*.webp',
      '**/*.glb',
      '**/*.gltf',
      '**/*.usdz',
      '**/*.hdr',
    ],
  };
});
