'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction, FinanceCategory, Account, FinanceReport } from '@astor/core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from './add-transaction-dialog';
import { ImportDialog } from './import-dialog';
import { RUBRO_COLORS } from './finance-charts';
import { deleteTransactionAction } from '@/app/actions/finance';

const DonutChart = dynamic(() => import('./finance-charts').then((m) => m.DonutChart), {
  ssr: false,
  loading: () => <div className="h-[190px]" />,
});

export function fmt(n: number): string {
  return `$ ${Math.round(n).toLocaleString('es-AR')}`;
}

export function FinanceView({
  month,
  transactions,
  categories,
  accounts,
  report,
  fxMep,
  timezone,
}: {
  month: string;
  transactions: Transaction[];
  categories: FinanceCategory[];
  accounts: Account[];
  report: FinanceReport;
  fxMep: number | null;
  timezone: string;
}) {
  const router = useRouter();
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const monthLabel = DateTime.fromISO(`${month}-01`).setLocale('es-AR').toFormat('LLLL yyyy');

  function goMonth(delta: number) {
    const m = DateTime.fromISO(`${month}-01`).plus({ months: delta }).toFormat('yyyy-MM');
    router.push(`/finanzas?month=${m}`);
  }
  function del(id: string) {
    deleteTransactionAction(id).then((r) => {
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  const maxAcc = Math.max(1, ...report.byAccount.map((a) => a.total));
  const donutData = report.byCategory.map((c, i) => ({
    name: c.name,
    value: c.total,
    color: RUBRO_COLORS[i % RUBRO_COLORS.length]!,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => goMonth(-1)} className="rounded-md p-1.5 text-fg-subtle hover:bg-surface-overlay">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="min-w-[160px] text-center text-600 font-bold capitalize tracking-tight text-fg-default">{monthLabel}</h1>
          <button onClick={() => goMonth(1)} className="rounded-md p-1.5 text-fg-subtle hover:bg-surface-overlay">
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {fxMep && (
            <span className="hidden items-center gap-1 rounded-md border border-line-subtle px-2.5 py-1.5 text-100 text-fg-subtle sm:inline-flex">
              <TrendingUp className="size-3.5 text-success-default" /> MEP ${fxMep.toLocaleString('es-AR')}
            </span>
          )}
          <Button asChild variant="secondary" size="sm">
            <Link href="/finanzas/tarjetas">Tarjetas</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/finanzas/patrimonio">Patrimonio</Link>
          </Button>
          <ImportDialog categories={categories} accounts={accounts} />
          <AddTransactionDialog categories={categories} accounts={accounts} timezone={timezone} defaultMonth={month} />
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Gastos del mes" value={fmt(report.totalExpense)} sub={fxMep ? `≈ US$ ${Math.round(report.totalExpense / fxMep).toLocaleString('es-AR')}` : undefined} tone="danger" hero />
        <Stat label="Ingresos" value={fmt(report.totalIncome)} tone="success" />
        <Stat label="Neto" value={fmt(report.net)} tone={report.net >= 0 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Registro */}
        <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
          <div className="border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">
            Movimientos <span className="text-fg-subtlest">({report.count})</span>
          </div>
          <div className="divide-y divide-line-subtle">
            {transactions.length === 0 && <p className="px-4 py-8 text-center text-200 text-fg-subtlest">Sin movimientos este mes.</p>}
            {transactions.map((t) => {
              const cat = t.category_id ? catMap.get(t.category_id) : undefined;
              const acc = t.account_id ? accMap.get(t.account_id) : undefined;
              return (
                <div key={t.id} className="group flex items-center gap-3 px-4 py-2.5">
                  <span className="w-12 shrink-0 text-100 tabular-nums text-fg-subtlest">
                    {DateTime.fromISO(t.occurred_on).toFormat('dd/MM')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-300 text-fg-default">{t.description}</p>
                    <div className="flex items-center gap-2 text-100 text-fg-subtlest">
                      {cat && (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full" style={{ background: cat.color ?? 'var(--color-brand-default)' }} />
                          {cat.name}
                        </span>
                      )}
                      {acc && <span>· {acc.name}</span>}
                      {t.source === 'import' && <span className="text-discovery-text">· csv</span>}
                    </div>
                  </div>
                  <span className={cn('shrink-0 tabular-nums text-300 font-medium', t.kind === 'income' ? 'text-success-text' : 'text-fg-default')}>
                    {t.kind === 'income' ? '+' : '−'}{fmt(Number(t.amount))}
                  </span>
                  <button onClick={() => del(t.id)} className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100">
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reportes: donut por rubro + barras por forma de pago */}
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
            <h3 className="mb-2 text-300 font-semibold text-fg-default">Por rubro</h3>
            {donutData.length === 0 ? (
              <p className="py-8 text-center text-200 text-fg-subtlest">Sin datos.</p>
            ) : (
              <>
                <DonutChart data={donutData} />
                <div className="mt-3 flex flex-col gap-1.5">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-100">
                      <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                      <span className="flex-1 text-fg-subtle">{d.name}</span>
                      <span className="tabular-nums text-fg-default">{fmt(d.value)}</span>
                      <span className="w-9 text-right tabular-nums text-fg-subtlest">
                        {report.totalExpense ? Math.round((d.value / report.totalExpense) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <Pivot title="Por forma de pago" rows={report.byAccount} max={maxAcc} total={report.totalExpense} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone, hero }: { label: string; value: string; sub?: string; tone: 'danger' | 'success'; hero?: boolean }) {
  if (hero) {
    return (
      <div className="rounded-lg p-4 text-[#1a1204] shadow-raised" style={{ background: 'linear-gradient(135deg, #FFC98A 0%, #F0A85E 55%, #E88A63 100%)' }}>
        <p className="text-100 font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="mt-1 text-500 font-bold tracking-tight">{value}</p>
        {sub && <p className="text-100 opacity-70">{sub}</p>}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
      <p className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</p>
      <p className={cn('mt-1 text-500 font-bold tracking-tight', tone === 'success' ? 'text-success-text' : 'text-fg-default')}>{value}</p>
      {sub && <p className="text-100 text-fg-subtlest">{sub}</p>}
    </div>
  );
}

function Pivot({ title, rows, max, total }: { title: string; rows: { name: string; total: number }[]; max: number; total: number }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-300 font-semibold text-fg-default">{title}</h3>
        <span className="text-100 text-fg-subtlest">{fmt(total)}</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.length === 0 && <p className="text-200 text-fg-subtlest">Sin datos.</p>}
        {rows.map((r) => (
          <div key={r.name}>
            <div className="mb-1 flex items-center justify-between text-100">
              <span className="text-fg-subtle">{r.name}</span>
              <span className="tabular-nums text-fg-default">{fmt(r.total)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-brand-default" style={{ width: `${(r.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
