/**
 * Colores semánticos (light / dark) — derivados de los fundamentos de Atlassian.
 * Fuente de verdad; sincronizado con .docs/visual-design/tokens.reference.md.
 * Los componentes NUNCA usan hex crudo: consumen estos tokens vía CSS vars (web)
 * o el objeto theme (mobile).
 */

export type Mode = 'light' | 'dark';
export interface ColorValue {
  readonly light: string;
  readonly dark: string;
}

export const color = {
  surface: {
    base: { light: '#FFFFFF', dark: '#101214' },
    raised: { light: '#FFFFFF', dark: '#161A1D' },
    overlay: { light: '#FFFFFF', dark: '#22272B' },
    sunken: { light: '#F7F8F9', dark: '#0D0F10' },
  },
  text: {
    default: { light: '#172B4D', dark: '#E7EDF3' },
    subtle: { light: '#44546F', dark: '#9FADBC' },
    subtlest: { light: '#626F86', dark: '#7A8896' },
    inverse: { light: '#FFFFFF', dark: '#1D2125' },
    disabled: { light: '#8993A4', dark: '#5A6572' },
  },
  border: {
    default: { light: '#DCDFE4', dark: '#2C333A' },
    subtle: { light: '#EBECF0', dark: '#22272B' },
    focus: { light: '#388BFF', dark: '#4C9AFF' },
  },
  brand: {
    default: { light: '#0C66E4', dark: '#4C9AFF' },
    bold: { light: '#0055CC', dark: '#579DFF' },
    text: { light: '#0C66E4', dark: '#85B8FF' },
  },
  danger: {
    default: { light: '#C9372C', dark: '#F87168' },
    text: { light: '#AE2A19', dark: '#FD9891' },
    subtle: { light: '#FFECEB', dark: '#42221F' },
  },
  success: {
    default: { light: '#22A06B', dark: '#4BCE97' },
    text: { light: '#216E4E', dark: '#7EE2B8' },
    subtle: { light: '#DCFFF1', dark: '#1C3329' },
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
  // Firma Astor — ámbar "ojos de pantera". Acento cálido, uso ≤10% (Restrained).
  signature: {
    default: { light: '#B45309', dark: '#F4B860' },
    text: { light: '#92400E', dark: '#F8CE97' },
    soft: { light: '#FBEBD2', dark: '#2A2013' },
  },
} as const satisfies Record<string, Record<string, ColorValue>>;

export type ColorGroup = keyof typeof color;
