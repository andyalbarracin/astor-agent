# Astor — Diseño visual

> Documento vivo. Fundamentos derivados de **Atlassian Design System**
> (https://atlassian.design/) — NO `@atlaskit` (web-only, React viejo, no corre en RN).

## Estrategia

`packages/design-tokens` es la **única fuente de verdad** visual. Una definición en TS produce dos
salidas desde los mismos tokens semánticos:

- **Web:** CSS custom properties (`:root` para light, `[data-theme="dark"]` para dark) + un
  `tailwind-preset` que mapea las vars a la escala de Tailwind (`bg-surface`, `text-default`, etc.).
- **Mobile:** un objeto `theme` tipado + `ThemeProvider` (React Native) que expone los mismos tokens.

Los componentes **nunca** usan hex crudo: consumen tokens semánticos. Cambiar un valor se hace en un
solo lugar y se propaga a web y mobile.

## Modo claro / oscuro

**Default dark** (estética de referencia: superficies oscuras, mucho aire, headers grandes, acentos
sobrios — ver capturas de Rimu en el brief). Se respeta la preferencia del sistema
(`prefers-color-scheme` en web, `Appearance` en RN) y `profiles.theme` (`system|light|dark`) la
puede sobreescribir por usuario.

## Tokens semánticos (claves)

Ocho familias, más interacción y foco. Valores completos light/dark en `tokens.reference.md`.

| Familia | Claves | Uso |
|---|---|---|
| `surface` | `base`, `raised`, `overlay`, `sunken` | Fondos por nivel de elevación. |
| `text` | `default`, `subtle`, `subtlest`, `inverse`, `disabled` | Jerarquía tipográfica. |
| `border` | `default`, `subtle`, `focus` | Divisores, inputs, anillo de foco. |
| `brand` | `default`, `bold`, `text` | Acción primaria, links, acentos. |
| `danger` | `default`, `text`, `subtle` | Errores, destructivo, egresos. |
| `success` | `default`, `text`, `subtle` | Confirmaciones, ingresos, rachas. |
| `warning` | `default`, `text`, `subtle` | Vencimientos próximos, avisos. |
| `discovery` | `default`, `text`, `subtle` | Novedades, features de agente. |

## Mapa tokens Atlassian → claves semánticas

Los tokens semánticos derivan de los **fundamentos** de Atlassian (paleta de neutrales y de color,
escala de espaciado de 4px, tipografía, elevación). No importamos su librería; replicamos los
valores como tokens propios.

| Fundamento Atlassian | → Clave semántica Astor |
|---|---|
| Neutrals (N0…N1000 / DarkNeutral) | `surface.*`, `text.*`, `border.*` |
| Blue (B) | `brand.*`, `border.focus`, link |
| Red (R) | `danger.*` |
| Green (G) | `success.*` |
| Yellow (Y) | `warning.*` |
| Purple (P) | `discovery.*` |
| Space scale (4px base) | `space.*` (ver tokens.reference) |
| Type scale | `font.size.*`, `font.lineHeight.*` |
| Elevation | `shadow.raised`, `shadow.overlay` |

## Espaciado, tipografía, radios, elevación

- **Espaciado** — escala de 4px de Atlassian: `0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64`.
- **Tipografía** — stack de sistema (`-apple-system, Segoe UI, Roboto, …`) con `Inter` opcional en
  web. Escala: `11, 12, 14, 16, 20, 24, 29, 35`. Headers grandes (estética de referencia).
- **Radios** — `3` (inputs), `6` (botones/cards chicas), `8` (cards), `full` (pills/avatares).
- **Elevación** — `shadow.raised` (cards), `shadow.overlay` (menús/diálogos). En dark, la elevación
  se comunica sobre todo con `surface.raised/overlay` más claros que `surface.base`.

## Iconografía

`lucide` alineado al estilo Atlassian (`lucide-react` en web, `lucide-react-native` en mobile), con
un **mapa único `nombre → componente` por plataforma** para no dispersar imports. Un mismo nombre
lógico (`icon.task`, `icon.habit`, `icon.money`…) resuelve al componente correcto en cada plataforma.

## Accesibilidad

- Contraste mínimo AA para `text.default`/`text.subtle` sobre sus superficies.
- Anillo de foco visible (`border.focus`) en todo elemento interactivo.
- No comunicar estado solo por color (íconos/label además de `danger`/`success`).
