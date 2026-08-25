'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowLeft, FileDown } from 'lucide-react';
import type { SpendingReport } from '@astor/core';
import { Button } from '@/components/ui/button';
import { fmt } from './finance-view';
import { RUBRO_COLORS } from './finance-charts';

const DonutChart = dynamic(() => import('./finance-charts').then((m) => m.DonutChart), { ssr: false });
const TrendChart = dynamic(() => import('./finance-charts').then((m) => m.TrendChart), { ssr: false });

const RANGES = [3, 6, 12];
const monthLabel = (m: string) => DateTime.fromISO(`${m}-01`).setLocale('es').toFormat('LLL');

export function ReportesView({
  report,
  months,
  mep,
}: {
  report: SpendingReport;
  months: number;
  mep: number | null;
}) {
  const router = useRouter();
  const donutData = report.byCategory.slice(0, 12).map((c, i) => ({ name: c.name, value: c.total, color: RUBRO_COLORS[i % RUBRO_COLORS.length] ?? '#888888' }));
  const trendData = report.byMonth.map((m) => ({ label: monthLabel(m.month), expense: m.expense, income: m.income }));
  const maxConcept = Math.max(1, ...report.topConcepts.map((c) => c.total));
  const rangeLabel = `${monthLabel(report.byMonth[0]?.month ?? '')} – ${monthLabel(report.byMonth[report.byMonth.length - 1]?.month ?? '')}`;

  return (
    <div id="print-report" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/finanzas" className="mb-3 inline-flex items-center gap-1.5 text-200 text-fg-subtle transition-colors hover:text-fg-default print:hidden">
            <ArrowLeft className="size-4" /> Finanzas
          </Link>
          <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Reportes de gastos</h1>
          <p className="text-200 text-fg-subtle capitalize">{rangeLabel} · {report.count} movimientos</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <div className="inline-flex rounded-md border border-line-subtle p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => router.push(`/finanzas/reportes?meses=${r}`)}
                className={`rounded px-3 py-1 text-200 font-medium transition-colors ${months === r ? 'bg-surface-overlay text-fg-default' : 'text-fg-subtle hover:text-fg-default'}`}
              >
                {r}m
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <FileDown className="size-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Gastos" value={fmt(report.totalExpense)} accent="#F87168" />
        <Stat label="Ingresos" value={fmt(report.totalIncome)} accent="#7CC96A" />
        <Stat label="Neto" value={fmt(report.totalIncome - report.totalExpense)} accent="#3FA9B8" />
        <Stat label={`Gasto/mes (${months}m)`} value={fmt(report.totalExpense / months)} accent="#FFBD76" />
      </div>

      <section className="print-surface rounded-lg border border-line-subtle bg-surface-raised p-4">
        <h2 className="mb-3 text-300 font-semibold text-fg-default">Tendencia mensual</h2>
        <TrendChart data={trendData} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="print-surface rounded-lg border border-line-subtle bg-surface-raised p-4">
          <h2 className="mb-1 text-300 font-semibold text-fg-default">Por rubro</h2>
          <DonutChart data={donutData} />
          <div className="mt-3 flex flex-col gap-1.5">
            {report.byCategory.slice(0, 8).map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-200">
                <span className="size-2.5 rounded-full" style={{ background: RUBRO_COLORS[i % RUBRO_COLORS.length] }} />
                <span className="flex-1 text-fg-subtle">{c.name}</span>
                <span className="tabular-nums text-fg-default">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="print-surface rounded-lg border border-line-subtle bg-surface-raised p-4">
          <h2 className="mb-3 text-300 font-semibold text-fg-default">Top conceptos (repetidos)</h2>
          <div className="flex flex-col gap-2.5">
            {report.topConcepts.length === 0 && <p className="text-200 text-fg-subtlest">Sin gastos en el período.</p>}
            {report.topConcepts.map((c) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-200 capitalize text-fg-default">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-200 text-fg-default">{fmt(c.total)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                    <div className="h-full rounded-full bg-signature-default" style={{ width: `${(c.total / maxConcept) * 100}%` }} />
                  </div>
                  <span className="shrink-0 text-100 text-fg-subtlest">{c.count}×</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {mep && (
        <p className="text-100 text-fg-subtlest print:hidden">Referencia dólar MEP ${mep.toLocaleString('es-AR')}.</p>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="print-surface rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</span>
        <span className="size-2.5 rounded-full" style={{ background: accent }} />
      </div>
      <p className="text-500 font-bold tracking-tight text-fg-default">{value}</p>
    </div>
  );
}
