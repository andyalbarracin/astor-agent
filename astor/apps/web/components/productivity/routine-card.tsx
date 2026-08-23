'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sunrise, Moon, ListChecks, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { RoutineWithItems, RoutineKind } from '@astor/core';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toggleRoutineItemAction, addRoutineItemAction } from '@/app/actions/routines';

const ICON: Record<RoutineKind, typeof Sunrise> = {
  morning: Sunrise,
  night: Moon,
  custom: ListChecks,
};

export function RoutineCard({
  routine,
  completedIds,
  date,
}: {
  routine: RoutineWithItems;
  completedIds: string[];
  date: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState('');
  const done = new Set(completedIds);
  const doneCount = routine.items.filter((i) => done.has(i.id)).length;
  const Icon = ICON[routine.kind];
  const pct = routine.items.length ? Math.round((doneCount / routine.items.length) * 100) : 0;

  function toggle(itemId: string, isDone: boolean) {
    start(async () => {
      const r = await toggleRoutineItemAction(itemId, date, isDone);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }
  function add() {
    if (!adding.trim()) return;
    start(async () => {
      const r = await addRoutineItemAction(routine.id, adding.trim());
      if (r.ok) {
        setAdding('');
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col rounded-lg border border-line-subtle bg-surface-raised p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-signature-soft text-signature-text">
          <Icon size={18} />
        </span>
        <div className="flex-1">
          <h3 className="text-400 font-semibold text-fg-default">{routine.name}</h3>
          <p className="text-100 text-fg-subtlest">
            {doneCount}/{routine.items.length} · {pct}%
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        {routine.items.map((item) => {
          const isDone = done.has(item.id);
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 transition-colors hover:bg-surface-overlay"
            >
              <Checkbox checked={isDone} onCheckedChange={(v) => toggle(item.id, Boolean(v))} />
              <span
                className={cn(
                  'text-300',
                  isDone ? 'text-fg-subtlest line-through' : 'text-fg-default',
                )}
              >
                {item.label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Plus className="size-4 text-fg-subtlest" />
        <Input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Agregar paso…"
          disabled={pending}
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
