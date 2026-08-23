import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { listHabits, getHabitLogs, type HabitLog } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { HabitsView } from '@/components/habits/habits-view';
import { CreateHabitDialog } from '@/components/habits/create-habit-dialog';

export default async function HabitsPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const habits = await listHabits(ctx);
  const since = DateTime.now().setZone(ctx.timezone).minus({ days: 140 }).toISODate() ?? undefined;
  const logsByHabit: Record<string, HabitLog[]> = {};
  await Promise.all(
    habits.map(async (h) => {
      logsByHabit[h.id] = await getHabitLogs(ctx, h.id, since);
    }),
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Hábitos" subtitle="Marcá el día. La racha hace el resto.">
        {habits.length > 0 && <CreateHabitDialog />}
      </PageHeader>
      <HabitsView habits={habits} logsByHabit={logsByHabit} timezone={ctx.timezone} />
    </div>
  );
}
