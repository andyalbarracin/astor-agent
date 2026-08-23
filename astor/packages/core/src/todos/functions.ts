import type { Tables } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError } from '../errors';
import {
  createTodoSectionInput,
  createTodoItemInput,
  DEFAULT_TODO_SECTIONS,
  type CreateTodoSectionInput,
  type CreateTodoItemInput,
} from './schema';

export type TodoSection = Tables<'todo_sections'>;
export type TodoItem = Tables<'todo_items'>;
export type TodoSectionWithItems = TodoSection & { items: TodoItem[] };

/** Secciones (con ítems) del usuario, ordenadas por posición. */
export async function listTodoSections(ctx: DomainContext): Promise<TodoSectionWithItems[]> {
  const [{ data: sections, error: sErr }, { data: items, error: iErr }] = await Promise.all([
    ctx.supabase.from('todo_sections').select().order('position', { ascending: true }),
    ctx.supabase.from('todo_items').select().order('position', { ascending: true }),
  ]);
  assertNoDbError(sErr);
  assertNoDbError(iErr);
  const bySection = new Map<string, TodoItem[]>();
  for (const it of items ?? []) {
    const arr = bySection.get(it.section_id) ?? [];
    arr.push(it);
    bySection.set(it.section_id, arr);
  }
  return (sections ?? []).map((s) => ({ ...s, items: bySection.get(s.id) ?? [] }));
}

/** Crea las secciones por defecto (días) si el usuario no tiene ninguna. */
export async function ensureDefaultTodoSections(ctx: DomainContext): Promise<void> {
  const { count, error } = await ctx.supabase
    .from('todo_sections')
    .select('id', { count: 'exact', head: true });
  assertNoDbError(error);
  if ((count ?? 0) > 0) return;
  const rows = DEFAULT_TODO_SECTIONS.map((name, i) => ({
    user_id: ctx.userId,
    name,
    position: i,
  }));
  const { error: insErr } = await ctx.supabase.from('todo_sections').insert(rows);
  assertNoDbError(insErr);
}

export async function createTodoSection(
  ctx: DomainContext,
  input: CreateTodoSectionInput,
): Promise<TodoSection> {
  const d = createTodoSectionInput.parse(input);
  const { count } = await ctx.supabase
    .from('todo_sections')
    .select('id', { count: 'exact', head: true });
  const { data, error } = await ctx.supabase
    .from('todo_sections')
    .insert({ user_id: ctx.userId, name: d.name, position: count ?? 0 })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function renameTodoSection(
  ctx: DomainContext,
  sectionId: string,
  name: string,
): Promise<void> {
  const d = createTodoSectionInput.parse({ name });
  const { error } = await ctx.supabase
    .from('todo_sections')
    .update({ name: d.name })
    .eq('id', sectionId);
  assertNoDbError(error);
}

export async function deleteTodoSection(ctx: DomainContext, sectionId: string): Promise<void> {
  const { error } = await ctx.supabase.from('todo_sections').delete().eq('id', sectionId);
  assertNoDbError(error);
}

export async function addTodoItem(
  ctx: DomainContext,
  input: CreateTodoItemInput,
): Promise<TodoItem> {
  const d = createTodoItemInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('todo_items')
    .insert({ user_id: ctx.userId, section_id: d.sectionId, label: d.label })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function toggleTodoItem(
  ctx: DomainContext,
  itemId: string,
  done: boolean,
): Promise<void> {
  const { error } = await ctx.supabase.from('todo_items').update({ done }).eq('id', itemId);
  assertNoDbError(error);
}

export async function deleteTodoItem(ctx: DomainContext, itemId: string): Promise<void> {
  const { error } = await ctx.supabase.from('todo_items').delete().eq('id', itemId);
  assertNoDbError(error);
}
