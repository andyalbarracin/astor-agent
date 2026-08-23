'use client';

import type { Task, Category, TaskEisenhower } from '@astor/core';
import { TaskCard } from './task-card';

const QUADRANTS: {
  key: TaskEisenhower;
  title: string;
  hint: string;
  accent: string;
}[] = [
  { key: 'urgent_important', title: 'Hacer ya', hint: 'Urgente · Importante', accent: 'text-danger-text' },
  { key: 'not_urgent_important', title: 'Planificar', hint: 'Importante · No urgente', accent: 'text-brand-text' },
  { key: 'urgent_not_important', title: 'Delegar', hint: 'Urgente · No importante', accent: 'text-warning-text' },
  { key: 'not_urgent_not_important', title: 'Descartar', hint: 'Ni urgente ni importante', accent: 'text-fg-subtlest' },
];

export function EisenhowerMatrix({
  tasks,
  categoryOf,
  timezone,
  onOpen,
}: {
  tasks: Task[];
  categoryOf: (t: Task) => Category | undefined;
  timezone: string;
  onOpen: (t: Task) => void;
}) {
  const active = tasks.filter((t) => t.status !== 'done' && t.status !== 'archived');
  const unclassified = active.filter((t) => !t.eisenhower);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {QUADRANTS.map((q) => {
          const list = active.filter((t) => t.eisenhower === q.key);
          return (
            <div
              key={q.key}
              className="flex min-h-[160px] flex-col rounded-xl border border-line-subtle bg-surface-raised p-4"
            >
              <div className="mb-3">
                <p className={`text-300 font-semibold ${q.accent}`}>{q.title}</p>
                <p className="text-100 text-fg-subtlest">{q.hint}</p>
              </div>
              <div className="flex flex-col gap-2">
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    category={categoryOf(t)}
                    timezone={timezone}
                    onClick={() => onOpen(t)}
                  />
                ))}
                {list.length === 0 && (
                  <p className="text-100 text-fg-subtlest">Sin tareas.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unclassified.length > 0 && (
        <div>
          <p className="mb-2 text-100 font-medium uppercase tracking-wide text-fg-subtlest">
            Sin clasificar
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unclassified.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                category={categoryOf(t)}
                timezone={timezone}
                onClick={() => onOpen(t)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
