-- ============================================================================
-- Astor · Habilitar Realtime (postgres_changes) para las tablas de Fase 1.
-- Correr una vez en el editor SQL de Supabase. Idempotente.
-- Sin esto, la app funciona igual pero sin actualización en vivo (refresh manual).
-- ============================================================================
do $$
declare
  tbl text;
begin
  foreach tbl in array array['tasks', 'habit_logs', 'habits'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;
