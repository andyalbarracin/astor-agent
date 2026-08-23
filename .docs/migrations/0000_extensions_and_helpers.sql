-- ============================================================================
-- Astor · Migración 0000 · Extensiones y helpers
-- Fase 0. Pegable tal cual en el editor SQL de Supabase (correr PRIMERO).
-- Idempotente: usa IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================================

-- Extensiones ----------------------------------------------------------------
-- gen_random_uuid() y utilidades de criptografía (hash de PATs en Fase 2).
create extension if not exists pgcrypto;

-- Helper de timestamps -------------------------------------------------------
-- Trigger BEFORE UPDATE que mantiene updated_at. Cada tabla con updated_at
-- crea su trigger apuntando a esta función (ver migraciones siguientes).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger BEFORE UPDATE: setea updated_at = now(). Compartido por todas las tablas.';

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- drop function if exists public.set_updated_at();
-- -- pgcrypto se deja instalada a propósito (otras migraciones dependen de ella).
-- -- drop extension if exists pgcrypto;
