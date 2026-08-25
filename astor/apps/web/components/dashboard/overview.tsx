'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUpRight, Flame, Timer, GraduationCap, Dumbbell, GripVertical, X, Plus,
} from 'lucide-react';
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

const LS_KEY = 'astor-dashboard-layout';

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

function Ring({ value, accent, children }: { value: number; accent: string; children: ReactNode }) {
  return (
    <div
      className="relative flex size-[92px] items-center justify-center rounded-full transition-[background] duration-700"
      style={{ background: `conic-gradient(${accent} ${value * 3.6}deg, var(--color-surface-overlay) 0deg)` }}
    >
      <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-surface-raised">{children}</div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="flex-1 text-200 text-fg-subtle">{label}</span>
      <span className="text-300 font-semibold text-fg-default">{value}</span>
    </div>
  );
}

// ── Registro de widgets ────────────────────────────────────────────────────
interface WidgetDef {
  title: string;
  href?: string;
  hrefLabel?: string;
  body: (d: OverviewData) => ReactNode;
}

const WIDGETS: Record<string, WidgetDef> = {
  financeTrend: {
    title: 'Flujo · últimos 6 meses',
    href: '/finanzas/reportes',
    hrefLabel: 'Reportes',
    body: (d) => (
      <>
        <p className="mb-3 text-100 text-fg-subtlest">Patrimonio neto {money(d.finance.netWorth)}</p>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={d.finance.trend} margin={{ left: -18, right: 6, top: 4 }}>
            <defs>
              <linearGradient id="dExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87168" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F87168" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT.finanzas} stopOpacity={0.3} />
                <stop offset="100%" stopColor={ACCENT.finanzas} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-fg-subtlest)' }} />
            <YAxis hide />
            <Tooltip content={<ChartTip />} cursor={{ stroke: '#ffffff22' }} />
            <Area type="monotone" dataKey="income" name="Ingresos" stroke={ACCENT.finanzas} strokeWidth={2} fill="url(#dInc)" />
            <Area type="monotone" dataKey="expense" name="Gastos" stroke="#F87168" strokeWidth={2} fill="url(#dExp)" />
          </AreaChart>
        </ResponsiveContainer>
      </>
    ),
  },
  today: {
    title: 'Hoy',
    href: '/productividad',
    hrefLabel: 'Productividad',
    body: (d) => {
      const pct = d.productivity.habitsTotal ? Math.round((d.productivity.habitsDone / d.productivity.habitsTotal) * 100) : 0;
      return (
        <div className="flex items-center gap-5">
          <Ring value={pct} accent={ACCENT.productividad}>
            <span className="text-500 font-bold text-fg-default">{pct}%</span>
            <span className="text-100 text-fg-subtlest">hábitos</span>
          </Ring>
          <div className="flex-1 space-y-3">
            <Metric icon={<Flame className="size-4" style={{ color: ACCENT.productividad }} />} label="Hábitos" value={`${d.productivity.habitsDone}/${d.productivity.habitsTotal}`} />
            <Metric icon={<Timer className="size-4" style={{ color: '#FFBD76' }} />} label="Foco hoy" value={`${d.productivity.focusMin} min`} />
            <Metric icon={<ArrowUpRight className="size-4 text-fg-subtle" />} label="Pendientes" value={`${d.productivity.tasksPending}`} />
          </div>
        </div>
      );
    },
  },
  rubroDonut: {
    title: 'Gastos por rubro · 6m',
    body: (d) => {
      const donut = d.finance.byCategory.slice(0, 8).map((c, i) => ({ name: c.name, value: c.total, color: RUBRO_COLORS[i % RUBRO_COLORS.length] ?? '#888' }));
      return (
        <div className="flex items-center gap-4">
          <div className="relative size-[150px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTip />} />
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                  {donut.map((x, i) => <Cell key={i} fill={x.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {donut.slice(0, 6).map((x) => (
              <div key={x.name} className="flex items-center gap-2 text-200">
                <span className="size-2.5 rounded-full" style={{ background: x.color }} />
                <span className="flex-1 truncate text-fg-subtle">{x.name}</span>
                <span className="tabular-nums text-fg-default">{fmt(x.value)}</span>
              </div>
            ))}
            {donut.length === 0 && <p className="text-200 text-fg-subtlest">Sin gastos aún.</p>}
          </div>
        </div>
      );
    },
  },
  studyWeek: {
    title: 'Estudio de la semana',
    href: '/conocimiento',
    hrefLabel: 'Conocimiento',
    body: (d) => (
      <>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={d.knowledge.weekly} margin={{ left: -28, right: 4 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-fg-subtlest)' }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#ffffff08' }} content={({ active, payload, label }: TipProps) =>
              active && payload?.length ? (
                <div className="rounded-md border border-line-subtle bg-surface-overlay px-2.5 py-1.5 text-100 text-fg-default">{label}: {payload[0]?.value}h</div>
              ) : null} />
            <Bar dataKey="value" fill={ACCENT.conocimiento} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {d.knowledge.nextExam ? (
          <div className="mt-3 rounded-lg border border-line-subtle bg-surface-overlay p-3">
            <div className="flex items-center justify-between">
              <span className="text-200 font-medium text-fg-default">{d.knowledge.nextExam.name}</span>
              <span className="rounded-full px-2 py-0.5 text-100 font-semibold" style={{ background: `${ACCENT.conocimiento}22`, color: ACCENT.conocimiento }}>
                {d.knowledge.nextExam.daysLeft <= 0 ? 'hoy' : `${d.knowledge.nextExam.daysLeft} días`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-base">
              <div className="h-full rounded-full" style={{ width: `${d.knowledge.nextExam.progress}%`, background: ACCENT.conocimiento }} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-200 text-fg-subtlest">Sin exámenes próximos.</p>
        )}
      </>
    ),
  },
  focusTasks: {
    title: 'Foco de hoy',
    href: '/tasks',
    hrefLabel: 'Tareas',
    body: (d) => (
      <div className="-mx-5 -mb-1 divide-y divide-line-subtle border-t border-line-subtle">
        {d.productivity.focus.length === 0 && <p className="px-5 py-6 text-center text-200 text-fg-subtlest">Nada urgente. Buen momento para lo importante.</p>}
        {d.productivity.focus.map((t, i) => (
          <Link key={i} href="/tasks" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-overlay">
            <span className="size-2 shrink-0 rounded-full" style={{ background: t.doing ? ACCENT.productividad : 'var(--color-fg-subtlest)' }} />
            <span className="min-w-0 flex-1 truncate text-300 text-fg-default">{t.title}</span>
            {t.dueLabel && <span className={`text-100 ${t.overdue ? 'text-danger-text' : 'text-fg-subtlest'}`}>{t.dueLabel}</span>}
          </Link>
        ))}
      </div>
    ),
  },
  upcomingInvoices: {
    title: 'Próximos vencimientos',
    href: '/finanzas/tarjetas',
    hrefLabel: 'Tarjetas',
    body: (d) => (
      <div className="-mx-5 -mb-1 divide-y divide-line-subtle border-t border-line-subtle">
        {d.finance.upcoming.length === 0 && <p className="px-5 py-6 text-center text-200 text-fg-subtlest">Sin resúmenes por vencer.</p>}
        {d.finance.upcoming.map((v, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-300 text-fg-default">{v.cardName}</p>
              <p className="text-100 capitalize text-fg-subtlest">{v.periodLabel} · vence {v.dueLabel}</p>
            </div>
            <span className="tabular-nums text-300 font-semibold text-fg-default">{money(v.total)}</span>
          </div>
        ))}
      </div>
    ),
  },
};

const ALL_KEYS = Object.keys(WIDGETS);

function sanitize(keys: unknown): string[] {
  if (!Array.isArray(keys)) return ALL_KEYS;
  const valid = keys.filter((k): k is string => typeof k === 'string' && k in WIDGETS);
  return valid.length ? Array.from(new Set(valid)) : ALL_KEYS;
}

export function DashboardOverview({ data }: { data: OverviewData }) {
  const { productivity: p, finance: f, knowledge: k } = data;
  const [layout, setLayout] = useState<string[]>(ALL_KEYS);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setLayout(sanitize(JSON.parse(raw)));
    } catch { /* default */ }
    setMounted(true);
  }, []);

  function persist(next: string[]) {
    setLayout(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    persist(arrayMove(layout, layout.indexOf(String(active.id)), layout.indexOf(String(over.id))));
  }
  const hidden = ALL_KEYS.filter((key) => !layout.includes(key));

  return (
    <div className="mx-auto max-w-[1240px]">
      <header className="astor-fade mb-7">
        <h1 className="text-800 font-bold tracking-[-0.02em] text-fg-default">
          {data.greetingWord}{data.name ? `, ${data.name}` : ''}.
        </h1>
        <p className="mt-1 text-300 capitalize text-fg-subtle">{data.dateLabel}</p>
      </header>

      {/* Hero tiles por hub (fijos) */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HubTile href="/productividad" accent={ACCENT.productividad} label="Productividad" icon={<Flame className="size-4" />} delay={0}
          value={`${p.tasksPending}`} unit="tareas pendientes" foot={`${p.habitsDone}/${p.habitsTotal} hábitos · ${p.focusMin} min foco`} />
        <HubTile href="/finanzas" accent={ACCENT.finanzas} label="Finanzas" icon={<span className="text-300">$</span>} delay={70}
          value={money(f.expense)} unit="gasto del mes" foot={`Neto ${money(f.net)}`} />
        <HubTile href="/conocimiento" accent={ACCENT.conocimiento} label="Conocimiento" icon={<GraduationCap className="size-4" />} delay={140}
          value={`${k.weekHours}h`} unit="esta semana" foot={`${k.learnedTopics} temas · ${k.activePrograms} programas`} />
        <HubTile href="/movimiento" accent={ACCENT.movimiento} label="Movimiento" icon={<Dumbbell className="size-4" />} delay={210}
          value="Pronto" unit="entrenos + recetas" foot="Próximamente" />
      </div>

      {/* Widgets personalizables */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={layout} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {layout.map((key) => (
              <WidgetCard key={key} id={key} def={WIDGETS[key]!} data={data} onRemove={() => persist(layout.filter((x) => x !== key))} draggable={mounted} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Agregar widget */}
      <div className="relative mt-4">
        <button
          onClick={() => setAdding((a) => !a)}
          disabled={hidden.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-default bg-surface-raised/40 py-3.5 text-200 font-medium text-fg-subtle backdrop-blur transition-colors hover:bg-surface-raised/70 hover:text-fg-default disabled:opacity-40"
        >
          <Plus className="size-4" /> {hidden.length === 0 ? 'Todos los widgets agregados' : 'Agregar widget'}
        </button>
        {adding && hidden.length > 0 && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 rounded-xl border border-line-subtle bg-surface-overlay p-2 shadow-raised">
            {hidden.map((key) => (
              <button
                key={key}
                onClick={() => { persist([...layout, key]); setAdding(false); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-200 text-fg-subtle transition-colors hover:bg-surface-raised hover:text-fg-default"
              >
                <Plus className="size-3.5" /> {WIDGETS[key]!.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetCard({ id, def, data, onRemove, draggable }: { id: string; def: WidgetDef; data: OverviewData; onRemove: () => void; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`astor-rise group relative overflow-hidden rounded-xl border border-line-subtle bg-surface-raised p-5 ${isDragging ? 'z-20 opacity-80 shadow-raised' : ''}`}
    >
      <div className="mb-4 flex items-center gap-2">
        {draggable && (
          <button {...attributes} {...listeners} aria-label="Reordenar" className="cursor-grab touch-none rounded p-0.5 text-fg-subtlest opacity-0 transition-opacity hover:text-fg-default group-hover:opacity-100 active:cursor-grabbing">
            <GripVertical className="size-4" />
          </button>
        )}
        <h2 className="text-400 font-semibold text-fg-default">{def.title}</h2>
        <div className="ml-auto flex items-center gap-1">
          {def.href && (
            <Link href={def.href} className="inline-flex items-center gap-1 text-200 text-fg-subtle transition-colors hover:text-fg-default">
              {def.hrefLabel} <ArrowUpRight className="size-3.5" />
            </Link>
          )}
          <button onClick={onRemove} aria-label="Quitar widget" className="rounded p-1 text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100">
            <X className="size-3.5" />
          </button>
        </div>
      </div>
      {def.body(data)}
    </section>
  );
}

function HubTile({
  href, accent, label, icon, value, unit, foot, delay,
}: {
  href: string; accent: string; label: string; icon: ReactNode;
  value: string; unit: string; foot: string; delay: number;
}) {
  return (
    <Link href={href} className="astor-rise group relative block overflow-hidden rounded-xl border border-line-subtle bg-surface-raised p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: accent }} />
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${accent}22`, color: accent }}>{icon}</span>
        <span className="text-200 font-medium text-fg-subtle">{label}</span>
        <ArrowUpRight className="ml-auto size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="text-700 font-bold leading-none tracking-tight text-fg-default">{value}</p>
      <p className="mt-1 text-100 uppercase tracking-wide text-fg-subtlest">{unit}</p>
      <p className="mt-2 text-100 text-fg-subtle">{foot}</p>
    </Link>
  );
}
