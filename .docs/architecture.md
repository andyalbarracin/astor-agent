# Astor — Arquitectura

> Documento vivo.

## Principio central: una sola capa de dominio

Toda mutación del sistema pasa por **funciones de dominio tipadas y validadas con Zod** en
`packages/core`. UI web, UI mobile, REST `/api/v1`, servidor MCP, bot de Telegram y webhooks
salientes son **adaptadores finos** sobre esa capa. No hay reglas de negocio duplicadas en los
adaptadores.

El LLM **nunca** escribe a la base por texto libre: `agent.run()` produce **tool-calls** cuyos
argumentos se validan con los **mismos schemas Zod** de `core` antes de ejecutar la función de dominio.

```
                         ┌─────────────────────────────┐
   UI web  ───────────►  │                             │
   UI mobile ─────────►  │      packages/core          │  ──►  packages/supabase  ──►  Postgres (RLS)
   REST /api/v1 ──────►  │  (zod schemas + funciones   │
   MCP tools ─────────►  │   de dominio: createTask,   │
   Telegram bot ──────►  │   logExpense, getBriefing…) │
   (webhooks: salida) ◄─ │                             │
                         └─────────────────────────────┘
```

## Límites de módulos

| Paquete | Responsabilidad | Depende de |
|---|---|---|
| `packages/core` | Schemas Zod, reglas, funciones de dominio (única fuente de mutaciones). | `supabase`, `i18n` |
| `packages/supabase` | Tipo `Database` (gen types) + cliente tipado (`AstorClient`) + `createServiceClient`. El acceso a datos por dominio vive en las funciones de `core` (usan el cliente tipado directo), sin una capa de queries redundante. | — |
| `packages/design-tokens` | Tokens Atlassian → web + mobile. | — |
| `packages/agent` | Hermes: `LLMProvider`, `OpenRouterProvider`, prompts, tool registry, parsers, bot composer (grammY), MCP server factory. | `core` |
| `packages/i18n` | Catálogos es-AR, helpers luxon/timezone. | — |
| `apps/web` | UI + superficies HTTP de agente (route handlers). | todos |
| `apps/mobile` | UI mobile. | `core`, `design-tokens`, `supabase`, `i18n` |

Regla de dependencias: los adaptadores dependen de `core`; `core` no depende de ningún adaptador.

## Las 3 superficies de agente (owner-only)

Todas adaptadores finos sobre `core`, todas gateadas por `profiles.agent_enabled = true`.

1. **REST `/api/v1/*`** — route handlers Next.js, auth con **Personal Access Tokens** (`api_tokens`:
   hash + scopes). Superficie universal (n8n, scripts, Telegram, Hermes-por-HTTP). Incluye
   `POST /api/v1/agent/message` (pipeline de parse NL).
2. **Servidor MCP** — `apps/web/app/api/mcp`, transporte **Streamable HTTP** (HTTP normal, hosteable
   en Vercel). Expone las **mismas** funciones de dominio como **tools** + **resources**
   (resource: agenda de hoy; tools: `create_task`, `log_expense`, `get_briefing`…). Auth bearer que
   resuelve al `user_id` del owner. No persiste estado de negocio.
3. **Webhooks salientes** — `webhook_endpoints`; Astor emite eventos firmados con HMAC
   (`task.completed`, `invoice.due`, `briefing.ready`) vía patrón **outbox** (`webhook_deliveries`
   con reintentos), para que Hermes/n8n reaccionen sin polling.

## Gating por `agent_enabled`

- Las tres superficies chequean `is_agent_enabled(auth.uid())` (helper SQL, migración 0001) y, en el
  adaptador, `profiles.agent_enabled`. Usuario normal → **403**; la UI ni muestra esas superficies.
- El bot y el MCP usan **`service_role`** desde backend, nunca desde cliente.
- El owner se marca `agent_enabled=true` en el bootstrap (vía `ASTOR_OWNER_USER_ID`, service_role).
- `profiles.role`/`agent_enabled`/`entitlements` son inmutables para el usuario (trigger
  `guard_profile_sensitive_columns`); solo service_role los cambia.

## Flujos textuales

**Telegram (Fase 2).**
```
update Telegram
  → resolver messaging_accounts(provider='telegram', provider_chat_id)
  → si NO vinculado: pedir link_code (generado en la app) → verificar → verified_at
  → si vinculado: armar contexto (perfil, timezone, locale)
  → agent.run(texto | voz)
        · voz: descargar audio → Transcriber (Whisper vía Groq/OpenAI) → texto
        · LLM → tool-calls → validar args con Zod (schemas de core) → ejecutar función de dominio
  → responder confirmación + botones inline (grammY)
  → auditar en agent_messages (direction, raw_text, tool_calls, model, tokens, cost_usd, status)
```

**REST / MCP.**
```
request (PAT o bearer MCP)
  → resolver user_id → chequear agent_enabled → 403 si false
  → invocar función de dominio (core) con args validados
  → respuesta tipada
```

**Webhook saliente.**
```
evento de dominio (p.ej. task.completed)
  → insert webhook_deliveries (payload)
  → firmar HMAC con secret del endpoint → POST
  → si falla: reintentar (attempts, next_retry_at)
```

**Briefing (cron, Fase 2).**
```
Vercel Cron (con ASTOR_CRON_SECRET) → /api/internal/briefings
  → por cada perfil con briefing_prefs habilitado y hora local correspondiente (luxon + timezone)
  → armar resumen (agenda, hábitos, más adelante blue/MEP y cuotas) → enviar por canal (Telegram)
```

## Hosting

Decisión: superficies de agente como **route handlers de Next.js en Vercel** (un solo runtime Node
que consume `core` directo). `services/bot` y `services/mcp` del brief se materializan como módulos
lógicos bajo `apps/web/app/api/*` que importan de `packages/agent`. Si el MCP creciera, se puede
promover a servicio Node standalone sin tocar `packages/agent`.
