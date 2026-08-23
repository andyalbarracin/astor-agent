import type { Tables } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError } from '../errors';
import {
  createRoutineInput,
  createRoutineItemInput,
  type CreateRoutineInput,
  type CreateRoutineItemInput,
} from './schema';

export type Routine = Tables<'routines'>;
export type RoutineItem = Tables<'routine_items'>;
export type RoutineWithItems = Routine & { items: RoutineItem[] };

/** Rutinas (no archivadas) con sus ítems, ordenadas por posición. */
export async function listRoutines(ctx: DomainContext): Promise<RoutineWithItems[]> {
  const [{ data: routines, error: rErr }, { data: items, error: iErr }] = await Promise.all([
    ctx.supabase.from('routines').select().eq('archived', false).order('position', { ascending: true }),
    ctx.supabase.from('routine_items').select().order('position', { ascending: true }),
  ]);
  assertNoDbError(rErr);
  assertNoDbError(iErr);
  const byRoutine = new Map<string, RoutineItem[]>();
  for (const it of items ?? []) {
    const arr = byRoutine.get(it.routine_id) ?? [];
    arr.push(it);
    byRoutine.set(it.routine_id, arr);
  }
  return (routines ?? []).map((r) => ({ ...r, items: byRoutine.get(r.id) ?? [] }));
}

/** Ids de routine_items completados en una fecha (YYYY-MM-DD). */
export async function getRoutineCompletions(
  ctx: DomainContext,
  date: string,
): Promise<string[]> {
  const { data, error } = await ctx.supabase
    .from('routine_completions')
    .select('routine_item_id')
    .eq('date', date);
  assertNoDbError(error);
  return (data ?? []).map((r) => r.routine_item_id);
}

/** Marca/desmarca un ítem de rutina para una fecha. */
export async function toggleRoutineItem(
  ctx: DomainContext,
  itemId: string,
  date: string,
  done: boolean,
): Promise<void> {
  if (done) {
    const { error } = await ctx.supabase
      .from('routine_completions')
      .upsert(
        { user_id: ctx.userId, routine_item_id: itemId, date },
        { onConflict: 'routine_item_id,date' },
      );
    assertNoDbError(error);
  } else {
    const { error } = await ctx.supabase
      .from('routine_completions')
      .delete()
      .eq('routine_item_id', itemId)
      .eq('date', date);
    assertNoDbError(error);
  }
}

export async function createRoutine(
  ctx: DomainContext,
  input: CreateRoutineInput,
): Promise<Routine> {
  const d = createRoutineInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('routines')
    .insert({ user_id: ctx.userId, name: d.name, kind: d.kind, position: d.position })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function addRoutineItem(
  ctx: DomainContext,
  input: CreateRoutineItemInput,
): Promise<RoutineItem> {
  const d = createRoutineItemInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('routine_items')
    .insert({ user_id: ctx.userId, routine_id: d.routineId, label: d.label, position: d.position })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function deleteRoutineItem(ctx: DomainContext, itemId: string): Promise<void> {
  const { error } = await ctx.supabase.from('routine_items').delete().eq('id', itemId);
  assertNoDbError(error);
}

export async function renameRoutine(
  ctx: DomainContext,
  routineId: string,
  name: string,
): Promise<void> {
  const clean = name.trim();
  if (!clean) return;
  const { error } = await ctx.supabase.from('routines').update({ name: clean }).eq('id', routineId);
  assertNoDbError(error);
}

export async function deleteRoutine(ctx: DomainContext, routineId: string): Promise<void> {
  const { error } = await ctx.supabase.from('routines').delete().eq('id', routineId);
  assertNoDbError(error);
}

export async function renameRoutineItem(
  ctx: DomainContext,
  itemId: string,
  label: string,
): Promise<void> {
  const clean = label.trim();
  if (!clean) return;
  const { error } = await ctx.supabase
    .from('routine_items')
    .update({ label: clean })
    .eq('id', itemId);
  assertNoDbError(error);
}

export async function reorderRoutines(ctx: DomainContext, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) => ctx.supabase.from('routines').update({ position: i }).eq('id', id)),
  );
}

export async function reorderRoutineItems(ctx: DomainContext, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      ctx.supabase.from('routine_items').update({ position: i }).eq('id', id),
    ),
  );
}
