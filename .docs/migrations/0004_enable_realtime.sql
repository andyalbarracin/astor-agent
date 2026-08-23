-- ============================================================================
-- Astor · Migración 0004 · Habilitar Realtime (postgres_changes) · Fase 1
-- Requiere 0002, 0003. Idempotente. Pegable tal cual en el editor SQL de Supabase.
-- Sin esto la app funciona igual pero sin actualización en vivo (refresh manual).
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

-- ============================================================================
-- -- ROLLBACK (descomentar para revertir)
-- ============================================================================
-- alter publication supabase_realtime drop table public.tasks;
-- alter publication supabase_realtime drop table public.habit_logs;
-- alter publication supabase_realtime drop table public.habits;
