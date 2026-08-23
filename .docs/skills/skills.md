# Astor — Skills / tools del agente (Hermes)

> Documento vivo. Catálogo de tools que expone la capa de agente. Todas gateadas por
> `agent_enabled` (owner-only) y todas invocan **funciones de dominio** de `packages/core`.
> El LLM devuelve tool-calls; los args se validan con el schema Zod ANTES de ejecutar.

## Convención de una tool

Cada tool se registra en `packages/agent` (tool registry) con:

- `name` — identificador estable (snake_case), p.ej. `create_task`.
- `schema` — el **mismo** schema Zod de `core` para esos args.
- `domainFn` — la función de dominio que ejecuta (`createTask`, `logExpense`, …).
- `requiresConfirmation` — si el adaptador debe pedir confirmación (botón inline) antes de ejecutar.
- `surfaces` — dónde se expone (`rest`, `mcp`, `telegram`). Por defecto las tres.

Las tres superficies (REST/MCP/Telegram) exponen la misma tool sin reescribir lógica.

## Catálogo (por fase)

Estado: ✅ implementada · ⬜ planeada.

### Fase 2 — Tareas / hábitos / briefing

| Tool | Args (resumen) | Función de dominio | Confirma | Estado |
|---|---|---|---|---|
| `create_task` | `title`, `due_at?`, `priority?`, `category?` | `createTask` | no | ⬜ |
| `complete_task` | `task_id` \| `title_match` | `completeTask` | si (por `title_match`) | ⬜ |
| `list_tasks` | `status?`, `date?` | `listTasks` (read) | no | ⬜ |
| `log_habit` | `habit`, `date?`, `status` | `logHabit` | no | ⬜ |
| `get_briefing` | `slot` (`morning\|midday\|night`) | `getBriefing` (read) | no | ⬜ |

### Fase 3 — Finanzas

| Tool | Args (resumen) | Función de dominio | Confirma | Estado |
|---|---|---|---|---|
| `log_expense` | `amount`, `currency?`, `account?`, `category?`, `note?` | `logExpense` | no | ⬜ |
| `log_income` | `amount`, `currency?`, `account?`, `note?` | `logIncome` | no | ⬜ |
| `create_installment_plan` | `description`, `total_amount`, `installments_count`, `card`, `first_charge_date?` | `createInstallmentPlan` | si | ⬜ |
| `get_finance_summary` | `period?`, `dual?` (pesos/USD) | `getFinanceSummary` (read) | no | ⬜ |

### Fase 4 — Entrenamientos / estudios / enfoque

| Tool | Args (resumen) | Función de dominio | Confirma | Estado |
|---|---|---|---|---|
| `log_workout_set` | `exercise`, `reps`, `weight`, `session?` | `logWorkoutSet` | no | ⬜ |
| `log_study_session` | `subject`, `hours`, `notes?` | `logStudySession` | no | ⬜ |
| `start_focus_session` | `duration?`, `task?` | `startFocusSession` | no | ⬜ |

## Recursos MCP (resources)

| Resource | Contenido | Estado |
|---|---|---|
| `today_agenda` | Agenda de hoy (tareas + hábitos + vencimientos). | ⬜ |
| `finance_snapshot` | Balances ARS/USD + cuotas activas. | ⬜ |

## Eventos de webhook saliente

| Evento | Payload | Estado |
|---|---|---|
| `task.completed` | task | ⬜ |
| `invoice.due` | card_invoice | ⬜ |
| `briefing.ready` | briefing | ⬜ |

## Pipeline de parse (NL → tool-call)

1. Entrada de texto (o voz → `Transcriber` → texto).
2. `agent.run(text, context)` con `LLMProvider` (OpenRouter + fallback chain).
3. El LLM elige tool(s) y arma args.
4. **Validación Zod** de los args con el schema de `core`. Si falla → re-prompt o error legible.
5. Si `requiresConfirmation` → botón inline (Telegram) / confirmación explícita.
6. Ejecutar `domainFn`. Auditar en `agent_messages` (`tool_calls`, `model`, tokens, `cost_usd`).

## Convenciones de dev del agente

- **Provider-agnóstico:** toda llamada al LLM pasa por `LLMProvider`. `OpenRouterProvider` es la
  impl default; cambiar a OpenAI/Anthropic/Gemini/Ollama = nueva impl, sin tocar `core` ni tools.
- **Modelo por env:** `OPENROUTER_MODEL` + `OPENROUTER_FALLBACK_MODELS` (los `:free` rotan).
- **Nunca SQL libre:** el LLM solo produce tool-calls; los args se validan siempre.
- **Auditoría siempre:** toda interacción se registra con costo.
