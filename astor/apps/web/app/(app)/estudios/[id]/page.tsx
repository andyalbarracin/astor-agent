import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { getProgram, listSubjectsWithTopics, listResources } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { SubjectsBoard } from '@/components/studies/subjects-board';
import { LogHoursButton, ResourcesPanel } from '@/components/studies/study-extras';

const KIND_LABEL: Record<string, string> = { curso: 'Curso', carrera: 'Carrera', examen: 'Examen', otro: 'Otro' };

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const program = await getProgram(ctx, id);
  if (!program) notFound();

  const [subjects, resources] = await Promise.all([
    listSubjectsWithTopics(ctx, id),
    listResources(ctx, { programId: id }),
  ]);
  const color = program.color ?? '#3FA9B8';

  let countdown: string | null = null;
  if (program.kind === 'examen' && program.target_date) {
    const days = Math.round(
      DateTime.fromISO(program.target_date, { zone: ctx.timezone }).startOf('day').diff(
        DateTime.now().setZone(ctx.timezone).startOf('day'),
        'days',
      ).days,
    );
    countdown = days < 0 ? 'examen pasado' : days === 0 ? 'examen hoy' : `faltan ${days} días`;
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link href="/estudios" className="mb-4 inline-flex items-center gap-1.5 text-200 text-fg-subtle transition-colors hover:text-fg-default">
        <ArrowLeft className="size-4" /> Estudios
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-100 font-medium" style={{ background: `${color}22`, color }}>
              {KIND_LABEL[program.kind]}
            </span>
            {countdown && (
              <span className="inline-flex items-center gap-1 text-100 text-signature-text">
                <CalendarClock className="size-3" /> {countdown}
              </span>
            )}
          </div>
          <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">{program.name}</h1>
          {program.institution && <p className="text-200 text-fg-subtle">{program.institution}</p>}
        </div>
        <LogHoursButton subjects={subjects} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SubjectsBoard subjects={subjects} programId={id} />
        <ResourcesPanel resources={resources} programId={id} />
      </div>
    </div>
  );
}
