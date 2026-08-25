-- ============================================================================
-- Astor · Migración 0011 · Cuotas + Tarjetas AR (diferenciador)
-- (credit_cards, card_invoices, installment_plans, installments, economic_rates)
-- Fase 3. Requiere 0000-0001, 0009 (accounts). Pegable en el editor SQL.
--
-- Mecánica AR: cargás el TOTAL una vez → se generan N cuotas asignadas al resumen
-- (card_invoice) correspondiente según el CIERRE/VENCIMIENTO de la tarjeta.
-- ============================================================================

do $$ begin create type public.installment_status as enum ('scheduled', 'charged', 'paid');
exception when duplicate_object then null; end $$;

-- Tarjetas (cierre/vencimiento ≠ mes calendario) ------------------------------
create table if not exists public.credit_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  brand       text,
  bank        text,
  account_id  uuid references public.accounts (id) on delete set null,
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day     smallint not null check (due_day between 1 and 31),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists credit_cards_user_idx on public.credit_cards (user_id);

-- Resúmenes (un statement por tarjeta+período) --------------------------------
create table if not exists public.card_invoices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards (id) on delete cascade,
  period         date not null,        -- mes del resumen (YYYY-MM-01)
  closing_date   date not null,
  due_date       date not null,
  total          numeric(18,2) not null default 0,
  paid           boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (credit_card_id, period)
);
create index if not exists card_invoices_card_idx on public.card_invoices (credit_card_id, period);

-- Planes de cuotas (total una vez) --------------------------------------------
create table if not exists public.installment_plans (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  credit_card_id    uuid references public.credit_cards (id) on delete set null,
  description       text not null,
  total_amount      numeric(18,2) not null,
  currency          text not null default 'ARS',
  installments_count integer not null check (installments_count between 1 and 60),
  first_charge_date date not null,
  interest_rate     numeric(8,2) not null default 0,   -- TNA % (0 = sin interés)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists installment_plans_card_idx on public.installment_plans (credit_card_id);

-- Cuotas (asignadas a resúmenes) ----------------------------------------------
create table if not exists public.installments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  plan_id         uuid not null references public.installment_plans (id) on delete cascade,
  number          integer not null,
  amount          numeric(18,2) not null,
  card_invoice_id uuid references public.card_invoices (id) on delete set null,
  status          public.installment_status not null default 'scheduled',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists installments_plan_idx on public.installments (plan_id, number);
create index if not exists installments_invoice_idx on public.installments (card_invoice_id);

-- Tasas económicas (inflación mensual, TNA de referencia, etc.) ----------------
create table if not exists public.economic_rates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null,           -- 'inflacion_mensual', 'tna_ref', …
  value      numeric(10,4) not null,   -- porcentaje
  source     text,
  as_of      timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists economic_rates_user_kind_idx on public.economic_rates (user_id, kind, as_of desc);

-- updated_at + RLS ------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['credit_cards','card_invoices','installment_plans','installments','economic_rates'] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', tbl);
    execute format('create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', tbl);
    execute format('alter table public.%1$s enable row level security', tbl);
    execute format('drop policy if exists %1$s_rw_own on public.%1$s', tbl);
    execute format('create policy %1$s_rw_own on public.%1$s for all using (user_id = auth.uid()) with check (user_id = auth.uid())', tbl);
  end loop;
end $$;

-- ============================================================================
-- -- ROLLBACK
-- ============================================================================
-- drop table if exists public.economic_rates;
-- drop table if exists public.installments;
-- drop table if exists public.installment_plans;
-- drop table if exists public.card_invoices;
-- drop table if exists public.credit_cards;
-- drop type if exists public.installment_status;
