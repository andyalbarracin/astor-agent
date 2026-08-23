'use server';

import { revalidatePath } from 'next/cache';
import {
  createHabit,
  logHabit,
  archiveHabit,
  type CreateHabitInput,
  type HabitLogStatus,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
}

function revalidateHabits() {
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function createHabitAction(input: CreateHabitInput): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await createHabit(ctx, input);
    revalidateHabits();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function logHabitAction(
  habitId: string,
  date: string,
  status: HabitLogStatus,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await logHabit(ctx, { habitId, date, status });
    revalidateHabits();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function archiveHabitAction(
  habitId: string,
  archived = true,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await archiveHabit(ctx, habitId, archived);
    revalidateHabits();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
