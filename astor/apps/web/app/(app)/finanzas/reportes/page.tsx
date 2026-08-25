import { redirect } from 'next/navigation';
import { getSpendingReport, latestFxRates } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { ReportesView } from '@/components/finance/reportes-view';

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ meses?: string }>;
}) {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const raw = searchParams ? Number((await searchParams).meses) : NaN;
  const months = [3, 6, 12].includes(raw) ? raw : 6;

  const [report, fx] = await Promise.all([
    getSpendingReport(ctx, months),
    latestFxRates(ctx),
  ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <ReportesView report={report} months={months} mep={fx.mep ?? fx.blue ?? null} />
    </div>
  );
}
