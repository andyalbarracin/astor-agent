'use server';

import { revalidatePath } from 'next/cache';
import {
  toggleRoutineItem,
  addRoutineItem,
  createRoutine,
  deleteRoutineItem,
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
