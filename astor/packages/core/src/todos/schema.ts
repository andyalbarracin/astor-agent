import { z } from 'zod';

export const createTodoSectionInput = z.object({
  name: z.string().trim().min(1).max(120),
});
export type CreateTodoSectionInput = z.input<typeof createTodoSectionInput>;

export const createTodoItemInput = z.object({
  sectionId: z.string().uuid(),
  label: z.string().trim().min(1).max(500),
});
export type CreateTodoItemInput = z.input<typeof createTodoItemInput>;

/** Secciones por defecto cuando el usuario no tiene ninguna (días de la semana). */
export const DEFAULT_TODO_SECTIONS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;
