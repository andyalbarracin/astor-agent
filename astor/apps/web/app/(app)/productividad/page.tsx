import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import {
  listRoutines,
  getRoutineCompletions,
  listTodoSections,
  ensureDefaultTodoSections,
  getFocusToday,
  type Subject,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { RoutinesList } from '@/components/productivity/routines-list';
import { SectionedTodos } from '@/components/productivity/sectioned-todos';
import { PomodoroTimer } from '@/components/focus/pomodoro-timer';

const KIND_ORDER: Record<string, number> = { morning: 0, custom: 1, night: 2 };

export default async function ProductividadPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.toISODate() ?? '';

  await ensureDefaultTodoSections(ctx);

  const [routines, completedIds, sections, focusToday, subjectsRes] = await Promise.all([
    listRoutines(ctx),
    getRoutineCompletions(ctx, today),
    listTodoSections(ctx),
    getFocusToday(ctx),
    ctx.supabase.from('subjects').select().order('name', { ascending: true }),
  ]);
  const subjects = (subjectsRes.data ?? []) as Subject[];

  const sortedRoutines = [...routines].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Productividad" subtitle={now.toLocaleString(DateTime.DATE_HUGE)} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <SectionedTodos sections={sections} />
        <div className="flex flex-col gap-5">
          <RoutinesList routines={sortedRoutines} completedIds={completedIds} date={today} />
          <section className="rounded-lg border border-line-subtle bg-surface-raised p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-300 font-semibold text-fg-default">Enfoque</h2>
              <span className="text-100 text-fg-subtlest">{focusToday.totalMinutes} min hoy</span>
            </div>
            <PomodoroTimer subjects={subjects} />
          </section>
        </div>
      </div>
    </div>
  );
}
