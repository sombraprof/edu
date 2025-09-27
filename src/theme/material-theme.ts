import { ref, type Ref } from 'vue';
import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
  type Scheme,
} from '@material/material-color-utilities';

type ThemeMode = 'light' | 'dark';
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
  const palette = scheme.toJSON();

  Object.entries(palette).forEach(([token, value]) => {
    document.documentElement.style.setProperty(toCssVarName(token), toHex(value));
  });

  const primary = toHex(palette.primary);
  const onSurface = toHex(palette.onSurface);

  // Derived tokens for state layers based on MD3 guidance.
  document.documentElement.style.setProperty(
    '--md-sys-state-layer-primary',
    rgba(primary, mode === 'dark' ? 0.16 : 0.12)
  );
  document.documentElement.style.setProperty(
    '--md-sys-state-layer-primary-strong',
    rgba(primary, mode === 'dark' ? 0.24 : 0.2)
  );
  document.documentElement.style.setProperty(
    '--md-sys-state-layer-on-surface',
    rgba(onSurface, 0.12)
  );

  document.documentElement.dataset.theme = mode;
  document.documentElement.style.setProperty('color-scheme', mode);
  activeMode.value = mode;
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
