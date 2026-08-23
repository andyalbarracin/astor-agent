'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sunrise, Moon, ListChecks, MoreHorizontal, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RoutineWithItems, RoutineKind } from '@astor/core';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  toggleRoutineItemAction,
  addRoutineItemAction,
  deleteRoutineItemAction,
  renameRoutineItemAction,
  renameRoutineAction,
  deleteRoutineAction,
  reorderRoutinesAction,
} from '@/app/actions/routines';

const ICON: Record<RoutineKind, typeof Sunrise> = { morning: Sunrise, night: Moon, custom: ListChecks };

export function RoutinesList({
  routines,
  completedIds,
  date,
}: {
  routines: RoutineWithItems[];
  completedIds: string[];
  date: string;
}) {
  const [local, setLocal] = useState(routines);
  const [done, setDone] = useState<Set<string>>(new Set(completedIds));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const sig = useMemo(
    () => JSON.stringify(routines.map((r) => [r.id, r.position, r.name, r.items.map((i) => [i.id, i.label])])),
    [routines],
  );
  useEffect(() => setLocal(routines), [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const compSig = completedIds.join(',');
  useEffect(() => setDone(new Set(completedIds)), [compSig]); // eslint-disable-line react-hooks/exhaustive-deps

  function fire(p: Promise<{ ok: boolean; error?: string }>) {
    p.then((r) => !r.ok && toast.error(r.error ?? 'Error')).catch(() => toast.error('Error de red'));
  }

  function toggle(itemId: string, isDone: boolean) {
    setDone((cur) => {
      const n = new Set(cur);
      if (isDone) n.add(itemId);
      else n.delete(itemId);
      return n;
    });
    fire(toggleRoutineItemAction(itemId, date, isDone));
  }
  function addItem(routineId: string, label: string) {
    const temp = { id: crypto.randomUUID(), user_id: '', routine_id: routineId, label, position: 999, created_at: '', updated_at: '' };
    setLocal((cur) => cur.map((r) => (r.id === routineId ? { ...r, items: [...r.items, temp] } : r)));
    fire(addRoutineItemAction(routineId, label));
  }
  function deleteItem(routineId: string, itemId: string) {
    setLocal((cur) => cur.map((r) => (r.id === routineId ? { ...r, items: r.items.filter((i) => i.id !== itemId) } : r)));
    fire(deleteRoutineItemAction(itemId));
  }
  function renameItem(routineId: string, itemId: string, label: string) {
    setLocal((cur) => cur.map((r) => (r.id === routineId ? { ...r, items: r.items.map((i) => (i.id === itemId ? { ...i, label } : i)) } : r)));
    fire(renameRoutineItemAction(itemId, label));
  }
  function rename(routineId: string, name: string) {
    setLocal((cur) => cur.map((r) => (r.id === routineId ? { ...r, name } : r)));
    fire(renameRoutineAction(routineId, name));
  }
  function remove(routineId: string) {
    setLocal((cur) => cur.filter((r) => r.id !== routineId));
    fire(deleteRoutineAction(routineId));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLocal((cur) => {
      const next = arrayMove(cur, cur.findIndex((r) => r.id === active.id), cur.findIndex((r) => r.id === over.id));
      fire(reorderRoutinesAction(next.map((r) => r.id)));
      return next;
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={local.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {local.map((routine) => (
            <RoutineCardEditable
              key={routine.id}
              routine={routine}
              done={done}
              onToggle={toggle}
              onAddItem={(label) => addItem(routine.id, label)}
              onDeleteItem={(itemId) => deleteItem(routine.id, itemId)}
              onRenameItem={(itemId, label) => renameItem(routine.id, itemId, label)}
              onRename={(name) => rename(routine.id, name)}
              onDelete={() => remove(routine.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function RoutineCardEditable({
  routine,
  done,
  onToggle,
  onAddItem,
  onDeleteItem,
  onRenameItem,
  onRename,
  onDelete,
}: {
  routine: RoutineWithItems;
  done: Set<string>;
  onToggle: (itemId: string, done: boolean) => void;
  onAddItem: (label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string, label: string) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: routine.id });
  const Icon = ICON[routine.kind];
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(routine.name);
  const [newItem, setNewItem] = useState('');
  const [editItem, setEditItem] = useState<{ id: string; val: string } | null>(null);
  const doneCount = routine.items.filter((i) => done.has(i.id)).length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rounded-lg border border-line-subtle bg-surface-raised p-4', isDragging && 'z-10 opacity-80 shadow-overlay')}
    >
      <div className="mb-3 flex items-center gap-2">
        <button type="button" className="cursor-grab touch-none text-fg-subtlest hover:text-fg-default active:cursor-grabbing" {...attributes} {...listeners} aria-label="Reordenar">
          <GripVertical className="size-4" />
        </button>
        <span className="flex size-8 items-center justify-center rounded-lg bg-signature-soft text-signature-text">
          <Icon size={16} />
        </span>
        {renaming ? (
          <Input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nameVal.trim()) {
                onRename(nameVal.trim());
                setRenaming(false);
              }
              if (e.key === 'Escape') setRenaming(false);
            }}
            onBlur={() => {
              if (nameVal.trim() && nameVal !== routine.name) onRename(nameVal.trim());
              setRenaming(false);
            }}
            className="h-7 w-44"
          />
        ) : (
          <span className="flex-1 text-400 font-semibold text-fg-default">{routine.name}</span>
        )}
        <span className="text-100 tabular-nums text-fg-subtlest">
          {doneCount}/{routine.items.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded p-1 text-fg-subtlest hover:bg-surface-overlay hover:text-fg-default">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setNameVal(routine.name); setRenaming(true); }}>
              <Pencil className="size-4" /> Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="size-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pl-1">
        {routine.items.map((item) => {
          const isDone = done.has(item.id);
          return (
            <div key={item.id} className="group flex items-center gap-2.5 py-1.5">
              <Checkbox
                checked={isDone}
                onCheckedChange={(v) => onToggle(item.id, Boolean(v))}
                style={isDone ? { backgroundColor: 'var(--color-signature-default)', borderColor: 'var(--color-signature-default)' } : undefined}
              />
              {editItem?.id === item.id ? (
                <Input
                  autoFocus
                  value={editItem.val}
                  onChange={(e) => setEditItem({ id: item.id, val: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editItem.val.trim()) { onRenameItem(item.id, editItem.val.trim()); setEditItem(null); }
                    if (e.key === 'Escape') setEditItem(null);
                  }}
                  onBlur={() => { if (editItem.val.trim() && editItem.val !== item.label) onRenameItem(item.id, editItem.val.trim()); setEditItem(null); }}
                  className="h-7 flex-1"
                />
              ) : (
                <button type="button" onClick={() => setEditItem({ id: item.id, val: item.label })} className={cn('flex-1 text-left text-300', isDone ? 'text-fg-subtlest line-through' : 'text-fg-default')}>
                  {item.label}
                </button>
              )}
              <button type="button" onClick={() => onDeleteItem(item.id)} className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100">
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
        <div className="flex items-center gap-2 py-1">
          <Plus className="size-4 text-fg-subtlest" />
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newItem.trim()) { onAddItem(newItem.trim()); setNewItem(''); }
            }}
            placeholder="Agregar paso…"
            className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
