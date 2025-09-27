declare module '@material/material-color-utilities' {
  export interface Scheme {
    toJSON(): Record<string, number | string>;
  }

  export interface Theme {
    schemes: {
      light: Scheme;
      dark: Scheme;
    };
  }

  export interface PaletteOverride {
    name: string;
    value: number;
    blend?: boolean;
  }

  export function argbFromHex(hex: string): number;
  export function hexFromArgb(argb: number): string;
  export function themeFromSourceColor(seed: number, overrides?: PaletteOverride[]): Theme;
}
