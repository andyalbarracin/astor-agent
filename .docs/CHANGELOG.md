# Astor — CHANGELOG

> Log de features implementadas. Alimenta la tabla "Features vs competencia" de `market-analysis.md`.
> Formato: por fase; cada entrada = feature entregada y verificada.

## Fase 0 — Fundaciones ✅

### 0a — Monorepo + tooling + docs (hecho)
- Estructura de monorepo `astor/` (pnpm workspaces + Turborepo): `apps/{web,mobile}`,
  `packages/{core,design-tokens,supabase,agent,i18n,config}`, `supabase/`.
- Tooling compartido: `packages/config` (tsconfig base, eslint base, prettier base), `.env.example`,
  `.gitignore`, `.nvmrc`, `turbo.json`.
- Documentación viva completa en `.docs/`: `manifesto`, `roadmap`, `architecture`, `data-model`,
  `visual-design/{design,tokens.reference}`, `skills/skills`, `market-analysis`, este `CHANGELOG`.
- `CLAUDE.md` raíz (visión, distinción app/agente, convenciones, estado del roadmap).
- Migraciones `0000` (extensiones + `set_updated_at`) y `0001` (`profiles` + gating `agent_enabled`
  + alta automática + guard anti-escalación + `is_agent_enabled`).
- `ASTOR_market-analysis.md` movido a `.docs/market-analysis.md`.

### 0b — design-tokens (hecho)
- `packages/design-tokens`: fuente de verdad TS única (colors light/dark, escalas de
  espaciado/tipografía/radios, sombras) derivada de los fundamentos de Atlassian.
- Salida web: `buildThemeCss()` (CSS custom properties, estrategia dark-first + respeta
  `prefers-color-scheme` + override `[data-theme]`) y `astorPreset` de Tailwind (utilidades
  `bg-surface-*`, `text-fg-*`, `border-line-*`, `bg-brand-*`, `shadow-raised`, `p-200`, `text-600`…).
- Salida mobile: `lightTheme`/`darkTheme` resueltos + `ThemeProvider`/`useTheme` (RN, dark-first).
- Entradas separadas por plataforma (`.`, `./css`, `./tailwind`, `./mobile`); consumido como
  source (Next `transpilePackages` / Expo Metro), sin build step.

### 0c — Auth + profiles + shell web (hecho)
- `apps/web`: Next.js 15 (App Router) + Tailwind 3 con el preset de `@astor/design-tokens`.
- Auth Supabase (`@supabase/ssr`): login por **magic link** (`signInWithOtp`), callback
  (`exchangeCodeForSession`), signout, middleware de refresh de sesión + protección de rutas.
- Clientes browser/server con anon key + cookies (RLS por `auth.uid()`); service_role nunca en cliente.
- Root layout inyecta `buildThemeCss()` y setea `data-theme` desde `profiles.theme` (dark-first,
  respeta sistema). Shell con sidebar (mapa de iconos lucide), toggle de tema (server action que
  persiste `profiles.theme`), gate de sesión, y dashboard con grilla de módulos (placeholder).
- i18n/timezone: saludo y fecha con `luxon` según `timezone`/`locale` del perfil.
- Seed de desarrollo: `.docs/migrations/seed.dev.sql` (datos dummy AR por fase).

### 0d — Shell mobile (hecho)
- `apps/mobile`: Expo (SDK 52) + Expo Router, en paridad con web.
- Auth Supabase RN (`@supabase/supabase-js` + AsyncStorage, `persistSession`): login por magic link
  (`signInWithOtp`), intercambio por **deep link** (`astor://auth/callback` → ruta `app/auth/callback`
  con `exchangeCodeForSession`), auto-refresh del token en foreground (AppState).
- `SessionProvider` (contexts/session) + guard de rutas por grupo (`(app)/_layout` → `Redirect` a login).
- Tema con `ThemeProvider`/`useTheme` de `@astor/design-tokens/mobile` (dark-first, sigue el device);
  dashboard equivalente al de web (saludo con luxon, grilla de módulos) usando tokens resueltos.
- Monorepo: `metro.config.js` (watch del workspace + package exports) y `.npmrc` `node-linker=hoisted`
  (recomendado por Expo para pnpm).

## Estudios + Enfoque — módulo (web + mobile Estudios) ✅

- **Dominio** `packages/core/{studies,focus}`: programas con progreso, materias, temas
  (por estudiar/estudiando/aprendido), horas (`study_sessions`), recursos; Pomodoro (`focus_sessions`).
  Tipos en `packages/supabase`.
- **Web** `/estudios`: stats (horas/temas/programas) + **cards de programas coloridas** con progreso
  y **countdown a examen**. `/estudios/[id]`: materias + tablero de temas (ciclo estado, optimista) +
  registrar horas + recursos. `/enfoque`: **Pomodoro** (ring, foco/descanso) que registra sesiones
  y, si liga materia, cuenta como horas de estudio.
- **Mobile**: tab **Estudios** (cards con countdown + temas con ciclo de estado + crear programa).
- Sidebar/bottom-nav: Estudios y Enfoque activados. Seed de estudios para juan aplicado.
- Deuda: Pomodoro mobile + recursos/horas mobile (ver tech-debt).

## Productividad + shell — polish (optimistic, DnD, responsive) ✅

- **Latencia resuelta**: checkboxes con **optimistic UI** (web y mobile) — cambian al instante, la
  acción va en background; realtime reconcilia. Se sacó el `router.refresh()` por click.
- **Secciones**: cards separadas, **coloreadas** (una por día, paleta), **drag-and-drop** para
  reordenar (dnd-kit, con handle `⋮⋮`), y todo editable (renombrar/eliminar sección, agregar/
  renombrar/eliminar ítems). Dominio: `reorderTodoSections/Items`, `renameTodoItem`.
- **Rituales** (RoutinesList): mismas capacidades — renombrar/eliminar ritual, editar ítems,
  reordenar cards por DnD. Dominio: `renameRoutine`, `deleteRoutine`, `renameRoutineItem`, `reorder*`.
- **Sidebar colapsable** (persistido en localStorage, icono `PanelLeft`).
- **Responsive**: en < lg el sidebar se oculta y aparece un **navbar inferior**; `main` con padding
  adaptable. **Login** con marca arriba en mobile (slider oculto).

## Productividad — Checklist seccionado editable ✅

- **Migración `0006_todos.sql`**: `todo_sections` + `todo_items` (checklist liviano tipo Notion,
  `done` persiste; separado de `tasks`) + RLS + realtime.
- **Secciones editables**: por defecto días de la semana (Lun–Dom, auto-creadas si el usuario no
  tiene ninguna, `ensureDefaultTodoSections`), pero renombrables / agregables / borrables.
- **Dominio** (`packages/core/todos`): list/ensure/create/rename/delete sección, add/toggle/delete ítem.
- **Web**: reemplaza "To-do de hoy" por `SectionedTodos` (secciones colapsables, checkboxes, agregar
  ítem/sección, renombrar/eliminar). **Mobile**: misma experiencia en el tab "Día".
- Realtime de `todo_items` sumado al refresher web. Seed de secciones de ejemplo para juan.

## Productividad — Rutinas + To-do del día ✅

- **Migración `0005_routines.sql`**: `routines` (morning/night/custom), `routine_items`,
  `routine_completions` (una fila = ítem hecho ese día; resetea al cambiar de día) + RLS + realtime.
- **Dominio** (`packages/core/routines`): `listRoutines` (con ítems), `getRoutineCompletions(date)`,
  `toggleRoutineItem`, `createRoutine`, `addRoutineItem`, `deleteRoutineItem`.
- **Web** `/productividad`: To-do de hoy (checklist + agregar, reusa `tasks`) + cards de rutina
  matutina/nocturna con checkboxes y progreso. Nav "Productividad".
- **Mobile**: tab "Día" con la misma experiencia (checklist del día + rutinas), estilo sobrio,
  con realtime.
- Seed de rutinas de ejemplo para juan (ritual matutino/nocturno) aplicado en la DB.

## Fase 1 — Loop núcleo ✅

### 1a — Dominio (core + supabase + migraciones) (hecho)
- Migraciones `0002` (categories, tasks, task_checklist_items) y `0003` (habits, habit_logs):
  enums, índices, RLS `for all` por `auth.uid()`, triggers `updated_at`, rollback. **Corridas en la
  DB real y verificadas** (tablas existen, RLS activa).
- `packages/supabase`: tipo `Database` (hand-authored hasta `supabase gen types`), helpers
  `Tables/TablesInsert/TablesUpdate`, `AstorClient`, `createServiceClient` (backend).
- `packages/core`: capa de dominio única. Schemas Zod (tareas/categorías/checklist/hábitos),
  funciones (`createTask`, `updateTask`, `completeTask` con recurrencia, `listTasks`, `createCategory`,
  checklist; `createHabit`, `logHabit`, `getHabitStreak`, …). Lógica pura testeada:
  `nextOccurrence` (RRULE + luxon, wall-clock) y `computeStreak`/`buildHeatmap`.
- Tests con vitest (recurrencia, streak, validación de schemas). Algoritmo de rachas verificado
  también fuera de vitest (node).
- Seed `seed.dev.sql`: casts de enum de la sección Fase 1 corregidos contra `0002`/`0003`.

### 1b — UI web (Tareas + Hábitos) (hecho)
- Base shadcn/ui hand-authored e integrada a los tokens Astor (bridge de nombres shadcn →
  CSS vars en el tailwind config): button (variante `signature`), card, input, textarea, label,
  checkbox, badge, dialog, dropdown-menu, tabs, select, separator, tooltip, skeleton, sonner.
- Branding **pantera**: token firma ámbar (`signature.*`, "ojos de pantera") + glifo `PantherMark`;
  acento ámbar en "ahora"/rachas/drop-targets (uso ≤10%, Restrained).
- **Tareas**: tablero Kanban con drag-and-drop (dnd-kit, mover entre columnas con optimismo →
  `completeTask` al soltar en Hecho, con recurrencia), matriz Eisenhower, crear tarea (prioridad/
  categoría/vencimiento/recurrencia), detalle con checklist, completar y borrar.
- **Hábitos**: cards con racha (current/récord vía `computeStreak`), log de hoy (hecho/saltar),
  heatmap tipo calendario, crear hábito, archivar, y chart de consistencia 14 días (recharts,
  ámbar, `dynamic ssr:false`).
- Dashboard reconstruido: "Foco de hoy" (tareas due/haciendo) + "Hábitos" con estado del día.
- Cableado: clientes Supabase tipados con `Database`, `getDomainContext`, server actions sobre
  `@astor/core`, sidebar con links reales (marca pantera) y estado activo, Toaster.
- Infra: `@supabase/supabase-js` fijado a 2.45.4 (override en `pnpm-workspace.yaml`) para alinear
  con el shape de tipos de `packages/supabase`. **Build de Next verde**, dev server OK en :3000.

### 1b.1 — Acceso (login split + usuarios de prueba) (hecho)
- **Fix HTTP 431** ("headers too large" por cookies acumuladas en el dominio `localhost`):
  `NODE_OPTIONS=--max-http-header-size=81920` en los scripts dev/start del web.
- **Login rediseñado**: split 60/40 (`app/(auth)/login`) — panel izquierdo con **slider de 3 slides**
  (mockups de Tareas/Hábitos/Finanzas) sobre gradiente + imagen de fondo opcional; panel derecho
  con **auth por password** (`signInWithPassword`) + fallback de enlace mágico.
- **Cards de acceso rápido** con usuarios de prueba (autocompletan email/password).
- **Usuarios dummy**: `.docs/migrations/seed.users.sql` crea `juan@astor.app` y `maria@astor.app`
  (password `astor1234`, email confirmado, con su fila en profiles vía trigger). `seed.dev.sql`
  ahora siembra el contenido dummy en **juan** (no en el owner), resuelto por email.
- **Assets**: favicon pantera en `app/icon.svg`; carpeta `public/` con `brand/` y `login/` +
  README indicando qué archivos reemplazar (logo.png, isologo.png, login-bg.jpg, favicon.ico).
- **Landing** placeholder en `/landing` (público, wired en middleware) para la futura landing
  estilo Rimu con CTA al login.

### 1c — Paridad mobile + realtime (hecho)
- **Mobile (Expo)** en paridad: navegación por **Tabs** (Hoy / Tareas / Hábitos) tematizada.
  - Hoy: saludo (luxon) + tiles de tareas pendientes / hábitos por marcar + cerrar sesión.
  - Tareas: lista por estado (Por hacer/Haciendo/Hecho), completar con tap, crear (modal), FAB.
  - Hábitos: cards con racha (`computeStreak`), heatmap tipo calendario, log hecho/saltar, crear.
  - Las pantallas llaman las funciones de `@astor/core` directo con el cliente autenticado (RLS);
    cliente mobile tipado con `Database`.
- **Realtime** (Supabase `postgres_changes`) en web y mobile: al cambiar `tasks`/`habit_logs` se
  re-fetcha. Degrada con gracia; habilitar con `.docs/migrations/0004_enable_realtime.sql`.
- **Infra**: React alineado a **18.3.1** en todo el monorepo (Expo 52 lo fija; Next 15 lo soporta)
  vía overrides en `pnpm-workspace.yaml` — resuelve el choque de tipos `@types/react` web/mobile.
  Web build verde, mobile `tsc --noEmit` verde.
## Fase 2 — Hermes v0 (owner) ⬜
## Fase 3 — Finanzas (AR) ⬜
## Fase 4 — Entrenamientos + Estudios + Enfoque ⬜
## Fase 5 — MCP + webhooks + Google Calendar + WhatsApp ⬜
