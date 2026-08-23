'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ThemePreference = 'system' | 'light' | 'dark';

/** Persiste la preferencia de tema del usuario en profiles.theme. */
export async function setThemePreference(pref: ThemePreference) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({ theme: pref }).eq('user_id', user.id);
  revalidatePath('/', 'layout');
}
