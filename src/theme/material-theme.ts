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
  DENSITY_SCALE,
  DIMENSION_SCALE,
  ELEVATION_SHADOWS,
  LAYOUT_CONTAINERS,
  MOTION_TOKENS,
  SHAPE_SCALE,
  SPACING_SCALE,
  STATE_LAYER_OPACITY,
  STRONG_STATE_LAYER_OPACITY,
  TYPOGRAPHY_SCALE,
  type ThemeMode,
} from './tokens';
import { DEFAULT_THEME_OPTIONS, type BaseMaterialThemeOptions } from './base-palette';
type ThemePreference = ThemeMode | 'system';

type MaterialThemeOptions = Partial<BaseMaterialThemeOptions>;

const STORAGE_KEY = 'theme';
const DEFAULT_OPTIONS: BaseMaterialThemeOptions = DEFAULT_THEME_OPTIONS;

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const activeMode = ref<ThemeMode>('light');
let followSystem = false;
let initialized = false;
let staticTokensApplied = false;
let materialTheme: Theme | null = null;

type ColorGroupValues = {
  color: number;
  onColor: number;
  colorContainer: number;
  onColorContainer: number;
};

type MaterialCustomColorGroup = {
  color: { name: string };
  light: ColorGroupValues;
  dark: ColorGroupValues;
};

const SURFACE_TONE_MAP: Record<
  ThemeMode,
  Record<
    | 'surfaceDim'
    | 'surfaceBright'
    | 'surfaceContainerLowest'
    | 'surfaceContainerLow'
    | 'surfaceContainer'
    | 'surfaceContainerHigh'
    | 'surfaceContainerHighest',
    number
  >
> = {
  light: {
    surfaceDim: 92,
    surfaceBright: 99,
    surfaceContainerLowest: 100,
    surfaceContainerLow: 98,
    surfaceContainer: 96,
    surfaceContainerHigh: 94,
    surfaceContainerHighest: 92,
  },
  dark: {
    surfaceDim: 12,
    surfaceBright: 36,
    surfaceContainerLowest: 8,
    surfaceContainerLow: 18,
    surfaceContainer: 22,
    surfaceContainerHigh: 26,
    surfaceContainerHighest: 30,
  },
};

function toCssVarName(token: string): string {
  return `--md-sys-color-${token.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function toRgbCssVarName(token: string): string {
  return `${toCssVarName(token)}-rgb`;
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

function setColorToken(style: CSSStyleDeclaration, token: string, value: number | string) {
  const hex = toHex(value);
  style.setProperty(toCssVarName(token), hex);
  const [r, g, b] = hexToRgb(hex);
  style.setProperty(toRgbCssVarName(token), `${r} ${g} ${b}`);
}

function applyScheme(mode: ThemeMode) {
  if (!materialTheme) {
    throw new Error('Material theme has not been initialized.');
  }

  const scheme: Scheme = mode === 'dark' ? materialTheme.schemes.dark : materialTheme.schemes.light;
  const palette = scheme.toJSON() as Record<string, number | string>;
  const rootStyle = document.documentElement.style;
  const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  COLOR_ROLE_TOKENS.forEach((token) => {
    const value = palette[token];
    if (value !== undefined) {
      setColorToken(rootStyle, token, value);
    }
  });

  const customColorGroups =
    (materialTheme as Theme & { customColors?: MaterialCustomColorGroup[] }).customColors ?? [];

  customColorGroups
    .filter(({ color }) => color.name === 'success' || color.name === 'warning')
    .forEach((customColor) => {
      const group = mode === 'dark' ? customColor.dark : customColor.light;
      const tokenName = customColor.color.name;
      const capitalized = tokenName.charAt(0).toUpperCase() + tokenName.slice(1);

      setColorToken(rootStyle, tokenName, group.color);
      setColorToken(rootStyle, `on${capitalized}`, group.onColor);
      setColorToken(rootStyle, `${tokenName}Container`, group.colorContainer);
      setColorToken(rootStyle, `on${capitalized}Container`, group.onColorContainer);
    });

  const primary = toHex(palette.primary);
  const onSurface = toHex(palette.onSurface);
  const background = toHex(palette.background);
  const surface = toHex(palette.surface);

  if (themeColorMeta) {
    const themeColor = mode === 'dark' ? surface : background;
    themeColorMeta.content = themeColor;
  }

  rootStyle.setProperty(
    '--md-sys-state-layer-primary',
    rgba(primary, STATE_LAYER_OPACITY[mode].primary)
  );
  rootStyle.setProperty(
    '--md-sys-state-layer-primary-strong',
    rgba(primary, STRONG_STATE_LAYER_OPACITY[mode])
  );
  rootStyle.setProperty(
    '--md-sys-state-layer-on-surface',
    rgba(onSurface, STATE_LAYER_OPACITY[mode].onSurface)
  );

  const neutralPalette = materialTheme.palettes.neutral;
  const surfaceTones = SURFACE_TONE_MAP[mode];
  Object.entries(surfaceTones).forEach(([token, tone]) => {
    setColorToken(rootStyle, token, hexFromArgb(neutralPalette.tone(tone)));
  });

  const elevation = ELEVATION_SHADOWS[mode];
  rootStyle.setProperty('--md-sys-elevation-level0', elevation.level0);
  rootStyle.setProperty('--md-sys-elevation-level1', elevation.level1);
  rootStyle.setProperty('--md-sys-elevation-level2', elevation.level2);
  rootStyle.setProperty('--md-sys-elevation-level3', elevation.level3);
  rootStyle.setProperty('--md-sys-elevation-level4', elevation.level4);
  rootStyle.setProperty('--md-sys-elevation-level5', elevation.level5);

  document.documentElement.dataset.theme = mode;
  rootStyle.setProperty('color-scheme', mode);
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

  (Object.entries(MOTION_TOKENS.duration) as Array<[string, string]>).forEach(([key, value]) => {
    const normalizedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    rootStyle.setProperty(`--md-sys-motion-duration-${normalizedKey}`, value);
  });

  (Object.entries(MOTION_TOKENS.easing) as Array<[string, string]>).forEach(([key, value]) => {
    const normalizedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    rootStyle.setProperty(`--md-sys-motion-easing-${normalizedKey}`, value);
  });

  (Object.entries(DENSITY_SCALE.reference) as Array<[string, number]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-density-reference-${key}`, String(value));
  });

  (Object.entries(DENSITY_SCALE.topAppBar) as Array<[string, number]>).forEach(([key, value]) => {
    rootStyle.setProperty(`--md-sys-density-top-app-bar-${key}`, String(value));
  });

  (Object.entries(DENSITY_SCALE.navigation) as Array<[string, Record<string, number>]>).forEach(
    ([group, values]) => {
      (Object.entries(values) as Array<[string, number]>).forEach(([key, value]) => {
        rootStyle.setProperty(`--md-sys-density-${group}-${key}`, String(value));
      });
    }
  );

  staticTokensApplied = true;
}

function handleSystemChange(event: MediaQueryListEvent) {
  if (followSystem) {
    applyScheme(event.matches ? 'dark' : 'light');
  }
}

function createTheme(options: BaseMaterialThemeOptions): Theme {
  return themeFromSourceColor(argbFromHex(options.seedColor), [
    { name: 'secondary', value: argbFromHex(options.secondaryColor), blend: true },
    { name: 'tertiary', value: argbFromHex(options.tertiaryColor), blend: true },
    { name: 'neutral', value: argbFromHex(options.neutralColor), blend: true },
    {
      name: 'neutralVariant',
      value: argbFromHex(options.neutralVariantColor),
      blend: true,
    },
    { name: 'success', value: argbFromHex(options.successColor), blend: true },
    { name: 'warning', value: argbFromHex(options.warningColor), blend: true },
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

  const merged: BaseMaterialThemeOptions = { ...DEFAULT_OPTIONS, ...options };
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
