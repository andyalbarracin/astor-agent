'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Wallet, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import type { NetWorthItem, NetWorthKind, NetWorthSummary } from '@astor/core';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fmt } from './finance-view';
import {
  createNetWorthItemAction,
  deleteNetWorthItemAction,
} from '@/app/actions/finance';

export function PatrimonioView({
  summary,
  monthFlow,
}: {
  summary: NetWorthSummary;
  monthFlow: { income: number; expense: number };
}) {
  const flow = monthFlow.income - monthFlow.expense;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/finanzas" className="mb-3 inline-flex items-center gap-1.5 text-200 text-fg-subtle transition-colors hover:text-fg-default">
          <ArrowLeft className="size-4" /> Finanzas
        </Link>
        <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Estado financiero</h1>
        <p className="text-200 text-fg-subtle">Activos, pasivos y patrimonio (USD convertido a blue ${summary.blueRate.toLocaleString('es-AR')}).</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg p-4 text-[#04140c] shadow-raised" style={{ background: 'linear-gradient(135deg, #9EE6A8 0%, #6FC58A 55%, #4FA372 100%)' }}>
          <p className="text-100 font-medium uppercase tracking-wide opacity-70">Patrimonio neto</p>
          <p className="mt-1 text-600 font-bold tracking-tight">{fmt(summary.net)}</p>
        </div>
        <Card label="Activos" value={fmt(summary.assetsTotal)} icon={Wallet} color="#3FA9B8" />
        <Card label="Pasivos" value={fmt(summary.liabilitiesTotal)} icon={TrendingDown} color="#F87168" />
        <Card label="Flujo del mes" value={fmt(flow)} icon={Wallet} color={flow >= 0 ? '#7CC96A' : '#F87168'} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Column kind="asset" title="Activos" items={summary.items.filter((i) => i.kind === 'asset')} accent="#3FA9B8" />
        <Column kind="liability" title="Pasivos" items={summary.items.filter((i) => i.kind === 'liability')} accent="#F87168" />
      </div>
    </div>
  );
}

function Card({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Wallet; color: string }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-100 uppercase tracking-wide text-fg-subtlest">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${color}22`, color }}><Icon size={15} /></span>
      </div>
      <p className="text-500 font-bold tracking-tight text-fg-default">{value}</p>
    </div>
  );
}

function Column({ kind, title, items, accent }: { kind: NetWorthKind; title: string; items: NetWorthItem[]; accent: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [group, setGroup] = useState('');

  const groups = new Map<string, NetWorthItem[]>();
  for (const i of items) {
    const arr = groups.get(i.group_name) ?? [];
    arr.push(i);
    groups.set(i.group_name, arr);
  }

  function fire(p: Promise<{ ok: boolean; error?: string }>) {
    start(async () => {
      const r = await p;
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }
  function add() {
    const amt = Number(amount);
    if (!name.trim() || !amt) return;
    fire(createNetWorthItemAction({ kind, name: name.trim(), amount: amt, groupName: group.trim() || 'Otros' }));
    setName(''); setAmount(''); setGroup('');
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
      <div className="h-1" style={{ background: accent }} />
      <div className="border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">{title}</div>
      <div className="flex flex-col gap-4 p-4">
        {[...groups.entries()].map(([g, gi]) => (
          <div key={g}>
            <p className="mb-1 text-100 font-medium uppercase tracking-wide text-fg-subtlest">{g}</p>
            {gi.map((i) => (
              <div key={i.id} className="group flex items-center gap-2 py-1.5">
                <span className="flex-1 text-300 text-fg-default">{i.name}</span>
                <span className="tabular-nums text-300 text-fg-subtle">
                  {i.currency === 'USD' ? `US$ ${Number(i.amount).toLocaleString('es-AR')}` : fmt(Number(i.amount))}
                </span>
                <button onClick={() => fire(deleteNetWorthItemAction(i.id))} className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
        {items.length === 0 && <p className="text-200 text-fg-subtlest">Sin ítems.</p>}

        <div className="flex flex-col gap-2 border-t border-line-subtle pt-3">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="h-8 flex-1" />
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Monto" className="h-8 w-28" />
          </div>
          <div className="flex gap-2">
            <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Grupo (ej. Inversiones)" className="h-8 flex-1" />
            <button onClick={add} disabled={!name.trim() || !Number(amount)} className={cn('flex size-8 items-center justify-center rounded-md text-fg-inverse disabled:opacity-40')} style={{ background: accent }}>
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
