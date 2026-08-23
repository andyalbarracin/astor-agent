'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Suscribe a cambios de tasks/habit_logs del usuario y re-fetcha (router.refresh).
 * Degrada con gracia si las tablas no están en la publicación supabase_realtime.
 */
export function RealtimeRefresher({ userId }: { userId: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`rt-web-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${userId}` },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todo_items', filter: `user_id=eq.${userId}` },
        () => router.refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routine_completions', filter: `user_id=eq.${userId}` },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, router]);
  return null;
}
