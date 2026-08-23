# Astor — Modelo de datos

> Documento vivo. Todas las entidades de todos los módulos, con la fase en que entran.

## Convenciones base (toda tabla)

- `id uuid primary key default gen_random_uuid()` (salvo `profiles`, cuya PK es `user_id`).
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()` + trigger `public.set_updated_at()` (migración 0000).
- `user_id uuid not null references auth.users(id) on delete cascade`.
- **RLS** habilitada; policies `using (user_id = auth.uid())` en select/insert/update/delete.
- Superficies de agente además chequean `public.is_agent_enabled(auth.uid())`.
- Nombres en snake_case; enums como tipos Postgres.

## Índice de migraciones

| # | Archivo | Fase | Tablas |
|---|---|---|---|
| 0000 | `0000_extensions_and_helpers.sql` | 0 | (extensión pgcrypto, `set_updated_at()`) |
| 0001 | `0001_profiles.sql` | 0 | `profiles` (+ `is_agent_enabled()`, alta automática, guard anti-escalación) |
| 0002 | `0002_tasks.sql` | 1 | `categories`, `tasks`, `task_checklist_items` |
| 0003 | `0003_habits.sql` | 1 | `habits`, `habit_logs` |
| 0004 | `0004_enable_realtime.sql` | 1 | realtime de `tasks`/`habit_logs`/`habits` |
| 0005 | `0005_routines.sql` | Prod. | `routines`, `routine_items`, `routine_completions` |
| 0006 | `0006_todos.sql` | Prod. | `todo_sections`, `todo_items` (checklist seccionado editable) |
| 0007+ | (Fase 2+) | 2 | `messaging_agent`, `agent_external_surface`, finanzas, workouts, estudios, enfoque, integraciones |

> Nota: los números de Fase 2+ son indicativos (esas migraciones aún no existen); se
> finalizan al construirlas. Reales hoy: 0000–0006.

> Además: `seed.users.sql` (usuarios de prueba) y `seed.dev.sql` (datos dummy) — se corren a mano,
> NO son migraciones de esquema. Todo el SQL vive en `.docs/migrations/`.

---

## Fase 0 — Núcleo / cuenta

**`profiles`** — PK `user_id`. `display_name`, `timezone` (default AR), `locale` (default `es-AR`),
`theme` (`system|light|dark`), `role` (`owner|user`), `agent_enabled` (bool, default false),
`entitlements` (jsonb, lugar para futuro billing). `role`/`agent_enabled`/`entitlements` inmutables
para el usuario (guard trigger). Alta automática vía trigger sobre `auth.users`.

## Fase 1 — Tareas

- **`categories`** — self-ref `parent_id` (subcategorías), `kind` (`task|project`), `name`, `color`.
- **`tasks`** — `title`, `notes`, `status` (`todo|doing|done|archived`), `priority` (1–4),
  `eisenhower` (`urgent_important|urgent_not_important|not_urgent_important|not_urgent_not_important`),
  `due_at`, `scheduled_at`, `recurrence_rule` (RRULE text), `category_id` (fk), `source`
  (`app|telegram|api|mcp`).
- **`task_checklist_items`** — `task_id` (fk), `label`, `done` (bool), `position` (int).

## Fase 1 — Hábitos

- **`habits`** — `name`, `schedule` (jsonb), `target` (int), `period` (`day|week|month`),
  `allow_skip` (bool), `archived` (bool).
- **`habit_logs`** — `habit_id` (fk), `date` (date), `status` (`done|skipped`).
  **Único `(habit_id, date)`**. Rachas y heatmap se derivan por query (sin tabla de agregados).

## Fase 2 — Agente / mensajería

- **`messaging_accounts`** — `provider` (`telegram|whatsapp`), `provider_chat_id`, `verified_at`,
  `link_code`, `link_code_expires_at`. Único `(provider, provider_chat_id)`.
- **`agent_messages`** — auditoría: `direction` (`in|out`), `raw_text`, `parsed_intent` (jsonb),
  `tool_calls` (jsonb), `model`, `tokens_in`, `tokens_out`, `cost_usd` (numeric), `status`.
- **`briefing_prefs`** — `morning_at`, `midday_at`, `night_at` (time), `enabled_slots` (text[]),
  `channels` (text[]).

## Fase 2/5 — Superficie externa de agente (owner-gated)

- **`api_tokens`** — `name`, `token_prefix`, `token_hash`, `scopes` (text[]), `last_used_at`,
  `expires_at`, `revoked_at`. El token en claro se muestra una sola vez al crear.
- **`webhook_endpoints`** — `url`, `secret`, `events` (text[]), `active` (bool).
- **`webhook_deliveries`** — `endpoint_id` (fk), `event`, `payload` (jsonb), `status`, `attempts`,
  `response_code`, `next_retry_at`. Patrón outbox con reintento.

## Fase 3 — Finanzas (contexto AR)

- **`currencies`** — `code` (ARS/USD/…), `symbol`, `decimals`.
- **`fx_rates`** — `base`, `quote`, `rate` (numeric), `rate_type` (`oficial|blue|mep`), `source`,
  `as_of` (timestamptz). Múltiples fuentes; carga manual como fallback.
- **`accounts`** — `name`, `type` (`efectivo|banco|tarjeta|usd`), `currency`, `opening_balance`.
- **`transactions`** — `kind` (`income|expense|transfer`), `account_id` (fk), `amount`, `currency`,
  `fx_rate_applied`, `category_id` (fk), `occurred_on` (date), `note`, `source`.
- **`credit_cards`** — `account_id` (fk), `closing_day` (int), `due_day` (int, ≠ mes calendario),
  `brand`, `bank`.
- **`card_invoices`** — `credit_card_id` (fk), `period` (mes de resumen), `closing_date`,
  `due_date`, `total`, `paid` (bool).
- **`installment_plans`** — total una vez: `description`, `total_amount`, `currency`,
  `installments_count`, `first_charge_date`, `credit_card_id` (fk).
- **`installments`** — generadas por el plan: `plan_id` (fk), `number`, `amount`,
  `card_invoice_id` (fk; asignada por cierre/vencimiento), `status`. Generación idempotente en `core`.
- **`budgets`** — `category_id` (fk), `period`, `amount`, `currency`.
- **`recurring_entries`** — template de transacción + `recurrence_rule` (RRULE).

## Fase 4 — Entrenamientos

- **`exercises`** (catálogo), **`workout_templates`**, **`workout_template_items`**,
  **`workout_sessions`**, **`set_logs`** (`reps`, `weight`, `rest`), **`cardio_logs`**
  (`distance`, `duration`). PRs derivados por query.

## Fase 4 — Estudios

- **`subjects`**, **`study_topics`**, **`study_sessions`** (`hours`, `notes`), **`study_links`**
  (materiales/playlists).

## Fase 4 — Enfoque

- **`focus_sessions`** — pomodoro: `task_id` (fk, opcional), `started_at`, `duration`, `notes`.

## Fase 5 — Integraciones

- **`calendar_connections`** — Google OAuth: `provider`, `access_token`, `refresh_token`, `expiry`,
  `calendar_id`.
- **`calendar_sync_state`** — `resource_id`, `sync_token`, `direction`, `last_synced_at`.
  WhatsApp reusa `messaging_accounts`.
