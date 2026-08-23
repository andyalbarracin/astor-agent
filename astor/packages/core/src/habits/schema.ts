import { z } from 'zod';

export const habitPeriodSchema = z.enum(['day', 'week', 'month']);
export const habitLogStatusSchema = z.enum(['done', 'skipped']);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha esperada YYYY-MM-DD');

export const createHabitInput = z.object({
  name: z.string().trim().min(1).max(200),
  schedule: z.record(z.unknown()).default({}),
  target: z.number().int().positive().default(1),
  period: habitPeriodSchema.default('day'),
  allowSkip: z.boolean().default(true),
});
export type CreateHabitInput = z.input<typeof createHabitInput>;

/** Patch parcial: todo opcional y SIN defaults (un campo omitido no toca la columna). */
export const updateHabitInput = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  schedule: z.record(z.unknown()).optional(),
  target: z.number().int().positive().optional(),
  period: habitPeriodSchema.optional(),
  allowSkip: z.boolean().optional(),
  archived: z.boolean().optional(),
});
export type UpdateHabitInput = z.input<typeof updateHabitInput>;

export const logHabitInput = z.object({
  habitId: z.string().uuid(),
  date: isoDate,
  status: habitLogStatusSchema.default('done'),
});
export type LogHabitInput = z.input<typeof logHabitInput>;
