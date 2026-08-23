/**
 * Generación de CSS custom properties desde los tokens (fuente de verdad TS).
 * El web app inyecta buildThemeCss() en el <head> del root layout (Fase 0c).
 *
 * Estrategia dark-first + respeta sistema + override explícito por perfil:
 *   :root                                         → DARK (base)
 *   @media (prefers-color-scheme: light)
 *     :root:not([data-theme="dark"])              → LIGHT (respeta sistema)
 *   :root[data-theme="light"]                     → LIGHT (override)
 *   :root[data-theme="dark"]                      → DARK  (override)
 */
import { color, type Mode } from '../tokens/colors';
import { shadow } from '../tokens/shadows';

/** Nombre de la CSS var para un color semántico, p.ej. cssVar('surface','base'). */
export function cssVar(group: string, key: string): string {
  return `var(--color-${group}-${key})`;
}

/** Nombre de la CSS var para una sombra, p.ej. shadowVar('raised'). */
export function shadowVar(key: string): string {
  return `var(--shadow-${key})`;
}

function declarationsFor(mode: Mode): string {
  const lines: string[] = [];
  for (const [group, keys] of Object.entries(color)) {
    for (const [key, value] of Object.entries(keys)) {
      lines.push(`  --color-${group}-${key}: ${value[mode]};`);
    }
  }
  for (const [key, value] of Object.entries(shadow)) {
    lines.push(`  --shadow-${key}: ${value[mode]};`);
  }
  return lines.join('\n');
}

/** CSS completo con las 4 capas de la estrategia dark-first. */
export function buildThemeCss(): string {
  const dark = declarationsFor('dark');
  const light = declarationsFor('light');
  return [
    `:root {\n${dark}\n}`,
    `@media (prefers-color-scheme: light) {\n  :root:not([data-theme="dark"]) {\n${light}\n  }\n}`,
    `:root[data-theme="light"] {\n${light}\n}`,
    `:root[data-theme="dark"] {\n${dark}\n}`,
  ].join('\n\n');
}
