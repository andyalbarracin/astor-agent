import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import {
  listTasks,
  listHabits,
  getFocusToday,
  getSpendingReport,
  getNetWorthSummary,
  listUpcomingInvoices,
  getStudyOverview,
  listProgramsWithProgress,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { DashboardOverview, type OverviewData } from '@/components/dashboard/overview';

function greeting(hour: number): string {
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

const mlabel = (m: string) => DateTime.fromISO(`${m}-01`).setLocale('es').toFormat('LLL');

export default async function DashboardPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone).setLocale(ctx.locale ?? 'es-AR');
  const today = now.startOf('day');
  const todayKey = today.toISODate() ?? '';

  const [tasks, habits, focusToday, spending, netWorth, invoices, study, programs, profileRes, logsRes] =
    await Promise.all([
      listTasks(ctx, { status: ['todo', 'doing'] }),
      listHabits(ctx),
      getFocusToday(ctx),
      getSpendingReport(ctx, 6),
      getNetWorthSummary(ctx),
      listUpcomingInvoices(ctx),
      getStudyOverview(ctx),
      listProgramsWithProgress(ctx),
      ctx.supabase.from('profiles').select('display_name').eq('user_id', ctx.userId).single(),
      ctx.supabase.from('habit_logs').select().eq('date', todayKey),
    ]);

  const logStatus = new Map((logsRes.data ?? []).map((l) => [l.habit_id, l.status]));
  const habitsDone = habits.filter((h) => logStatus.get(h.id) === 'done').length;

  const focus = tasks
    .filter((t) => t.status === 'doing' || (t.due_at && DateTime.fromISO(t.due_at) <= today.endOf('day')))
    .slice(0, 6)
    .map((t) => {
      const due = t.due_at ? DateTime.fromISO(t.due_at, { zone: ctx.timezone }).startOf('day') : null;
      const overdue = due ? due < today : false;
      return {
        title: t.title,
        doing: t.status === 'doing',
        overdue,
        dueLabel: due ? (overdue ? 'vencida' : due.equals(today) ? 'hoy' : due.setLocale('es-AR').toFormat('d LLL')) : null,
      };
    });

  const upcoming = invoices
    .filter((v) => DateTime.fromISO(v.due_date) >= today.minus({ days: 1 }))
    .slice(0, 5)
    .map((v) => ({
      cardName: v.cardName,
      total: Number(v.total),
      dueLabel: DateTime.fromISO(v.due_date).setLocale('es').toFormat('dd LLL'),
      periodLabel: DateTime.fromISO(v.period).setLocale('es').toFormat('LLLL'),
    }));

  // Próximo examen: programa con target_date más cercano en el futuro.
  const nextExam = programs
    .filter((pr) => pr.target_date)
    .map((pr) => ({ name: pr.name, date: DateTime.fromISO(pr.target_date!), progress: pr.progress }))
    .filter((pr) => pr.date >= today.minus({ days: 1 }))
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())[0];

  const data: OverviewData = {
    greetingWord: greeting(now.hour),
    name: profileRes.data?.display_name?.split(' ')[0] ?? '',
    dateLabel: today.toLocaleString(DateTime.DATE_HUGE),
    productivity: {
      tasksPending: tasks.length,
      habitsDone,
      habitsTotal: habits.length,
      focusMin: focusToday.totalMinutes,
      focus,
    },
    finance: {
      expense: spending.byMonth.at(-1)?.expense ?? 0,
      income: spending.byMonth.at(-1)?.income ?? 0,
      net: (spending.byMonth.at(-1)?.income ?? 0) - (spending.byMonth.at(-1)?.expense ?? 0),
      netWorth: netWorth.net,
      trend: spending.byMonth.map((m) => ({ label: mlabel(m.month), expense: m.expense, income: m.income })),
      byCategory: spending.byCategory,
      upcoming,
    },
    knowledge: {
      weekHours: Math.round((study.weekMinutes / 60) * 10) / 10,
      learnedTopics: study.learnedTopics,
      activePrograms: study.activePrograms,
      weekly: study.weekly,
      nextExam: nextExam
        ? { name: nextExam.name, daysLeft: Math.ceil(nextExam.date.diff(today, 'days').days), progress: nextExam.progress }
        : null,
    },
  };

  return <DashboardOverview data={data} />;
}
