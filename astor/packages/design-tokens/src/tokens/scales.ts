/**
 * Escalas mode-independientes: espaciado (4px base), tipografía, radios.
 * Derivadas de los fundamentos de Atlassian.
 */

/** Espaciado en px. Claves con la nomenclatura de Atlassian (space.100 = 8px). */
export const space = {
  '0': 0,
  '025': 2,
  '050': 4,
  '100': 8,
  '150': 12,
  '200': 16,
  '300': 24,
  '400': 32,
  '500': 40,
  '600': 48,
  '800': 64,
} as const;

export const fontFamily = {
  sans: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;

/** Tamaños de fuente en px. */
export const fontSize = {
  '100': 11,
  '200': 12,
  '300': 14,
  '400': 16,
  '500': 20,
  '600': 24,
  '700': 29,
  '800': 35,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.2,
  default: 1.5,
} as const;

/** Radios en px (full = pill). */
export const radius = {
  sm: 3,
  md: 6,
  lg: 8,
  full: 9999,
} as const;
