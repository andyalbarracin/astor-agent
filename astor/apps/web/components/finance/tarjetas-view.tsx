'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { ArrowLeft, Plus, CreditCard as CardIcon, CalendarClock, Scale } from 'lucide-react';
import { toast } from 'sonner';
import type { CreditCard, PlanWithProgress, InvoiceWithCard } from '@astor/core';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fmt } from './finance-view';
import { createCreditCardAction, createInstallmentPlanAction } from '@/app/actions/finance';

const dLabel = (iso: string) => DateTime.fromISO(iso).setLocale('es').toFormat('dd LLL yyyy');
const mLabel = (iso: string) => DateTime.fromISO(iso).setLocale('es').toFormat('LLLL yyyy');

export function TarjetasView({
  cards,
  plans,
  invoices,
  inflacion,
}: {
  cards: CreditCard[];
  plans: PlanWithProgress[];
  invoices: InvoiceWithCard[];
  inflacion: number | null;
}) {
  const today = DateTime.now().startOf('day');
  const upcoming = invoices.filter((v) => DateTime.fromISO(v.due_date) >= today.minus({ days: 1 }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/finanzas" className="mb-3 inline-flex items-center gap-1.5 text-200 text-fg-subtle transition-colors hover:text-fg-default">
            <ArrowLeft className="size-4" /> Finanzas
          </Link>
          <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Tarjetas y cuotas</h1>
          <p className="text-200 text-fg-subtle">
            Cargás el total una vez y se reparte en resúmenes por cierre/vencimiento.
            {inflacion != null && <> Inflación de referencia: <span className="text-fg-default">{inflacion}% mensual</span>.</>}
          </p>
        </div>
        <NewPlanDialog cards={cards} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Próximos vencimientos */}
        <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
          <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">
            <CalendarClock className="size-4 text-signature-default" /> Próximos vencimientos
          </div>
          <div className="flex flex-col divide-y divide-line-subtle">
            {upcoming.length === 0 && <p className="px-4 py-6 text-200 text-fg-subtlest">Sin resúmenes por vencer.</p>}
            {upcoming.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-300 font-medium text-fg-default">{v.cardName}</p>
                  <p className="text-100 text-fg-subtlest capitalize">{mLabel(v.period)} · vence {dLabel(v.due_date)}</p>
                </div>
                <span className="tabular-nums text-400 font-semibold text-fg-default">{fmt(Number(v.total))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planes de cuotas */}
        <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
          <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">
            <CardIcon className="size-4 text-signature-default" /> Planes de cuotas
          </div>
          <div className="flex flex-col divide-y divide-line-subtle">
            {plans.length === 0 && <p className="px-4 py-6 text-200 text-fg-subtlest">Todavía no cargaste planes.</p>}
            {plans.map((p) => {
              const pct = p.totalCount ? Math.round((p.paidCount / p.totalCount) * 100) : 0;
              return (
                <div key={p.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-300 font-medium text-fg-default">{p.description}</p>
                    <span className="tabular-nums text-300 text-fg-subtle">{fmt(Number(p.total_amount))}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-100 text-fg-subtlest">
                    <span>{p.paidCount}/{p.totalCount} cuotas · resta {fmt(p.remaining)}</span>
                    <span>{p.installments_count} cuotas</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                    <div className="h-full rounded-full bg-signature-default" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tarjetas + calculadora */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CardsPanel cards={cards} />
        <ContadoVsCuotas inflacion={inflacion} />
      </div>
    </div>
  );
}

function CardsPanel({ cards }: { cards: CreditCard[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [closing, setClosing] = useState('');
  const [due, setDue] = useState('');

  function add() {
    const cd = Number(closing);
    const dd = Number(due);
    if (!name.trim() || !cd || !dd) return;
    start(async () => {
      const r = await createCreditCardAction({ name: name.trim(), bank: bank.trim() || null, closingDay: cd, dueDay: dd });
      if (r.ok) { setName(''); setBank(''); setClosing(''); setDue(''); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
      <div className="border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">Tarjetas</div>
      <div className="flex flex-col gap-3 p-4">
        {cards.map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div>
              <p className="text-300 font-medium text-fg-default">{c.name}</p>
              <p className="text-100 text-fg-subtlest">{c.bank ?? 'Sin banco'} · cierre {c.closing_day} · vence {c.due_day}</p>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-200 text-fg-subtlest">Agregá tu primera tarjeta.</p>}

        <div className="flex flex-col gap-2 border-t border-line-subtle pt-3">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (Visa Galicia)" className="h-8 flex-1" />
            <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Banco" className="h-8 w-28" />
          </div>
          <div className="flex gap-2">
            <Input value={closing} onChange={(e) => setClosing(e.target.value)} type="number" min={1} max={31} placeholder="Cierre" className="h-8 flex-1" />
            <Input value={due} onChange={(e) => setDue(e.target.value)} type="number" min={1} max={31} placeholder="Vence" className="h-8 flex-1" />
            <button onClick={add} disabled={!name.trim() || !Number(closing) || !Number(due)} className="flex size-8 items-center justify-center rounded-md bg-signature-default text-fg-inverse disabled:opacity-40">
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Análisis liviano: valor presente de las cuotas vs pagar de contado, ajustado por inflación. */
function ContadoVsCuotas({ inflacion }: { inflacion: number | null }) {
  const [contado, setContado] = useState('');
  const [totalCuotas, setTotalCuotas] = useState('');
  const [n, setN] = useState('12');
  const [infl, setInfl] = useState(inflacion != null ? String(inflacion) : '2.5');

  const result = useMemo(() => {
    const c = Number(contado), t = Number(totalCuotas), cuotasN = Number(n), i = Number(infl) / 100;
    if (!c || !t || !cuotasN) return null;
    const cuota = t / cuotasN;
    let vp = 0;
    for (let k = 0; k < cuotasN; k += 1) vp += cuota / (1 + i) ** k;
    const ahorro = c - vp; // >0 → conviene cuotas
    return { vp, ahorro, conviene: ahorro > 0 };
  }, [contado, totalCuotas, n, infl]);

  return (
    <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface-raised">
      <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3 text-300 font-semibold text-fg-default">
        <Scale className="size-4 text-signature-default" /> ¿Cuotas o contado?
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Precio contado</Label>
            <Input value={contado} onChange={(e) => setContado(e.target.value)} type="number" placeholder="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Total en cuotas</Label>
            <Input value={totalCuotas} onChange={(e) => setTotalCuotas(e.target.value)} type="number" placeholder="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>N° de cuotas</Label>
            <Input value={n} onChange={(e) => setN(e.target.value)} type="number" min={1} max={60} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Inflación mensual %</Label>
            <Input value={infl} onChange={(e) => setInfl(e.target.value)} type="number" step="0.1" />
          </div>
        </div>
        {result && (
          <div className="rounded-md border border-line-subtle bg-surface-overlay p-3">
            <p className="text-200 text-fg-subtle">
              Valor presente de las cuotas: <span className="font-semibold text-fg-default">{fmt(result.vp)}</span>
            </p>
            <p className={`mt-1 text-300 font-semibold ${result.conviene ? 'text-success-text' : 'text-danger-text'}`}>
              {result.conviene
                ? `Convienen las cuotas: ahorrás ${fmt(result.ahorro)} en pesos de hoy.`
                : `Conviene el contado: pagás ${fmt(-result.ahorro)} de más en cuotas.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewPlanDialog({ cards }: { cards: CreditCard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [description, setDescription] = useState('');
  const [total, setTotal] = useState('');
  const [count, setCount] = useState('12');
  const [firstDate, setFirstDate] = useState(() => DateTime.now().toISODate() ?? '');
  const [cardId, setCardId] = useState<string>(cards[0]?.id ?? 'none');

  function submit() {
    const amt = Number(total), cuotas = Number(count);
    if (!description.trim() || !amt || !cuotas) return;
    start(async () => {
      const r = await createInstallmentPlanAction({
        description: description.trim(),
        totalAmount: amt,
        installmentsCount: cuotas,
        firstChargeDate: firstDate,
        cardId: cardId === 'none' ? null : cardId,
      });
      if (r.ok) {
        toast.success('Compra en cuotas cargada');
        setDescription(''); setTotal(''); setCount('12');
        setOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="signature" size="sm"><Plus className="size-4" /> Compra</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nueva compra en cuotas</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-desc">Descripción</Label>
            <Input id="p-desc" autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Heladera, notebook…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-total">Total</Label>
              <Input id="p-total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-count">N° de cuotas</Label>
              <Input id="p-count" type="number" min={1} max={60} value={count} onChange={(e) => setCount(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-date">Primer consumo</Label>
              <Input id="p-date" type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tarjeta</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger><SelectValue placeholder="Sin tarjeta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin tarjeta</SelectItem>
                  {cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {total && count && Number(count) > 0 && (
            <p className="text-100 text-fg-subtlest">
              {count} cuotas de {fmt(Number(total) / Number(count))} c/u.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="signature" onClick={submit} disabled={pending || !description.trim() || !Number(total) || !Number(count)}>
            {pending ? 'Generando…' : 'Generar cuotas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
