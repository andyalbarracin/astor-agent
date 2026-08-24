import { z } from 'zod';

export const studyProgramKindSchema = z.enum(['curso', 'carrera', 'examen', 'otro']);
export const studyStatusSchema = z.enum(['active', 'paused', 'done', 'archived']);
export const topicStatusSchema = z.enum(['todo', 'learning', 'learned']);
export const resourceKindSchema = z.enum(['video', 'pdf', 'link', 'playlist', 'book', 'otro']);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha YYYY-MM-DD');

export const createProgramInput = z.object({
  name: z.string().trim().min(1).max(200),
  kind: studyProgramKindSchema.default('curso'),
  color: z.string().max(32).nullish(),
  institution: z.string().max(200).nullish(),
  targetDate: isoDate.nullish(),
});
export type CreateProgramInput = z.input<typeof createProgramInput>;

export const updateProgramInput = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  kind: studyProgramKindSchema.optional(),
  color: z.string().max(32).nullish(),
  institution: z.string().max(200).nullish(),
  status: studyStatusSchema.optional(),
  targetDate: isoDate.nullish(),
});
export type UpdateProgramInput = z.input<typeof updateProgramInput>;

export const createSubjectInput = z.object({
  programId: z.string().uuid().nullish(),
  name: z.string().trim().min(1).max(200),
  color: z.string().max(32).nullish(),
});
export type CreateSubjectInput = z.input<typeof createSubjectInput>;

export const createTopicInput = z.object({
  subjectId: z.string().uuid(),
  title: z.string().trim().min(1).max(300),
  status: topicStatusSchema.default('todo'),
});
export type CreateTopicInput = z.input<typeof createTopicInput>;

export const logStudySessionInput = z.object({
  subjectId: z.string().uuid().nullish(),
  topicId: z.string().uuid().nullish(),
  minutes: z.number().int().positive().max(1440),
  note: z.string().max(500).nullish(),
  occurredOn: isoDate.nullish(),
});
export type LogStudySessionInput = z.input<typeof logStudySessionInput>;

export const addResourceInput = z.object({
  subjectId: z.string().uuid().nullish(),
  programId: z.string().uuid().nullish(),
  title: z.string().trim().min(1).max(300),
  url: z.string().url().max(1000).nullish(),
  kind: resourceKindSchema.default('link'),
});
export type AddResourceInput = z.input<typeof addResourceInput>;
