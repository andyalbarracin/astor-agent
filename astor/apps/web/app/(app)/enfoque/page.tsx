import { redirect } from 'next/navigation';
import { getFocusToday, type Subject } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { PomodoroTimer } from '@/components/focus/pomodoro-timer';

export default async function EnfoquePage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const [{ totalMinutes }, subjectsRes] = await Promise.all([
    getFocusToday(ctx),
    ctx.supabase.from('subjects').select().order('name', { ascending: true }),
  ]);
  const subjects = (subjectsRes.data ?? []) as Subject[];

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Enfoque" subtitle={`Pomodoro · ${totalMinutes} min de foco hoy`} />
      <PomodoroTimer subjects={subjects} />
    </div>
  );
}
