# Setup de LLM/IA interna — guía práctica

> Para la IA **interna** de Astor (ordenar CSV, auto-categorizar, reportes, Campus Intelligence).
> Distinta de Hermes (agente externo). Diseño conceptual en `intelligence.md`.
> **Las keys van SOLO en backend** (route handler/edge). Nunca en el bundle del cliente.

## Providers soportados (interfaz `LLMProvider`, OpenAI-compatible)

| Provider | Dónde sacar la API key | Costo | Modelos sugeridos (baratos/rápidos) |
|---|---|---|---|
| **Groq** (tenés cuenta) | https://console.groq.com/keys | Free tier generoso, muy rápido | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` |
| **Google Gemini** | https://aistudio.google.com/app/apikey | Free tier | `gemini-2.0-flash`, `gemini-1.5-flash` |
| **OpenAI** | https://platform.openai.com/api-keys | Pago (⚠️ ChatGPT Plus ≠ tokens de API) | `gpt-4o-mini`, `gpt-4.1-mini` |
| **OpenRouter** (agregador) | https://openrouter.ai/keys | Mixto; hay modelos `:free` (rotan/deslistan) | `meta-llama/llama-3.3-70b-instruct`, `google/gemini-2.0-flash-exp:free` |

Recomendación para empezar: **Groq** (rápido + free), con OpenRouter como fallback.

## Env vars (backend)

Ya están los placeholders en `.env.example` / `apps/web/.env.local`:

```
# elegí el provider activo por env (o guardado por usuario en user_ai_settings)
OPENROUTER_API_KEY=      · OPENROUTER_MODEL=      · OPENROUTER_FALLBACK_MODELS=
GROQ_API_KEY=            # https://console.groq.com/keys
GEMINI_API_KEY=         # https://aistudio.google.com/app/apikey  (agregar)
OPENAI_API_KEY=         # https://platform.openai.com/api-keys    (opcional)
```

## Config por usuario (Settings, a construir)

- Tabla `user_ai_settings` (user_id, provider, api_key_encrypted, model, enabled). RLS por user.
- **Cifrado de la key**: `pgcrypto` (`pgp_sym_encrypt`) con una clave de entorno, o Supabase Vault.
  La UI muestra la key enmascarada; el backend la descifra solo al llamar al provider.
- UI `/settings` → sección IA: provider, key (masked), modelo, botón "probar conexión".

## Dónde se usa (enchufes)

- **Finanzas**: mapear/ordenar CSV/XLS heterogéneos; auto-categorizar (rubro por descripción);
  reportes en lenguaje natural.
- **Estudios**: recomendaciones de qué estudiar (Campus Intelligence).
- **Productividad/Hábitos**: foco del día, rachas en riesgo, reordenar el plan.

## Buenas prácticas de costo

- Capar tokens de salida; usar modelos baratos/rápidos (Groq llama, Gemini flash, gpt-4o-mini).
- Cachear sugerencias (tabla `ai_suggestions` por snapshot) para no re-llamar en cada render.
- El LLM **devuelve tool-calls/JSON tipado** validado con Zod antes de tocar la DB (nunca SQL libre).
