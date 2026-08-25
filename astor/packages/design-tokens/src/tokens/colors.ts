/**
 * Colores semánticos (light / dark).
 * Paleta base: negro neutro #0A0A0C (dark) · Wheat #FFF6E9 (light) · Oceanic #003F47 ·
 * Nectarine #FFBD76 + verde césped, usados SOLO como acentos. Fuente de verdad; sincronizado con
 * .docs/visual-design/tokens.reference.md.
 * Los componentes NUNCA usan hex crudo: consumen estos tokens.
 */

export type Mode = 'light' | 'dark';
export interface ColorValue {
  readonly light: string;
  readonly dark: string;
}

export const color = {
  // Superficies: negro neutro en dark (los colores son acentos), Wheat en light.
  surface: {
    base: { light: '#FFF6E9', dark: '#0A0A0C' },
    raised: { light: '#FFFFFF', dark: '#131317' },
    overlay: { light: '#FFFFFF', dark: '#1C1C22' },
    sunken: { light: '#F6EAD5', dark: '#060607' },
  },
  text: {
    default: { light: '#0A171D', dark: '#ECECEF' },
    subtle: { light: '#45565E', dark: '#A6A6AD' },
    subtlest: { light: '#6B7C84', dark: '#70707A' },
    inverse: { light: '#FFF6E9', dark: '#0A0A0C' },
    disabled: { light: '#9AA7AD', dark: '#4C4C54' },
  },
  border: {
    default: { light: '#E4D8C2', dark: '#2A2A31' },
    subtle: { light: '#EFE6D5', dark: '#1D1D22' },
    focus: { light: '#007A8A', dark: '#3FA9B8' },
  },
  // Brand: Oceanic (teal). En dark se aclara para contraste.
  brand: {
    default: { light: '#005A66', dark: '#3FA9B8' },
    bold: { light: '#003F47', dark: '#5FC0CE' },
    text: { light: '#005A66', dark: '#8AD3DE' },
  },
  danger: {
    default: { light: '#C9372C', dark: '#F87168' },
    text: { light: '#AE2A19', dark: '#FD9891' },
    subtle: { light: '#FFECEB', dark: '#42221F' },
  },
  // Success: verde césped.
  success: {
    default: { light: '#4E9A3E', dark: '#7CC96A' },
    text: { light: '#2E6B26', dark: '#A7E09A' },
    subtle: { light: '#E4F5DE', dark: '#14290F' },
  },
  warning: {
    default: { light: '#E2B203', dark: '#F5CD47' },
    text: { light: '#7F5F01', dark: '#F8E6A0' },
    subtle: { light: '#FFF7D6', dark: '#332E1B' },
  },
  discovery: {
    default: { light: '#6E5DC6', dark: '#9F8FEF' },
    text: { light: '#5E4DB2', dark: '#B8ACF6' },
    subtle: { light: '#F3F0FF', dark: '#2B2451' },
  },
  // Firma Astor — Nectarine (durazno cálido). Acento de "ahora"/rachas.
  signature: {
    default: { light: '#C77A22', dark: '#FFBD76' },
    text: { light: '#8A4E12', dark: '#FFD5A3' },
    soft: { light: '#FFEBD0', dark: '#2A1D0F' },
  },
} as const satisfies Record<string, Record<string, ColorValue>>;

export type ColorGroup = keyof typeof color;
