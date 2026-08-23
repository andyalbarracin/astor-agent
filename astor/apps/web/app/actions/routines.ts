'use server';

import { revalidatePath } from 'next/cache';
import {
  toggleRoutineItem,
  addRoutineItem,
  createRoutine,
  deleteRoutineItem,
  renameRoutine,
  deleteRoutine,
  renameRoutineItem,
  reorderRoutines,
  reorderRoutineItems,
  type RoutineKind,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
}
function rev() {
  revalidatePath('/productividad');
  revalidatePath('/');
}

export async function toggleRoutineItemAction(
  itemId: string,
  date: string,
  done: boolean,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await toggleRoutineItem(ctx, itemId, date, done);
    rev();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addRoutineItemAction(routineId: string, label: string): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await addRoutineItem(ctx, { routineId, label });
    rev();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteRoutineItemAction(itemId: string): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await deleteRoutineItem(ctx, itemId);
    rev();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createRoutineAction(name: string, kind: RoutineKind): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await createRoutine(ctx, { name, kind });
    rev();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

async function run(
  fn: (ctx: NonNullable<Awaited<ReturnType<typeof getDomainContext>>>) => Promise<void>,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await fn(ctx);
    rev();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function renameRoutineAction(id: string, name: string) {
  return run((ctx) => renameRoutine(ctx, id, name));
}
export async function deleteRoutineAction(id: string) {
  return run((ctx) => deleteRoutine(ctx, id));
}
export async function renameRoutineItemAction(itemId: string, label: string) {
  return run((ctx) => renameRoutineItem(ctx, itemId, label));
}
export async function reorderRoutinesAction(ids: string[]) {
  return run((ctx) => reorderRoutines(ctx, ids));
}
export async function reorderRoutineItemsAction(ids: string[]) {
  return run((ctx) => reorderRoutineItems(ctx, ids));
}
