/**
 * Theme resuelto para React Native. Los colores se resuelven a hex por modo
 * (RN no soporta CSS vars). Espaciado/tipografía/radios son mode-independientes.
 */
import { color, type Mode } from '../tokens/colors';
import { space, fontSize, fontWeight, lineHeight, radius } from '../tokens/scales';

type ColorTokens = typeof color;
type ResolvedColors = { [G in keyof ColorTokens]: { [K in keyof ColorTokens[G]]: string } };

function resolveColors(mode: Mode): ResolvedColors {
  const out = {} as ResolvedColors;
  for (const group of Object.keys(color) as (keyof ColorTokens)[]) {
    const keys = color[group];
    const resolved = {} as Record<string, string>;
    for (const key of Object.keys(keys)) {
      resolved[key] = (keys as Record<string, { light: string; dark: string }>)[key]![mode];
    }
    (out as Record<string, unknown>)[group] = resolved;
  }
  return out;
}

/** Sombras estilo React Native (iOS shadow* + Android elevation). */
const rnShadow = {
  light: {
    raised: { shadowColor: '#091E42', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, shadowRadius: 1, elevation: 1 },
    overlay: { shadowColor: '#091E42', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  },
  dark: {
    raised: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 1, elevation: 1 },
    overlay: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 12, elevation: 8 },
  },
} as const;

export function createTheme(mode: Mode) {
  return {
    mode,
    color: resolveColors(mode),
    space,
    fontSize,
    fontWeight,
    lineHeight,
    radius,
    shadow: rnShadow[mode],
  } as const;
}

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export type Theme = ReturnType<typeof createTheme>;
