-- ============================================================================
-- Astor · Migración 0010 · Estado financiero (net_worth_items)
-- Fase 3. Requiere 0000-0001. Pegable en el editor SQL de Supabase.
-- Balance de Activos/Pasivos → Patrimonio neto (hoja principal del Excel).
-- El flujo mensual (ingresos/egresos) se calcula desde transactions (0009).
-- ============================================================================

do $$ begin create type public.net_worth_kind as enum ('asset', 'liability');
exception when duplicate_object then null; end $$;

create table if not exists public.net_worth_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       public.net_worth_kind not null,
  group_name text not null default 'Otros',   -- Dinero, Inversiones, Inmuebles, Tarjetas, Préstamos…
  name       text not null,
  amount     numeric(18,2) not null default 0,
  currency   text not null default 'ARS',
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists net_worth_user_kind_idx on public.net_worth_items (user_id, kind, position);

drop trigger if exists set_net_worth_items_updated_at on public.net_worth_items;
create trigger set_net_worth_items_updated_at before update on public.net_worth_items
  for each row execute function public.set_updated_at();

alter table public.net_worth_items enable row level security;
drop policy if exists net_worth_items_rw_own on public.net_worth_items;
create policy net_worth_items_rw_own on public.net_worth_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- -- ROLLBACK
-- ============================================================================
-- drop table if exists public.net_worth_items;
-- drop type if exists public.net_worth_kind;
