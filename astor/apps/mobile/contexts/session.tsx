import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextValue>({ session: null, loading: true });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  // El intercambio del enlace mágico (deep link) lo maneja la ruta app/auth/callback.
  // Auto-refresh del token solo en foreground (guía Supabase RN).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => sub.remove();
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
