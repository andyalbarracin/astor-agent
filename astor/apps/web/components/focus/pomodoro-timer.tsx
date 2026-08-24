'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject } from '@astor/core';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { logFocusSessionAction } from '@/app/actions/focus';

const BREAK_MIN = 5;
const FOCUS_OPTIONS = [25, 50];

export function PomodoroTimer({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [focusMin, setFocusMin] = useState(25);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [subjectId, setSubjectId] = useState('none');

  // Reset al cambiar duración/modo mientras está pausado.
  useEffect(() => {
    if (!running) setSecs((mode === 'focus' ? focusMin : BREAK_MIN) * 60);
  }, [focusMin, mode, running]);

  // Tick.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const complete = useCallback(() => {
    setRunning(false);
    if (mode === 'focus') {
      void logFocusSessionAction({ duration: focusMin, subjectId: subjectId === 'none' ? undefined : subjectId }).then(
        (r) => {
          if (r.ok) {
            toast.success(`+${focusMin} min de foco`);
            router.refresh();
          }
        },
      );
      setMode('break');
      setSecs(BREAK_MIN * 60);
    } else {
      setMode('focus');
      setSecs(focusMin * 60);
    }
  }, [mode, focusMin, subjectId, router]);

  useEffect(() => {
    if (running && secs === 0) complete();
  }, [secs, running, complete]);

  const total = (mode === 'focus' ? focusMin : BREAK_MIN) * 60;
  const pct = total ? ((total - secs) / total) * 100 : 0;
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border border-line-subtle bg-surface-raised p-8">
      <div className="mb-6 inline-flex rounded-md border border-line-subtle p-1">
        {FOCUS_OPTIONS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={running}
            onClick={() => { setFocusMin(m); setMode('focus'); }}
            className={cn(
              'rounded px-3 py-1 text-200 font-medium transition-colors disabled:opacity-50',
              focusMin === m && mode === 'focus' ? 'bg-surface-overlay text-fg-default' : 'text-fg-subtle',
            )}
          >
            {m} min
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative flex size-56 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border-subtle)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={mode === 'focus' ? 'var(--color-signature-default)' : 'var(--color-success-default)'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="text-center">
          <p className="text-[3.2rem] font-bold tabular-nums leading-none text-fg-default">{mm}:{ss}</p>
          <p className="mt-1 text-200 uppercase tracking-wide text-fg-subtlest">
            {mode === 'focus' ? 'Foco' : 'Descanso'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="signature" size="lg" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? 'Pausar' : 'Empezar'}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setRunning(false); setSecs((mode === 'focus' ? focusMin : BREAK_MIN) * 60); }}>
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="mt-6 w-full">
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger><SelectValue placeholder="Sin materia" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin materia (solo foco)</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="mt-2 text-100 text-fg-subtlest">Si elegís materia, el bloque cuenta como horas de estudio.</p>
      </div>
    </div>
  );
}
