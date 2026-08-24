import { DateTime } from 'luxon';
import type { Tables } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError } from '../errors';
import { logFocusInput, type LogFocusInput } from './schema';

export type FocusSession = Tables<'focus_sessions'>;

/** Registra un bloque de Pomodoro completado. Si liga materia, cuenta como estudio. */
export async function logFocusSession(ctx: DomainContext, input: LogFocusInput): Promise<void> {
  const d = logFocusInput.parse(input);
  const { error } = await ctx.supabase.from('focus_sessions').insert({
    user_id: ctx.userId,
    task_id: d.taskId ?? null,
    subject_id: d.subjectId ?? null,
    duration: d.duration,
    note: d.note ?? null,
  });
  assertNoDbError(error);
}

/** Sesiones de foco de hoy + total de minutos. */
export async function getFocusToday(
  ctx: DomainContext,
): Promise<{ sessions: FocusSession[]; totalMinutes: number }> {
  const startIso =
    DateTime.now().setZone(ctx.timezone).startOf('day').toUTC().toISO() ?? new Date(0).toISOString();
  const { data, error } = await ctx.supabase
    .from('focus_sessions')
    .select()
    .gte('started_at', startIso)
    .order('started_at', { ascending: false });
  assertNoDbError(error);
  const sessions = data ?? [];
  return { sessions, totalMinutes: sessions.reduce((acc, s) => acc + s.duration, 0) };
}
