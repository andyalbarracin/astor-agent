'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Plus, GraduationCap, BookOpen, Target, Sparkles, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import type { ProgramWithProgress, StudyProgramKind } from '@astor/core';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createProgramAction } from '@/app/actions/studies';

const KIND: Record<StudyProgramKind, { label: string; icon: typeof BookOpen; color: string }> = {
  curso: { label: 'Curso', icon: BookOpen, color: '#3FA9B8' },
  carrera: { label: 'Carrera', icon: GraduationCap, color: '#9F8FEF' },
  examen: { label: 'Examen', icon: Target, color: '#FFBD76' },
  otro: { label: 'Otro', icon: Sparkles, color: '#7CC96A' },
};

function countdown(dateStr: string, tz: string): { label: string; urgent: boolean } | null {
  const target = DateTime.fromISO(dateStr, { zone: tz }).startOf('day');
  const days = Math.round(target.diff(DateTime.now().setZone(tz).startOf('day'), 'days').days);
  if (days < 0) return { label: 'pasó', urgent: false };
  if (days === 0) return { label: 'hoy', urgent: true };
  return { label: `faltan ${days} días`, urgent: days <= 14 };
}

function ProgramCard({ p, tz }: { p: ProgramWithProgress; tz: string }) {
  const meta = KIND[p.kind];
  const color = p.color ?? meta.color;
  const Icon = meta.icon;
  const cd = p.kind === 'examen' && p.target_date ? countdown(p.target_date, tz) : null;
  return (
    <Link
      href={`/estudios/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface-raised transition-colors hover:border-line-default"
    >
      <div className="h-1.5" style={{ background: color }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}22`, color }}>
            <Icon size={17} />
          </span>
          <span className="rounded-full px-2 py-0.5 text-100 font-medium" style={{ background: `${color}1f`, color }}>
            {meta.label}
          </span>
          {cd && (
            <span className={cn('ml-auto inline-flex items-center gap-1 text-100', cd.urgent ? 'text-danger-text' : 'text-fg-subtle')}>
              <CalendarClock className="size-3" />
              {cd.label}
            </span>
          )}
        </div>
        <h3 className="text-400 font-semibold leading-snug text-fg-default">{p.name}</h3>
        {p.institution && <p className="text-100 text-fg-subtlest">{p.institution}</p>}

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-100 text-fg-subtle">
            <span>{p.topicsLearned}/{p.topicsTotal} temas</span>
            <span className="tabular-nums">{p.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: color }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProgramsGrid({ programs, timezone }: { programs: ProgramWithProgress[]; timezone: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<StudyProgramKind>('curso');
  const [institution, setInstitution] = useState('');
  const [targetDate, setTargetDate] = useState('');

  function submit() {
    if (!name.trim()) return;
    start(async () => {
      const res = await createProgramAction({
        name: name.trim(),
        kind,
        institution: institution.trim() || undefined,
        targetDate: kind === 'examen' && targetDate ? targetDate : undefined,
      });
      if (res.ok) {
        toast.success('Programa creado');
        setName(''); setInstitution(''); setTargetDate(''); setKind('curso');
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {programs.map((p) => (
        <ProgramCard key={p.id} p={p} tz={timezone} />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-default text-fg-subtle transition-colors hover:border-signature hover:text-fg-default"
          >
            <Plus className="size-5" />
            <span className="text-200">Nuevo programa</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo programa</DialogTitle>
            <DialogDescription>Un curso, una carrera o una prep de examen.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-name">Nombre</Label>
              <Input id="p-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Data Science, Ingreso CBC…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Tipo</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as StudyProgramKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND) as StudyProgramKind[]).map((k) => (
                      <SelectItem key={k} value={k}>{KIND[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {kind === 'examen' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-date">Fecha de examen</Label>
                  <Input id="p-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-inst">Institución (opcional)</Label>
              <Input id="p-inst" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="UBA, Platzi…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="signature" onClick={submit} disabled={pending || !name.trim()}>
              {pending ? 'Creando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
