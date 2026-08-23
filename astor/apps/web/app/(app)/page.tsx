import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowUpRight, Flame } from 'lucide-react';
import { listTasks, listHabits } from '@astor/core';
import { getDomainContext } from '@/lib/domain';

function greeting(hour: number): string {
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default async function DashboardPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.startOf('day');
  const todayKey = today.toISODate() ?? '';

  const [tasks, habits] = await Promise.all([listTasks(ctx, { status: ['todo', 'doing'] }), listHabits(ctx)]);
  const { data: todayLogs } = await ctx.supabase.from('habit_logs').select().eq('date', todayKey);
  const logStatus = new Map((todayLogs ?? []).map((l) => [l.habit_id, l.status]));

  const focus = tasks
    .filter((t) => t.status === 'doing' || (t.due_at && DateTime.fromISO(t.due_at) <= today.endOf('day')))
    .slice(0, 7);

  const pending = habits.filter((h) => logStatus.get(h.id) !== 'done').length;
  const nombre = ctx.userId ? ((await ctx.supabase.from('profiles').select('display_name').eq('user_id', ctx.userId).single()).data?.display_name?.split(' ')[0] ?? '') : '';

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-8">
        <h1 className="text-800 font-bold tracking-[-0.02em] text-fg-default">
          {greeting(now.hour)}
          {nombre ? `, ${nombre}` : ''}.
        </h1>
        <p className="mt-1 text-300 capitalize text-fg-subtle">
          {today.toLocaleString(DateTime.DATE_HUGE)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Foco de hoy */}
        <section className="rounded-lg border border-line-subtle bg-surface-raised">
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <h2 className="text-400 font-semibold text-fg-default">Foco de hoy</h2>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default"
            >
              Tareas <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-line-subtle">
            {focus.length === 0 && (
              <p className="px-5 py-8 text-center text-200 text-fg-subtlest">
                Nada urgente para hoy. Buen momento para avanzar lo importante.
              </p>
            )}
            {focus.map((t) => {
              const due = t.due_at ? DateTime.fromISO(t.due_at, { zone: ctx.timezone }).startOf('day') : null;
              const overdue = due ? due < today : false;
              return (
                <Link
                  key={t.id}
                  href="/tasks"
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-overlay"
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      t.status === 'doing' ? 'bg-signature' : 'bg-fg-subtlest'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-300 text-fg-default">{t.title}</span>
                  {due && (
                    <span className={`text-100 ${overdue ? 'text-danger-text' : 'text-fg-subtlest'}`}>
                      {overdue ? 'vencida' : due.equals(today) ? 'hoy' : due.setLocale('es-AR').toFormat('d LLL')}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Hábitos de hoy */}
        <section className="rounded-lg border border-line-subtle bg-surface-raised">
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <h2 className="text-400 font-semibold text-fg-default">
              Hábitos
              {pending > 0 && (
                <span className="ml-2 rounded-full bg-signature-soft px-2 py-0.5 text-100 font-medium text-signature-text">
                  {pending} pendientes
                </span>
              )}
            </h2>
            <Link
              href="/habits"
              className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default"
            >
              Ir <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-1 p-3">
            {habits.length === 0 && (
              <p className="px-2 py-6 text-center text-200 text-fg-subtlest">Sin hábitos aún.</p>
            )}
            {habits.map((h) => {
              const status = logStatus.get(h.id);
              return (
                <Link
                  key={h.id}
                  href="/habits"
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-overlay"
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full ${
                      status === 'done'
                        ? 'bg-signature-soft text-signature-text'
                        : 'border border-line-default text-transparent'
                    }`}
                  >
                    <Flame className="size-3.5" />
                  </span>
                  <span className="flex-1 text-300 text-fg-default">{h.name}</span>
                  {status && (
                    <span className="text-100 text-fg-subtlest">
                      {status === 'done' ? 'hecho' : 'salteado'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
