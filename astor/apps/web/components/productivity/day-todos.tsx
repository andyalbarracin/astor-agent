'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@astor/core';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { completeTaskAction, setTaskStatusAction, createTaskAction } from '@/app/actions/tasks';

export function DayTodos({
  active,
  doneToday,
  timezone,
}: {
  active: Task[];
  doneToday: Task[];
  timezone: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState('');

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else toast.error(r.error ?? 'Error');
    });
  }
  function add() {
    if (!adding.trim()) return;
    const scheduledAt = DateTime.now().setZone(timezone).set({ hour: 9 }).toISO() ?? undefined;
    run(async () => {
      const r = await createTaskAction({ title: adding.trim(), scheduledAt });
      if (r.ok) setAdding('');
      return r;
    });
  }

  return (
    <div className="flex flex-col rounded-lg border border-line-subtle bg-surface-raised p-5">
      <h3 className="mb-3 text-400 font-semibold text-fg-default">To-do de hoy</h3>

      <div className="flex flex-col">
        {active.length === 0 && (
          <p className="px-1 py-2 text-200 text-fg-subtlest">Nada pendiente. 🎉</p>
        )}
        {active.map((t) => (
          <label
            key={t.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 transition-colors hover:bg-surface-overlay"
          >
            <Checkbox checked={false} onCheckedChange={() => run(() => completeTaskAction(t.id))} />
            <span className="text-300 text-fg-default">{t.title}</span>
          </label>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <Plus className="size-4 text-fg-subtlest" />
        <Input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Agregar tarea…"
          disabled={pending}
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {doneToday.length > 0 && (
        <div className="mt-4 border-t border-line-subtle pt-3">
          <p className="mb-1 text-100 font-medium uppercase tracking-wide text-fg-subtlest">
            Hecho hoy
          </p>
          {doneToday.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 transition-colors hover:bg-surface-overlay"
            >
              <Checkbox
                checked
                onCheckedChange={() => run(() => setTaskStatusAction(t.id, 'todo'))}
              />
              <span className={cn('text-300 text-fg-subtlest line-through')}>{t.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
