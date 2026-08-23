# CLAUDE.md — Astor

Archivo de orientación para toda sesión de Edit futura. Leelo antes de tocar código.
La documentación viva vive en `../.docs/`.

---

## Visión

Astor es el **dashboard personal y sistema de ejecución diaria** del owner (tareas, hábitos,
entrenamientos, finanzas, estudios, enfoque) y, encima, la **capa a la que se conecta el agente
personal Hermes** desde afuera.

El valor no es "5 apps en 1" (commoditizado). Es **ejecución diaria con captura sin fricción y
contexto local argentino** (blue/MEP, cuotas AR, tarjetas AR), más una capa de agente reservada al
owner. Se compite por **confiabilidad y contexto local**, no por cantidad de features.

## Distinción crítica: app vs. agente (nunca perderla)

- **La app es multi-tenant desde el día uno.** En el futuro puede tener usuarios reales, que solo
  ven la **capa de app** (UI web + mobile). RLS por `user_id` en TODO. Sin billing todavía, pero el
  esquema deja lugar (`profiles.entitlements`) para un eventual pago único.
- **La capa de agente (Hermes) es solo para el owner.** No se le crea un agente a cada usuario. El
  acceso de agente (REST `/api/v1`, MCP, webhooks) se **gatea por `profiles.agent_enabled`**
  (default `false`; solo el owner en `true`). Usuario normal → **403** y ni ve esas superficies.

## Arquitectura en una frase

**Una sola capa de dominio** (`packages/core`, validada con Zod). UI, REST, MCP, Telegram y webhooks
son **adaptadores finos** sobre ella. El LLM nunca escribe SQL: devuelve tool-calls cuyos argumentos
se validan con los mismos schemas de `core` antes de ejecutarse.

Superficies de agente = **route handlers de Next.js en Vercel** (`apps/web/app/api/{v1,telegram,mcp,internal}`),
un solo runtime Node que consume `core` directo. La lógica de Hermes vive en `packages/agent`; los
route handlers la envuelven.

## Monorepo (pnpm + Turborepo)

```
apps/web        Next.js 15 App Router + Tailwind → Vercel (UI + superficies de agente)
apps/mobile     Expo + Expo Router
packages/core           capa de dominio (zod schemas, reglas, funciones)
packages/design-tokens  tokens Atlassian → web (css vars + tailwind preset) + rn (theme)
packages/supabase       cliente tipado, tipos generados, queries por dominio
packages/agent          Hermes: LLMProvider, OpenRouterProvider, prompts, tools, bot composer, MCP factory
packages/i18n           catálogos es-AR, helpers luxon/timezone
packages/config         tsconfig/eslint/prettier compartidos
supabase/               config + espejo opcional de migraciones (fuente pegable: ../.docs/migrations)
```

## Convenciones

**Naming.** Paquetes `@astor/<nombre>`. Archivos y carpetas en kebab-case; tipos/clases en PascalCase;
funciones y variables en camelCase. Tablas y columnas SQL en snake_case. Enums SQL en snake_case.

**Cómo agregar una migración.**
1. Crear `../.docs/migrations/000N_<tema>.sql` con el siguiente número libre.
2. Incluir SIEMPRE: tablas, índices, `enable row level security`, policies (con `auth.uid()`),
   trigger de `updated_at` (usa `public.set_updated_at()` de 0000), y un bloque `-- ROLLBACK` comentado.
3. Debe ser **pegable sin editar** en el editor SQL de Supabase, e idempotente donde se pueda
   (`if not exists`, `create or replace`, `do $$ … exception when duplicate_object`).
4. Actualizar el índice de migraciones en `../.docs/data-model.md` y marcar la fase.

**Cómo agregar una función de dominio (mutación).**
1. En `packages/core/src/<módulo>/schema.ts`: schema Zod de input y de entidad.
2. En `packages/core/src/<módulo>/functions.ts`: función tipada que valida input y ejecuta vía
   `packages/supabase`. Nunca SQL libre desde texto del LLM.
3. Reusarla desde UI, REST, MCP y bot. No duplicar reglas en los adaptadores.
4. Test de dominio en `packages/core` (cross-cutting: siempre).

**Cómo agregar una tool de agente.**
1. Registrar en `packages/agent` (tool registry): `name`, schema Zod (el de `core`), función de
   dominio a invocar, y si `requiresConfirmation`.
2. Documentarla en `../.docs/skills/skills.md`.
3. Las tres superficies (REST/MCP/bot) la exponen automáticamente si están gateadas por `agent_enabled`.

**Cómo agregar un módulo.** Migración numerada → schemas+funciones en `core` → queries en `supabase`
→ UI web + mobile → tools de agente → entradas en `data-model.md`, `roadmap.md`, `skills.md`, `CHANGELOG.md`.

**Seguridad.** `service_role` solo en backend (route handlers/cron/bot/mcp), nunca en cliente. PATs
guardados como hash. Webhooks firmados con HMAC. RLS en toda tabla.

**i18n / tiempo.** `es-AR` default desde el inicio. Fechas/recurrencia/briefings con `luxon` y la
`timezone` del perfil. Nunca asumir zona del servidor.

**Notas de infra (no romper sin querer).** En `pnpm-workspace.yaml` hay `overrides`:
- `@supabase/supabase-js: 2.45.4` — el shape de tipos que espera `packages/supabase` (hand-authored).
  Subir requiere regenerar tipos con `supabase gen types`.
- `react/react-dom: 18.3.1` + `@types/react(-dom)` 18.x — Expo 52 fija React 18; Next 15 lo soporta.
  Una sola copia evita el choque de tipos `ReactNode` entre web y mobile.
El dev del web corre con `NODE_OPTIONS=--max-http-header-size=81920` (evita HTTP 431 por cookies
acumuladas en el dominio `localhost`). Componentes shadcn: hand-authored en `apps/web/components/ui`,
mapeados a los tokens vía el bridge del `tailwind.config`. Pantallas mobile en `apps/mobile/app/(app)`.

## Estado del roadmap

- **Fase 0 — Fundaciones** ✅ (monorepo/tooling/`.docs`/migraciones · design-tokens · auth + shell web + shell mobile en paridad)
- **Fase 1 — Loop núcleo** ✅ (core+supabase+migraciones+tests · UI web shadcn + branding pantera · login split + usuarios dummy · paridad mobile Tabs + realtime)
- **Fase 2 — Hermes v0 (owner)** ⬜
- **Fase 3 — Finanzas (AR)** ⬜
- **Fase 4 — Entrenamientos + Estudios + Enfoque** ⬜
- **Fase 5 — MCP + webhooks + Google Calendar + WhatsApp** ⬜

Detalle y criterios de "listo" en `../.docs/roadmap.md`.
