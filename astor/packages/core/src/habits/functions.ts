import { DateTime } from 'luxon';
import type { Tables, Json } from '@astor/supabase';
import type { DomainContext } from '../context';
import { DomainError, assertNoDbError } from '../errors';
import { computeStreak, buildHeatmap, type HabitLogLite } from './streak';
import {
  createHabitInput,
  updateHabitInput,
  logHabitInput,
  type CreateHabitInput,
  type UpdateHabitInput,
  type LogHabitInput,
} from './schema';

export type Habit = Tables<'habits'>;
export type HabitLog = Tables<'habit_logs'>;

export async function createHabit(ctx: DomainContext, input: CreateHabitInput): Promise<Habit> {
  const d = createHabitInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('habits')
    .insert({
      user_id: ctx.userId,
      name: d.name,
      schedule: d.schedule as Json,
      target: d.target,
      period: d.period,
      allow_skip: d.allowSkip,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function updateHabit(
  ctx: DomainContext,
  habitId: string,
  patch: UpdateHabitInput,
): Promise<Habit> {
  const d = updateHabitInput.parse(patch);
  const { data, error } = await ctx.supabase
    .from('habits')
    .update({
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.schedule !== undefined ? { schedule: d.schedule as Json } : {}),
      ...(d.target !== undefined ? { target: d.target } : {}),
      ...(d.period !== undefined ? { period: d.period } : {}),
      ...(d.allowSkip !== undefined ? { allow_skip: d.allowSkip } : {}),
      ...(d.archived !== undefined ? { archived: d.archived } : {}),
    })
    .eq('id', habitId)
    .select()
    .single();
  assertNoDbError(error);
  if (!data) throw new DomainError('not_found', 'Hábito no encontrado.');
  return data;
}

export async function archiveHabit(
  ctx: DomainContext,
  habitId: string,
  archived = true,
): Promise<Habit> {
  return updateHabit(ctx, habitId, { archived });
}

export async function listHabits(
  ctx: DomainContext,
  includeArchived = false,
): Promise<Habit[]> {
  let query = ctx.supabase.from('habits').select();
  if (!includeArchived) query = query.eq('archived', false);
  const { data, error } = await query.order('created_at', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}

/** Registra (o actualiza) el log de un hábito para una fecha. Único por habit+date. */
export async function logHabit(ctx: DomainContext, input: LogHabitInput): Promise<HabitLog> {
  const d = logHabitInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('habit_logs')
    .upsert(
      { user_id: ctx.userId, habit_id: d.habitId, date: d.date, status: d.status },
      { onConflict: 'habit_id,date' },
    )
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function getHabitLogs(
  ctx: DomainContext,
  habitId: string,
  sinceDate?: string,
): Promise<HabitLog[]> {
  let query = ctx.supabase.from('habit_logs').select().eq('habit_id', habitId);
  if (sinceDate) query = query.gte('date', sinceDate);
  const { data, error } = await query.order('date', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}

/** Racha (current/longest) de un hábito, calculada sobre los últimos `windowDays`. */
export async function getHabitStreak(
  ctx: DomainContext,
  habitId: string,
  windowDays = 400,
): Promise<{ current: number; longest: number }> {
  const today = DateTime.now().setZone(ctx.timezone).startOf('day');
  const since = today.minus({ days: windowDays }).toISODate() ?? undefined;
  const logs = await getHabitLogs(ctx, habitId, since);
  const lite: HabitLogLite[] = logs.map((l) => ({ date: l.date, status: l.status }));
  return computeStreak(lite, today);
}

export { computeStreak, buildHeatmap, type HabitLogLite };
