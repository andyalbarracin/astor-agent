# Astor — Manifiesto

> Documento vivo. Fase de diseño (Fase 0).

## Misión

Ser el **sistema de ejecución diaria** de una persona: un solo lugar para tareas, hábitos,
entrenamientos, finanzas, estudios y enfoque, con **captura sin fricción** y **contexto local
argentino**, sobre el que además se puede conectar un agente personal (Hermes).

## Usuario objetivo

- **Owner (yo):** usa la app completa + la capa de agente (Hermes) por Telegram/MCP/API.
- **Usuarios futuros (multi-tenant):** estudiantes y jóvenes profesionales argentinos que ya usan
  apps de gastos y de hábitos por separado y odian pagar suscripciones en dólares. Solo ven la capa
  de app (web + mobile). Sin agente.

## Distinción app / agente (principio inviolable)

- La **app** es multi-tenant desde el día uno, con RLS por `user_id` en todo. Preparada para un
  eventual pago único (`profiles.entitlements`), sin billing todavía.
- El **agente** (Hermes) es **solo del owner**. Se gatea por `profiles.agent_enabled` (default
  `false`). Un usuario normal nunca ve ni puede usar REST `/api/v1`, MCP ni webhooks.

## Principios

1. **Captura sin fricción y confiable.** Si cargar algo tarda más de ~10 s, la gente abandona. La
   confiabilidad (que "cargá gasto 4000 súper" funcione siempre) vale más que sumar features.
2. **Contexto local > features genéricas.** Blue/MEP correcto, cuotas AR, tarjetas AR, todo en pesos.
3. **Una sola capa de dominio.** Toda mutación pasa por `packages/core`, validada con Zod. UI, REST,
   MCP, Telegram y webhooks son adaptadores finos. El LLM devuelve tool-calls, nunca SQL libre.
4. **Pocos módulos muy bien** antes de anchura. Nada de "jack of all trades, master of none".
5. **Provider-agnóstico.** El agente no se casa con ningún LLM (`LLMProvider` + fallback chain).
6. **Multiplataforma real.** Web + mobile nativo desde tokens de diseño compartidos.
7. **i18n y timezone desde el inicio** (es-AR, luxon).

## Qué NO es Astor

- No es "otra app de tareas" ni un template de Notion.
- No es un chatbot: el agente es un **asistente de captura y resumen**, no conversación por conversar.
- No es una app que cobra en dólares para trackear pesos.
- No le crea un agente a cada usuario: la capa de agente es del owner.
- No implementa billing todavía (pero el esquema lo deja preparado).

## Norte de producto

Ser **más argentino que la competencia** (Rimu incluida) en finanzas y **más confiable** en captura.
Esos dos ejes son la ventaja defendible; todo lo demás es tabla de posiciones.
