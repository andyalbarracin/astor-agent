/**
 * Preset de Tailwind para el web app. Mapea los tokens semánticos a utilidades
 * que apuntan a las CSS vars generadas por css-vars.ts (buildThemeCss()).
 *
 * Nomenclatura de utilidades (para evitar `text-text-*` / `border-border-*`):
 *   - color.text.*   → grupo `fg`   → text-fg-default, text-fg-subtle, …
 *   - color.border.* → grupo `line` → border-line-default, ring-line-focus, …
 *   - resto igual:      bg-surface-raised, bg-brand-default, text-danger-text,
 *                       bg-danger-subtle, bg-success-subtle, …
 *
 * Uso en apps/web/tailwind.config: `presets: [astorPreset]`.
 * Requiere que el layout inyecte buildThemeCss() (definir las vars en runtime).
 */
import { color } from '../tokens/colors';
import { space, fontFamily, fontSize, fontWeight, lineHeight, radius } from '../tokens/scales';
import { cssVar, shadowVar } from './css-vars';

const GROUP_ALIAS: Record<string, string> = { text: 'fg', border: 'line' };

function colorUtilities(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [group, keys] of Object.entries(color)) {
    const alias = GROUP_ALIAS[group] ?? group;
    out[alias] = {};
    for (const key of Object.keys(keys)) {
      out[alias][key] = cssVar(group, key);
    }
  }
  return out;
}

function pxScale(scale: Record<string, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, `${v}px`]));
}

const fontSizeUtilities: Record<string, [string, { lineHeight: string }]> = Object.fromEntries(
  Object.entries(fontSize).map(([k, v]) => [k, [`${v}px`, { lineHeight: String(lineHeight.default) }]]),
);

export const astorPreset = {
  theme: {
    extend: {
      colors: colorUtilities(),
      spacing: pxScale(space),
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        full: `${radius.full}px`,
      },
      fontFamily: {
        sans: [fontFamily.sans],
      },
      fontSize: fontSizeUtilities,
      fontWeight: {
        regular: String(fontWeight.regular),
        medium: String(fontWeight.medium),
        semibold: String(fontWeight.semibold),
        bold: String(fontWeight.bold),
      },
      lineHeight: {
        tight: String(lineHeight.tight),
        DEFAULT: String(lineHeight.default),
      },
      boxShadow: {
        raised: shadowVar('raised'),
        overlay: shadowVar('overlay'),
      },
    },
  },
};

export default astorPreset;
