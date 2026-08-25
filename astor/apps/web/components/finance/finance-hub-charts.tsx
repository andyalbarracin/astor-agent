'use client';

import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell,
} from 'recharts';
import { fmt } from './finance-view';
import { RUBRO_COLORS } from './finance-charts';

const ACCENT = '#7CC96A';
const money = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

type TipEntry = { name?: string; value?: number; color?: string; fill?: string };
type TipProps = { active?: boolean; payload?: TipEntry[]; label?: string | number };

function ChartTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line-subtle bg-surface-overlay px-3 py-2 text-100 shadow-raised">
      {label != null && <p className="mb-1 font-medium capitalize text-fg-default">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-fg-subtle">
          <span className="size-2 rounded-full" style={{ background: p.color ?? p.fill }} />
          {p.name}: <span className="tabular-nums text-fg-default">{money(p.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export function FinanceHubCharts({
  trend,
  donut,
}: {
  trend: { label: string; expense: number; income: number }[];
  donut: { name: string; total: number }[];
}) {
  const pie = donut.map((c, i) => ({ name: c.name, value: c.total, color: RUBRO_COLORS[i % RUBRO_COLORS.length] ?? '#888' }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="astor-rise rounded-xl border border-line-subtle bg-surface-raised p-5">
        <h2 className="mb-4 text-400 font-semibold text-fg-default">Flujo de los últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={trend} margin={{ left: -18, right: 6, top: 4 }}>
            <defs>
              <linearGradient id="fhExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87168" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F87168" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fhInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-fg-subtlest)' }} />
            <YAxis hide />
            <Tooltip content={<ChartTip />} cursor={{ stroke: '#ffffff22' }} />
            <Area type="monotone" dataKey="income" name="Ingresos" stroke={ACCENT} strokeWidth={2} fill="url(#fhInc)" />
            <Area type="monotone" dataKey="expense" name="Gastos" stroke="#F87168" strokeWidth={2} fill="url(#fhExp)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="astor-rise rounded-xl border border-line-subtle bg-surface-raised p-5" style={{ animationDelay: '60ms' }}>
        <h2 className="mb-2 text-400 font-semibold text-fg-default">Gastos por rubro (6m)</h2>
        <div className="flex items-center gap-4">
          <div className="relative size-[150px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTip />} />
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                  {pie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {pie.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-200">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="flex-1 truncate text-fg-subtle">{d.name}</span>
                <span className="tabular-nums text-fg-default">{fmt(d.value)}</span>
              </div>
            ))}
            {pie.length === 0 && <p className="text-200 text-fg-subtlest">Sin gastos aún.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
