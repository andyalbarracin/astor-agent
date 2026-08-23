import { useEffect, useRef } from 'react';
import { supabase } from './supabase';

/**
 * Suscripción a cambios (postgres_changes) de una tabla para el usuario actual.
 * Degrada con gracia: si la tabla no está en la publicación `supabase_realtime`,
 * simplemente no llegan eventos (no rompe). Habilitar con:
 *   alter publication supabase_realtime add table public.tasks, public.habit_logs, public.habits;
 */
export function useRealtime(
  table: string,
  userId: string | undefined,
  onChange: () => void,
): void {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`rt:${table}:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        () => cb.current(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, userId]);
}
