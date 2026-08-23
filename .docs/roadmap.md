# Astor — Roadmap

> Documento vivo. Estado: ✅ hecho · 🚧 en curso · ⬜ planeado.
> El orden lo gobierna el presupuesto de tokens: primero lo barato/frecuente/sinérgico, después lo
> pesado. **Todos los módulos entran**; lo que varía es el orden de construcción.

---

## Fase 0 — Fundaciones ✅

Subdividida por la decisión de paridad web+mobile.

| Sub | Qué | Estado |
|---|---|---|
| 0a | Monorepo (pnpm+Turborepo), `packages/config`, `.env.example`, `.docs/*` completo, `CLAUDE.md`, migraciones `0000`+`0001`. Prerequisito: crear proyecto Supabase + Vercel. | ✅ |
| 0b | `packages/design-tokens`: definición TS → web (css vars + tailwind preset) + mobile (theme + ThemeProvider). | ✅ |
| 0c | Auth (email + magic link) + `profiles` + shell web (nav, tema claro/oscuro, dashboard vacío, gate de sesión). | ✅ |
| 0d | Shell mobile en paridad (Expo Router, ThemeProvider, auth por deep link, dashboard, Metro transpila workspace). | ✅ |

- **Stack:** Next.js 15, Expo, Supabase (Auth + Postgres + RLS), Tailwind, luxon.
- **Listo cuando:** `pnpm install` + `turbo build` verdes; login web y mobile; `profiles` creado al
  alta; RLS aísla usuarios; toggle de tema respeta el sistema.
- **Riesgo principal:** monorepo Expo+Next con workspace packages (config de Metro).

## Fase 1 — Loop núcleo ✅

`packages/core` + **Tareas** (Kanban/Eisenhower/recurrencia RRULE/checklist) + **Hábitos**
(rachas/heatmap/skip). Realtime sync. Migraciones `0002`, `0003`. Subdividida:

| Sub | Qué | Estado |
|---|---|---|
| 1a | Migraciones `0002`/`0003` + `packages/supabase` (tipos) + `packages/core` (schemas Zod, funciones de dominio de tareas/hábitos, recurrencia RRULE, rachas/heatmap) + tests. | ✅ |
| 1b | UI web de Tareas (Kanban/Eisenhower/checklist) + Hábitos (log/racha/heatmap). Base shadcn + branding pantera. Login split + usuarios dummy. | ✅ |
| 1c | Paridad mobile (Tabs Hoy/Tareas/Hábitos) + realtime sync (Supabase). | ✅ |

- **Listo cuando:** CRUD + recurrencia + rachas en web y mobile; RLS verificada; tests de `core` verdes.
- **Riesgo:** correcta expansión de RRULE con timezone del perfil (luxon).

## Fase 2 — Hermes v0 (owner) ⬜

Tool registry + `OpenRouterProvider` (fallback chain), REST `/api/v1` con PAT, webhook Telegram
(grammY) + parse NL (crear/completar/listar; voz stub), vinculación por `link_code`, briefings por
cron (Vercel Cron). Auditoría con `cost_usd`. MCP y webhooks salientes: estructura + gating, tools
mínimas. Migraciones `0004`, `0005`.

- **Listo cuando:** "creá tarea X" por Telegram crea la tarea (owner), auditado en `agent_messages`;
  PAT en `/api/v1` responde; usuario sin `agent_enabled` → 403.
- **Riesgo:** deslistado de modelos `:free` de OpenRouter (mitigado con fallback chain).

## Fase 3 — Finanzas (diferenciador AR) ⬜

Multimoneda FX `oficial|blue|mep`, cuentas, **tarjetas AR** (cierre/vencimiento ≠ mes), **planes de
cuotas** (total una vez → N cuotas asignadas a resúmenes, idempotente), presupuestos, reportes,
**vista dual pesos/USD**. Migraciones `0006`, `0007`, `0008`.

- **Listo cuando:** "heladera $600.000 en 12 cuotas Visa Galicia" genera 12 cuotas asignadas por
  cierre; balances en ARS y USD.
- **Riesgo:** modelar bien el calendario de cierre/vencimiento y la asignación de cuotas a resúmenes.

## Fase 4 — Entrenamientos + Estudios + Enfoque ⬜

Workouts (progresión/PRs por query), Estudios (materias/temas/horas), Pomodoro. Tools de agente.
Migraciones `0009`, `0010`, `0011`.

- **Listo cuando:** los tres módulos con UI web+mobile y captura por chat.

## Fase 5 — Superficies e integraciones pesadas ⬜

Servidor MCP owner-gated completo + webhooks salientes (HMAC, reintentos) + Google Calendar 2-way +
WhatsApp Cloud API (reusa `messaging_accounts`). Offline mobile. Migración `0012`.

- **Listo cuando:** Hermes se conecta por MCP; eventos firmados llegan a n8n; calendario sincroniza
  bidireccional.
- **Riesgo:** OAuth de Google y watch/push de Calendar; límites de la Cloud API de WhatsApp.

---

## Cross-cutting (todas las fases)

RLS · i18n (es-AR) · accesibilidad · tests de la capa de dominio · `CHANGELOG.md` y
`market-analysis.md` sincronizados con cada módulo entregado.
