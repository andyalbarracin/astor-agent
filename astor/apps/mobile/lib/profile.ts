import { supabase } from './supabase';

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

export async function getProfile(): Promise<Profile | null> {
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
