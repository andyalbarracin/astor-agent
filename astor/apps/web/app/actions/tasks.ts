'use server';

import { revalidatePath } from 'next/cache';
import {
  createTask,
  updateTask,
  setTaskStatus,
  completeTask,
  deleteTask,
  createCategory,
  addChecklistItem,
  toggleChecklistItem,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskStatus,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
}

function revalidateTasks() {
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function createTaskAction(input: CreateTaskInput): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await createTask(ctx, input);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateTaskAction(
  taskId: string,
  patch: UpdateTaskInput,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await updateTask(ctx, taskId, patch);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await setTaskStatus(ctx, taskId, status);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function completeTaskAction(taskId: string): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await completeTask(ctx, taskId);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await deleteTask(ctx, taskId);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createCategoryAction(input: {
  name: string;
  kind?: 'task' | 'project';
  color?: string;
}): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await createCategory(ctx, input);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addChecklistItemAction(
  taskId: string,
  label: string,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await addChecklistItem(ctx, { taskId, label });
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleChecklistItemAction(
  itemId: string,
  done: boolean,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await toggleChecklistItem(ctx, itemId, done);
    revalidateTasks();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
