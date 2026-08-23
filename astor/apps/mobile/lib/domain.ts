import { useEffect, useState } from 'react';
import type { DomainContext } from '@astor/core';
import { useSession } from '@/contexts/session';
import { supabase } from './supabase';
import { getProfile, type Profile } from './profile';

/**
 * DomainContext para las pantallas (cliente autenticado + perfil). En mobile no
 * hay server actions: las pantallas llaman las funciones de @astor/core directo;
 * RLS garantiza el aislamiento por usuario.
 */
export function useDomainContext(): DomainContext | null {
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (session) void getProfile().then(setProfile);
    else setProfile(null);
  }, [session?.user.id]);

  if (!session) return null;
  return {
    supabase,
    userId: session.user.id,
    timezone: profile?.timezone ?? 'America/Argentina/Buenos_Aires',
    locale: profile?.locale ?? 'es-AR',
  };
}
