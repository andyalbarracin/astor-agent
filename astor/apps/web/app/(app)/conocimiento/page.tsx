import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import { getStudyOverview, listProgramsWithProgress } from '@astor/core';
import { getDomainContext } from '@/lib/domain';

const ACCENT = '#9F8FEF';

export default async function ConocimientoPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const [study, programs] = await Promise.all([getStudyOverview(ctx), listProgramsWithProgress(ctx)]);
  const weekHours = Math.round((study.weekMinutes / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-[1100px]">
      <header className="astor-fade mb-6">
        <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Conocimiento</h1>
        <p className="text-200 text-fg-subtle">Estudios, lecturas e ideas — todo lo que aprendés en un lugar.</p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Horas (semana)" value={`${weekHours}h`} accent={ACCENT} />
        <Stat label="Temas aprendidos" value={`${study.learnedTopics}`} accent={ACCENT} />
        <Stat label="Programas activos" value={`${study.activePrograms}`} accent={ACCENT} />
        <Stat label="Programas" value={`${programs.length}`} accent={ACCENT} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Link href="/estudios" className="astor-rise group rounded-xl border border-line-subtle bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--h)]" style={{ ['--h' as string]: `${ACCENT}66` }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md" style={{ background: `${ACCENT}22`, color: ACCENT }}><BookOpen className="size-4" /></span>
            <h2 className="text-400 font-semibold text-fg-default">Estudios</h2>
            <ArrowUpRight className="ml-auto size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="space-y-2">
            {programs.slice(0, 4).map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-200">
                  <span className="truncate text-fg-default">{p.name}</span>
                  <span className="text-fg-subtlest">{p.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: ACCENT }} />
                </div>
              </div>
            ))}
            {programs.length === 0 && <p className="text-200 text-fg-subtlest">Creá tu primer programa en Estudios.</p>}
          </div>
        </Link>

        <div className="astor-rise rounded-xl border border-dashed border-line-default bg-surface-raised/50 p-5" style={{ animationDelay: '80ms' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md" style={{ background: `${ACCENT}18`, color: ACCENT }}><Lightbulb className="size-4" /></span>
            <h2 className="text-400 font-semibold text-fg-default">Ideas & Notas rápidas</h2>
            <span className="ml-auto rounded-full bg-surface-overlay px-2 py-0.5 text-100 text-fg-subtlest">pronto</span>
          </div>
          <p className="text-200 text-fg-subtle">Un lugar para capturar ideas sueltas, notas y links sin fricción. En construcción.</p>
          <div className="mt-4 flex items-center gap-2 text-fg-subtlest">
            <GraduationCap className="size-4" />
            <span className="text-100">Se integrará con Estudios y con el agente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="astor-rise rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</span>
        <span className="size-2.5 rounded-full" style={{ background: accent }} />
      </div>
      <p className="text-500 font-bold tracking-tight text-fg-default">{value}</p>
    </div>
  );
}
