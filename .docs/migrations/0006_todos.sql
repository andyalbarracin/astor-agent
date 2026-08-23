-- ============================================================================
-- Astor · Migración 0006 · To-do seccionado (todo_sections, todo_items)
-- Productividad. Requiere 0000-0001. Pegable tal cual en el editor SQL de Supabase.
--
-- Checklist liviano y editable (estilo Notion). El usuario define las secciones
-- (por defecto: días de la semana) y agrega ítems checkeables (done persiste).
-- Separado de `tasks` (que es el módulo de tareas "real" con Kanban/prioridad).
-- ============================================================================

-- Secciones -------------------------------------------------------------------
create table if not exists public.todo_sections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists todo_sections_user_idx on public.todo_sections (user_id, position);

drop trigger if exists set_todo_sections_updated_at on public.todo_sections;
create trigger set_todo_sections_updated_at before update on public.todo_sections
  for each row execute function public.set_updated_at();

-- Ítems -----------------------------------------------------------------------
create table if not exists public.todo_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  section_id uuid not null references public.todo_sections (id) on delete cascade,
  label      text not null,
  done       boolean not null default false,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists todo_items_section_idx on public.todo_items (section_id, position);

drop trigger if exists set_todo_items_updated_at on public.todo_items;
create trigger set_todo_items_updated_at before update on public.todo_items
  for each row execute function public.set_updated_at();

-- RLS ------------------------------------------------------------------------
alter table public.todo_sections enable row level security;
alter table public.todo_items enable row level security;

drop policy if exists todo_sections_rw_own on public.todo_sections;
create policy todo_sections_rw_own on public.todo_sections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists todo_items_rw_own on public.todo_items;
create policy todo_items_rw_own on public.todo_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime --------------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['todo_sections', 'todo_items'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime'
                   and schemaname='public' and tablename=tbl) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop table if exists public.todo_items;
-- drop table if exists public.todo_sections;
