'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, TaskStatus } from '@astor/core';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createTaskAction } from '@/app/actions/tasks';

const RECURRENCE: { value: string; label: string; rule?: string }[] = [
  { value: 'none', label: 'No se repite' },
  { value: 'daily', label: 'Cada día', rule: 'FREQ=DAILY' },
  { value: 'weekdays', label: 'Días de semana', rule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
  { value: 'weekly', label: 'Cada semana', rule: 'FREQ=WEEKLY' },
  { value: 'monthly', label: 'Cada mes', rule: 'FREQ=MONTHLY' },
];

const PRIORITIES = [
  { value: 1, label: 'P1', tone: 'data-[on=true]:bg-danger-subtle data-[on=true]:text-danger-text' },
  { value: 2, label: 'P2', tone: 'data-[on=true]:bg-warning-subtle data-[on=true]:text-warning-text' },
  { value: 3, label: 'P3', tone: 'data-[on=true]:bg-surface-overlay data-[on=true]:text-brand-text' },
  { value: 4, label: 'P4', tone: 'data-[on=true]:bg-surface-overlay data-[on=true]:text-fg-default' },
];

export function CreateTaskDialog({
  categories,
  timezone,
  defaultStatus = 'todo',
}: {
  categories: Category[];
  timezone: string;
  defaultStatus?: TaskStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState(3);
  const [categoryId, setCategoryId] = useState<string>('none');
  const [due, setDue] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  function reset() {
    setTitle('');
    setNotes('');
    setPriority(3);
    setCategoryId('none');
    setDue('');
    setRecurrence('none');
  }

  function submit() {
    if (!title.trim()) return;
    const rule = RECURRENCE.find((r) => r.value === recurrence)?.rule;
    const dueAt = due
      ? DateTime.fromISO(due, { zone: timezone }).set({ hour: 9 }).toISO()
      : undefined;

    start(async () => {
      const res = await createTaskAction({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        status: defaultStatus,
        categoryId: categoryId === 'none' ? undefined : categoryId,
        dueAt: dueAt ?? undefined,
        recurrenceRule: rule,
      });
      if (res.ok) {
        toast.success('Tarea creada');
        reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="signature" size="sm">
          <Plus className="size-4" />
          Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription>Cargala rápido. Podés completar el resto después.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder="Terminar el informe…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Prioridad</Label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    data-on={priority === p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex-1 rounded-md border border-line-subtle py-1.5 text-100 font-medium text-fg-subtle transition-colors hover:text-fg-default',
                      p.tone,
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due">Vencimiento</Label>
              <Input
                id="task-due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Recurrencia</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-notes">Notas</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles, contexto…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="signature" onClick={submit} disabled={pending || !title.trim()}>
            {pending ? 'Creando…' : 'Crear tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
