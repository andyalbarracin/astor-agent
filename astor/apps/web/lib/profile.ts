import { createClient } from './supabase/server';

/** Perfil del usuario. Tipado local hasta que packages/supabase genere tipos (Fase 1). */
export interface Profile {
  user_id: string;
  display_name: string | null;
  timezone: string;
  locale: string;
  theme: 'system' | 'light' | 'dark';
  role: 'owner' | 'user';
  agent_enabled: boolean;
  entitlements: Record<string, unknown>;
}

/** Perfil del usuario autenticado, o null si no hay sesión. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single<Profile>();

  return data ?? null;
}
