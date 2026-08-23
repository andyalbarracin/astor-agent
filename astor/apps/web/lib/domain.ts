import type { DomainContext } from '@astor/core';
import { createClient } from './supabase/server';
import { getProfile } from './profile';

/** Arma el DomainContext (cliente autenticado + perfil) para las server actions. */
export async function getDomainContext(): Promise<DomainContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile();
  return {
    supabase,
    userId: user.id,
    timezone: profile?.timezone ?? 'America/Argentina/Buenos_Aires',
    locale: profile?.locale ?? 'es-AR',
  };
}
