import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import {
  listRoutines,
  getRoutineCompletions,
  listTodoSections,
  ensureDefaultTodoSections,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { RoutinesList } from '@/components/productivity/routines-list';
import { SectionedTodos } from '@/components/productivity/sectioned-todos';

const KIND_ORDER: Record<string, number> = { morning: 0, custom: 1, night: 2 };

export default async function ProductividadPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.toISODate() ?? '';

  await ensureDefaultTodoSections(ctx);

  const [routines, completedIds, sections] = await Promise.all([
    listRoutines(ctx),
    getRoutineCompletions(ctx, today),
    listTodoSections(ctx),
  ]);

  const sortedRoutines = [...routines].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Productividad" subtitle={now.toLocaleString(DateTime.DATE_HUGE)} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <SectionedTodos sections={sections} />
        <RoutinesList routines={sortedRoutines} completedIds={completedIds} date={today} />
      </div>
    </div>
  );
}
