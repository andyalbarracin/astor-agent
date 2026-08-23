import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/** Cliente Supabase tipado con el esquema de Astor. */
export type AstorClient = SupabaseClient<Database>;

/**
 * Cliente con service_role (SOLO backend: superficies de agente, cron, bot).
 * Bypassa RLS — nunca instanciar desde código de cliente.
 */
export function createServiceClient(url: string, serviceRoleKey: string): AstorClient {
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
