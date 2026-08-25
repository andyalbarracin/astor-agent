'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { FinanceCategory, Account } from '@astor/core';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createTransactionAction, createInstallmentPlanAction } from '@/app/actions/finance';
import { fmt } from './finance-view';

const CUOTA_OPTIONS = [1, 3, 6, 9, 12, 18, 24];

export function AddTransactionDialog({
  categories,
  accounts,
  timezone,
  defaultMonth,
}: {
  categories: FinanceCategory[];
  accounts: Account[];
  timezone: string;
  defaultMonth: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const now = DateTime.now().setZone(timezone);
    return now.toFormat('yyyy-MM').startsWith(defaultMonth) ? now.toISODate() ?? '' : `${defaultMonth}-01`;
  });
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState('none');
  const [accountId, setAccountId] = useState('none');
  const [cuotas, setCuotas] = useState(1);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isCredit = selectedAccount?.type === 'tarjeta_credito' && kind === 'expense';

  function submit() {
    const amt = Number(amount);
    if (!description.trim() || !amt) return;
    start(async () => {
      // Consumo con crédito en cuotas → genera el plan (se reparte en resúmenes).
      const res = isCredit && cuotas > 1
        ? await createInstallmentPlanAction({
            description: description.trim(),
            totalAmount: amt,
            installmentsCount: cuotas,
            firstChargeDate: date,
            accountId,
          })
        : await createTransactionAction({
            description: description.trim(),
            amount: amt,
            occurredOn: date,
            kind,
            categoryId: categoryId === 'none' ? undefined : categoryId,
            accountId: accountId === 'none' ? undefined : accountId,
          });
      if (res.ok) {
        toast.success(isCredit && cuotas > 1 ? `Compra en ${cuotas} cuotas cargada` : 'Movimiento cargado');
        setDescription(''); setAmount(''); setCategoryId('none'); setAccountId('none'); setCuotas(1);
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="signature" size="sm"><Plus className="size-4" /> Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo movimiento</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="inline-flex rounded-md border border-line-subtle p-1">
            {(['expense', 'income'] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} className={cn('flex-1 rounded px-3 py-1 text-200 font-medium transition-colors', kind === k ? 'bg-surface-overlay text-fg-default' : 'text-fg-subtle')}>
                {k === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-desc">Descripción</Label>
            <Input id="t-desc" autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Supermercado, alquiler…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-amount">Monto</Label>
              <Input id="t-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-date">Fecha</Label>
              <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Rubro</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Sin rubro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin rubro</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Forma de pago</Label>
              <Select value={accountId} onValueChange={(v) => { setAccountId(v); setCuotas(1); }}>
                <SelectTrigger><SelectValue placeholder="Ninguna" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isCredit && (
            <div className="flex flex-col gap-1.5 rounded-md border border-line-subtle bg-surface-overlay p-3">
              <Label>Cuotas</Label>
              <Select value={String(cuotas)} onValueChange={(v) => setCuotas(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUOTA_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n === 1 ? '1 pago' : `${n} cuotas`}</SelectItem>)}
                </SelectContent>
              </Select>
              {cuotas > 1 && Number(amount) > 0 && (
                <p className="text-100 text-fg-subtlest">
                  {cuotas} cuotas de {fmt(Number(amount) / cuotas)} → se genera el plan en Tarjetas y se reparte en los resúmenes.
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="signature" onClick={submit} disabled={pending || !description.trim() || !Number(amount)}>
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
