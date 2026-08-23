-- ============================================================================
-- Astor · Migración 0003 · Hábitos (habits, habit_logs)
-- Fase 1. Requiere 0000, 0001. Pegable tal cual en el editor SQL de Supabase.
-- Rachas y heatmap se derivan por query (sin tabla de agregados).
-- ============================================================================

-- Enums ----------------------------------------------------------------------
do $$ begin create type public.habit_period as enum ('day', 'week', 'month');
exception when duplicate_object then null; end $$;

do $$ begin create type public.habit_log_status as enum ('done', 'skipped');
exception when duplicate_object then null; end $$;

-- Hábitos ---------------------------------------------------------------------
create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  schedule   jsonb not null default '{}'::jsonb,
  target     integer not null default 1 check (target > 0),
  period     public.habit_period not null default 'day',
  allow_skip boolean not null default true,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habits_user_idx on public.habits (user_id);
create index if not exists habits_user_archived_idx on public.habits (user_id, archived);

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- Logs de hábito (uno por habit+date) -----------------------------------------
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  habit_id   uuid not null references public.habits (id) on delete cascade,
  date       date not null,
  status     public.habit_log_status not null default 'done',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists habit_logs_habit_date_idx on public.habit_logs (habit_id, date);
create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, date);

drop trigger if exists set_habit_logs_updated_at on public.habit_logs;
create trigger set_habit_logs_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();

-- RLS ------------------------------------------------------------------------
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

drop policy if exists habits_rw_own on public.habits;
create policy habits_rw_own on public.habits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists habit_logs_rw_own on public.habit_logs;
create policy habit_logs_rw_own on public.habit_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop table if exists public.habit_logs;
-- drop table if exists public.habits;
-- drop type if exists public.habit_log_status;
-- drop type if exists public.habit_period;
