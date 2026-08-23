'use server';

import { revalidatePath } from 'next/cache';
import {
  createTodoSection,
  renameTodoSection,
  deleteTodoSection,
  addTodoItem,
  toggleTodoItem,
  deleteTodoItem,
  renameTodoItem,
  reorderTodoSections,
  reorderTodoItems,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };
function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
}
function rev() {
  revalidatePath('/productividad');
}

async function withCtx(fn: (ctx: NonNullable<Awaited<ReturnType<typeof getDomainContext>>>) => Promise<void>): Promise<ActionResult> {
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

export async function addTodoSectionAction(name: string) {
  return withCtx((ctx) => createTodoSection(ctx, { name }).then(() => undefined));
}
export async function renameTodoSectionAction(sectionId: string, name: string) {
  return withCtx((ctx) => renameTodoSection(ctx, sectionId, name));
}
export async function deleteTodoSectionAction(sectionId: string) {
  return withCtx((ctx) => deleteTodoSection(ctx, sectionId));
}
export async function addTodoItemAction(sectionId: string, label: string) {
  return withCtx((ctx) => addTodoItem(ctx, { sectionId, label }).then(() => undefined));
}
export async function toggleTodoItemAction(itemId: string, done: boolean) {
  return withCtx((ctx) => toggleTodoItem(ctx, itemId, done));
}
export async function deleteTodoItemAction(itemId: string) {
  return withCtx((ctx) => deleteTodoItem(ctx, itemId));
}
export async function renameTodoItemAction(itemId: string, label: string) {
  return withCtx((ctx) => renameTodoItem(ctx, itemId, label));
}
export async function reorderTodoSectionsAction(orderedIds: string[]) {
  return withCtx((ctx) => reorderTodoSections(ctx, orderedIds));
}
export async function reorderTodoItemsAction(orderedIds: string[]) {
  return withCtx((ctx) => reorderTodoItems(ctx, orderedIds));
}
