'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';
import { Sparkles } from 'lucide-react';
import type { Habit, HabitLog } from '@astor/core';
import { HabitCard } from './habit-card';
import { CreateHabitDialog } from './create-habit-dialog';

const ConsistencyChart = dynamic(
  () => import('./consistency-chart').then((m) => m.ConsistencyChart),
  { ssr: false, loading: () => <div className="h-[140px]" /> },
);

export function HabitsView({
  habits,
  logsByHabit,
  timezone,
}: {
  habits: Habit[];
  logsByHabit: Record<string, HabitLog[]>;
  timezone: string;
}) {
  const chartData = useMemo(() => {
    const today = DateTime.now().setZone(timezone).startOf('day');
    const done = new Map<string, number>();
    for (const list of Object.values(logsByHabit)) {
      for (const l of list) {
        if (l.status === 'done') done.set(l.date, (done.get(l.date) ?? 0) + 1);
      }
    }
    return Array.from({ length: 14 }, (_, i) => {
      const d = today.minus({ days: 13 - i });
      const key = d.toISODate() ?? '';
      return { label: d.setLocale('es-AR').toFormat('ccc d'), value: done.get(key) ?? 0 };
    });
  }, [logsByHabit, timezone]);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-line-default py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-signature-soft text-signature-text">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-400 font-semibold text-fg-default">Todavía no hay hábitos</p>
          <p className="mt-1 text-200 text-fg-subtle">Empezá con uno. La constancia se construye de a uno.</p>
        </div>
        <CreateHabitDialog />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-line-subtle bg-surface-raised p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-200 font-medium text-fg-subtle">Consistencia · últimos 14 días</p>
        </div>
        <ConsistencyChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} logs={logsByHabit[h.id] ?? []} timezone={timezone} />
        ))}
      </div>
    </div>
  );
}
