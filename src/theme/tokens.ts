import type { Scheme } from '@material/material-color-utilities';

export type ThemeMode = 'light' | 'dark';

export const COLOR_ROLE_TOKENS: Array<keyof ReturnType<Scheme['toJSON']>> = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'surfaceBright',
  'surfaceDim',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'surfaceContainerLow',
  'surfaceContainerLowest',
  'inverseSurface',
  'inverseOnSurface',
  'inversePrimary',
  'background',
  'onBackground',
  'outline',
  'outlineVariant',
  'shadow',
  'scrim',
  'surfaceTint',
];

export const STATE_LAYER_OPACITY: Record<ThemeMode, Record<'primary' | 'onSurface', number>> = {
  light: {
    primary: 0.12,
    onSurface: 0.12,
  },
  dark: {
    primary: 0.16,
    onSurface: 0.12,
  },
};

export const STRONG_STATE_LAYER_OPACITY: Record<ThemeMode, number> = {
  light: 0.2,
  dark: 0.24,
};

export const ELEVATION_SHADOWS: Record<
  ThemeMode,
  Record<'level1' | 'level2' | 'level3', string>
> = {
  light: {
    level1: '0px 1px 3px rgba(17, 24, 39, 0.16), 0px 2px 6px rgba(17, 24, 39, 0.12)',
    level2: '0px 4px 12px rgba(17, 24, 39, 0.16), 0px 2px 6px rgba(17, 24, 39, 0.12)',
    level3: '0px 8px 20px rgba(17, 24, 39, 0.24), 0px 4px 8px rgba(17, 24, 39, 0.16)',
  },
  dark: {
    level1: '0px 1px 3px rgba(0, 0, 0, 0.55), 0px 2px 6px rgba(0, 0, 0, 0.45)',
    level2: '0px 4px 12px rgba(0, 0, 0, 0.48), 0px 2px 8px rgba(0, 0, 0, 0.32)',
    level3: '0px 10px 24px rgba(0, 0, 0, 0.55), 0px 6px 16px rgba(0, 0, 0, 0.36)',
  },
};

export const TYPOGRAPHY_SCALE = {
  fontFamily:
    "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  display: {
    large: { size: '3.5625rem', lineHeight: '4rem', weight: 400, tracking: '0em' },
    medium: { size: '2.8125rem', lineHeight: '3.25rem', weight: 400, tracking: '0em' },
    small: { size: '2.25rem', lineHeight: '2.75rem', weight: 400, tracking: '0em' },
  },
  headline: {
    large: { size: '2rem', lineHeight: '2.5rem', weight: 400, tracking: '0em' },
    medium: { size: '1.75rem', lineHeight: '2.25rem', weight: 400, tracking: '0em' },
    small: { size: '1.5rem', lineHeight: '2rem', weight: 400, tracking: '0em' },
  },
  title: {
    large: { size: '1.375rem', lineHeight: '1.75rem', weight: 500, tracking: '0em' },
    medium: { size: '1rem', lineHeight: '1.5rem', weight: 500, tracking: '0.009375em' },
    small: { size: '0.875rem', lineHeight: '1.25rem', weight: 500, tracking: '0.00625em' },
  },
  body: {
    large: { size: '1rem', lineHeight: '1.5rem', weight: 400, tracking: '0.03125em' },
    medium: { size: '0.875rem', lineHeight: '1.25rem', weight: 400, tracking: '0.017857em' },
    small: { size: '0.75rem', lineHeight: '1rem', weight: 400, tracking: '0.033333em' },
  },
  label: {
    large: { size: '0.875rem', lineHeight: '1.25rem', weight: 500, tracking: '0.00625em' },
    medium: { size: '0.75rem', lineHeight: '1rem', weight: 500, tracking: '0.041667em' },
    small: { size: '0.6875rem', lineHeight: '1rem', weight: 500, tracking: '0.045455em' },
  },
};

export const SHAPE_SCALE = {
  small: '0.5rem',
  medium: '0.75rem',
  large: '1rem',
  extraLarge: '1.5rem',
  doubleExtraLarge: '2rem',
  tripleExtraLarge: '2.5rem',
  quadrupleExtraLarge: '3rem',
  quintupleExtraLarge: '3.5rem',
  full: '9999px',
};

export const SPACING_SCALE = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const DIMENSION_SCALE = {
  icon: {
    small: '1rem',
    medium: '1.5rem',
    large: '3rem',
  },
};

export const BREAKPOINTS = {
  sm: '40rem',
  md: '56rem',
  lg: '72rem',
  xl: '90rem',
};

export const LAYOUT_CONTAINERS = {
  compact: '56rem',
  medium: '72rem',
  expanded: '90rem',
};

export const APP_BAR_HEIGHTS = {
  small: '3.5rem',
  medium: '4.5rem',
  large: '6rem',
};
