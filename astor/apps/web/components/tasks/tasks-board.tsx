'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Grid2x2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, Category, ChecklistItem, TaskStatus } from '@astor/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskDetailDialog } from './task-detail-dialog';
import { KanbanBoard } from './kanban-board';
import { EisenhowerMatrix } from './eisenhower-matrix';
import { completeTaskAction, setTaskStatusAction } from '@/app/actions/tasks';

export function TasksBoard({
  initialTasks,
  categories,
  checklistItems,
  timezone,
}: {
  initialTasks: Task[];
  categories: Category[];
  checklistItems: ChecklistItem[];
  timezone: string;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const checklistMap = useMemo(() => {
    const m = new Map<string, ChecklistItem[]>();
    for (const it of checklistItems) {
      const arr = m.get(it.task_id) ?? [];
      arr.push(it);
      m.set(it.task_id, arr);
    }
    return m;
  }, [checklistItems]);

  const categoryOf = (t: Task) => (t.category_id ? categoryMap.get(t.category_id) : undefined);
  const openTask = detailId ? (tasks.find((t) => t.id === detailId) ?? null) : null;

  function onMove(taskId: string, status: TaskStatus) {
    const prev = tasks;
    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, status } : t)));
    const action = status === 'done' ? completeTaskAction(taskId) : setTaskStatusAction(taskId, status);
    action
      .then((res) => {
        if (!res.ok) {
          setTasks(prev);
          toast.error(res.error);
        } else {
          router.refresh();
        }
      })
      .catch(() => {
        setTasks(prev);
        toast.error('No se pudo mover la tarea.');
      });
  }

  function onOpen(t: Task) {
    setDetailId(t.id);
    setDetailOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="kanban" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="size-3.5" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="eisenhower">
              <Grid2x2 className="size-3.5" />
              Eisenhower
            </TabsTrigger>
          </TabsList>
          <CreateTaskDialog categories={categories} timezone={timezone} />
        </div>

        <TabsContent value="kanban">
          <KanbanBoard
            tasks={tasks}
            categoryOf={categoryOf}
            timezone={timezone}
            onOpen={onOpen}
            onMove={onMove}
          />
        </TabsContent>
        <TabsContent value="eisenhower">
          <EisenhowerMatrix
            tasks={tasks}
            categoryOf={categoryOf}
            timezone={timezone}
            onOpen={onOpen}
          />
        </TabsContent>
      </Tabs>

      <TaskDetailDialog
        task={openTask}
        category={openTask ? categoryOf(openTask) : undefined}
        items={openTask ? (checklistMap.get(openTask.id) ?? []) : []}
        timezone={timezone}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
