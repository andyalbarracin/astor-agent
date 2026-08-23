-- ============================================================================
-- Astor · Migración 0002 · Tareas (categories, tasks, task_checklist_items)
-- Fase 1. Requiere 0000, 0001. Pegable tal cual en el editor SQL de Supabase.
-- ============================================================================

-- Enums ----------------------------------------------------------------------
do $$ begin create type public.category_kind as enum ('task', 'project');
exception when duplicate_object then null; end $$;

do $$ begin create type public.task_status as enum ('todo', 'doing', 'done', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin create type public.task_eisenhower as enum
  ('urgent_important', 'urgent_not_important', 'not_urgent_important', 'not_urgent_not_important');
exception when duplicate_object then null; end $$;

do $$ begin create type public.task_source as enum ('app', 'telegram', 'api', 'mcp');
exception when duplicate_object then null; end $$;

-- Categorías (self-ref para subcategorías) ------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  parent_id  uuid references public.categories (id) on delete set null,
  kind       public.category_kind not null default 'task',
  name       text not null,
  color      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_user_idx on public.categories (user_id);
create index if not exists categories_parent_idx on public.categories (parent_id);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Tareas ----------------------------------------------------------------------
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  category_id     uuid references public.categories (id) on delete set null,
  title           text not null,
  notes           text,
  status          public.task_status not null default 'todo',
  priority        smallint not null default 3 check (priority between 1 and 4),
  eisenhower      public.task_eisenhower,
  due_at          timestamptz,
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  recurrence_rule text,
  source          public.task_source not null default 'app',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists tasks_user_idx on public.tasks (user_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_due_idx on public.tasks (user_id, due_at);
create index if not exists tasks_category_idx on public.tasks (category_id);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Checklist de una tarea ------------------------------------------------------
create table if not exists public.task_checklist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  task_id    uuid not null references public.tasks (id) on delete cascade,
  label      text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklist_task_idx on public.task_checklist_items (task_id);

drop trigger if exists set_checklist_updated_at on public.task_checklist_items;
create trigger set_checklist_updated_at
  before update on public.task_checklist_items
  for each row execute function public.set_updated_at();

-- RLS ------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_checklist_items enable row level security;

drop policy if exists categories_rw_own on public.categories;
create policy categories_rw_own on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tasks_rw_own on public.tasks;
create policy tasks_rw_own on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists checklist_rw_own on public.task_checklist_items;
create policy checklist_rw_own on public.task_checklist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop table if exists public.task_checklist_items;
-- drop table if exists public.tasks;
-- drop table if exists public.categories;
-- drop type if exists public.task_source;
-- drop type if exists public.task_eisenhower;
-- drop type if exists public.task_status;
-- drop type if exists public.category_kind;
