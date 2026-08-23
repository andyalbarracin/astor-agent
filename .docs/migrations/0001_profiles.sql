-- ============================================================================
-- Astor · Migración 0001 · profiles + gating de agente
-- Fase 0. Requiere 0000. Pegable tal cual en el editor SQL de Supabase.
-- ============================================================================

-- Enums ----------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('owner', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.theme_pref as enum ('system', 'light', 'dark');
exception when duplicate_object then null; end $$;

-- Tabla ----------------------------------------------------------------------
create table if not exists public.profiles (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  timezone      text        not null default 'America/Argentina/Buenos_Aires',
  locale        text        not null default 'es-AR',
  theme         public.theme_pref not null default 'system',
  role          public.user_role  not null default 'user',
  agent_enabled boolean     not null default false,
  entitlements  jsonb       not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil por usuario (multi-tenant). role/agent_enabled/entitlements solo mutables por service_role.';
comment on column public.profiles.agent_enabled is
  'Gatea las 3 superficies de agente (REST/MCP/webhooks). Solo owner en true.';

create index if not exists profiles_agent_enabled_idx on public.profiles (agent_enabled);

-- updated_at -----------------------------------------------------------------
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Anti-escalación: usuarios normales no pueden tocar columnas sensibles.
-- PostgREST corre a los usuarios de la app bajo los roles 'authenticated'/'anon';
-- el backend (service_role) y el editor SQL (postgres) no son ninguno de esos,
-- así que el bootstrap del owner y las mutaciones de backend sí pasan.
create or replace function public.guard_profile_sensitive_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.role          := old.role;
    new.agent_enabled := old.agent_enabled;
    new.entitlements  := old.entitlements;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profiles_sensitive on public.profiles;
create trigger guard_profiles_sensitive
  before update on public.profiles
  for each row execute function public.guard_profile_sensitive_columns();

-- Alta automática de profile al crearse un auth.users --------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper de gating (usado por policies de superficies de agente en fases 2+) ---
create or replace function public.is_agent_enabled(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select agent_enabled from public.profiles where user_id = uid), false);
$$;

comment on function public.is_agent_enabled(uuid) is
  'true si el usuario tiene agent_enabled. Base del gating owner-only de las superficies de agente.';

-- RLS ------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (user_id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Sin policy de insert/delete para usuarios: el alta la hace el trigger
-- (security definer) y el borrado cae por cascade desde auth.users.

-- ============================================================================
-- Bootstrap del owner (correr UNA vez, reemplazando el uuid):
--   update public.profiles
--   set role = 'owner', agent_enabled = true
--   where user_id = '00000000-0000-0000-0000-000000000000'; -- ASTOR_OWNER_USER_ID
-- ============================================================================

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop function if exists public.is_agent_enabled(uuid);
-- drop trigger if exists guard_profiles_sensitive on public.profiles;
-- drop function if exists public.guard_profile_sensitive_columns();
-- drop table if exists public.profiles;
-- drop type if exists public.theme_pref;
-- drop type if exists public.user_role;
