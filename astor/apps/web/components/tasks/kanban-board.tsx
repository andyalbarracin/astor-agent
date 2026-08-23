'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Task, Category, TaskStatus } from '@astor/core';
import { cn } from '@/lib/utils';
import { TaskCard } from './task-card';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'Por hacer' },
  { id: 'doing', label: 'Haciendo' },
  { id: 'done', label: 'Hecho' },
];

function DraggableCard({
  task,
  category,
  timezone,
  onOpen,
}: {
  task: Task;
  category?: Category;
  timezone: string;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      {...attributes}
      {...listeners}
      className={cn('touch-none', isDragging && 'opacity-40')}
    >
      <TaskCard task={task} category={category} timezone={timezone} onClick={onOpen} />
    </div>
  );
}

function Column({
  id,
  label,
  tasks,
  categoryOf,
  timezone,
  onOpen,
}: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  categoryOf: (t: Task) => Category | undefined;
  timezone: string;
  onOpen: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-200 font-semibold text-fg-default">{label}</span>
        <span className="text-100 tabular-nums text-fg-subtlest">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border border-dashed border-transparent p-1 transition-colors',
          isOver && 'border-signature bg-signature-soft',
        )}
      >
        {tasks.map((t) => (
          <DraggableCard
            key={t.id}
            task={t}
            category={categoryOf(t)}
            timezone={timezone}
            onOpen={() => onOpen(t)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg text-100 text-fg-subtlest">
            Vacío
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  categoryOf,
  timezone,
  onOpen,
  onMove,
}: {
  tasks: Task[];
  categoryOf: (t: Task) => Category | undefined;
  timezone: string;
  onOpen: (t: Task) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = tasks.find((t) => t.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id;
    if (!overId) return;
    const task = tasks.find((t) => t.id === e.active.id);
    const target = overId as TaskStatus;
    if (task && task.status !== target) onMove(task.id, target);
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.id)}
            categoryOf={categoryOf}
            timezone={timezone}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {active ? (
          <TaskCard task={active} category={categoryOf(active)} timezone={timezone} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
