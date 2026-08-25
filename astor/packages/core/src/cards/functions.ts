import { DateTime } from 'luxon';
import type { Tables } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError, DomainError } from '../errors';
import {
  createCreditCardInput,
  createInstallmentPlanInput,
  type CreateCreditCardInput,
  type CreateInstallmentPlanInput,
} from './schema';

export type CreditCard = Tables<'credit_cards'>;
export type CardInvoice = Tables<'card_invoices'>;
export type InstallmentPlan = Tables<'installment_plans'>;
export type Installment = Tables<'installments'>;

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function listCreditCards(ctx: DomainContext): Promise<CreditCard[]> {
  const { data, error } = await ctx.supabase.from('credit_cards').select().order('created_at', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}

export async function createCreditCard(ctx: DomainContext, input: CreateCreditCardInput): Promise<CreditCard> {
  const d = createCreditCardInput.parse(input);
  const { data, error } = await ctx.supabase
    .from('credit_cards')
    .insert({ user_id: ctx.userId, name: d.name, brand: d.brand ?? null, bank: d.bank ?? null, account_id: d.accountId ?? null, closing_day: d.closingDay, due_day: d.dueDay })
    .select().single();
  assertNoDbError(error);
  return data!;
}

/**
 * Mecánica AR: total una vez → N cuotas asignadas al resumen (card_invoice) que
 * corresponde según cierre/vencimiento de la tarjeta. La cuota #1 cae en el
 * resumen que contiene first_charge_date; las siguientes en los meses sucesivos.
 */
export async function createInstallmentPlan(ctx: DomainContext, input: CreateInstallmentPlanInput): Promise<InstallmentPlan> {
  const d = createInstallmentPlanInput.parse(input);

  let card: CreditCard | null = null;
  if (d.cardId) {
    const { data } = await ctx.supabase.from('credit_cards').select().eq('id', d.cardId).single();
    card = data ?? null;
    if (!card) throw new DomainError('not_found', 'Tarjeta no encontrada.');
  }

  const { data: plan, error: planErr } = await ctx.supabase
    .from('installment_plans')
    .insert({
      user_id: ctx.userId,
      credit_card_id: d.cardId ?? null,
      description: d.description,
      total_amount: d.totalAmount,
      currency: d.currency,
      installments_count: d.installmentsCount,
      first_charge_date: d.firstChargeDate,
      interest_rate: d.interestRate,
    })
    .select().single();
  assertNoDbError(planErr);

  const n = d.installmentsCount;
  const per = round2(d.totalAmount / n);
  const closingDay = card?.closing_day ?? 1;
  const dueDay = card?.due_day ?? 10;

  const first = DateTime.fromISO(d.firstChargeDate, { zone: ctx.timezone });
  let firstStmt = first.startOf('month');
  if (first.day > closingDay) firstStmt = firstStmt.plus({ months: 1 });

  const invoiceCache = new Map<string, { id: string; total: number }>();

  for (let k = 0; k < n; k += 1) {
    const stmt = firstStmt.plus({ months: k });
    const period = stmt.toISODate() ?? '';
    const closing = stmt.set({ day: Math.min(closingDay, stmt.daysInMonth ?? 31) }).toISODate();
    const dueMonth = dueDay > closingDay ? stmt : stmt.plus({ months: 1 });
    const due = dueMonth.set({ day: Math.min(dueDay, dueMonth.daysInMonth ?? 31) }).toISODate();
    const amount = k === n - 1 ? round2(d.totalAmount - per * (n - 1)) : per;

    let invoiceId: string | null = null;
    if (card && closing && due) {
      let inv = invoiceCache.get(period);
      if (!inv) {
        const { data: existing } = await ctx.supabase
          .from('card_invoices').select('id,total')
          .eq('credit_card_id', card.id).eq('period', period).maybeSingle();
        if (existing) {
          inv = { id: existing.id, total: Number(existing.total) };
        } else {
          const { data: created, error: invErr } = await ctx.supabase
            .from('card_invoices')
            .insert({ user_id: ctx.userId, credit_card_id: card.id, period, closing_date: closing, due_date: due, total: 0 })
            .select('id,total').single();
          assertNoDbError(invErr);
          inv = { id: created!.id, total: 0 };
        }
        invoiceCache.set(period, inv);
      }
      inv.total += amount;
      invoiceId = inv.id;
    }

    const { error: instErr } = await ctx.supabase.from('installments').insert({
      user_id: ctx.userId, plan_id: plan!.id, number: k + 1, amount, card_invoice_id: invoiceId, status: 'scheduled',
    });
    assertNoDbError(instErr);
  }

  for (const inv of invoiceCache.values()) {
    await ctx.supabase.from('card_invoices').update({ total: round2(inv.total) }).eq('id', inv.id);
  }

  return plan!;
}

export type PlanWithProgress = InstallmentPlan & {
  paidCount: number;
  totalCount: number;
  remaining: number;
};

export async function listInstallmentPlans(ctx: DomainContext): Promise<PlanWithProgress[]> {
  const [{ data: plans, error: pErr }, { data: inst, error: iErr }] = await Promise.all([
    ctx.supabase.from('installment_plans').select().order('created_at', { ascending: false }),
    ctx.supabase.from('installments').select('plan_id,amount,status'),
  ]);
  assertNoDbError(pErr);
  assertNoDbError(iErr);
  const byPlan = new Map<string, { paid: number; total: number; remaining: number }>();
  for (const it of inst ?? []) {
    const s = byPlan.get(it.plan_id) ?? { paid: 0, total: 0, remaining: 0 };
    s.total += 1;
    if (it.status === 'paid') s.paid += 1;
    else s.remaining += Number(it.amount);
    byPlan.set(it.plan_id, s);
  }
  return (plans ?? []).map((p) => {
    const s = byPlan.get(p.id) ?? { paid: 0, total: p.installments_count, remaining: Number(p.total_amount) };
    return { ...p, paidCount: s.paid, totalCount: s.total, remaining: round2(s.remaining) };
  });
}

export type InvoiceWithCard = CardInvoice & { cardName: string };

export async function listUpcomingInvoices(ctx: DomainContext): Promise<InvoiceWithCard[]> {
  const [{ data: invoices, error }, { data: cards }] = await Promise.all([
    ctx.supabase.from('card_invoices').select().order('due_date', { ascending: true }),
    ctx.supabase.from('credit_cards').select('id,name'),
  ]);
  assertNoDbError(error);
  const cardName = new Map((cards ?? []).map((c) => [c.id, c.name]));
  return (invoices ?? []).map((v) => ({ ...v, cardName: cardName.get(v.credit_card_id) ?? 'Tarjeta' }));
}

/** Inflación mensual (%) más reciente, para análisis cuotas vs contado real. */
export async function getInflacionMensual(ctx: DomainContext): Promise<number | null> {
  const { data, error } = await ctx.supabase
    .from('economic_rates').select('value')
    .eq('kind', 'inflacion_mensual').order('as_of', { ascending: false }).limit(1).maybeSingle();
  assertNoDbError(error);
  return data ? Number(data.value) : null;
}
