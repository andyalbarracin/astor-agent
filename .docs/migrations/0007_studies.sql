-- ============================================================================
-- Astor · Migración 0007 · Estudios
-- (study_programs, subjects, study_topics, study_sessions, study_resources)
-- Fase 4 (adelantada). Requiere 0000-0001. Pegable en el editor SQL de Supabase.
-- Modela: cursos + carreras + prep de exámenes, con temas (por estudiar/aprendido),
-- recursos, y horas de estudio. Ver .docs/modules/estudios-enfoque.md
-- ============================================================================

do $$ begin create type public.study_program_kind as enum ('curso', 'carrera', 'examen', 'otro');
exception when duplicate_object then null; end $$;
do $$ begin create type public.study_status as enum ('active', 'paused', 'done', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin create type public.topic_status as enum ('todo', 'learning', 'learned');
exception when duplicate_object then null; end $$;
do $$ begin create type public.resource_kind as enum ('video', 'pdf', 'link', 'playlist', 'book', 'otro');
exception when duplicate_object then null; end $$;

-- Programas (curso / carrera / examen) ----------------------------------------
create table if not exists public.study_programs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  kind        public.study_program_kind not null default 'curso',
  color       text,
  institution text,
  status      public.study_status not null default 'active',
  target_date date,                    -- fecha de examen / deadline (para countdown)
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists study_programs_user_idx on public.study_programs (user_id, position);

-- Materias --------------------------------------------------------------------
create table if not exists public.subjects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  program_id uuid references public.study_programs (id) on delete set null,
  name       text not null,
  color      text,
  status     public.study_status not null default 'active',
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subjects_user_idx on public.subjects (user_id);
create index if not exists subjects_program_idx on public.subjects (program_id);

-- Temas (por estudiar / estudiando / aprendido) -------------------------------
create table if not exists public.study_topics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  title      text not null,
  status     public.topic_status not null default 'todo',
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_topics_subject_idx on public.study_topics (subject_id, position);

-- Sesiones de estudio (horas) -------------------------------------------------
create table if not exists public.study_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  subject_id  uuid references public.subjects (id) on delete set null,
  topic_id    uuid references public.study_topics (id) on delete set null,
  minutes     integer not null check (minutes > 0),
  note        text,
  occurred_on date not null default (now() at time zone 'utc')::date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists study_sessions_user_date_idx on public.study_sessions (user_id, occurred_on);
create index if not exists study_sessions_subject_idx on public.study_sessions (subject_id);

-- Recursos (por materia o programa) -------------------------------------------
create table if not exists public.study_resources (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  program_id uuid references public.study_programs (id) on delete cascade,
  title      text not null,
  url        text,
  kind       public.resource_kind not null default 'link',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists study_resources_subject_idx on public.study_resources (subject_id);
create index if not exists study_resources_program_idx on public.study_resources (program_id);

-- updated_at triggers ---------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['study_programs','subjects','study_topics','study_sessions','study_resources'] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', tbl);
    execute format('create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', tbl);
  end loop;
end $$;

-- RLS ------------------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['study_programs','subjects','study_topics','study_sessions','study_resources'] loop
    execute format('alter table public.%1$s enable row level security', tbl);
    execute format('drop policy if exists %1$s_rw_own on public.%1$s', tbl);
    execute format('create policy %1$s_rw_own on public.%1$s for all using (user_id = auth.uid()) with check (user_id = auth.uid())', tbl);
  end loop;
end $$;

-- ============================================================================
-- -- ROLLBACK
-- ============================================================================
-- drop table if exists public.study_resources;
-- drop table if exists public.study_sessions;
-- drop table if exists public.study_topics;
-- drop table if exists public.subjects;
-- drop table if exists public.study_programs;
-- drop type if exists public.resource_kind;
-- drop type if exists public.topic_status;
-- drop type if exists public.study_status;
-- drop type if exists public.study_program_kind;
