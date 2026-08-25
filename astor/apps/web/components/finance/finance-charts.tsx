'use client';

import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip, CartesianGrid,
} from 'recharts';

export const RUBRO_COLORS = [
  '#FFBD76', '#3FA9B8', '#7CC96A', '#9F8FEF', '#F87168', '#F5CD47', '#6FC5D4', '#C99BEC',
  '#5FA3D8', '#E8996B', '#8FD4A0', '#D98FC0',
];

export function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">Gastos</span>
        <span className="text-500 font-bold tracking-tight text-fg-default">
          ${Math.round(total).toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  );
}

export function TrendChart({ data }: { data: { label: string; expense: number; income: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid vertical={false} stroke="var(--color-line-subtle, #ffffff14)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-fg-subtlest, #8a8a8a)' }} />
        <Tooltip
          cursor={{ fill: '#ffffff08' }}
          contentStyle={{ background: 'var(--color-surface-overlay, #1c2830)', border: '1px solid var(--color-line-subtle, #ffffff14)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => `$${Math.round(v).toLocaleString('es-AR')}`}
        />
        <Bar dataKey="income" name="Ingresos" fill="#7CC96A" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" name="Gastos" fill="#F87168" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
