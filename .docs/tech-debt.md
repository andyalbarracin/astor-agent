# Astor — Deuda técnica

> Cosas conocidas para volver. No bloquean, pero hay que cerrarlas.

## Pendiente

- **Mobile · Estudios/Enfoque**: falta el **Pomodoro mobile** y, en Estudios mobile, registrar horas +
  recursos + agregar materia (web ya los tiene).
- **Mobile · drag-reorder**: la pantalla mobile de Productividad es optimista y editable, pero
  reordenar arrastrando NO está (RN necesita reanimated / draggable-flatlist). En web está completo.
- **Tareas · color en cards (Kanban)**: aplicar barra/acento de color por prioridad o categoría
  (referencia: cards de admin con barra superior de color). Hoy las cards de tareas son sobrias.
- **Rename/eliminar sección en mobile**: en web está en el menú ⋯; en mobile solo agregar/editar ítems.
- **Seguridad**: rotar `SUPABASE_SERVICE_ROLE_KEY` (estuvo en git; el owner decidió no rotar aún).
- **Tipos Supabase**: `packages/supabase/src/types.ts` es hand-authored. Reemplazar por
  `supabase gen types` cuando convenga (y eso permitiría subir `@supabase/supabase-js` de 2.45.4).

## Resuelto

- HTTP 431 (headers) · login por password + usuarios dummy · tokens NULL en auth.users ·
  repo re-rooteado en astor-code/ + secreto fuera de git · checkboxes optimistas · sidebar
  colapsable + navbar inferior responsive.
