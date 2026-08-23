-- ============================================================================
-- Astor · Migración 0008 · Enfoque (focus_sessions) · Fase 4 (adelantada)
-- Requiere 0000-0002 (tasks) y 0007 (subjects). Pegable en el editor SQL.
-- Pomodoro: cada bloque completado se registra acá. Puede ligarse a una tarea
-- y/o a una materia; si liga materia, cuenta como horas de estudio.
-- ============================================================================

create table if not exists public.focus_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  task_id    uuid references public.tasks (id) on delete set null,
  subject_id uuid references public.subjects (id) on delete set null,
  started_at timestamptz not null default now(),
  duration   integer not null check (duration > 0),   -- minutos
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists focus_sessions_user_idx on public.focus_sessions (user_id, started_at);
create index if not exists focus_sessions_subject_idx on public.focus_sessions (subject_id);

drop trigger if exists set_focus_sessions_updated_at on public.focus_sessions;
create trigger set_focus_sessions_updated_at before update on public.focus_sessions
  for each row execute function public.set_updated_at();

alter table public.focus_sessions enable row level security;
drop policy if exists focus_sessions_rw_own on public.focus_sessions;
create policy focus_sessions_rw_own on public.focus_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- -- ROLLBACK
-- ============================================================================
-- drop table if exists public.focus_sessions;
