'use client';

import { useEffect, useState } from 'react';
import { PantherMark } from '@/components/brand/panther-mark';
import { cn } from '@/lib/utils';

/* ── Mini-mockups por slide (divs con tokens, no imágenes) ─────────────────── */

function KanbanMock() {
  const cols = [
    { t: 'Por hacer', n: 3 },
    { t: 'Haciendo', n: 2 },
    { t: 'Hecho', n: 4 },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cols.map((c, i) => (
        <div key={c.t} className="rounded-lg bg-white/[0.04] p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] text-white/60">{c.t}</span>
            <span className="text-[10px] text-white/30">{c.n}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: c.n }).map((_, j) => (
              <div key={j} className="rounded-md bg-white/[0.06] px-2 py-1.5">
                <div className="mb-1 h-1.5 rounded-full bg-white/20" style={{ width: `${60 + ((i + j) % 3) * 12}%` }} />
                <div className="flex items-center gap-1">
                  <span className={cn('size-1.5 rounded-full', j % 2 ? 'bg-amber-400' : 'bg-white/30')} />
                  <div className="h-1 w-8 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitsMock() {
  return (
    <div className="rounded-lg bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-white/80">Meditar</span>
        <span className="flex items-center gap-1 text-xs text-amber-300">🔥 12 de racha</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 17 }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, d) => {
              const on = (w * 7 + d) % 3 !== 0 && w > 2;
              return (
                <div
                  key={d}
                  className="size-2 rounded-[2px]"
                  style={{ background: on ? '#F4B860' : 'rgba(255,255,255,0.06)', opacity: on ? 0.4 + ((w % 5) / 5) * 0.6 : 1 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceMock() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-white/[0.04] p-3">
        <p className="text-[10px] uppercase tracking-wide text-white/40">Balance</p>
        <p className="mt-1 text-lg font-semibold text-white">$1.284.500</p>
        <p className="text-xs text-white/50">≈ US$ 886 · blue</p>
      </div>
      <div className="rounded-lg bg-white/[0.04] p-3">
        <p className="text-[10px] uppercase tracking-wide text-white/40">Heladera · 12 cuotas</p>
        <p className="mt-1 text-lg font-semibold text-amber-300">3/12</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-amber-400" style={{ width: '25%' }} />
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { title: 'Ejecutá tu día', copy: 'Tareas, hábitos y foco en un solo lugar. Sin fricción.', visual: <KanbanMock /> },
  { title: 'Sostené tus hábitos', copy: 'Rachas, heatmap y constancia que se ve.', visual: <HabitsMock /> },
  { title: 'Entendé tu plata', copy: 'Multimoneda blue/MEP y cuotas argentinas, bien modeladas.', visual: <FinanceMock /> },
];

export function LoginSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0d10]">
      {/* Imagen de fondo opcional: reemplazar en public/login/login-bg.jpg */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/login/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(244,184,96,0.10),transparent_45%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d10]/40 via-[#0b0d10]/30 to-[#0b0d10]/90" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
        <div className="flex items-center gap-2.5">
          <PantherMark size={30} className="text-white" />
          <span className="text-lg font-semibold tracking-[-0.01em] text-white">Astor</span>
        </div>

        <div className="max-w-[440px]">
          <div className="mb-8 min-h-[180px]">{SLIDES[i]!.visual}</div>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-white xl:text-[2.4rem]">
            {SLIDES[i]!.title}
          </h2>
          <p className="mt-3 max-w-[380px] text-[0.95rem] leading-relaxed text-white/55">
            {SLIDES[i]!.copy}
          </p>
          <div className="mt-7 flex gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === i ? 'w-7 bg-amber-400' : 'w-1.5 bg-white/25 hover:bg-white/40',
                )}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30">Astor · sistema de ejecución diaria</p>
      </div>
    </div>
  );
}
