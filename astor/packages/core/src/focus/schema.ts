import { z } from 'zod';

export const logFocusInput = z.object({
  taskId: z.string().uuid().nullish(),
  subjectId: z.string().uuid().nullish(),
  duration: z.number().int().positive().max(600), // minutos
  note: z.string().max(500).nullish(),
});
export type LogFocusInput = z.input<typeof logFocusInput>;
