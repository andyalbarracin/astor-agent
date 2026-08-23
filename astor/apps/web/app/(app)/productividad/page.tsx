import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { listRoutines, getRoutineCompletions, listTasks } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { RoutineCard } from '@/components/productivity/routine-card';
import { DayTodos } from '@/components/productivity/day-todos';

const KIND_ORDER: Record<string, number> = { morning: 0, custom: 1, night: 2 };

export default async function ProductividadPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.toISODate() ?? '';

  const [routines, completedIds, tasks] = await Promise.all([
    listRoutines(ctx),
    getRoutineCompletions(ctx, today),
    listTasks(ctx, { status: ['todo', 'doing', 'done'] }),
  ]);

  const active = tasks.filter((t) => t.status === 'todo' || t.status === 'doing');
  const doneToday = tasks.filter(
    (t) =>
      t.status === 'done' &&
      t.completed_at &&
      DateTime.fromISO(t.completed_at, { zone: ctx.timezone }).toISODate() === today,
  );
  const sortedRoutines = [...routines].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Productividad" subtitle={now.toLocaleString(DateTime.DATE_HUGE)} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <DayTodos active={active} doneToday={doneToday} timezone={ctx.timezone} />
        <div className="flex flex-col gap-5">
          {sortedRoutines.map((r) => (
            <RoutineCard key={r.id} routine={r} completedIds={completedIds} date={today} />
          ))}
          {sortedRoutines.length === 0 && (
            <div className="rounded-lg border border-dashed border-line-default p-8 text-center text-200 text-fg-subtlest">
              Todavía no tenés rutinas. Corré el seed o creá una.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
