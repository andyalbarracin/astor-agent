# Módulo Finanzas AR — diseño

> Documento vivo. Fase 3 (diferenciador). Módulo "inteligente": interconexión con agentes,
> import CSV/XLS, LLM para ordenar/reportar, base para Inversiones (InvertirOnline MCP) a futuro.
> Referencia: el Excel del owner (registro de gastos + pivots + estado financiero).

## Visión (qué replicamos del Excel)

1. **Registro de gastos** (hoja "Gastos Mensuales"): Descripción · Fecha · **Rubro** · Costo ·
   **Forma de pago**. Import de **CSV/XLS**. Cada gasto asignable a rubro/fecha/forma de pago.
2. **Reportes / pivots** (hoja de totales): **por Rubro** (EF, Negocios, Varios, Necesarios, Casa,
   Cuotas…), **por Forma de pago** (Efectivo, Crédito, Débito, UALA, MercadoPago, Astropay,
   Transferencia…), subtotales y totales. Filtros por mes.
3. **Multimoneda AR**: ARS + USD, con **blue / MEP / oficial** (fx_rates). Vista dual $/USD.
4. **Cuotas + tarjetas AR** (diferenciador): total una vez → N cuotas asignadas a resúmenes por
   cierre/vencimiento. (Slice siguiente.)
5. **Estado financiero** (hoja principal): Activos/Pasivos, Ingresos/Egresos, Flujo de efectivo,
   **Valor neto / patrimonio**. (Slice siguiente.)
6. **Inversiones** (futuro): conectar MCP de InvertirOnline; acciones/fondos, objetivo vs resultado.

## Inteligencia / interconexión (por qué es un módulo "listo para agente")

- **Única superficie de dominio** (`packages/core/finance`): toda mutación pasa por ahí. Hermes,
  REST `/api/v1`, MCP y el bot de Telegram son adaptadores finos sobre estas funciones (Fase 2/5).
- **`transactions.source`** (`app | import | telegram | api | mcp`): trazabilidad de quién cargó.
- **Webhooks salientes** (Fase 5): `transaction.created`, `invoice.due`, etc. firmados HMAC.
- **LLM (Fase 2, OpenRouter)**: (a) ordenar/mapear CSV/XLS heterogéneos a nuestro esquema,
  (b) categorizar automáticamente (rubro por descripción), (c) generar reportes en lenguaje natural.
  Hoy el import usa **mapeo manual de columnas**; el auto-mapeo LLM se enchufa en el mismo punto.

## Data model — slice 1 (migración 0009)

- `currencies` (code, symbol, decimals) — ARS, USD.
- `fx_rates` (base, quote, rate, rate_type `oficial|blue|mep`, source, as_of) — USD→ARS.
- `finance_categories` (**rubros**): name, kind (`expense|income`), color, position.
- `accounts` (**formas de pago / billeteras**): name, type (`efectivo|banco|billetera|tarjeta_credito|
  tarjeta_debito|usd|otro`), currency, opening_balance.
- `transactions`: description, amount, currency, fx_rate, category_id, account_id, occurred_on,
  kind (`expense|income|transfer`), note, source.

### Slices siguientes
- 0010: `credit_cards`, `card_invoices`, `installment_plans`, `installments` (cuotas/tarjetas AR).
- 0011: `net_worth_items` (activos/pasivos manuales) + vista Estado Financiero.
- Fase 5: `webhook_endpoints`/`webhook_deliveries` (emitir eventos de finanzas).

## Dominio (packages/core/finance)

- transactions: list (filtros: mes, rubro, cuenta, kind), create, update, delete, **importMany** (bulk).
- categories (rubros): list, create, delete, reorder.
- accounts: list, create, delete.
- reports: `byCategory(period)`, `byAccount(period)`, `totals(period)` (pivots del Excel).
- fx: `latestRates()`, helper de conversión ARS↔USD (blue/MEP).

## UI

- **Web** `/finanzas`: registro (tabla filtrable por mes) + alta rápida + **import CSV/XLS**
  (parse → mapear columnas → preview → importar) + panel de **reportes** (pivot por rubro y por
  forma de pago, con subtotales/total) + toggle de moneda ($/USD blue).
- **Mobile**: registro + alta (import queda web-first).

## Estado

- [x] Diseño
- [ ] Migración 0009 + seed · dominio · UI web (registro + reportes + import) · mobile
