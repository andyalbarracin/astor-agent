import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowUpRight, SquareCheckBig, Repeat, Timer } from 'lucide-react';
import {
  listRoutines,
  getRoutineCompletions,
  listTodoSections,
  ensureDefaultTodoSections,
  getFocusToday,
  listTasks,
  listHabits,
  type Subject,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { RoutinesList } from '@/components/productivity/routines-list';
import { SectionedTodos } from '@/components/productivity/sectioned-todos';
import { PomodoroTimer } from '@/components/focus/pomodoro-timer';

const KIND_ORDER: Record<string, number> = { morning: 0, custom: 1, night: 2 };
const ACCENT = '#3FA9B8';

export default async function ProductividadPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.toISODate() ?? '';

  await ensureDefaultTodoSections(ctx);

  const [routines, completedIds, sections, focusToday, subjectsRes, tasks, habits, logsRes] = await Promise.all([
    listRoutines(ctx),
    getRoutineCompletions(ctx, today),
    listTodoSections(ctx),
    getFocusToday(ctx),
    ctx.supabase.from('subjects').select().order('name', { ascending: true }),
    listTasks(ctx, { status: ['todo', 'doing'] }),
    listHabits(ctx),
    ctx.supabase.from('habit_logs').select('habit_id,status').eq('date', today),
  ]);
  const subjects = (subjectsRes.data ?? []) as Subject[];
  const habitsDone = new Set((logsRes.data ?? []).filter((l) => l.status === 'done').map((l) => l.habit_id)).size;

  // Tareas pendientes del día (de las secciones) para enfocar en el Pomodoro.
  const focusTodos = sections.flatMap((s) =>
    s.items.filter((i) => !i.done).map((i) => ({ id: i.id, label: i.label, section: s.name })),
  );

  const sortedRoutines = [...routines].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1),
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Productividad" subtitle={now.toLocaleString(DateTime.DATE_HUGE)} />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <GlanceCard href="/tasks" icon={<SquareCheckBig className="size-4" />} label="Tareas" value={`${tasks.length}`} unit="pendientes" />
        <GlanceCard href="/habits" icon={<Repeat className="size-4" />} label="Hábitos" value={`${habitsDone}/${habits.length}`} unit="hoy" />
        <GlanceCard href="/productividad" icon={<Timer className="size-4" />} label="Enfoque" value={`${focusToday.totalMinutes}`} unit="min hoy" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <SectionedTodos sections={sections} />
        <div className="flex flex-col gap-5">
          <RoutinesList routines={sortedRoutines} completedIds={completedIds} date={today} />
          <section className="rounded-lg border border-line-subtle bg-surface-raised p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-300 font-semibold text-fg-default">Enfoque</h2>
              <span className="text-100 text-fg-subtlest">{focusToday.totalMinutes} min hoy</span>
            </div>
            <PomodoroTimer subjects={subjects} todos={focusTodos} />
          </section>
        </div>
      </div>
    </div>
  );
}

function GlanceCard({ href, icon, label, value, unit }: { href: string; icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <Link
      href={href}
      className="astor-rise group flex items-center gap-3 rounded-lg border border-line-subtle bg-surface-raised p-4 transition-all hover:-translate-y-0.5 hover:border-[#3FA9B855]"
    >
      <span className="flex size-9 items-center justify-center rounded-md" style={{ background: `${ACCENT}22`, color: ACCENT }}>{icon}</span>
      <div className="flex-1">
        <p className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</p>
        <p className="text-400 font-bold tracking-tight text-fg-default">{value} <span className="text-100 font-normal text-fg-subtle">{unit}</span></p>
      </div>
      <ArrowUpRight className="size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
