'use client';

import { DateTime } from 'luxon';
import { CalendarClock, ListChecks, Repeat } from 'lucide-react';
import type { Task, Category } from '@astor/core';
import { cn } from '@/lib/utils';

const PRIORITY: Record<number, { label: string; dot: string }> = {
  1: { label: 'P1', dot: 'bg-danger-default' },
  2: { label: 'P2', dot: 'bg-warning-default' },
  3: { label: 'P3', dot: 'bg-brand-default' },
  4: { label: 'P4', dot: 'bg-fg-subtlest' },
};

function dueMeta(dueIso: string | null, tz: string) {
  if (!dueIso) return null;
  const due = DateTime.fromISO(dueIso, { zone: tz }).startOf('day');
  const today = DateTime.now().setZone(tz).startOf('day');
  const days = Math.round(due.diff(today, 'days').days);
  const label =
    days < 0 ? 'vencida' : days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days}d`;
  const tone =
    days < 0 ? 'text-danger-text' : days <= 1 ? 'text-signature-text' : 'text-fg-subtle';
  return { label, tone };
}

export function TaskCard({
  task,
  category,
  timezone,
  onClick,
  dragging,
}: {
  task: Task;
  category?: Category;
  timezone: string;
  onClick?: () => void;
  dragging?: boolean;
}) {
  const prio = PRIORITY[task.priority] ?? PRIORITY[3]!;
  const due = dueMeta(task.due_at, timezone);
  const done = task.status === 'done';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-lg border border-line-subtle bg-surface-raised p-3 text-left transition-all',
        'hover:border-line-default hover:bg-surface-overlay',
        dragging && 'rotate-[1.5deg] border-line-default shadow-overlay',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', prio.dot)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-300 leading-snug text-fg-default',
              done && 'text-fg-subtlest line-through',
            )}
          >
            {task.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-100 text-fg-subtle">
            <span className="font-medium text-fg-subtlest">{prio.label}</span>
            {category && (
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-2 rounded-full"
                  style={{ background: category.color ?? 'var(--color-text-subtlest)' }}
                />
                {category.name}
              </span>
            )}
            {due && (
              <span className={cn('inline-flex items-center gap-1', due.tone)}>
                <CalendarClock className="size-3" />
                {due.label}
              </span>
            )}
            {task.recurrence_rule && <Repeat className="size-3 text-fg-subtlest" />}
          </div>
        </div>
      </div>
    </button>
  );
}

export { PRIORITY };
export { ListChecks };
