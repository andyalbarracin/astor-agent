'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { HabitPeriod } from '@astor/core';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createHabitAction } from '@/app/actions/habits';

const PERIODS: { value: HabitPeriod; label: string }[] = [
  { value: 'day', label: 'Por día' },
  { value: 'week', label: 'Por semana' },
  { value: 'month', label: 'Por mes' },
];

export function CreateHabitDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<HabitPeriod>('day');
  const [target, setTarget] = useState(1);
  const [allowSkip, setAllowSkip] = useState(true);

  function submit() {
    if (!name.trim()) return;
    start(async () => {
      const res = await createHabitAction({ name: name.trim(), period, target, allowSkip });
      if (res.ok) {
        toast.success('Hábito creado');
        setName('');
        setTarget(1);
        setPeriod('day');
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
          Nuevo hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo hábito</DialogTitle>
          <DialogDescription>Algo que quieras sostener con constancia.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">Nombre</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Meditar, correr, leer…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Frecuencia</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as HabitPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-target">Meta</Label>
              <Input
                id="habit-target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5">
            <Checkbox
              checked={allowSkip}
              onCheckedChange={(v) => setAllowSkip(Boolean(v))}
            />
            <span className="text-200 text-fg-subtle">Permitir saltear días sin cortar la racha</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="signature" onClick={submit} disabled={pending || !name.trim()}>
            {pending ? 'Creando…' : 'Crear hábito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
