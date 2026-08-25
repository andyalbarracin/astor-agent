import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { getNetWorthSummary, getFinanceReport } from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { PatrimonioView } from '@/components/finance/patrimonio-view';

export default async function PatrimonioPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const month = DateTime.now().setZone(ctx.timezone).toFormat('yyyy-MM');
  const [summary, report] = await Promise.all([
    getNetWorthSummary(ctx),
    getFinanceReport(ctx, month),
  ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PatrimonioView summary={summary} monthFlow={{ income: report.totalIncome, expense: report.totalExpense }} />
    </div>
  );
}
