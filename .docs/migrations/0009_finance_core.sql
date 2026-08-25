-- ============================================================================
-- Astor · Migración 0009 · Finanzas (core)
-- (currencies, fx_rates, finance_categories, accounts, transactions)
-- Fase 3. Requiere 0000-0001. Pegable en el editor SQL de Supabase.
-- Registro de gastos con rubro/fecha/forma de pago + multimoneda AR (blue/MEP).
-- Ver .docs/modules/finanzas.md
-- ============================================================================

do $$ begin create type public.account_type as enum
  ('efectivo','banco','billetera','tarjeta_credito','tarjeta_debito','usd','otro');
exception when duplicate_object then null; end $$;
do $$ begin create type public.fx_rate_type as enum ('oficial','blue','mep');
exception when duplicate_object then null; end $$;
do $$ begin create type public.transaction_kind as enum ('expense','income','transfer');
exception when duplicate_object then null; end $$;
do $$ begin create type public.finance_cat_kind as enum ('expense','income');
exception when duplicate_object then null; end $$;
do $$ begin create type public.transaction_source as enum ('app','import','telegram','api','mcp');
exception when duplicate_object then null; end $$;

-- Monedas ---------------------------------------------------------------------
create table if not exists public.currencies (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  code       text not null,          -- ARS, USD
  symbol     text,
  decimals   integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

-- Cotizaciones ----------------------------------------------------------------
create table if not exists public.fx_rates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  base       text not null,          -- USD
  quote      text not null,          -- ARS
  rate       numeric(18,4) not null,
  rate_type  public.fx_rate_type not null default 'blue',
  source     text,
  as_of      timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fx_rates_user_type_idx on public.fx_rates (user_id, rate_type, as_of desc);

-- Rubros ----------------------------------------------------------------------
create table if not exists public.finance_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  kind       public.finance_cat_kind not null default 'expense',
  color      text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists finance_categories_user_idx on public.finance_categories (user_id, position);

-- Cuentas / formas de pago ----------------------------------------------------
create table if not exists public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  type            public.account_type not null default 'billetera',
  currency        text not null default 'ARS',
  opening_balance numeric(18,2) not null default 0,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists accounts_user_idx on public.accounts (user_id, position);

-- Transacciones ---------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount      numeric(18,2) not null,
  currency    text not null default 'ARS',
  fx_rate     numeric(18,4),
  category_id uuid references public.finance_categories (id) on delete set null,
  account_id  uuid references public.accounts (id) on delete set null,
  occurred_on date not null default (now() at time zone 'utc')::date,
  kind        public.transaction_kind not null default 'expense',
  note        text,
  source      public.transaction_source not null default 'app',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index if not exists transactions_category_idx on public.transactions (category_id);
create index if not exists transactions_account_idx on public.transactions (account_id);

-- updated_at + RLS ------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['currencies','fx_rates','finance_categories','accounts','transactions'] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', tbl);
    execute format('create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', tbl);
    execute format('alter table public.%1$s enable row level security', tbl);
    execute format('drop policy if exists %1$s_rw_own on public.%1$s', tbl);
    execute format('create policy %1$s_rw_own on public.%1$s for all using (user_id = auth.uid()) with check (user_id = auth.uid())', tbl);
  end loop;
end $$;

-- Realtime (transacciones) ----------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime'
                 and schemaname='public' and tablename='transactions') then
    alter publication supabase_realtime add table public.transactions;
  end if;
end $$;

-- ============================================================================
-- -- ROLLBACK
-- ============================================================================
-- drop table if exists public.transactions;
-- drop table if exists public.accounts;
-- drop table if exists public.finance_categories;
-- drop table if exists public.fx_rates;
-- drop table if exists public.currencies;
-- drop type if exists public.transaction_source;
-- drop type if exists public.finance_cat_kind;
-- drop type if exists public.transaction_kind;
-- drop type if exists public.fx_rate_type;
-- drop type if exists public.account_type;
