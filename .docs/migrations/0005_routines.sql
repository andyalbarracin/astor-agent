-- ============================================================================
-- Astor · Migración 0005 · Rutinas (routines, routine_items, routine_completions)
-- Productividad. Requiere 0000-0001. Pegable tal cual en el editor SQL de Supabase.
--
-- Rutinas = checklists que se resetean cada día (matutina / nocturna / custom).
-- La completitud del día se guarda en routine_completions (una fila = ítem hecho
-- ese día). Sin fila = pendiente. Se "resetea" solo al cambiar de día.
-- ============================================================================

do $$ begin create type public.routine_kind as enum ('morning', 'night', 'custom');
exception when duplicate_object then null; end $$;

-- Rutinas ---------------------------------------------------------------------
create table if not exists public.routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  kind       public.routine_kind not null default 'custom',
  position   integer not null default 0,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists routines_user_idx on public.routines (user_id);

drop trigger if exists set_routines_updated_at on public.routines;
create trigger set_routines_updated_at before update on public.routines
  for each row execute function public.set_updated_at();

-- Ítems de una rutina ---------------------------------------------------------
create table if not exists public.routine_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  routine_id uuid not null references public.routines (id) on delete cascade,
  label      text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists routine_items_routine_idx on public.routine_items (routine_id);

drop trigger if exists set_routine_items_updated_at on public.routine_items;
create trigger set_routine_items_updated_at before update on public.routine_items
  for each row execute function public.set_updated_at();

-- Completitud por día (una fila = ítem hecho ese día) --------------------------
create table if not exists public.routine_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  routine_item_id uuid not null references public.routine_items (id) on delete cascade,
  date            date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (routine_item_id, date)
);
create index if not exists routine_completions_item_date_idx
  on public.routine_completions (routine_item_id, date);
create index if not exists routine_completions_user_date_idx
  on public.routine_completions (user_id, date);

drop trigger if exists set_routine_completions_updated_at on public.routine_completions;
create trigger set_routine_completions_updated_at before update on public.routine_completions
  for each row execute function public.set_updated_at();

-- RLS ------------------------------------------------------------------------
alter table public.routines enable row level security;
alter table public.routine_items enable row level security;
alter table public.routine_completions enable row level security;

drop policy if exists routines_rw_own on public.routines;
create policy routines_rw_own on public.routines
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists routine_items_rw_own on public.routine_items;
create policy routine_items_rw_own on public.routine_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists routine_completions_rw_own on public.routine_completions;
create policy routine_completions_rw_own on public.routine_completions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime --------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime'
                 and schemaname='public' and tablename='routine_completions') then
    alter publication supabase_realtime add table public.routine_completions;
  end if;
end $$;

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop table if exists public.routine_completions;
-- drop table if exists public.routine_items;
-- drop table if exists public.routines;
-- drop type if exists public.routine_kind;
