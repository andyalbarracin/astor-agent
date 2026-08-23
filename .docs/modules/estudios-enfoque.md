# Módulo Estudios + Enfoque — diseño

> Documento vivo. Fase 4 (traída adelante). Fundación (migraciones 0007/0008) capturada; UI se
> construye sobre esto. Referencias: dashboards de educación (course activity + focus hub).

## Necesidades del usuario (reales)

Estudia **en paralelo**: (1) un **curso** online, (2) una **carrera** universitaria, (3) prep de
**exámenes de ingreso**. El módulo tiene que modelar esos tres a la vez y mostrar:

| Necesidad | Se traduce en |
|---|---|
| "cursos / carreras" | **Programas** (`study_programs`): curso · carrera · examen · otro. Card coloreada con progreso. |
| "lo que hay que estudiar" | **Temas** (`study_topics`) con estado `todo`/`learning`. |
| "lo que ya aprendí" | **Temas** con estado `learned`. |
| "lo que hay que hacer" | Plan del día/semana: temas pendientes + fechas objetivo (examen) + sesiones agendadas. |
| "recursos" | `study_resources` (video/pdf/link/playlist/libro) por materia o programa. |
| "calendario" | `target_date` de cada programa (countdown a examen) + timeline de sesiones (tipo Gantt). |
| horas de estudio | `study_sessions` (minutos por materia/tema) → "Focus Hours" de la semana. |

## Jerarquía de datos

```
study_programs (curso | carrera | examen | otro)  ── target_date (examen), status, color
  └── subjects (materias)                          ── status, color
        ├── study_topics (temas)                   ── status: todo | learning | learned
        └── study_resources (recursos)             ── por materia (o directo a programa)
study_sessions (horas)  → subject/topic + minutos + fecha
focus_sessions (pomodoro) → task? / subject? + duración   (ver Enfoque)
```

- Una **materia** puede colgar de un programa o ser suelta (`program_id` nullable).
- Un **recurso** cuelga de materia o de programa (ambos nullable, al menos uno).
- Progreso de un programa = % de temas `learned` sobre el total (o por materia).

## Secciones de UI (web + mobile, estética sobria + acentos de color por programa)

1. **Overview** (como Focus Hub): 3 stats coloreados — *Horas esta semana* · *Temas aprendidos* ·
   *Programas activos*.
2. **Programas**: cards coloridas (color por programa) con barra de progreso, badge de tipo
   (curso/carrera/examen), y para `examen` un **countdown a `target_date`**. Click → detalle.
3. **Detalle de programa**: sus materias (con progreso + horas), agregar materia.
4. **Temas** (por materia): tablero por estado **Por estudiar / Estudiando / Aprendido**
   (reusa el patrón visual del Kanban/checklist). Marcar `learned` = "ya aprendí".
5. **Recursos**: lista por materia/programa (con icono según tipo).
6. **Horas**: log rápido de sesión + chart semanal de horas (recharts, como Hábitos).
7. **Plan / Calendario**: fechas de examen + sesiones de la semana (timeline).

## Enfoque (Pomodoro) — integrado con Estudios

- Timer configurable (default 25/5), start/pause/reset.
- Opcionalmente ligado a una **tarea** o a una **materia**.
- Al completar un bloque → registra `focus_sessions` (duración). Si está ligado a una materia,
  **también cuenta como horas de estudio** de esa materia (integración Enfoque ↔ Estudios).
- Vista: sesiones de foco de hoy + total de foco. Feeds el stat "Horas/Focus".

## Dominio (packages/core, a construir)

- `packages/core/studies`: programs (CRUD + progreso), subjects (CRUD), topics (CRUD + setStatus),
  resources (CRUD), sessions (log + horas por semana).
- `packages/core/focus`: startFocusSession / completeFocusSession (con task/subject), listToday, total.

## Estado

- [x] Diseño + data model
- [x] Migraciones `0007_studies.sql`, `0008_focus.sql`
- [ ] Dominio core (studies, focus)
- [ ] UI web (Estudios + Enfoque)
- [ ] UI mobile (tabs/pantallas)
