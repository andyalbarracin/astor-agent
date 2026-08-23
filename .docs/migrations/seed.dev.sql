-- ============================================================================
-- Astor · SEED de desarrollo (datos dummy) · seed.dev.sql
-- ----------------------------------------------------------------------------
-- SOLO para bases de desarrollo. NO correr en producción.
--
-- Cómo usarlo:
--  1. Creá los usuarios de prueba con seed.users.sql (juan@astor.app, maria@astor.app).
--  2. Pegá y corré ESTE archivo por secciones, cada una DESPUÉS de su migración.
--     El destino de los datos es juan@astor.app (usuario dummy), resuelto por email.
--     Para sembrar otro usuario, cambiá 'juan@astor.app' por el email que quieras.
--
-- Cada sección está gateada por la migración que la habilita. Mantener sincronizado
-- con .docs/data-model.md y las migraciones a medida que se escriben (Fases 1, 3, 4).
--
-- Idempotente: usa UUIDs fijos + `on conflict do nothing`. Re-correrlo no duplica.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 0 · profiles (migración 0001) — runnable HOY
-- ─────────────────────────────────────────────────────────────────────────────
update public.profiles
set timezone = 'America/Argentina/Buenos_Aires',
    locale   = 'es-AR'
where user_id = (select id from auth.users where email = 'juan@astor.app');


-- ═════════════════════════════════════════════════════════════════════════════
-- FASE 1 · Tareas y hábitos  (requiere migraciones 0002, 0003)
-- ═════════════════════════════════════════════════════════════════════════════

-- Categorías ------------------------------------------------------------------
insert into public.categories (id, user_id, parent_id, kind, name, color)
select v.id, p.user_id, v.parent_id, v.kind::public.category_kind, v.name, v.color
from public.profiles p,
  (values
    ('c1000000-0000-0000-0000-000000000001'::uuid, null::uuid, 'task',    'Personal',  '#4C9AFF'),
    ('c1000000-0000-0000-0000-000000000002'::uuid, null::uuid, 'task',    'Trabajo',   '#9F8FEF'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, null::uuid, 'project', 'Astor',     '#4BCE97')
  ) as v(id, parent_id, kind, name, color)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Tareas (variedad de estado / prioridad / eisenhower / recurrencia) -----------
insert into public.tasks
  (id, user_id, category_id, title, notes, status, priority, eisenhower, due_at, scheduled_at, recurrence_rule, source)
select v.id, p.user_id, v.category_id, v.title, v.notes,
       v.status::public.task_status, v.priority, v.eisenhower::public.task_eisenhower,
       v.due_at, v.scheduled_at, v.recurrence_rule, 'app'
from public.profiles p,
  (values
    ('a1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     'Terminar Fase 0c de Astor', 'Shell web + auth', 'doing', 1, 'urgent_important',
     (now() + interval '1 day'), now(), null::text),
    ('a1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid,
     'Informe trimestral', null, 'todo', 2, 'not_urgent_important',
     (now() + interval '5 days'), null, null),
    ('a1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     'Comprar regalo', null, 'todo', 3, 'urgent_not_important',
     (now() + interval '2 days'), null, null),
    ('a1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid,
     'Sacar la basura', 'Recurrente', 'todo', 4, 'not_urgent_not_important',
     null, null, 'FREQ=WEEKLY;BYDAY=MO,TH'),
    ('a1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
     'Diseñar tokens', null, 'done', 2, 'not_urgent_important',
     null, null, null)
  ) as v(id, category_id, title, notes, status, priority, eisenhower, due_at, scheduled_at, recurrence_rule)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

insert into public.task_checklist_items (id, user_id, task_id, label, done, position)
select v.id, p.user_id, v.task_id, v.label, v.done, v.position
from public.profiles p,
  (values
    ('a1c00000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 'Auth + magic link', true, 1),
    ('a1c00000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 'Shell + nav', true, 2),
    ('a1c00000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-0000-0000-000000000001'::uuid, 'Theme toggle', false, 3)
  ) as v(id, task_id, label, done, position)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Hábitos ---------------------------------------------------------------------
insert into public.habits (id, user_id, name, schedule, target, period, allow_skip, archived)
select v.id, p.user_id, v.name, v.schedule::jsonb, v.target, v.period::public.habit_period, v.allow_skip, false
from public.profiles p,
  (values
    ('b1000000-0000-0000-0000-000000000001'::uuid, 'Meditar',  '{"days":["mon","tue","wed","thu","fri","sat","sun"]}', 1, 'day', true),
    ('b1000000-0000-0000-0000-000000000002'::uuid, 'Correr',   '{"days":["mon","wed","fri"]}',                        3, 'week', true),
    ('b1000000-0000-0000-0000-000000000003'::uuid, 'Leer',     '{"days":["mon","tue","wed","thu","fri","sat","sun"]}', 1, 'day', false)
  ) as v(id, name, schedule, target, period, allow_skip)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Logs de hábitos: últimos 10 días de 'Meditar' (racha visible) ----------------
insert into public.habit_logs (id, user_id, habit_id, date, status)
select gen_random_uuid(), p.user_id, 'b1000000-0000-0000-0000-000000000001'::uuid,
       (current_date - g), (case when g = 3 then 'skipped' else 'done' end)::public.habit_log_status
from public.profiles p, generate_series(0, 9) as g
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (habit_id, date) do nothing;


-- ═════════════════════════════════════════════════════════════════════════════
-- Fases 3+ (Finanzas / Estudios / Entrenamientos / Enfoque): el seed de esas
-- tablas se agrega cuando se creen sus migraciones (0006+). No correr todavía.
-- ═════════════════════════════════════════════════════════════════════════════

-- ============================================================================
-- LIMPIEZA Fase 0/1 (descomentar para resetear el dev seed de juan)
-- ============================================================================
-- do $$
-- declare u uuid := (select id from auth.users where email='juan@astor.app' limit 1);
-- begin
--   delete from public.habit_logs where user_id = u;
--   delete from public.habits where user_id = u;
--   delete from public.task_checklist_items where user_id = u;
--   delete from public.tasks where user_id = u;
--   delete from public.categories where user_id = u;
-- end $$;
