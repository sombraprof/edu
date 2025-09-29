import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { BASE_COLOR_SCHEMES, FALLBACK_COLOR_TOKENS } from './src/theme/base-palette';
import {
  ELEVATION_SHADOWS,
  STATE_LAYER_OPACITY,
  STRONG_STATE_LAYER_OPACITY,
  type ThemeMode,
} from './src/theme/tokens';

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

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/edu/' : '/';

  return {
    base,
    plugins: [
      materialBasePalettePlugin(),
      vue(),
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
              type: 'image/svg+xml',
            },
          ],
        },
        workbox: {
          // Ensure SPA fallback works on static hosts like GitHub Pages
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
    preview: {
      base: '/edu/',
    },
  };
});
