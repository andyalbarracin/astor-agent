'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Plus, Link2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject, StudyResource } from '@astor/core';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logStudySessionAction, addResourceAction, deleteResourceAction } from '@/app/actions/studies';

export function LogHoursButton({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [minutes, setMinutes] = useState(30);
  const [subjectId, setSubjectId] = useState('none');

  function submit() {
    start(async () => {
      const res = await logStudySessionAction({ minutes, subjectId: subjectId === 'none' ? undefined : subjectId });
      if (res.ok) { toast.success('Horas registradas'); setOpen(false); router.refresh(); }
      else toast.error(res.error);
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm"><Clock className="size-4" /> Registrar horas</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Registrar sesión de estudio</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Minutos</Label>
            <Input type="number" min={1} value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Materia (opcional)</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Ninguna" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="signature" onClick={submit} disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourcesPanel({ resources, programId }: { resources: StudyResource[]; programId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [pending, start] = useTransition();

  function add() {
    if (!title.trim()) return;
    start(async () => {
      const res = await addResourceAction({ programId, title: title.trim(), url: url.trim() || undefined, kind: 'link' });
      if (res.ok) { setTitle(''); setUrl(''); router.refresh(); } else toast.error(res.error);
    });
  }
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
      <h3 className="mb-3 text-300 font-semibold text-fg-default">Recursos</h3>
      <div className="flex flex-col gap-1">
        {resources.length === 0 && <p className="text-200 text-fg-subtlest">Sin recursos aún.</p>}
        {resources.map((r) => (
          <div key={r.id} className="group flex items-center gap-2">
            <Link2 className="size-3.5 text-fg-subtlest" />
            {r.url ? (
              <a href={r.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-200 text-brand-text hover:underline">{r.title}</a>
            ) : (
              <span className="flex-1 truncate text-200 text-fg-default">{r.title}</span>
            )}
            <button type="button" onClick={() => start(async () => { await deleteResourceAction(r.id); router.refresh(); })} className="text-fg-subtlest opacity-0 hover:text-danger-text group-hover:opacity-100">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-line-subtle pt-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del recurso" className="h-8" />
        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… (opcional)" className="h-8" />
          <Button variant="secondary" size="sm" onClick={add} disabled={pending || !title.trim()}><Plus className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}
