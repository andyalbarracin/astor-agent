'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, type TooltipProps } from 'recharts';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line-subtle bg-surface-overlay px-2.5 py-1.5 text-100 shadow-overlay">
      <p className="font-medium text-fg-default">{label}</p>
      <p className="text-fg-subtle">
        <span className="tabular-nums text-signature-text">{payload[0]?.value}</span> completados
      </p>
    </div>
  );
}

export function ConsistencyChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="astorAmber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-signature-default)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--color-signature-default)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--color-text-subtlest)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border-default)' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-signature-default)"
          strokeWidth={2}
          fill="url(#astorAmber)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
