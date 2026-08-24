import { redirect } from 'next/navigation';
import { Clock, GraduationCap, CheckCircle2 } from 'lucide-react';
import { listProgramsWithProgress, getStudyOverview } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PageHeader } from '@/components/page-header';
import { ProgramsGrid } from '@/components/studies/programs-grid';

function StatTile({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Clock;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${color}22`, color }}>
          <Icon size={15} />
        </span>
      </div>
      <p className="text-700 font-bold tracking-tight text-fg-default">{value}</p>
    </div>
  );
}

export default async function EstudiosPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const [programs, overview] = await Promise.all([
    listProgramsWithProgress(ctx),
    getStudyOverview(ctx),
  ]);
  const hours = Math.round((overview.weekMinutes / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Estudios" subtitle="Cursos, carreras y exámenes en un solo lugar." />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Horas esta semana" value={`${hours} h`} icon={Clock} color="#3FA9B8" />
        <StatTile label="Temas aprendidos" value={overview.learnedTopics} icon={CheckCircle2} color="#7CC96A" />
        <StatTile label="Programas activos" value={overview.activePrograms} icon={GraduationCap} color="#FFBD76" />
      </div>

      <ProgramsGrid programs={programs} timezone={ctx.timezone} />
    </div>
  );
}
