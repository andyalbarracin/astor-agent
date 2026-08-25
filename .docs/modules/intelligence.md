# Astor Intelligence (IA interna) + Settings LLM — diseño

> Documento vivo. Dos cosas distintas que suelen confundirse:
> 1. **IA interna** (dentro de la app, con la API key del owner) → analiza/ordena/recomienda.
> 2. **Hermes** (agente externo) → interactúa con Astor desde afuera (REST/MCP/webhooks, Fase 2/5).
> Este doc cubre (1). Hermes está en `architecture.md`.

## Settings · configurar LLM (IA interna)

- **Providers**: Groq (el owner ya tiene), Gemini, OpenAI, OpenRouter. Interfaz `LLMProvider`
  provider-agnóstico (ya planeada en `packages/agent`). Modelo por provider, con fallback.
- **Config por usuario** (owner por ahora): provider, api_key, model. Guardar en una tabla dedicada
  `user_ai_settings` (RLS por user), **api_key cifrada** (pgcrypto `pgp_sym_encrypt` con una clave de
  entorno, o Supabase Vault). Nunca exponer la key al cliente: las llamadas al LLM corren en backend
  (route handler / edge), no en el browser.
- **UI**: página `/settings` (o `/ajustes`) → sección "IA": elegir provider, pegar API key (masked),
  elegir modelo, botón "probar conexión". Nota: OpenAI personal ≠ tokens de API (el owner ya lo sabe).

## Usos de la IA interna (dónde enchufa)

- **Finanzas**: (a) ordenar/mapear CSV/XLS heterogéneos → nuestro esquema (hoy es auto-mapeo por
  headers; el LLM lo hace robusto), (b) auto-categorizar (rubro por descripción), (c) reportes en
  lenguaje natural ("resumime agosto", "en qué gasté de más").
- **Estudios**: recomendaciones de qué estudiar/priorizar (ver Campus Intelligence).
- **Productividad/Hábitos**: sugerir el foco del día, avisar rachas en riesgo, reordenar el plan.

## Campus Intelligence (capa de recomendación / anti-análisis-parálisis)

Concepto tomado de la ref "Campus Intelligence": una **capa que lee el estado del usuario**
(tareas, rutinas, hábitos, estudios, finanzas) y **recomienda la próxima acción concreta**, para
no caer en "analysis by analysis". Astor tiene mucha data del día a día → puede optimizar la vida.

- **Entrada**: snapshot del día (tareas pendientes/vencidas, rutinas sin marcar, temas de estudio
  por estado + fecha de examen, hábitos en riesgo, gastos del mes vs presupuesto).
- **Salida**: 1–3 **acciones sugeridas** ("Estudiá 'Límites' 25 min antes del examen (faltan 40d)",
  "Te falta la rutina nocturna", "Vas 20% arriba en Varios este mes"). Cada sugerencia con un CTA
  que ejecuta la acción (start pomodoro, marcar hábito, abrir el gasto).
- **Superficie UI**: card destacada tipo hero (degradé sobrio) en el Dashboard + micro-sugerencias
  contextuales por módulo. Estética: como la ref Sapphire, sin AI-slop.
- **Motor**: función de dominio `intelligence.suggest(ctx)` que arma el snapshot y llama al
  `LLMProvider` con un prompt estructurado que **devuelve tool-calls/acciones tipadas** (no texto
  libre a la DB — mismo principio que Hermes). Corre en backend con la key del owner.
- **Gating**: solo si hay LLM configurado (Settings) y `agent_enabled`/owner. Degrada a heurísticas
  simples (sin LLM) para sugerencias básicas.

## Data model (próximo)

- `user_ai_settings` (user_id, provider, api_key_encrypted, model, enabled, updated_at). RLS por user.
- (Opcional) `ai_suggestions` cache (para no re-llamar el LLM en cada render): snapshot_hash, payload,
  created_at.

## Estado

- [x] Diseño
- [ ] Migración `user_ai_settings` · Settings UI (config LLM) · `LLMProvider` (Groq/Gemini/OpenAI)
- [ ] `intelligence.suggest` + card en Dashboard · auto-categorización/orden de CSV en Finanzas
