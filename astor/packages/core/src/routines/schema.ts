import { z } from 'zod';

export const routineKindSchema = z.enum(['morning', 'night', 'custom']);

export const createRoutineInput = z.object({
  name: z.string().trim().min(1).max(200),
  kind: routineKindSchema.default('custom'),
  position: z.number().int().min(0).default(0),
});
export type CreateRoutineInput = z.input<typeof createRoutineInput>;

export const createRoutineItemInput = z.object({
  routineId: z.string().uuid(),
  label: z.string().trim().min(1).max(300),
  position: z.number().int().min(0).default(0),
});
export type CreateRoutineItemInput = z.input<typeof createRoutineItemInput>;
