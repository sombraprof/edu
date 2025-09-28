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
import { DEFAULT_THEME_OPTIONS, type BaseMaterialThemeOptions } from './base-palette';
type ThemePreference = ThemeMode | 'system';

type MaterialThemeOptions = Partial<BaseMaterialThemeOptions>;

const STORAGE_KEY = 'theme';
const DEFAULT_OPTIONS: BaseMaterialThemeOptions = DEFAULT_THEME_OPTIONS;

type CustomColorDefinition =
  | string
  | {
      color?: string;
      value?: string;
    };

interface MaterialThemeOptions {
  seedColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  neutralColor?: string;
  neutralVariantColor?: string;
  success?: CustomColorDefinition;
  warning?: CustomColorDefinition;
}

const STORAGE_KEY = 'theme';
const DEFAULT_SUCCESS_COLOR = '#4caf50';
const DEFAULT_WARNING_COLOR = '#ff9800';

const DEFAULT_OPTIONS: Required<MaterialThemeOptions> = {
  seedColor: '#2563eb',
  secondaryColor: '#7c3aed',
  tertiaryColor: '#f97316',
  neutralColor: '#6b6f7c',
  neutralVariantColor: '#687385',
  success: DEFAULT_SUCCESS_COLOR,
  warning: DEFAULT_WARNING_COLOR,
};

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

const CUSTOM_COLOR_TOKEN_MAP: Record<string, [string, string, string, string]> = {
  success: ['success', 'onSuccess', 'successContainer', 'onSuccessContainer'],
  warning: ['warning', 'onWarning', 'warningContainer', 'onWarningContainer'],
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

function resolveCustomColorDefinition(definition: CustomColorDefinition, fallback: string): string {
  if (typeof definition === 'string') {
    return definition;
  }

  if (definition) {
    if (typeof definition.color === 'string' && definition.color.trim().length > 0) {
      return definition.color;
    }

    if (typeof definition.value === 'string' && definition.value.trim().length > 0) {
      return definition.value;
    }
  }

  return fallback;
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

  customColorGroups.forEach((customColor) => {
    const tokens = CUSTOM_COLOR_TOKEN_MAP[customColor.color.name];

    if (!tokens) {
      return;
    }

    const group = mode === 'dark' ? customColor.dark : customColor.light;
    const [colorToken, onColorToken, containerToken, onContainerToken] = tokens;

    setColorToken(rootStyle, colorToken, group.color);
    setColorToken(rootStyle, onColorToken, group.onColor);
    setColorToken(rootStyle, containerToken, group.colorContainer);
    setColorToken(rootStyle, onContainerToken, group.onColorContainer);
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
  rootStyle.setProperty('--md-sys-elevation-level1', elevation.level1);
  rootStyle.setProperty('--md-sys-elevation-level2', elevation.level2);
  rootStyle.setProperty('--md-sys-elevation-level3', elevation.level3);
  // Maintain legacy aliases while components migrate fully to the new tokens.
  rootStyle.setProperty('--shadow-elevation-1', elevation.level1);
  rootStyle.setProperty('--shadow-elevation-2', elevation.level2);
  rootStyle.setProperty('--shadow-elevation-3', elevation.level3);

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
    { name: 'success', value: argbFromHex(successColor), blend: true },
    { name: 'warning', value: argbFromHex(warningColor), blend: true },
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
