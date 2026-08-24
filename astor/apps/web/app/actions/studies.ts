'use server';

import { revalidatePath } from 'next/cache';
import {
  createProgram,
  updateProgram,
  deleteProgram,
  createSubject,
  deleteSubject,
  createTopic,
  setTopicStatus,
  deleteTopic,
  logStudySession,
  addResource,
  deleteResource,
  type CreateProgramInput,
  type UpdateProgramInput,
  type LogStudySessionInput,
  type AddResourceInput,
  type TopicStatus,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function run(
  fn: (ctx: NonNullable<Awaited<ReturnType<typeof getDomainContext>>>) => Promise<void>,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await fn(ctx);
    revalidatePath('/estudios', 'layout');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
  }
}

export async function createProgramAction(input: CreateProgramInput) {
  return run((ctx) => createProgram(ctx, input).then(() => undefined));
}
export async function updateProgramAction(id: string, patch: UpdateProgramInput) {
  return run((ctx) => updateProgram(ctx, id, patch));
}
export async function deleteProgramAction(id: string) {
  return run((ctx) => deleteProgram(ctx, id));
}
export async function createSubjectAction(programId: string, name: string) {
  return run((ctx) => createSubject(ctx, { programId, name }).then(() => undefined));
}
export async function deleteSubjectAction(id: string) {
  return run((ctx) => deleteSubject(ctx, id));
}
export async function createTopicAction(subjectId: string, title: string) {
  return run((ctx) => createTopic(ctx, { subjectId, title }).then(() => undefined));
}
export async function setTopicStatusAction(topicId: string, status: TopicStatus) {
  return run((ctx) => setTopicStatus(ctx, topicId, status));
}
export async function deleteTopicAction(id: string) {
  return run((ctx) => deleteTopic(ctx, id));
}
export async function logStudySessionAction(input: LogStudySessionInput) {
  return run((ctx) => logStudySession(ctx, input));
}
export async function addResourceAction(input: AddResourceInput) {
  return run((ctx) => addResource(ctx, input).then(() => undefined));
}
export async function deleteResourceAction(id: string) {
  return run((ctx) => deleteResource(ctx, id));
}
