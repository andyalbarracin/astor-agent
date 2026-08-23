import type { AstorClient } from '@astor/supabase';

/**
 * Contexto de una operación de dominio. Los adaptadores lo arman con el cliente
 * Supabase autenticado del usuario + su perfil (timezone/locale). RLS garantiza
 * que solo se toquen filas de `userId`; las funciones setean user_id = ctx.userId.
 */
export interface DomainContext {
  supabase: AstorClient;
  userId: string;
  timezone: string;
  locale?: string;
}
