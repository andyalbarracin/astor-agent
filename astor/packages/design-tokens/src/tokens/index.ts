/** Agregador de tokens primitivos (fuente de verdad). */
export * from './colors';
export * from './scales';
export * from './shadows';

import { color } from './colors';
import { space, fontFamily, fontSize, fontWeight, lineHeight, radius } from './scales';
import { shadow } from './shadows';

export const tokens = {
  color,
  space,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadow,
} as const;

export type Tokens = typeof tokens;
