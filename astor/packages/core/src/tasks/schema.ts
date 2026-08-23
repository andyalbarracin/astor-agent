import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'doing', 'done', 'archived']);
export const taskEisenhowerSchema = z.enum([
  'urgent_important',
  'urgent_not_important',
  'not_urgent_important',
  'not_urgent_not_important',
]);
export const taskSourceSchema = z.enum(['app', 'telegram', 'api', 'mcp']);
export const categoryKindSchema = z.enum(['task', 'project']);

const isoDateTime = z.string().datetime({ offset: true });

export const createTaskInput = z.object({
  title: z.string().trim().min(1).max(500),
  notes: z.string().max(5000).nullish(),
  categoryId: z.string().uuid().nullish(),
  status: taskStatusSchema.default('todo'),
  priority: z.number().int().min(1).max(4).default(3),
  eisenhower: taskEisenhowerSchema.nullish(),
  dueAt: isoDateTime.nullish(),
  scheduledAt: isoDateTime.nullish(),
  recurrenceRule: z.string().max(500).nullish(),
  source: taskSourceSchema.default('app'),
});
export type CreateTaskInput = z.input<typeof createTaskInput>;

/** Patch parcial: todo opcional y SIN defaults (un campo omitido no toca la columna). */
export const updateTaskInput = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  notes: z.string().max(5000).nullish(),
  categoryId: z.string().uuid().nullish(),
  status: taskStatusSchema.optional(),
  priority: z.number().int().min(1).max(4).optional(),
  eisenhower: taskEisenhowerSchema.nullish(),
  dueAt: isoDateTime.nullish(),
  scheduledAt: isoDateTime.nullish(),
  recurrenceRule: z.string().max(500).nullish(),
});
export type UpdateTaskInput = z.input<typeof updateTaskInput>;

export const listTasksFilter = z
  .object({
    status: z.array(taskStatusSchema).nonempty().optional(),
    categoryId: z.string().uuid().nullish(),
  })
  .default({});
export type ListTasksFilter = z.input<typeof listTasksFilter>;

export const createCategoryInput = z.object({
  name: z.string().trim().min(1).max(200),
  kind: categoryKindSchema.default('task'),
  parentId: z.string().uuid().nullish(),
  color: z.string().max(32).nullish(),
});
export type CreateCategoryInput = z.input<typeof createCategoryInput>;

export const createChecklistItemInput = z.object({
  taskId: z.string().uuid(),
  label: z.string().trim().min(1).max(500),
  position: z.number().int().min(0).default(0),
});
export type CreateChecklistItemInput = z.input<typeof createChecklistItemInput>;
