import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import {
  listTransactions,
  listFinanceCategories,
  listAccounts,
  getFinanceReport,
  latestFxRates,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { FinanceView } from '@/components/finance/finance-view';

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone);
  const month = searchParams ? (await searchParams).month ?? now.toFormat('yyyy-MM') : now.toFormat('yyyy-MM');

  const [transactions, categories, accounts, report, fx] = await Promise.all([
    listTransactions(ctx, { month }),
    listFinanceCategories(ctx),
    listAccounts(ctx),
    getFinanceReport(ctx, month),
    latestFxRates(ctx),
  ]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <FinanceView
        month={month}
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        report={report}
        fxMep={fx.mep ?? fx.blue ?? null}
        timezone={ctx.timezone}
      />
    </div>
  );
}
