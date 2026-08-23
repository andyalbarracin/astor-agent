import { redirect } from 'next/navigation';
import { listTasks, listCategories } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { TasksBoard } from '@/components/tasks/tasks-board';

export default async function TasksPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const [tasks, categories] = await Promise.all([
    listTasks(ctx, { status: ['todo', 'doing', 'done'] }),
    listCategories(ctx),
  ]);
  const { data: checklist } = await ctx.supabase.from('task_checklist_items').select();

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Tareas" subtitle="Arrastrá entre columnas o priorizá con Eisenhower." />
      <TasksBoard
        initialTasks={tasks}
        categories={categories}
        checklistItems={checklist ?? []}
        timezone={ctx.timezone}
      />
    </div>
  );
}
