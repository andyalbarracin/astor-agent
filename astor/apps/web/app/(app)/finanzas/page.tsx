import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowUpRight, Wallet, CreditCard, PiggyBank, CalendarClock } from 'lucide-react';
import {
  getFinanceReport,
  getSpendingReport,
  getNetWorthSummary,
  listUpcomingInvoices,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { FinanceHubCharts } from '@/components/finance/finance-hub-charts';

const ACCENT = '#7CC96A';
const money = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

export default async function FinanzasPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const now = DateTime.now().setZone(ctx.timezone);
  const month = now.toFormat('yyyy-MM');

  const [report, spending, netWorth, invoices] = await Promise.all([
    getFinanceReport(ctx, month),
    getSpendingReport(ctx, 6),
    getNetWorthSummary(ctx),
    listUpcomingInvoices(ctx),
  ]);

  const today = now.startOf('day');
  const upcoming = invoices
    .filter((v) => DateTime.fromISO(v.due_date) >= today.minus({ days: 1 }))
    .slice(0, 5)
    .map((v) => ({
      cardName: v.cardName,
      total: Number(v.total),
      dueLabel: DateTime.fromISO(v.due_date).setLocale('es').toFormat('dd LLL'),
      periodLabel: DateTime.fromISO(v.period).setLocale('es').toFormat('LLLL'),
    }));

  const trend = spending.byMonth.map((m) => ({ label: DateTime.fromISO(`${m.month}-01`).setLocale('es').toFormat('LLL'), expense: m.expense, income: m.income }));
  const donut = spending.byCategory.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="astor-fade mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Finanzas</h1>
          <p className="text-200 text-fg-subtle capitalize">{now.setLocale('es').toFormat('LLLL yyyy')}</p>
        </div>
        <Link href="/finanzas/registro" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-200 font-medium text-fg-inverse" style={{ background: ACCENT }}>
          Ir al registro <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      {/* Stat cards → módulos */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/finanzas/registro" icon={<Wallet className="size-4" />} label="Gasto del mes" value={money(report.totalExpense)} foot={`Ingresos ${money(report.totalIncome)}`} />
        <StatCard href="/finanzas/patrimonio" icon={<PiggyBank className="size-4" />} label="Patrimonio neto" value={money(netWorth.net)} foot={`MEP $${netWorth.usdRate.toLocaleString('es-AR')}`} />
        <StatCard href="/finanzas/tarjetas" icon={<CreditCard className="size-4" />} label="Por vencer" value={`${upcoming.length}`} foot="resúmenes próximos" />
        <StatCard href="/finanzas/reportes" icon={<CalendarClock className="size-4" />} label="Neto del mes" value={money(report.net)} foot={`${report.count} movimientos`} />
      </div>

      <FinanceHubCharts trend={trend} donut={donut} />

      {/* Próximos vencimientos */}
      <div className="mt-5 overflow-hidden rounded-xl border border-line-subtle bg-surface-raised">
        <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
          <h2 className="flex items-center gap-2 text-400 font-semibold text-fg-default"><CalendarClock className="size-4" style={{ color: ACCENT }} /> Próximos vencimientos</h2>
          <Link href="/finanzas/tarjetas" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">Tarjetas <ArrowUpRight className="size-3.5" /></Link>
        </div>
        <div className="divide-y divide-line-subtle">
          {upcoming.length === 0 && <p className="px-5 py-8 text-center text-200 text-fg-subtlest">Sin resúmenes por vencer.</p>}
          {upcoming.map((v, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-300 text-fg-default">{v.cardName}</p>
                <p className="text-100 capitalize text-fg-subtlest">{v.periodLabel} · vence {v.dueLabel}</p>
              </div>
              <span className="tabular-nums text-300 font-semibold text-fg-default">{money(v.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ href, icon, label, value, foot }: { href: string; icon: React.ReactNode; label: string; value: string; foot: string }) {
  return (
    <Link href={href} className="astor-rise group relative overflow-hidden rounded-xl border border-line-subtle bg-surface-raised p-4 transition-all hover:-translate-y-0.5 hover:border-[#7CC96A55]">
      <div className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: ACCENT }} />
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${ACCENT}22`, color: ACCENT }}>{icon}</span>
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</span>
        <ArrowUpRight className="ml-auto size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="text-600 font-bold tracking-tight text-fg-default">{value}</p>
      <p className="mt-1 text-100 text-fg-subtle">{foot}</p>
    </Link>
  );
}
