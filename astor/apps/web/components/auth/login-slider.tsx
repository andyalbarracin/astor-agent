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
    <div className="grid grid-cols-3 gap-4">
      {cols.map((c, i) => (
        <div key={c.t} className="rounded-xl bg-white/[0.05] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-white/70">{c.t}</span>
            <span className="text-sm text-white/35">{c.n}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: c.n }).map((_, j) => (
              <div key={j} className="rounded-lg bg-white/[0.07] px-3 py-2.5">
                <div className="mb-2 h-2 rounded-full bg-white/25" style={{ width: `${60 + ((i + j) % 3) * 12}%` }} />
                <div className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', j % 2 ? 'bg-[#FFBD76]' : 'bg-white/35')} />
                  <div className="h-1.5 w-10 rounded-full bg-white/12" />
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
    <div className="rounded-xl bg-white/[0.05] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg text-white/85">Meditar</span>
        <span className="flex items-center gap-1.5 text-base text-[#FFD5A3]">🔥 12 de racha</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 16 }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1.5">
            {Array.from({ length: 7 }).map((_, d) => {
              const on = (w * 7 + d) % 3 !== 0 && w > 2;
              return (
                <div
                  key={d}
                  className="size-3 rounded-[3px]"
                  style={{ background: on ? '#FFBD76' : 'rgba(255,255,255,0.07)', opacity: on ? 0.45 + ((w % 5) / 5) * 0.55 : 1 }}
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
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/[0.05] p-5">
        <p className="text-xs uppercase tracking-wide text-white/45">Balance</p>
        <p className="mt-1.5 text-2xl font-semibold text-white">$1.284.500</p>
        <p className="text-sm text-white/55">≈ US$ 886 · blue</p>
      </div>
      <div className="rounded-xl bg-white/[0.05] p-5">
        <p className="text-xs uppercase tracking-wide text-white/45">Heladera · 12 cuotas</p>
        <p className="mt-1.5 text-2xl font-semibold text-[#FFD5A3]">3/12</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
          <div className="h-full rounded-full bg-[#FFBD76]" style={{ width: '25%' }} />
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
    <div className="relative h-full w-full overflow-hidden">
      {/* Fallback: gradiente moderno onyx → oceanic → verde césped */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #0A171D 0%, #003F47 52%, #1E4D2B 100%)',
        }}
      />
      {/* Imagen de fondo opcional: reemplazar en public/login/login-bg.jpg */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/login/login-bg.jpg')" }}
      />
      {/* Glow nectarine arriba-izquierda */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_15%_0%,rgba(255,189,118,0.16),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06121A]/70" />

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <PantherMark size={38} className="text-white" />
          <span className="text-2xl font-semibold tracking-[-0.01em] text-white">Astor</span>
        </div>

        <div className="max-w-[520px]">
          <div className="mb-10 min-h-[220px]">{SLIDES[i]!.visual}</div>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white xl:text-5xl">
            {SLIDES[i]!.title}
          </h2>
          <p className="mt-4 max-w-[440px] text-lg leading-relaxed text-white/60">
            {SLIDES[i]!.copy}
          </p>
          <div className="mt-9 flex gap-2.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  idx === i ? 'w-9 bg-[#FFBD76]' : 'w-2 bg-white/25 hover:bg-white/45',
                )}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-white/35">Astor · sistema de ejecución diaria</p>
      </div>
    </div>
  );
}
