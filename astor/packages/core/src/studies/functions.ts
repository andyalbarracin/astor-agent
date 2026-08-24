import { DateTime } from 'luxon';
import type { Tables, TopicStatus } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError } from '../errors';
import {
  createProgramInput,
  updateProgramInput,
  createSubjectInput,
  createTopicInput,
  logStudySessionInput,
  addResourceInput,
  type CreateProgramInput,
  type UpdateProgramInput,
  type CreateSubjectInput,
  type CreateTopicInput,
  type LogStudySessionInput,
  type AddResourceInput,
} from './schema';

export type Program = Tables<'study_programs'>;
export type Subject = Tables<'subjects'>;
export type Topic = Tables<'study_topics'>;
export type StudySession = Tables<'study_sessions'>;
export type StudyResource = Tables<'study_resources'>;

export type ProgramWithProgress = Program & {
  subjectsCount: number;
  topicsTotal: number;
  topicsLearned: number;
  progress: number; // 0-100
};
export type SubjectWithTopics = Subject & { topics: Topic[] };

// ── Programas ────────────────────────────────────────────────────────────────

export async function listProgramsWithProgress(ctx: DomainContext): Promise<ProgramWithProgress[]> {
  const [{ data: programs, error: pErr }, { data: subjects, error: sErr }, { data: topics, error: tErr }] =
    await Promise.all([
      ctx.supabase.from('study_programs').select().neq('status', 'archived').order('position', { ascending: true }),
      ctx.supabase.from('subjects').select(),
      ctx.supabase.from('study_topics').select(),
    ]);
  assertNoDbError(pErr);
  assertNoDbError(sErr);
  assertNoDbError(tErr);

  const subjToProgram = new Map((subjects ?? []).map((s) => [s.id, s.program_id]));
  const subjCount = new Map<string, number>();
  for (const s of subjects ?? []) if (s.program_id) subjCount.set(s.program_id, (subjCount.get(s.program_id) ?? 0) + 1);

  const stats = new Map<string, { total: number; learned: number }>();
  for (const t of topics ?? []) {
    const pid = subjToProgram.get(t.subject_id);
    if (!pid) continue;
    const st = stats.get(pid) ?? { total: 0, learned: 0 };
    st.total += 1;
    if (t.status === 'learned') st.learned += 1;
    stats.set(pid, st);
  }
  return (programs ?? []).map((p) => {
    const st = stats.get(p.id) ?? { total: 0, learned: 0 };
    return {
      ...p,
      subjectsCount: subjCount.get(p.id) ?? 0,
      topicsTotal: st.total,
      topicsLearned: st.learned,
      progress: st.total ? Math.round((st.learned / st.total) * 100) : 0,
    };
  });
}

export async function getProgram(ctx: DomainContext, programId: string): Promise<Program | null> {
  const { data, error } = await ctx.supabase.from('study_programs').select().eq('id', programId).single();
  assertNoDbError(error);
  return data ?? null;
}

export async function createProgram(ctx: DomainContext, input: CreateProgramInput): Promise<Program> {
  const d = createProgramInput.parse(input);
  const { count } = await ctx.supabase.from('study_programs').select('id', { count: 'exact', head: true });
  const { data, error } = await ctx.supabase
    .from('study_programs')
    .insert({
      user_id: ctx.userId,
      name: d.name,
      kind: d.kind,
      color: d.color ?? null,
      institution: d.institution ?? null,
      target_date: d.targetDate ?? null,
      position: count ?? 0,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function updateProgram(ctx: DomainContext, programId: string, patch: UpdateProgramInput): Promise<void> {
  const d = updateProgramInput.parse(patch);
  const { error } = await ctx.supabase
    .from('study_programs')
    .update({
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.kind !== undefined ? { kind: d.kind } : {}),
      ...(d.color !== undefined ? { color: d.color ?? null } : {}),
      ...(d.institution !== undefined ? { institution: d.institution ?? null } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.targetDate !== undefined ? { target_date: d.targetDate ?? null } : {}),
    })
    .eq('id', programId);
  assertNoDbError(error);
}

export async function deleteProgram(ctx: DomainContext, programId: string): Promise<void> {
  const { error } = await ctx.supabase.from('study_programs').delete().eq('id', programId);
  assertNoDbError(error);
}

// ── Materias + Temas ─────────────────────────────────────────────────────────

export async function listSubjectsWithTopics(
  ctx: DomainContext,
  programId: string,
): Promise<SubjectWithTopics[]> {
  const { data: subjects, error: sErr } = await ctx.supabase
    .from('subjects')
    .select()
    .eq('program_id', programId)
    .order('position', { ascending: true });
  assertNoDbError(sErr);
  const ids = (subjects ?? []).map((s) => s.id);
  let topics: Topic[] = [];
  if (ids.length) {
    const { data, error } = await ctx.supabase
      .from('study_topics')
      .select()
      .in('subject_id', ids)
      .order('position', { ascending: true });
    assertNoDbError(error);
    topics = data ?? [];
  }
  const bySubject = new Map<string, Topic[]>();
  for (const t of topics) {
    const arr = bySubject.get(t.subject_id) ?? [];
    arr.push(t);
    bySubject.set(t.subject_id, arr);
  }
  return (subjects ?? []).map((s) => ({ ...s, topics: bySubject.get(s.id) ?? [] }));
}

export async function createSubject(ctx: DomainContext, input: CreateSubjectInput): Promise<Subject> {
  const d = createSubjectInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('subjects')
    .insert({ user_id: ctx.userId, program_id: d.programId ?? null, name: d.name, color: d.color ?? null })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function deleteSubject(ctx: DomainContext, subjectId: string): Promise<void> {
  const { error } = await ctx.supabase.from('subjects').delete().eq('id', subjectId);
  assertNoDbError(error);
}

export async function createTopic(ctx: DomainContext, input: CreateTopicInput): Promise<Topic> {
  const d = createTopicInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('study_topics')
    .insert({ user_id: ctx.userId, subject_id: d.subjectId, title: d.title, status: d.status })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function setTopicStatus(ctx: DomainContext, topicId: string, status: TopicStatus): Promise<void> {
  const { error } = await ctx.supabase.from('study_topics').update({ status }).eq('id', topicId);
  assertNoDbError(error);
}

export async function deleteTopic(ctx: DomainContext, topicId: string): Promise<void> {
  const { error } = await ctx.supabase.from('study_topics').delete().eq('id', topicId);
  assertNoDbError(error);
}

// ── Horas / overview ─────────────────────────────────────────────────────────

export async function logStudySession(ctx: DomainContext, input: LogStudySessionInput): Promise<void> {
  const d = logStudySessionInput.parse(input);
  const { error } = await ctx.supabase.from('study_sessions').insert({
    user_id: ctx.userId,
    subject_id: d.subjectId ?? null,
    topic_id: d.topicId ?? null,
    minutes: d.minutes,
    note: d.note ?? null,
    ...(d.occurredOn ? { occurred_on: d.occurredOn } : {}),
  });
  assertNoDbError(error);
}

export async function getStudyOverview(ctx: DomainContext): Promise<{
  weekMinutes: number;
  learnedTopics: number;
  activePrograms: number;
  weekly: { label: string; value: number }[];
}> {
  const today = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR').startOf('day');
  const since = today.minus({ days: 6 }).toISODate() ?? undefined;
  const [{ data: sessions }, { count: learnedTopics }, { count: activePrograms }] = await Promise.all([
    ctx.supabase.from('study_sessions').select('minutes,occurred_on').gte('occurred_on', since ?? ''),
    ctx.supabase.from('study_topics').select('id', { count: 'exact', head: true }).eq('status', 'learned'),
    ctx.supabase.from('study_programs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  const perDay = new Map<string, number>();
  let weekMinutes = 0;
  for (const s of sessions ?? []) {
    perDay.set(s.occurred_on, (perDay.get(s.occurred_on) ?? 0) + s.minutes);
    weekMinutes += s.minutes;
  }
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = today.minus({ days: 6 - i });
    const key = d.toISODate() ?? '';
    return { label: d.toFormat('ccc'), value: Math.round((perDay.get(key) ?? 0) / 60 * 10) / 10 };
  });
  return { weekMinutes, learnedTopics: learnedTopics ?? 0, activePrograms: activePrograms ?? 0, weekly };
}

// ── Recursos ─────────────────────────────────────────────────────────────────

export async function listResources(
  ctx: DomainContext,
  filter: { programId?: string; subjectId?: string },
): Promise<StudyResource[]> {
  let query = ctx.supabase.from('study_resources').select();
  if (filter.programId) query = query.eq('program_id', filter.programId);
  if (filter.subjectId) query = query.eq('subject_id', filter.subjectId);
  const { data, error } = await query.order('created_at', { ascending: false });
  assertNoDbError(error);
  return data ?? [];
}

export async function addResource(ctx: DomainContext, input: AddResourceInput): Promise<StudyResource> {
  const d = addResourceInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('study_resources')
    .insert({
      user_id: ctx.userId,
      subject_id: d.subjectId ?? null,
      program_id: d.programId ?? null,
      title: d.title,
      url: d.url ?? null,
      kind: d.kind,
    })
    .select()
    .single();
  assertNoDbError(error);
  return data!;
}

export async function deleteResource(ctx: DomainContext, resourceId: string): Promise<void> {
  const { error } = await ctx.supabase.from('study_resources').delete().eq('id', resourceId);
  assertNoDbError(error);
}
