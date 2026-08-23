import { DateTime } from 'luxon';
import type { Tables } from '@astor/supabase';
import type { DomainContext } from '../context';
import { DomainError, assertNoDbError } from '../errors';
import { nextOccurrence } from './recurrence';
import {
  createTaskInput,
  updateTaskInput,
  listTasksFilter,
  createCategoryInput,
  createChecklistItemInput,
  type CreateTaskInput,
  type UpdateTaskInput,
  type ListTasksFilter,
  type CreateCategoryInput,
  type CreateChecklistItemInput,
} from './schema';

export type Task = Tables<'tasks'>;
export type Category = Tables<'categories'>;
export type ChecklistItem = Tables<'task_checklist_items'>;

// ── Tareas ───────────────────────────────────────────────────────────────────

export async function createTask(ctx: DomainContext, input: CreateTaskInput): Promise<Task> {
  const d = createTaskInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('tasks')
    .insert({
      user_id: ctx.userId,
      title: d.title,
      notes: d.notes ?? null,
      category_id: d.categoryId ?? null,
      status: d.status,
      priority: d.priority,
      eisenhower: d.eisenhower ?? null,
      due_at: d.dueAt ?? null,
      scheduled_at: d.scheduledAt ?? null,
      recurrence_rule: d.recurrenceRule ?? null,
      source: d.source,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function updateTask(
  ctx: DomainContext,
  taskId: string,
  patch: UpdateTaskInput,
): Promise<Task> {
  const d = updateTaskInput.parse(patch);
  const { data, error } = await ctx.supabase
    .from('tasks')
    .update({
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.notes !== undefined ? { notes: d.notes ?? null } : {}),
      ...(d.categoryId !== undefined ? { category_id: d.categoryId ?? null } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.priority !== undefined ? { priority: d.priority } : {}),
      ...(d.eisenhower !== undefined ? { eisenhower: d.eisenhower ?? null } : {}),
      ...(d.dueAt !== undefined ? { due_at: d.dueAt ?? null } : {}),
      ...(d.scheduledAt !== undefined ? { scheduled_at: d.scheduledAt ?? null } : {}),
      ...(d.recurrenceRule !== undefined ? { recurrence_rule: d.recurrenceRule ?? null } : {}),
    })
    .eq('id', taskId)
    .select()
    .single();
  assertNoDbError(error);
  if (!data) throw new DomainError('not_found', 'Tarea no encontrada.');
  return data;
}

export async function setTaskStatus(
  ctx: DomainContext,
  taskId: string,
  status: Task['status'],
): Promise<Task> {
  const { data, error } = await ctx.supabase
    .from('tasks')
    .update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .select()
    .single();
  assertNoDbError(error);
  if (!data) throw new DomainError('not_found', 'Tarea no encontrada.');
  return data;
}

/**
 * Completa una tarea. Si es recurrente (recurrence_rule + due_at), genera la
 * próxima instancia como una tarea nueva 'todo' con el próximo due_at.
 */
export async function completeTask(
  ctx: DomainContext,
  taskId: string,
): Promise<{ task: Task; next: Task | null }> {
  const { data: current, error: readErr } = await ctx.supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single();
  assertNoDbError(readErr);
  if (!current) throw new DomainError('not_found', 'Tarea no encontrada.');

  const task = await setTaskStatus(ctx, taskId, 'done');

  let next: Task | null = null;
  if (current.recurrence_rule && current.due_at) {
    const from = DateTime.fromISO(current.due_at, { zone: ctx.timezone });
    const nextDue = nextOccurrence(current.recurrence_rule, from);
    if (nextDue) {
      next = await createTask(ctx, {
        title: current.title,
        notes: current.notes ?? undefined,
        categoryId: current.category_id ?? undefined,
        priority: current.priority,
        eisenhower: current.eisenhower ?? undefined,
        dueAt: nextDue.toISO() ?? undefined,
        recurrenceRule: current.recurrence_rule,
        source: current.source,
      });
    }
  }
  return { task, next };
}

export async function deleteTask(ctx: DomainContext, taskId: string): Promise<void> {
  const { error } = await ctx.supabase.from('tasks').delete().eq('id', taskId);
  assertNoDbError(error);
}

export async function listTasks(ctx: DomainContext, filter?: ListTasksFilter): Promise<Task[]> {
  const f = listTasksFilter.parse(filter ?? {});
  let query = ctx.supabase.from('tasks').select();
  if (f.status) query = query.in('status', f.status);
  if (f.categoryId) query = query.eq('category_id', f.categoryId);
  const { data, error } = await query
    .order('priority', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false });
  assertNoDbError(error);
  return data ?? [];
}

// ── Categorías ───────────────────────────────────────────────────────────────

export async function createCategory(
  ctx: DomainContext,
  input: CreateCategoryInput,
): Promise<Category> {
  const d = createCategoryInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('categories')
    .insert({
      user_id: ctx.userId,
      name: d.name,
      kind: d.kind,
      parent_id: d.parentId ?? null,
      color: d.color ?? null,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function listCategories(ctx: DomainContext): Promise<Category[]> {
  const { data, error } = await ctx.supabase
    .from('categories')
    .select()
    .order('name', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}

// ── Checklist ────────────────────────────────────────────────────────────────

export async function addChecklistItem(
  ctx: DomainContext,
  input: CreateChecklistItemInput,
): Promise<ChecklistItem> {
  const d = createChecklistItemInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('task_checklist_items')
    .insert({
      user_id: ctx.userId,
      task_id: d.taskId,
      label: d.label,
      position: d.position,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function toggleChecklistItem(
  ctx: DomainContext,
  itemId: string,
  done: boolean,
): Promise<ChecklistItem> {
  const { data, error } = await ctx.supabase
    .from('task_checklist_items')
    .update({ done })
    .eq('id', itemId)
    .select()
    .single();
  assertNoDbError(error);
  if (!data) throw new DomainError('not_found', 'Ítem no encontrado.');
  return data;
}

export async function listChecklist(ctx: DomainContext, taskId: string): Promise<ChecklistItem[]> {
  const { data, error } = await ctx.supabase
    .from('task_checklist_items')
    .select()
    .eq('task_id', taskId)
    .order('position', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}
