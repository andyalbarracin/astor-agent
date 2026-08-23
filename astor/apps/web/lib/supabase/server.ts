import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@astor/supabase';

/**
 * Cliente Supabase para Server Components / route handlers / server actions.
 * Usa la anon key + cookies del usuario (RLS por auth.uid()).
 * El service_role NUNCA se usa acá; queda para superficies de agente (backend).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll llamado desde un Server Component: lo maneja el middleware.
          }
        },
      },
    },
  );
}
