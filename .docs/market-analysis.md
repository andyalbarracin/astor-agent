# Astor — Análisis de mercado y oportunidad

> Documento vivo. Se actualiza junto con `roadmap.md` y el `CHANGELOG`/log de features. Cada vez que se implementa un módulo, se marca en la sección "Features vs. competencia".
> Última actualización: fase de diseño (pre-Fase 0).
> Fuentes citadas al pie; los tamaños de mercado se presentan con rango porque los reportes se contradicen bastante entre sí.

---

## 1. Tesis en una línea

El valor de Astor no es "5 apps en 1" (eso está commoditizado). Es **un sistema de ejecución diaria con captura sin fricción y contexto local (Argentina/LATAM)**, con una capa de agente personal (Hermes) reservada al owner. La competencia gana o pierde usuarios por **fricción de captura** y por **entender o no la economía local**, no por cantidad de features.

---

## 2. Tamaño de mercado y oportunidad

Los reportes de mercado varían muchísimo (señal de que hay que tomarlos como orden de magnitud, no como verdad):

- **Apps de productividad (global):** ~USD 14.500 M en 2026, proyectado a ~USD 30.850 M en 2034, CAGR ~9,9% (Fortune Business Insights).
- **Apps de tracking de hábitos (global):** las estimaciones 2026 van desde ~USD 1.300–2.200 M (Straits Research, MRFR, Business Research Insights) hasta cifras infladas de USD 14–50 B en reportes menos creíbles. CAGR razonable ~13–15%. Usar el rango bajo como referencia realista.
- **Señal cualitativa relevante:** el segmento de trackers standalone se está **commoditizando**; los reportes advierten que los nuevos entrantes la tienen difícil salvo que ofrezcan una propuesta de valor única, y que los usuarios migran hacia **ecosistemas integrados** en vez de apps sueltas (Verified Market Reports). Esto es a la vez la amenaza (commodity) y la oportunidad (integración + contexto local).

**Lectura para Astor:** el mercado global es grande pero saturado y dominado por gigantes en inglés. La oportunidad no es competir por el mercado global genérico, sino por el **nicho hispanohablante desatendido con contexto argentino**, donde los incumbentes no llegan bien.

---

## 3. Panorama competitivo

### 3.1 Todo-en-uno / "Life OS" (competencia directa del concepto)

- **Rimu** (referencia directa). Tareas + hábitos + entrenamiento + finanzas + estudios, pago único "de por vida", captura por WhatsApp, español, con IA. Debilidad observable: los comentarios de su propio Instagram reportan que la integración de WhatsApp falla ("me manda un link y dice que no existe"). **La confiabilidad es una grieta explotable.**
- **TickTick.** El todo-en-uno más pulido (tareas + hábitos + pomodoro + calendario + lenguaje natural). Suscripción. No tiene finanzas, entrenamiento ni estudios, y no entiende contexto argentino.
- **SyncOS** (basado en Notion). Hábitos + tareas + notas + finanzas + goals + gym + calendario + asistente + CRM, **pago único** (~EUR 30–43). Mismo pitch que Rimu pero como template. Debilidad: es Notion, no una app nativa; la captura y el mobile sufren.
- **Notion "Life OS" / PARA templates** (p. ej. Gumroad ~USD 50). Todo configurable, nada opinado. Curva de armado alta, captura lenta, mobile pobre.
- **Apps genéricas "all-in-one" de app store** (Done!, FocusKit, Planner App, Rudis ~USD 99, Brite, QuirkPlus). Muchas, en general **shallow**: hacen 2–3 dominios superficialmente. Refuerzan la percepción "jack of all trades, master of none".

### 3.2 Incumbentes enfocados (competencia por módulo)

- Tareas: Todoist, TickTick, Things, Microsoft To Do.
- Hábitos: Habitica (gamificado), Streaks, Productive, Fabulous, Strides, Atoms.
- Entrenamiento: Hevy, Strong, Jefit.
- Finanzas (internacional): YNAB (ortodoxo, caro, en inglés, no entiende inflación local), Monarch, Mobills, Bluecoins, Spendee, Money Manager, Fintonic (ES).
- Estudios: Anki, Notion, Forest (enfoque).

Ninguno combina bien los 5 dominios **y** el contexto local. Ese es el whitespace.

### 3.3 Competencia argentina de finanzas (crítica, porque es el módulo diferenciador)

- **Billeteras/bancos** (Mercado Pago, Ualá, Brubank, Naranja X, Personal Pay): cada una ve **solo su propia plata**, no consolidan. Se usan junto a una app de finanzas, no en lugar de.
- **Apps de gastos AR o localizadas:** Ábaco (AR), Finy (AR, IA: carga por voz/foto/PDF, 40+ monedas, sincroniza Mercado Pago en varios países LATAM), FocusFolio (AR, dólar blue), Chanchito, Mobills, Moneon, Bluecoins.
- **Dolor articulado por medios y foros AR (2026):**
  - Pagar en dólares una app para trackear pesos es irónico y caro: con el tipo de cambio terminás pagando varios miles de pesos por mes por algo que no entiende tu economía (CumbreBot / techdelfuego).
  - **Multimoneda con dólar blue/MEP es requisito, no lujo:** mucha gente cobra en pesos, ahorra en dólares MEP, paga Spotify/Netflix en USD. Una conversión desactualizada "te miente" (FocusFolio).
  - **Cuotas argentinas mal resueltas:** al comprar en 12 cuotas, la mayoría de las apps te obligan a anotar cada cuota por separado (gastos duplicados) o el total una vez (el reporte mensual no refleja qué cuotas tenés activas hoy). Una app pensada para AR anotaría el total una vez y entendería las 12 cuotas automáticamente (CumbreBot).
  - **Tarjetas argentinas:** cierre y vencimiento no coinciden con el mes calendario; casi ninguna app lo modela.
  - **Fricción de captura mata la constancia:** si cargar un gasto tarda más de ~10 segundos, la gente abandona en una semana. El error más común es elegir app por lista de features en vez de por "por qué dejé la anterior" (Finy / Chanchito).
  - **Mercado Pago** es la integración más útil en la práctica en AR porque concentra el consumo cotidiano.

**Conclusión 3.3:** Rimu ya lista "cuotas automáticas" y "multimoneda con tasa automática", pero es una app pensada en clave regional genérica. Hay lugar para ser **más argentino que Rimu**: blue/MEP correcto, cuotas y tarjetas AR bien modeladas, todo en pesos y sin cobrar en USD.

---

## 4. Señales de demanda (qué pide el mercado)

1. **Fatiga de suscripción / pro-pago único.** Sentimiento explícito y recurrente ("SaaS is a cancer, promote one-time-purchase apps"). El pago único de Rimu/SyncOS explota esto. En AR se agrava porque las suscripciones en USD duelen por FX.
2. **Escepticismo al "todo-en-uno".** El "jack of all trades, master of none" es real: la gente desconfía de apps que hacen todo mal. → Astor debe hacer **pocos módulos muy bien** antes de anchura.
3. **Captura sin fricción como killer feature.** Voz, foto de ticket, texto por chat. Finy ya lo hace en finanzas; Rimu lo hace por WhatsApp. Es la feature por la que la gente se queda o se va.
4. **IA como asistente de captura y resumen**, no como chatbot. Briefings, "cargá esto por mí", "resumime el mes".
5. **Contexto local > features genéricas.** En AR, entender blue/MEP/cuotas/Mercado Pago vale más que 20 features de más.

---

## 5. Ventajas de Astor frente a la competencia

Tabla viva — se actualiza a medida que se implementa cada módulo. Estado: ✅ hecho · 🚧 en curso · ⬜ planeado.

| Capacidad | Astor | Rimu | TickTick | Notion Life OS | Apps AR de gastos |
|---|---|---|---|---|---|
| Tareas (Eisenhower/Kanban/recurrencia) | ⬜ | ✅ | ✅ | parcial | ✗ |
| Hábitos (rachas/heatmap/skip) | ⬜ | ✅ | ✅ | parcial | ✗ |
| Entrenamiento (progresión/PRs) | ⬜ | ✅ | ✗ | template | ✗ |
| Estudios (materias/horas/rachas) | ⬜ | ✅ | ✗ | template | ✗ |
| Enfoque/Pomodoro | ⬜ | ✅ | ✅ | ✗ | ✗ |
| Finanzas multimoneda **blue/MEP correcto** | ⬜ | parcial | ✗ | ✗ | algunas |
| **Cuotas AR bien modeladas** (total una vez → N cuotas) | ⬜ | parcial | ✗ | ✗ | casi ninguna |
| **Tarjetas AR** (cierre/vencimiento ≠ mes) | ⬜ | ✗ | ✗ | ✗ | casi ninguna |
| Captura por chat (Telegram/WhatsApp) | ⬜ | ✅ (WA, inestable) | ✗ | ✗ | Finy (voz/foto) |
| Captura por voz → dato estructurado | ⬜ | parcial | ✗ | ✗ | Finy |
| Briefings mañana/mediodía/noche | ⬜ | ✅ | ✗ | ✗ | ✗ |
| Sync Google Calendar bidireccional | ⬜ | ✅ | ✅ | parcial | ✗ |
| **Precio en pesos, sin cobrar en USD** | ⬜ | ? | ✗ (USD) | ✗ (USD) | mixto |
| **Capa de agente (MCP/API/webhooks)** — owner | ⬜ | ✗ | ✗ | limitado | ✗ |
| Multiplataforma nativa (web + mobile) | ⬜ | ✅ | ✅ | ✗ (web+wrapper) | varía |

---

## 6. Oportunidades de mejora y cómo ganar mercado

### 6.1 Diferenciadores defendibles (por orden de impacto)

1. **Ser el más argentino en finanzas.** Blue/MEP con cotización fresca, cuotas y tarjetas AR bien modeladas, todo en pesos, integración Mercado Pago. Esto solo ya justifica la app para el mercado AR.
2. **Captura sin fricción, confiable.** El talón de Aquiles de Rimu es que su captura falla. Ganar por **confiabilidad** (que "cargá gasto 4000 súper" funcione siempre) es más valioso que sumar features.
3. **Integración cross-módulo real.** "Terminé sesión de estudio" → registra tiempo + marca hábito + sugiere próxima. Eso los standalone no lo pueden hacer y los templates lo hacen a mano.
4. **Precio.** Pago único en pesos (cuando se monetice) contra suscripciones en USD = argumento de venta directo en AR.

### 6.2 Cómo entrar al mercado

- **Nicho primero:** estudiantes + jóvenes profesionales AR que ya usan apps de gastos y de hábitos por separado y odian pagar en dólares.
- **Wedge = finanzas AR + captura por chat.** Entrar por el dolor más agudo (plata + fricción), no por "otra app de tareas".
- **Distribución:** contenido en español mostrando el modelado correcto de cuotas/blue (los artículos AR de 2026 muestran que la gente busca justamente eso), demos de captura por chat, comparativas honestas vs. pagar en USD.
- **Confianza en datos financieros:** privacidad y seguridad explícitas (RLS, sin venta de datos) como argumento, dado que es plata.

---

## 7. Features que (probablemente) nadie en Argentina tiene — "ir más allá"

Ideas de whitespace para el roadmap (validar antes de construir):

1. **Modelado de cuotas nativo argentino:** cargás "Heladera $600.000 en 12 cuotas con tarjeta Visa Galicia" y Astor genera automáticamente las 12 cuotas futuras, las asigna a cada resumen según cierre/vencimiento de esa tarjeta, y las muestra como pasivo activo. Casi nadie lo hace bien.
2. **Vista dual pesos/dólares en toda la app:** todo balance y reporte muestra el equivalente en USD (blue o MEP a elección) con la cotización del momento, no solo en el módulo de finanzas.
3. **"Poder de compra" contra inflación:** mostrar cuánto vale hoy lo que ahorraste hace X meses, en términos reales. Feature emocionalmente potente en AR, inexistente en apps genéricas.
4. **Captura unificada cross-módulo por chat/voz:** un solo canal (Telegram) que entiende si le hablás de una tarea, un gasto, una serie de gym o una sesión de estudio, y lo rutea al módulo correcto. Rimu hace tareas + gastos; hacerlo para los 5 dominios con desambiguación es un paso más.
4b. **Foto de resumen de tarjeta → cuotas + movimientos** (OCR/IA), respetando el modelo de cuotas AR.
5. **Briefing "argentino":** el resumen de la mañana incluye cotización blue/MEP, cuánto llevás gastado del presupuesto en términos reales, y qué cuotas te vencen este mes.
6. **Capa de agente para power users (fase lejana, opcional):** hoy owner-only, pero la arquitectura MCP/API deja la puerta abierta a, algún día, ofrecer "conectá tu propio asistente" como feature premium diferencial que ningún competidor AR tiene. (Decisión de negocio futura, no compromiso.)

---

## 8. Riesgos de mercado

- **Commoditización:** el espacio está lleno. Mitigación: no competir por features, competir por contexto local + confiabilidad + captura.
- **Rimu ya existe y ocupa el nicho exacto.** Mitigación: ejecutar mejor (confiabilidad), ser más argentino, y usar la capa de agente como palanca propia (Hermes) que Rimu no tiene.
- **Costo recurrente de IA vs. pago único** (si se monetiza así): capar tokens, modelos baratos, y reservar el agente para el owner en esta etapa evita el problema por ahora.
- **Dependencia de terceros locales** (Mercado Pago, cotización blue): mitigar con múltiples fuentes de FX y carga manual como fallback.

---

## 9. Fuentes

- Fortune Business Insights — Productivity Apps Market (2026): https://www.fortunebusinessinsights.com/productivity-apps-market-110254
- Straits Research — Habit Tracking Apps Market (2026): https://straitsresearch.com/report/habit-tracking-apps-market
- Verified Market Reports — Habit Tracking Apps (commoditización): https://www.verifiedmarketreports.com/product/habit-tracking-apps-market/
- FocusFolio — Mejores apps de finanzas personales Argentina 2026: https://focusfolio.com.ar/mejores-apps-finanzas-personales-argentina
- techdelfuego / CumbreBot — Mejor app de finanzas personales Argentina (cuotas, blue/MEP): https://finanzas.techdelfuego.com/preguntas/mejor-app-finanzas-personales-argentina/
- Finy — Mejor app de gastos Argentina (captura por voz/foto/PDF): https://www.finyapp.io/guias/mejor-app-de-gastos-argentina
- Segundo Enfoque — Apps para manejar el dinero en Argentina 2026: https://segundoenfoque.com/las-mejores-apps-para-manejar-la-plata-en-argentina-2026
- SyncOS (competidor pago único, Notion-based): https://alesnotion.gumroad.com/l/SyncOS-Pro
- Rimu (referencia): https://www.rimuapp.com/ · IG: https://www.instagram.com/rimuapp
- Sentimiento anti-suscripción / all-in-one skepticism: overoptimize.substack.com, alexcristea.substack.com, billmclean.substack.com
