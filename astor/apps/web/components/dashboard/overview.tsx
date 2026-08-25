'use client';

import Link from 'next/link';
import { ArrowUpRight, Flame, Timer, GraduationCap, CalendarClock, Dumbbell } from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { fmt } from '@/components/finance/finance-view';
import { RUBRO_COLORS } from '@/components/finance/finance-charts';

const ACCENT = {
  productividad: '#3FA9B8',
  finanzas: '#7CC96A',
  conocimiento: '#9F8FEF',
  movimiento: '#FFBD76',
} as const;

export interface OverviewData {
  greetingWord: string;
  name: string;
  dateLabel: string;
  productivity: {
    tasksPending: number;
    habitsDone: number;
    habitsTotal: number;
    focusMin: number;
    focus: { title: string; doing: boolean; dueLabel: string | null; overdue: boolean }[];
  };
  finance: {
    expense: number;
    income: number;
    net: number;
    netWorth: number;
    trend: { label: string; expense: number; income: number }[];
    byCategory: { name: string; total: number }[];
    upcoming: { cardName: string; total: number; dueLabel: string; periodLabel: string }[];
  };
  knowledge: {
    weekHours: number;
    learnedTopics: number;
    activePrograms: number;
    weekly: { label: string; value: number }[];
    nextExam: { name: string; daysLeft: number; progress: number } | null;
  };
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`;
}

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

/** Anillo de progreso con conic-gradient (0-100). */
function Ring({ value, accent, children }: { value: number; accent: string; children: React.ReactNode }) {
  return (
    <div
      className="relative flex size-[92px] items-center justify-center rounded-full transition-[background] duration-700"
      style={{ background: `conic-gradient(${accent} ${value * 3.6}deg, var(--color-surface-overlay) 0deg)` }}
    >
      <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-surface-raised">
        {children}
      </div>
    </div>
  );
}

function Card({ children, className = '', delay = 0, accent }: { children: React.ReactNode; className?: string; delay?: number; accent?: string }) {
  return (
    <section
      className={`astor-rise group relative overflow-hidden rounded-xl border border-line-subtle bg-surface-raised transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{ animationDelay: `${delay}ms`, ['--accent' as string]: accent }}
      onMouseEnter={(e) => accent && (e.currentTarget.style.borderColor = `${accent}66`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      {children}
    </section>
  );
}

export function DashboardOverview({ data }: { data: OverviewData }) {
  const { productivity: p, finance: f, knowledge: k } = data;
  const habitPct = p.habitsTotal ? Math.round((p.habitsDone / p.habitsTotal) * 100) : 0;
  const donut = f.byCategory.slice(0, 8).map((c, i) => ({ name: c.name, value: c.total, color: RUBRO_COLORS[i % RUBRO_COLORS.length] ?? '#888' }));
  const weeklyMax = Math.max(1, ...k.weekly.map((w) => w.value));

  return (
    <div className="mx-auto max-w-[1240px]">
      <header className="astor-fade mb-7">
        <h1 className="text-800 font-bold tracking-[-0.02em] text-fg-default">
          {data.greetingWord}{data.name ? `, ${data.name}` : ''}.
        </h1>
        <p className="mt-1 text-300 capitalize text-fg-subtle">{data.dateLabel}</p>
      </header>

      {/* Hero tiles — una mirada por hub */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HubTile href="/productividad" accent={ACCENT.productividad} label="Productividad" icon={<Flame className="size-4" />} delay={0}
          value={`${p.tasksPending}`} unit="tareas pendientes"
          foot={`${p.habitsDone}/${p.habitsTotal} hábitos · ${p.focusMin} min foco`}>
          <div className="h-10" />
        </HubTile>

        <HubTile href="/finanzas" accent={ACCENT.finanzas} label="Finanzas" icon={<span className="text-300">$</span>} delay={70}
          value={money(f.expense)} unit="gasto del mes" foot={`Neto ${money(f.net)}`}>
          <MiniArea data={f.trend} color={ACCENT.finanzas} />
        </HubTile>

        <HubTile href="/conocimiento" accent={ACCENT.conocimiento} label="Conocimiento" icon={<GraduationCap className="size-4" />} delay={140}
          value={`${k.weekHours}h`} unit="esta semana" foot={`${k.learnedTopics} temas · ${k.activePrograms} programas`}>
          <MiniBars data={k.weekly} max={weeklyMax} color={ACCENT.conocimiento} />
        </HubTile>

        <HubTile href="/movimiento" accent={ACCENT.movimiento} label="Movimiento" icon={<Dumbbell className="size-4" />} delay={210}
          value="Pronto" unit="entrenos + recetas" foot="Próximamente">
          <div className="flex h-10 items-end gap-1 opacity-40">
            {[5, 8, 6, 10, 7, 9].map((h, i) => <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 3}px`, background: ACCENT.movimiento }} />)}
          </div>
        </HubTile>
      </div>

      {/* Fila principal: tendencia financiera + hoy (hábitos/foco) */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card delay={120} accent={ACCENT.finanzas} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-400 font-semibold text-fg-default">Flujo de los últimos 6 meses</h2>
              <p className="text-100 text-fg-subtlest">Patrimonio neto {money(f.netWorth)}</p>
            </div>
            <Link href="/finanzas/reportes" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              Reportes <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={f.trend} margin={{ left: -18, right: 6, top: 4 }}>
              <defs>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87168" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F87168" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT.finanzas} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ACCENT.finanzas} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-fg-subtlest)' }} />
              <YAxis hide />
              <Tooltip content={<ChartTip />} cursor={{ stroke: '#ffffff22' }} />
              <Area type="monotone" dataKey="income" name="Ingresos" stroke={ACCENT.finanzas} strokeWidth={2} fill="url(#gInc)" />
              <Area type="monotone" dataKey="expense" name="Gastos" stroke="#F87168" strokeWidth={2} fill="url(#gExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card delay={180} accent={ACCENT.productividad} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-400 font-semibold text-fg-default">Hoy</h2>
            <Link href="/productividad" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              Productividad <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Ring value={habitPct} accent={ACCENT.productividad}>
              <span className="text-500 font-bold text-fg-default">{habitPct}%</span>
              <span className="text-100 text-fg-subtlest">hábitos</span>
            </Ring>
            <div className="flex-1 space-y-3">
              <Metric icon={<Flame className="size-4" style={{ color: ACCENT.productividad }} />} label="Hábitos" value={`${p.habitsDone}/${p.habitsTotal}`} />
              <Metric icon={<Timer className="size-4" style={{ color: '#FFBD76' }} />} label="Foco hoy" value={`${p.focusMin} min`} />
              <Metric icon={<ArrowUpRight className="size-4 text-fg-subtle" />} label="Pendientes" value={`${p.tasksPending}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Fila: gastos por rubro + estudios */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card delay={220} accent={ACCENT.finanzas} className="p-5">
          <h2 className="mb-2 text-400 font-semibold text-fg-default">Gastos por rubro (6m)</h2>
          <div className="flex items-center gap-4">
            <div className="relative size-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTip />} />
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                    {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {donut.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-200">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 truncate text-fg-subtle">{d.name}</span>
                  <span className="tabular-nums text-fg-default">{fmt(d.value)}</span>
                </div>
              ))}
              {donut.length === 0 && <p className="text-200 text-fg-subtlest">Sin gastos aún.</p>}
            </div>
          </div>
        </Card>

        <Card delay={260} accent={ACCENT.conocimiento} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-400 font-semibold text-fg-default">Estudio de la semana</h2>
            <Link href="/conocimiento" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              Conocimiento <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={k.weekly} margin={{ left: -28, right: 4 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-fg-subtlest)' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#ffffff08' }} content={({ active, payload, label }: TipProps) =>
                active && payload?.length ? (
                  <div className="rounded-md border border-line-subtle bg-surface-overlay px-2.5 py-1.5 text-100 text-fg-default">{label}: {payload[0]?.value}h</div>
                ) : null} />
              <Bar dataKey="value" fill={ACCENT.conocimiento} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {k.nextExam ? (
            <div className="mt-3 rounded-lg border border-line-subtle bg-surface-overlay p-3">
              <div className="flex items-center justify-between">
                <span className="text-200 font-medium text-fg-default">{k.nextExam.name}</span>
                <span className="rounded-full px-2 py-0.5 text-100 font-semibold" style={{ background: `${ACCENT.conocimiento}22`, color: ACCENT.conocimiento }}>
                  {k.nextExam.daysLeft <= 0 ? 'hoy' : `${k.nextExam.daysLeft} días`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-base">
                <div className="h-full rounded-full" style={{ width: `${k.nextExam.progress}%`, background: ACCENT.conocimiento }} />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-200 text-fg-subtlest">Sin exámenes próximos.</p>
          )}
        </Card>
      </div>

      {/* Fila: foco de hoy + próximos vencimientos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card delay={300} accent={ACCENT.productividad}>
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <h2 className="text-400 font-semibold text-fg-default">Foco de hoy</h2>
            <Link href="/tasks" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              Tareas <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-line-subtle">
            {p.focus.length === 0 && <p className="px-5 py-8 text-center text-200 text-fg-subtlest">Nada urgente. Buen momento para lo importante.</p>}
            {p.focus.map((t, i) => (
              <Link key={i} href="/tasks" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-overlay">
                <span className="size-2 shrink-0 rounded-full" style={{ background: t.doing ? ACCENT.productividad : 'var(--color-fg-subtlest)' }} />
                <span className="min-w-0 flex-1 truncate text-300 text-fg-default">{t.title}</span>
                {t.dueLabel && <span className={`text-100 ${t.overdue ? 'text-danger-text' : 'text-fg-subtlest'}`}>{t.dueLabel}</span>}
              </Link>
            ))}
          </div>
        </Card>

        <Card delay={340} accent={ACCENT.finanzas}>
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <h2 className="flex items-center gap-2 text-400 font-semibold text-fg-default"><CalendarClock className="size-4" style={{ color: ACCENT.finanzas }} /> Próximos vencimientos</h2>
            <Link href="/finanzas/tarjetas" className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              Tarjetas <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-line-subtle">
            {f.upcoming.length === 0 && <p className="px-5 py-8 text-center text-200 text-fg-subtlest">Sin resúmenes por vencer.</p>}
            {f.upcoming.map((v, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-300 text-fg-default">{v.cardName}</p>
                  <p className="text-100 capitalize text-fg-subtlest">{v.periodLabel} · vence {v.dueLabel}</p>
                </div>
                <span className="tabular-nums text-300 font-semibold text-fg-default">{money(v.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HubTile({
  href, accent, label, icon, value, unit, foot, delay, children,
}: {
  href: string; accent: string; label: string; icon: React.ReactNode;
  value: string; unit: string; foot: string; delay: number; children: React.ReactNode;
}) {
  return (
    <Link href={href} className="astor-rise group relative block overflow-hidden rounded-xl border border-line-subtle bg-surface-raised p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}>
      <div className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: accent }} />
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${accent}22`, color: accent }}>{icon}</span>
        <span className="text-200 font-medium text-fg-subtle">{label}</span>
        <ArrowUpRight className="ml-auto size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="text-700 font-bold leading-none tracking-tight text-fg-default">{value}</p>
      <p className="mt-1 text-100 uppercase tracking-wide text-fg-subtlest">{unit}</p>
      {children}
      <p className="mt-1 text-100 text-fg-subtle">{foot}</p>
    </Link>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="flex-1 text-200 text-fg-subtle">{label}</span>
      <span className="text-300 font-semibold text-fg-default">{value}</span>
    </div>
  );
}

function MiniArea({ data, color }: { data: { label: string; expense: number }[]; color: string }) {
  return (
    <div className="mt-2 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id="miniExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="expense" stroke={color} strokeWidth={1.5} fill="url(#miniExp)" isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBars({ data, max, color }: { data: { label: string; value: number }[]; max: number; color: string }) {
  return (
    <div className="mt-2 flex h-10 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${Math.max(6, (d.value / max) * 40)}px`, background: `${color}${d.value ? 'cc' : '33'}` }} title={`${d.label}: ${d.value}h`} />
      ))}
    </div>
  );
}
