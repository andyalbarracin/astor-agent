'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Check, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, Category, ChecklistItem } from '@astor/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  completeTaskAction,
  deleteTaskAction,
  addChecklistItemAction,
  toggleChecklistItemAction,
} from '@/app/actions/tasks';

const PRIO_LABEL: Record<number, string> = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4' };

export function TaskDetailDialog({
  task,
  category,
  items,
  timezone,
  open,
  onOpenChange,
}: {
  task: Task | null;
  category?: Category;
  items: ChecklistItem[];
  timezone: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newItem, setNewItem] = useState('');

  if (!task) return null;

  const due = task.due_at
    ? DateTime.fromISO(task.due_at, { zone: timezone }).setLocale('es-AR').toLocaleString(
        DateTime.DATE_MED,
      )
    : null;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (success) toast.success(success);
        router.refresh();
      } else {
        toast.error(res.error ?? 'Error');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{PRIO_LABEL[task.priority]}</Badge>
            {category && (
              <Badge variant="neutral">
                <span
                  className="size-2 rounded-full"
                  style={{ background: category.color ?? 'var(--color-text-subtlest)' }}
                />
                {category.name}
              </Badge>
            )}
            {due && <Badge variant="signature">vence {due}</Badge>}
            {task.recurrence_rule && <Badge variant="discovery">recurrente</Badge>}
          </div>
          <DialogTitle className="mt-1 text-500">{task.title}</DialogTitle>
        </DialogHeader>

        {task.notes && <p className="text-200 leading-relaxed text-fg-subtle">{task.notes}</p>}

        <Separator className="my-4" />

        <div className="flex flex-col gap-2">
          <p className="text-100 font-medium uppercase tracking-wide text-fg-subtlest">Checklist</p>
          {items.length === 0 && (
            <p className="text-200 text-fg-subtlest">Sin ítems todavía.</p>
          )}
          {items.map((it) => (
            <label key={it.id} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={it.done}
                onCheckedChange={(v) =>
                  run(() => toggleChecklistItemAction(it.id, Boolean(v)))
                }
              />
              <span
                className={
                  it.done ? 'text-200 text-fg-subtlest line-through' : 'text-200 text-fg-default'
                }
              >
                {it.label}
              </span>
            </label>
          ))}
          <div className="mt-1 flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  run(() => addChecklistItemAction(task.id, newItem.trim()));
                  setNewItem('');
                }
              }}
              placeholder="Agregar ítem…"
              className="h-8"
            />
            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              disabled={!newItem.trim()}
              onClick={() => {
                run(() => addChecklistItemAction(task.id, newItem.trim()));
                setNewItem('');
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-danger-text hover:bg-danger-subtle"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const r = await deleteTaskAction(task.id);
                if (r.ok) onOpenChange(false);
                return r;
              }, 'Tarea eliminada')
            }
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
          {task.status !== 'done' && (
            <Button
              variant="signature"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const r = await completeTaskAction(task.id);
                  if (r.ok) onOpenChange(false);
                  return r;
                }, 'Completada')
              }
            >
              <Check className="size-4" />
              Completar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
