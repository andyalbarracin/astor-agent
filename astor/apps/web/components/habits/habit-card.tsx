'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Flame, Check, SkipForward, MoreHorizontal, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { computeStreak, type Habit, type HabitLog } from '@astor/core';
import { cn } from '@/lib/utils';
import { Heatmap } from './heatmap';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logHabitAction, archiveHabitAction } from '@/app/actions/habits';

export function HabitCard({
  habit,
  logs,
  timezone,
}: {
  habit: Habit;
  logs: HabitLog[];
  timezone: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const today = DateTime.now().setZone(timezone).startOf('day');
  const todayKey = today.toISODate() ?? '';
  const lite = logs.map((l) => ({ date: l.date, status: l.status }));
  const streak = computeStreak(lite, today);
  const todayStatus = logs.find((l) => l.date === todayKey)?.status ?? null;

  function log(status: 'done' | 'skipped') {
    start(async () => {
      const res = await logHabitAction(habit.id, todayKey, status);
      if (res.ok) router.refresh();
      else toast.error(res.error);
    });
  }

  function archive() {
    start(async () => {
      const res = await archiveHabitAction(habit.id, true);
      if (res.ok) {
        toast.success('Hábito archivado');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-400 font-semibold text-fg-default">{habit.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-100 text-fg-subtle">
            <span className="inline-flex items-center gap-1">
              <Flame
                className={cn('size-3.5', streak.current > 0 ? 'text-signature' : 'text-fg-subtlest')}
              />
              <span className="tabular-nums text-fg-default">{streak.current}</span> de racha
            </span>
            <span className="text-fg-subtlest">·</span>
            <span className="tabular-nums">récord {streak.longest}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1 text-fg-subtlest transition-colors hover:bg-surface-overlay hover:text-fg-default"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={archive}>
              <Archive className="size-4" />
              Archivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Heatmap logs={lite} timezone={timezone} />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => log('done')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1.5 text-200 font-medium transition-colors disabled:opacity-60',
            todayStatus === 'done'
              ? 'border-signature bg-signature-soft text-signature-text'
              : 'border-line-default text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
          )}
        >
          <Check className="size-4" />
          {todayStatus === 'done' ? 'Hecho hoy' : 'Marcar hecho'}
        </button>
        {habit.allow_skip && (
          <button
            type="button"
            disabled={pending}
            onClick={() => log('skipped')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-200 font-medium transition-colors disabled:opacity-60',
              todayStatus === 'skipped'
                ? 'border-line-default bg-surface-overlay text-fg-default'
                : 'border-line-default text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
            )}
          >
            <SkipForward className="size-4" />
            Saltar
          </button>
        )}
      </div>
    </div>
  );
}
