'use server';

import { revalidatePath } from 'next/cache';
import { logFocusSession, type LogFocusInput } from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function logFocusSessionAction(input: LogFocusInput): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await logFocusSession(ctx, input);
    revalidatePath('/enfoque');
    revalidatePath('/estudios');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
  }
}
