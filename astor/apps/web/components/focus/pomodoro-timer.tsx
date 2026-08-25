'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject } from '@astor/core';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { logFocusSessionAction } from '@/app/actions/focus';
import { playBell, playSoftChime, primeAudio } from '@/lib/chime';

const BREAK_MIN = 5;
const FOCUS_OPTIONS = [25, 50];

export interface FocusTodo {
  id: string;
  label: string;
  section: string;
}

export function PomodoroTimer({ subjects, todos = [] }: { subjects: Subject[]; todos?: FocusTodo[] }) {
  const router = useRouter();
  const [focusMin, setFocusMin] = useState(25);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  // target: 'none' | 'subj:<id>' | 'task:<id>'
  const [target, setTarget] = useState('none');
  const subjectId = target.startsWith('subj:') ? target.slice(5) : undefined;
  const targetLabel =
    target.startsWith('task:') ? todos.find((t) => `task:${t.id}` === target)?.label
    : target.startsWith('subj:') ? subjects.find((s) => `subj:${s.id}` === target)?.name
    : undefined;
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(localStorage.getItem('astor-pomodoro-muted') === '1');
  }, []);
  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('astor-pomodoro-muted', next ? '1' : '0');
      if (!next) primeAudio();
      return next;
    });
  }

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
      if (!muted) playBell();
      void logFocusSessionAction({ duration: focusMin, subjectId }).then(
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
      if (!muted) playSoftChime();
      setMode('focus');
      setSecs(focusMin * 60);
    }
  }, [mode, focusMin, subjectId, router, muted]);

  useEffect(() => {
    if (running && secs === 0) complete();
  }, [secs, running, complete]);

  const total = (mode === 'focus' ? focusMin : BREAK_MIN) * 60;
  const pct = total ? ((total - secs) / total) * 100 : 0;
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border border-line-subtle bg-surface-raised p-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="inline-flex rounded-md border border-line-subtle p-1">
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
        <div className="inline-flex items-center gap-1 rounded-md border border-line-subtle px-2 py-1">
          <input
            type="number"
            min={1}
            max={180}
            disabled={running}
            value={focusMin}
            onChange={(e) => { setFocusMin(Math.min(180, Math.max(1, Number(e.target.value) || 1))); setMode('focus'); }}
            className="w-12 bg-transparent text-center text-200 font-medium text-fg-default outline-none disabled:opacity-50"
            aria-label="Minutos personalizados"
          />
          <span className="text-100 text-fg-subtlest">min</span>
        </div>
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

      {targetLabel && (
        <p className="mt-4 max-w-[18rem] truncate rounded-full bg-surface-overlay px-3 py-1 text-center text-100 text-fg-subtle">
          {target.startsWith('task:') ? '🎯' : '📚'} {targetLabel}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="signature" size="lg" onClick={() => { primeAudio(); setRunning((r) => !r); }}>
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? 'Pausar' : 'Empezar'}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { setRunning(false); setSecs((mode === 'focus' ? focusMin : BREAK_MIN) * 60); }}>
          <RotateCcw className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleMute} title={muted ? 'Activar sonido' : 'Silenciar'} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </Button>
      </div>

      <div className="mt-6 w-full">
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger><SelectValue placeholder="Sin objetivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin objetivo (solo foco)</SelectItem>
            {todos.length > 0 && (
              <>
                <div className="px-2 pb-1 pt-2 text-100 uppercase tracking-wide text-fg-subtlest">Tareas de hoy</div>
                {todos.map((t) => (
                  <SelectItem key={t.id} value={`task:${t.id}`}>
                    {t.label} <span className="text-fg-subtlest">· {t.section}</span>
                  </SelectItem>
                ))}
              </>
            )}
            {subjects.length > 0 && (
              <>
                <div className="px-2 pb-1 pt-2 text-100 uppercase tracking-wide text-fg-subtlest">Materias</div>
                {subjects.map((s) => <SelectItem key={s.id} value={`subj:${s.id}`}>{s.name}</SelectItem>)}
              </>
            )}
          </SelectContent>
        </Select>
        <p className="mt-2 text-100 text-fg-subtlest">
          {target.startsWith('subj:')
            ? 'Cuenta como horas de estudio de esa materia.'
            : target.startsWith('task:')
              ? 'Foco para concretar esta tarea del día.'
              : 'Elegí una tarea del día o una materia para enfocar el bloque.'}
        </p>
      </div>
    </div>
  );
}
