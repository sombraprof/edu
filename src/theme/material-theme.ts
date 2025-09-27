import { ref, type Ref } from 'vue';
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
  type Scheme,
} from '@material/material-color-utilities';
import {
  APP_BAR_HEIGHTS,
  BREAKPOINTS,
  COLOR_ROLE_TOKENS,
  DIMENSION_SCALE,
  ELEVATION_SHADOWS,
  LAYOUT_CONTAINERS,
  SHAPE_SCALE,
  SPACING_SCALE,
  STATE_LAYER_OPACITY,
  STRONG_STATE_LAYER_OPACITY,
  TYPOGRAPHY_SCALE,
  type ThemeMode,
} from './tokens';
type ThemePreference = ThemeMode | 'system';

interface MaterialThemeOptions {
  seedColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  neutralColor?: string;
  neutralVariantColor?: string;
}

const STORAGE_KEY = 'theme';
const DEFAULT_OPTIONS: Required<MaterialThemeOptions> = {
  seedColor: '#2563eb',
  secondaryColor: '#7c3aed',
  tertiaryColor: '#f97316',
  neutralColor: '#5c5f6d',
  neutralVariantColor: '#5a6478',
};

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const activeMode = ref<ThemeMode>('light');
let followSystem = false;
let initialized = false;
let staticTokensApplied = false;
let materialTheme: Theme | null = null;

function toCssVarName(token: string): string {
  return `--md-sys-color-${token.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const int = parseInt(value, 16);
  return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toHex(value: number | string): string {
  return typeof value === 'number' ? hexFromArgb(value) : value;
}

function applyScheme(mode: ThemeMode) {
  if (!materialTheme) {
    throw new Error('Material theme has not been initialized.');
  }

  const scheme: Scheme = mode === 'dark' ? materialTheme.schemes.dark : materialTheme.schemes.light;
  const palette = scheme.toJSON() as Record<string, number | string>;

  COLOR_ROLE_TOKENS.forEach((token) => {
    const value = palette[token];
    if (value !== undefined) {
      const cssVarName = toCssVarName(token);
      document.documentElement.style.setProperty(cssVarName, toHex(value));
    }
  });

  const primary = toHex(palette.primary);
  const onSurface = toHex(palette.onSurface);

  document.documentElement.style.setProperty(
    '--md-sys-state-layer-primary',
    rgba(primary, STATE_LAYER_OPACITY[mode].primary)
  );
  document.documentElement.style.setProperty(
    '--md-sys-state-layer-primary-strong',
    rgba(primary, STRONG_STATE_LAYER_OPACITY[mode])
  );
  document.documentElement.style.setProperty(
    '--md-sys-state-layer-on-surface',
    rgba(onSurface, STATE_LAYER_OPACITY[mode].onSurface)
  );

  const elevation = ELEVATION_SHADOWS[mode];
  document.documentElement.style.setProperty('--md-sys-elevation-level1', elevation.level1);
  document.documentElement.style.setProperty('--md-sys-elevation-level2', elevation.level2);
  document.documentElement.style.setProperty('--md-sys-elevation-level3', elevation.level3);
  // Maintain legacy aliases while components migrate fully to the new tokens.
  document.documentElement.style.setProperty('--shadow-elevation-1', elevation.level1);
  document.documentElement.style.setProperty('--shadow-elevation-2', elevation.level2);
  document.documentElement.style.setProperty('--shadow-elevation-3', elevation.level3);

  document.documentElement.dataset.theme = mode;
  document.documentElement.style.setProperty('color-scheme', mode);
  activeMode.value = mode;
}

function applyStaticTokens() {
  if (staticTokensApplied || typeof window === 'undefined') {
    return;
  }

  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--md-sys-typescale-font', TYPOGRAPHY_SCALE.fontFamily);

  (
    Object.entries(TYPOGRAPHY_SCALE.display) as Array<
      [string, { size: string; lineHeight: string; weight: number; tracking: string }]
    >
  ).forEach(([variant, settings]) => {
    rootStyle.setProperty(`--md-sys-typescale-display-${variant}-size`, settings.size);
    rootStyle.setProperty(`--md-sys-typescale-display-${variant}-line-height`, settings.lineHeight);
    rootStyle.setProperty(`--md-sys-typescale-display-${variant}-weight`, String(settings.weight));
    rootStyle.setProperty(`--md-sys-typescale-display-${variant}-tracking`, settings.tracking);
  });

  (
    Object.entries(TYPOGRAPHY_SCALE.headline) as Array<
      [string, { size: string; lineHeight: string; weight: number; tracking: string }]
    >
  ).forEach(([variant, settings]) => {
    rootStyle.setProperty(`--md-sys-typescale-headline-${variant}-size`, settings.size);
    rootStyle.setProperty(
      `--md-sys-typescale-headline-${variant}-line-height`,
      settings.lineHeight
    );
    rootStyle.setProperty(`--md-sys-typescale-headline-${variant}-weight`, String(settings.weight));
    rootStyle.setProperty(`--md-sys-typescale-headline-${variant}-tracking`, settings.tracking);
  });

  (
    Object.entries(TYPOGRAPHY_SCALE.title) as Array<
      [string, { size: string; lineHeight: string; weight: number; tracking: string }]
    >
  ).forEach(([variant, settings]) => {
    rootStyle.setProperty(`--md-sys-typescale-title-${variant}-size`, settings.size);
    rootStyle.setProperty(`--md-sys-typescale-title-${variant}-line-height`, settings.lineHeight);
    rootStyle.setProperty(`--md-sys-typescale-title-${variant}-weight`, String(settings.weight));
    rootStyle.setProperty(`--md-sys-typescale-title-${variant}-tracking`, settings.tracking);
  });

  (
    Object.entries(TYPOGRAPHY_SCALE.body) as Array<
      [string, { size: string; lineHeight: string; weight: number; tracking: string }]
    >
  ).forEach(([variant, settings]) => {
    rootStyle.setProperty(`--md-sys-typescale-body-${variant}-size`, settings.size);
    rootStyle.setProperty(`--md-sys-typescale-body-${variant}-line-height`, settings.lineHeight);
    rootStyle.setProperty(`--md-sys-typescale-body-${variant}-weight`, String(settings.weight));
    rootStyle.setProperty(`--md-sys-typescale-body-${variant}-tracking`, settings.tracking);
  });

  (
    Object.entries(TYPOGRAPHY_SCALE.label) as Array<
      [string, { size: string; lineHeight: string; weight: number; tracking: string }]
    >
  ).forEach(([variant, settings]) => {
    rootStyle.setProperty(`--md-sys-typescale-label-${variant}-size`, settings.size);
    rootStyle.setProperty(`--md-sys-typescale-label-${variant}-line-height`, settings.lineHeight);
    rootStyle.setProperty(`--md-sys-typescale-label-${variant}-weight`, String(settings.weight));
    rootStyle.setProperty(`--md-sys-typescale-label-${variant}-tracking`, settings.tracking);
  });

  (Object.entries(SHAPE_SCALE) as Array<[string, string]>).forEach(([key, value]) => {
    const normalizedKey = key.replace(/[A-Z]/g, '-$&').toLowerCase();
    rootStyle.setProperty(`--md-sys-shape-${normalizedKey}`, value);
    rootStyle.setProperty(`--md-sys-shape-corner-${normalizedKey}`, value);
  });

  (Object.entries(SPACING_SCALE) as Array<[string, string]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-spacing-${key}`, value);
  });

  (Object.entries(DIMENSION_SCALE.icon) as Array<[string, string]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-icon-size-${key}`, value);
  });

  (Object.entries(BREAKPOINTS) as Array<[string, string]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-breakpoint-${key}`, value);
  });

  (Object.entries(LAYOUT_CONTAINERS) as Array<[string, string]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-layout-container-${key}`, value);
  });

  (Object.entries(APP_BAR_HEIGHTS) as Array<[string, string]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-app-bar-height-${key}`, value);
  });

  staticTokensApplied = true;
}

function handleSystemChange(event: MediaQueryListEvent) {
  if (followSystem) {
    applyScheme(event.matches ? 'dark' : 'light');
  }
}

function createTheme(options: Required<MaterialThemeOptions>): Theme {
  return themeFromSourceColor(argbFromHex(options.seedColor), [
    { name: 'secondary', value: argbFromHex(options.secondaryColor), blend: true },
    { name: 'tertiary', value: argbFromHex(options.tertiaryColor), blend: true },
    { name: 'neutral', value: argbFromHex(options.neutralColor), blend: true },
    {
      name: 'neutralVariant',
      value: argbFromHex(options.neutralVariantColor),
      blend: true,
    },
  ]);
}

function resolveInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;

  if (stored === 'light' || stored === 'dark') {
    followSystem = false;
    return stored;
  }

  followSystem = true;
  const prefersDark = mediaQuery?.matches ?? false;
  return prefersDark ? 'dark' : 'light';
}

export function initMaterialTheme(options: MaterialThemeOptions = {}): Ref<ThemeMode> {
  if (initialized || typeof window === 'undefined') {
    return activeMode;
  }

  const merged = { ...DEFAULT_OPTIONS, ...options } as Required<MaterialThemeOptions>;
  materialTheme = createTheme(merged);

  applyStaticTokens();
  const initialMode = resolveInitialMode();
  applyScheme(initialMode);

  if (followSystem && mediaQuery) {
    mediaQuery.addEventListener('change', handleSystemChange);
  }

  initialized = true;
  return activeMode;
}

export function setMaterialTheme(preference: ThemePreference) {
  if (!initialized) {
    initMaterialTheme();
  }

  if (preference === 'system') {
    localStorage.removeItem(STORAGE_KEY);
    followSystem = true;
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemChange);
      mediaQuery.addEventListener('change', handleSystemChange);
      applyScheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      applyScheme('light');
    }
    return;
  }

  followSystem = false;
  localStorage.setItem(STORAGE_KEY, preference);
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemChange);
  }
  applyScheme(preference);
}

export function getActiveMaterialTheme(): Ref<ThemeMode> {
  if (!initialized) {
    initMaterialTheme();
  }
  return activeMode;
}
