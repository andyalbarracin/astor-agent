/** Error de dominio. Los adaptadores (UI/REST/MCP/bot) lo traducen a su formato. */
export class DomainError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

/** Lanza DomainError si un error de PostgREST/Supabase está presente. */
export function assertNoDbError(
  error: { message: string; code?: string } | null,
  fallbackCode = 'db_error',
): void {
  if (error) throw new DomainError(error.code ?? fallbackCode, error.message);
}
