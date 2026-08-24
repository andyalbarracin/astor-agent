'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Circle, CircleDashed, CheckCircle2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { SubjectWithTopics, TopicStatus } from '@astor/core';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  createSubjectAction,
  createTopicAction,
  setTopicStatusAction,
  deleteTopicAction,
} from '@/app/actions/studies';

const NEXT: Record<TopicStatus, TopicStatus> = { todo: 'learning', learning: 'learned', learned: 'todo' };
const STATUS_UI: Record<TopicStatus, { icon: typeof Circle; color: string; label: string }> = {
  todo: { icon: Circle, color: 'var(--color-text-subtlest)', label: 'Por estudiar' },
  learning: { icon: CircleDashed, color: 'var(--color-signature-default)', label: 'Estudiando' },
  learned: { icon: CheckCircle2, color: 'var(--color-success-default)', label: 'Aprendido' },
};

export function SubjectsBoard({ subjects, programId }: { subjects: SubjectWithTopics[]; programId: string }) {
  const router = useRouter();
  const [local, setLocal] = useState(subjects);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState<Record<string, string>>({});

  const sig = useMemo(
    () => JSON.stringify(subjects.map((s) => [s.id, s.name, s.topics.map((t) => [t.id, t.status, t.title])])),
    [subjects],
  );
  useEffect(() => setLocal(subjects), [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  function fire(p: Promise<{ ok: boolean; error?: string }>) {
    p.then((r) => !r.ok && toast.error(r.error ?? 'Error')).catch(() => toast.error('Error de red'));
  }
  function cycle(subjectId: string, topicId: string, status: TopicStatus) {
    const next = NEXT[status];
    setLocal((cur) => cur.map((s) => (s.id === subjectId ? { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, status: next } : t)) } : s)));
    fire(setTopicStatusAction(topicId, next));
  }
  function addTopic(subjectId: string, title: string) {
    const temp = { id: crypto.randomUUID(), user_id: '', subject_id: subjectId, title, status: 'todo' as TopicStatus, position: 999, created_at: '', updated_at: '' };
    setLocal((cur) => cur.map((s) => (s.id === subjectId ? { ...s, topics: [...s.topics, temp] } : s)));
    fire(createTopicAction(subjectId, title));
  }
  function delTopic(subjectId: string, topicId: string) {
    setLocal((cur) => cur.map((s) => (s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s)));
    fire(deleteTopicAction(topicId));
  }
  function addSubject(name: string) {
    fire(createSubjectAction(programId, name).then((r) => { if (r.ok) router.refresh(); return r; }));
  }

  return (
    <div className="flex flex-col gap-4">
      {local.map((subject) => {
        const learned = subject.topics.filter((t) => t.status === 'learned').length;
        return (
          <div key={subject.id} className="rounded-lg border border-line-subtle bg-surface-raised p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-400 font-semibold text-fg-default">{subject.name}</h3>
              <span className="text-100 tabular-nums text-fg-subtlest">{learned}/{subject.topics.length} temas</span>
            </div>
            <div className="flex flex-col">
              {subject.topics.map((t) => {
                const ui = STATUS_UI[t.status];
                const Icon = ui.icon;
                return (
                  <div key={t.id} className="group flex items-center gap-2.5 py-1.5">
                    <button type="button" onClick={() => cycle(subject.id, t.id, t.status)} title={ui.label} className="shrink-0">
                      <Icon size={18} style={{ color: ui.color }} />
                    </button>
                    <span className={cn('flex-1 text-300', t.status === 'learned' ? 'text-fg-subtlest line-through' : 'text-fg-default')}>
                      {t.title}
                    </span>
                    <span className="text-100" style={{ color: ui.color }}>{ui.label}</span>
                    <button type="button" onClick={() => delTopic(subject.id, t.id)} className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100">
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 py-1">
                <Plus className="size-4 text-fg-subtlest" />
                <Input
                  value={newTopic[subject.id] ?? ''}
                  onChange={(e) => setNewTopic((p) => ({ ...p, [subject.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    const v = (newTopic[subject.id] ?? '').trim();
                    if (e.key === 'Enter' && v) { addTopic(subject.id, v); setNewTopic((p) => ({ ...p, [subject.id]: '' })); }
                  }}
                  placeholder="Agregar tema…"
                  className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-line-default px-4 py-2.5">
        <Plus className="size-4 text-signature" />
        <Input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && newSubject.trim()) { addSubject(newSubject.trim()); setNewSubject(''); } }}
          placeholder="Nueva materia…"
          className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
