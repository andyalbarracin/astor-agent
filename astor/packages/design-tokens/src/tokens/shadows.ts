/**
 * Elevación (light / dark). En dark la elevación se comunica sobre todo con
 * surface.raised/overlay más claros que surface.base; las sombras son sutiles.
 */
import type { ColorValue } from './colors';

export const shadow = {
  raised: {
    light: '0 1px 1px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.13)',
    dark: '0 1px 1px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.5)',
  },
  overlay: {
    light: '0 8px 12px rgba(9,30,66,0.15), 0 0 1px rgba(9,30,66,0.31)',
    dark: '0 8px 12px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.6)',
  },
} as const satisfies Record<string, ColorValue>;

export type ShadowToken = keyof typeof shadow;
