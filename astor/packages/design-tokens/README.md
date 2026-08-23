# @astor/design-tokens

Fuente de verdad visual, derivada de los fundamentos de Atlassian Design System (no `@atlaskit`).
Una definición TS → salidas web y mobile. Sincronizado con `../../../.docs/visual-design/`.

## Estructura

```
src/
├── tokens/     colors (light/dark), scales (space/type/radius), shadows  ← fuente de verdad
├── web/        css-vars (CSS custom properties) + tailwind-preset
├── mobile/     theme (resuelto por modo) + ThemeProvider (RN)
└── index.ts    export agnóstico de plataforma
```

## Uso — web (Fase 0c)

```ts
// tailwind.config.ts
import { astorPreset } from '@astor/design-tokens/tailwind';
export default { presets: [astorPreset], content: [...] };
```

```tsx
// app/layout.tsx — inyectar las vars (dark-first + respeta sistema + override por perfil)
import { buildThemeCss } from '@astor/design-tokens/css';
// <html data-theme={profile?.theme === 'system' ? undefined : profile?.theme}>
//   <head><style dangerouslySetInnerHTML={{ __html: buildThemeCss() }} /></head>
```

Utilidades resultantes: `bg-surface-base`, `text-fg-subtle`, `border-line-default`,
`ring-line-focus`, `bg-brand-default`, `text-danger-text`, `bg-success-subtle`, `shadow-raised`,
`p-200`, `text-600`, `rounded-lg`, …

## Uso — mobile (Fase 0d)

```tsx
import { ThemeProvider, useTheme } from '@astor/design-tokens/mobile';

// raíz: <ThemeProvider initialPreference={profile.theme}>…</ThemeProvider>
const t = useTheme();
// t.color.surface.base, t.space['200'], t.radius.lg, t.shadow.raised
```

## Estrategia de tema

Dark-first, respeta `prefers-color-scheme` / `Appearance`, y `profiles.theme`
(`system|light|dark`) lo puede sobreescribir por usuario. Detalle en
`../../../.docs/visual-design/design.md`.
