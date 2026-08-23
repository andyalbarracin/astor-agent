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
-- FASE 3 · Finanzas AR  (requiere migraciones 0006, 0007, 0008)
-- ═════════════════════════════════════════════════════════════════════════════

-- Monedas ---------------------------------------------------------------------
insert into public.currencies (id, user_id, code, symbol, decimals)
select v.id, p.user_id, v.code, v.symbol, v.decimals
from public.profiles p,
  (values
    ('cc000000-0000-0000-0000-000000000001'::uuid, 'ARS', '$',   2),
    ('cc000000-0000-0000-0000-000000000002'::uuid, 'USD', 'US$', 2)
  ) as v(id, code, symbol, decimals)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Cotizaciones FX: oficial / blue / MEP (USD→ARS) -----------------------------
insert into public.fx_rates (id, user_id, base, quote, rate, rate_type, source, as_of)
select v.id, p.user_id, 'USD', 'ARS', v.rate, v.rate_type, 'seed', now()
from public.profiles p,
  (values
    ('fx000000-0000-0000-0000-000000000001'::uuid, 1000.00, 'oficial'),
    ('fx000000-0000-0000-0000-000000000002'::uuid, 1450.00, 'blue'),
    ('fx000000-0000-0000-0000-000000000003'::uuid, 1420.00, 'mep')
  ) as v(id, rate, rate_type)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Cuentas ---------------------------------------------------------------------
insert into public.accounts (id, user_id, name, type, currency, opening_balance)
select v.id, p.user_id, v.name, v.type, v.currency, v.opening_balance
from public.profiles p,
  (values
    ('ac000000-0000-0000-0000-000000000001'::uuid, 'Efectivo',        'efectivo', 'ARS',  50000.00),
    ('ac000000-0000-0000-0000-000000000002'::uuid, 'Banco Galicia',   'banco',    'ARS', 800000.00),
    ('ac000000-0000-0000-0000-000000000003'::uuid, 'Dólares (colchón)','usd',     'USD',   1200.00),
    ('ac000000-0000-0000-0000-000000000004'::uuid, 'Visa Galicia',    'tarjeta',  'ARS',      0.00)
  ) as v(id, name, type, currency, opening_balance)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Tarjeta AR: cierre y vencimiento distintos del mes calendario ---------------
insert into public.credit_cards (id, user_id, account_id, closing_day, due_day, brand, bank)
select 'cd000000-0000-0000-0000-000000000001'::uuid, p.user_id,
       'ac000000-0000-0000-0000-000000000004'::uuid, 22, 10, 'Visa', 'Galicia'
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Resúmenes (invoices) del último y próximo período ---------------------------
insert into public.card_invoices (id, user_id, credit_card_id, period, closing_date, due_date, total, paid)
select v.id, p.user_id, 'cd000000-0000-0000-0000-000000000001'::uuid, v.period, v.closing_date, v.due_date, v.total, v.paid
from public.profiles p,
  (values
    ('ci000000-0000-0000-0000-000000000001'::uuid, date_trunc('month', current_date)::date,
       (date_trunc('month', current_date) + interval '21 days')::date,
       (date_trunc('month', current_date) + interval '1 month 9 days')::date, 0.00, false),
    ('ci000000-0000-0000-0000-000000000002'::uuid, (date_trunc('month', current_date) + interval '1 month')::date,
       (date_trunc('month', current_date) + interval '1 month 21 days')::date,
       (date_trunc('month', current_date) + interval '2 months 9 days')::date, 0.00, false)
  ) as v(id, period, closing_date, due_date, total, paid)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Plan de cuotas: "Heladera $600.000 en 12 cuotas Visa Galicia" ----------------
-- (cargás el total UNA vez → el dominio genera las 12 cuotas asignadas a resúmenes)
insert into public.installment_plans
  (id, user_id, credit_card_id, description, total_amount, currency, installments_count, first_charge_date)
select 'ip000000-0000-0000-0000-000000000001'::uuid, p.user_id,
       'cd000000-0000-0000-0000-000000000001'::uuid, 'Heladera Samsung',
       600000.00, 'ARS', 12, current_date
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Cuotas 1..12 (50.000 c/u). En la app las genera core.createInstallmentPlan;
-- acá se siembran para poder ver el pasivo activo sin correr el dominio.
insert into public.installments (id, user_id, plan_id, number, amount, status)
select gen_random_uuid(), p.user_id, 'ip000000-0000-0000-0000-000000000001'::uuid,
       g, 50000.00, case when g = 1 then 'charged' else 'scheduled' end
from public.profiles p, generate_series(1, 12) as g
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict do nothing;

-- Transacciones ---------------------------------------------------------------
insert into public.transactions
  (id, user_id, account_id, kind, amount, currency, category_id, occurred_on, note, source)
select v.id, p.user_id, v.account_id, v.kind, v.amount, v.currency, null, v.occurred_on, v.note, 'app'
from public.profiles p,
  (values
    ('tx000000-0000-0000-0000-000000000001'::uuid, 'ac000000-0000-0000-0000-000000000002'::uuid,
     'income',  1300000.00, 'ARS', (current_date - 5), 'Sueldo'),
    ('tx000000-0000-0000-0000-000000000002'::uuid, 'ac000000-0000-0000-0000-000000000001'::uuid,
     'expense',   46000.00, 'ARS', (current_date - 2), 'Supermercado'),
    ('tx000000-0000-0000-0000-000000000003'::uuid, 'ac000000-0000-0000-0000-000000000002'::uuid,
     'expense',   15000.00, 'ARS', (current_date - 1), 'Spotify + Netflix')
  ) as v(id, account_id, kind, amount, currency, occurred_on, note)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

-- Presupuestos ----------------------------------------------------------------
insert into public.budgets (id, user_id, category_id, period, amount, currency)
select 'bd000000-0000-0000-0000-000000000001'::uuid, p.user_id, null, 'month', 400000.00, 'ARS'
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;


-- ═════════════════════════════════════════════════════════════════════════════
-- FASE 4 · Estudios / Entrenamientos / Enfoque  (requiere 0009, 0010, 0011)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.subjects (id, user_id, name)
select v.id, p.user_id, v.name
from public.profiles p,
  (values
    ('50000000-0000-0000-0000-000000000001'::uuid, 'Cálculo II'),
    ('50000000-0000-0000-0000-000000000002'::uuid, 'Física')
  ) as v(id, name)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

insert into public.study_sessions (id, user_id, subject_id, hours, notes)
select gen_random_uuid(), p.user_id, '50000000-0000-0000-0000-000000000001'::uuid, 4.5, 'Integrales'
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict do nothing;

insert into public.exercises (id, user_id, name)
select v.id, p.user_id, v.name
from public.profiles p,
  (values
    ('e0000000-0000-0000-0000-000000000001'::uuid, 'Sentadilla'),
    ('e0000000-0000-0000-0000-000000000002'::uuid, 'Press banca')
  ) as v(id, name)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

insert into public.workout_sessions (id, user_id, started_at)
select 'w0000000-0000-0000-0000-000000000001'::uuid, p.user_id, (now() - interval '1 day')
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict (id) do nothing;

insert into public.set_logs (id, user_id, session_id, exercise_id, reps, weight, rest)
select gen_random_uuid(), p.user_id, 'w0000000-0000-0000-0000-000000000001'::uuid,
       'e0000000-0000-0000-0000-000000000001'::uuid, v.reps, v.weight, 90
from public.profiles p,
  (values (10, 60.0), (8, 70.0), (6, 80.0)) as v(reps, weight)
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict do nothing;

insert into public.focus_sessions (id, user_id, task_id, started_at, duration, notes)
select gen_random_uuid(), p.user_id, 'a1000000-0000-0000-0000-000000000001'::uuid,
       (now() - interval '3 hours'), 25, 'Pomodoro Astor'
from public.profiles p
where p.user_id = (select id from auth.users where email = 'juan@astor.app')
on conflict do nothing;

-- ============================================================================
-- LIMPIEZA (borra solo datos del owner; descomentar para resetear el dev seed)
-- ============================================================================
-- do $$
-- declare u uuid := (select id from auth.users where email='juan@astor.app' limit 1);
-- begin
--   delete from public.focus_sessions where user_id = u;
--   delete from public.set_logs where user_id = u;
--   delete from public.workout_sessions where user_id = u;
--   delete from public.study_sessions where user_id = u;
--   delete from public.subjects where user_id = u;
--   delete from public.budgets where user_id = u;
--   delete from public.transactions where user_id = u;
--   delete from public.installments where user_id = u;
--   delete from public.installment_plans where user_id = u;
--   delete from public.card_invoices where user_id = u;
--   delete from public.credit_cards where user_id = u;
--   delete from public.accounts where user_id = u;
--   delete from public.fx_rates where user_id = u;
--   delete from public.currencies where user_id = u;
--   delete from public.habit_logs where user_id = u;
--   delete from public.habits where user_id = u;
--   delete from public.task_checklist_items where user_id = u;
--   delete from public.tasks where user_id = u;
--   delete from public.categories where user_id = u;
-- end $$;
