'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import type { FinanceCategory, Account, CreateTransactionInput } from '@astor/core';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { importTransactionsAction } from '@/app/actions/finance';

function pick(row: Record<string, string>, keys: string[]): string {
  const entry = Object.entries(row).find(([h]) => keys.some((k) => h.toLowerCase().includes(k)));
  return entry ? String(entry[1] ?? '').trim() : '';
}
function parseDate(raw: string, tz: string): string {
  for (const f of ['d/M/yy', 'd/M/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'M/d/yyyy']) {
    const dt = DateTime.fromFormat(raw, f, { zone: tz });
    if (dt.isValid) return dt.toISODate()!;
  }
  const iso = DateTime.fromISO(raw, { zone: tz });
  return iso.isValid ? iso.toISODate()! : DateTime.now().setZone(tz).toISODate()!;
}
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return Math.abs(Number(cleaned)) || 0;
}

export function ImportDialog({ categories, accounts }: { categories: FinanceCategory[]; accounts: Account[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CreateTransactionInput[]>([]);
  const [fileName, setFileName] = useState('');
  const [pending, start] = useTransition();

  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const accByName = new Map(accounts.map((a) => [a.name.toLowerCase(), a.id]));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { cellDates: false });
    const sheet = wb.Sheets[wb.SheetNames[0]!];
    const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet!, { raw: false, defval: '' });
    const parsed: CreateTransactionInput[] = [];
    for (const r of json) {
      const description = pick(r, ['descrip', 'concepto', 'detalle', 'gasto']);
      const amountRaw = pick(r, ['costo', 'monto', 'importe', 'amount', 'total', 'precio']);
      if (!description || !amountRaw) continue;
      const rubro = pick(r, ['rubro', 'categor']).toLowerCase();
      const forma = pick(r, ['forma', 'pago', 'cuenta', 'medio', 'account']).toLowerCase();
      parsed.push({
        description,
        amount: parseAmount(amountRaw),
        occurredOn: parseDate(pick(r, ['fecha', 'date']), 'America/Argentina/Buenos_Aires'),
        categoryId: catByName.get(rubro),
        accountId: accByName.get(forma),
        kind: 'expense',
        source: 'import',
      });
    }
    setRows(parsed);
    if (parsed.length === 0) toast.error('No se detectaron filas válidas (revisá las columnas).');
  }

  function doImport() {
    if (rows.length === 0) return;
    start(async () => {
      const res = await importTransactionsAction(rows);
      if (res.ok) {
        toast.success(`${res.count} movimientos importados`);
        setRows([]); setFileName(''); setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRows([]); setFileName(''); } }}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm"><Upload className="size-4" /> Importar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar CSV / XLS</DialogTitle>
          <DialogDescription>Detectamos columnas de descripción, monto, fecha, rubro y forma de pago.</DialogDescription>
        </DialogHeader>

        <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" onChange={onFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-default py-8 text-fg-subtle transition-colors hover:border-signature hover:text-fg-default"
        >
          <FileSpreadsheet className="size-6" />
          <span className="text-200">{fileName || 'Elegí un archivo'}</span>
        </button>

        {rows.length > 0 && (
          <div className="rounded-md border border-line-subtle bg-surface-sunken p-3">
            <p className="text-200 text-fg-default">{rows.length} movimientos listos para importar.</p>
            <div className="mt-2 max-h-32 overflow-y-auto text-100 text-fg-subtle">
              {rows.slice(0, 5).map((r, i) => (
                <div key={i} className="flex justify-between gap-2 py-0.5">
                  <span className="truncate">{r.description}</span>
                  <span className="tabular-nums">${Math.round(r.amount as number).toLocaleString('es-AR')}</span>
                </div>
              ))}
              {rows.length > 5 && <p className="text-fg-subtlest">…y {rows.length - 5} más</p>}
            </div>
            <p className="mt-2 text-100 text-fg-subtlest">Rubros/formas se matchean por nombre; los que no coincidan quedan sin asignar (editás después).</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="signature" onClick={doImport} disabled={pending || rows.length === 0}>
            {pending ? 'Importando…' : `Importar ${rows.length || ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
