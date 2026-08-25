import { DateTime } from 'luxon';
import type { Tables, FxRateType } from '@astor/supabase';
import type { DomainContext } from '../context';
import { assertNoDbError, DomainError } from '../errors';
import {
  createTransactionInput,
  updateTransactionInput,
  listTransactionsFilter,
  createFinanceCategoryInput,
  createAccountInput,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type ListTransactionsFilter,
  type CreateFinanceCategoryInput,
  type CreateAccountInput,
} from './schema';

export type Transaction = Tables<'transactions'>;
export type FinanceCategory = Tables<'finance_categories'>;
export type Account = Tables<'accounts'>;
export type FxRate = Tables<'fx_rates'>;

function monthRange(month: string): { start: string; end: string } {
  const d = DateTime.fromISO(`${month}-01`);
  return { start: d.toISODate() ?? `${month}-01`, end: d.endOf('month').toISODate() ?? `${month}-28` };
}

// ── Transacciones ──────────────────────────────────────────────────────────

export async function listTransactions(ctx: DomainContext, filter?: ListTransactionsFilter): Promise<Transaction[]> {
  const f = listTransactionsFilter.parse(filter ?? {});
  let q = ctx.supabase.from('transactions').select();
  if (f.month) {
    const { start, end } = monthRange(f.month);
    q = q.gte('occurred_on', start).lte('occurred_on', end);
  }
  if (f.categoryId) q = q.eq('category_id', f.categoryId);
  if (f.accountId) q = q.eq('account_id', f.accountId);
  if (f.kind) q = q.eq('kind', f.kind);
  const { data, error } = await q.order('occurred_on', { ascending: false }).order('created_at', { ascending: false });
  assertNoDbError(error);
  return data ?? [];
}

function toInsert(ctx: DomainContext, d: ReturnType<typeof createTransactionInput.parse>) {
  return {
    user_id: ctx.userId,
    description: d.description,
    amount: d.amount,
    currency: d.currency,
    category_id: d.categoryId ?? null,
    account_id: d.accountId ?? null,
    occurred_on: d.occurredOn,
    kind: d.kind,
    note: d.note ?? null,
    source: d.source,
  };
}

export async function createTransaction(ctx: DomainContext, input: CreateTransactionInput): Promise<Transaction> {
  const d = createTransactionInput.parse(input);
  const { data, error } = await ctx.supabase.from('transactions').insert(toInsert(ctx, d)).select().single();
  assertNoDbError(error);
  return data!;
}

export async function updateTransaction(ctx: DomainContext, id: string, patch: UpdateTransactionInput): Promise<void> {
  const d = updateTransactionInput.parse(patch);
  const { error } = await ctx.supabase
    .from('transactions')
    .update({
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.amount !== undefined ? { amount: d.amount } : {}),
      ...(d.currency !== undefined ? { currency: d.currency } : {}),
      ...(d.categoryId !== undefined ? { category_id: d.categoryId ?? null } : {}),
      ...(d.accountId !== undefined ? { account_id: d.accountId ?? null } : {}),
      ...(d.occurredOn !== undefined ? { occurred_on: d.occurredOn } : {}),
      ...(d.kind !== undefined ? { kind: d.kind } : {}),
      ...(d.note !== undefined ? { note: d.note ?? null } : {}),
    })
    .eq('id', id);
  assertNoDbError(error);
}

export async function deleteTransaction(ctx: DomainContext, id: string): Promise<void> {
  const { error } = await ctx.supabase.from('transactions').delete().eq('id', id);
  assertNoDbError(error);
}

/** Import masivo (CSV/XLS ya parseado y mapeado). Marca source='import'. */
export async function importTransactions(ctx: DomainContext, rows: CreateTransactionInput[]): Promise<number> {
  if (rows.length === 0) return 0;
  if (rows.length > 2000) throw new DomainError('too_many', 'Máximo 2000 filas por import.');
  const insertRows = rows.map((r) => toInsert(ctx, createTransactionInput.parse({ ...r, source: 'import' })));
  const { error } = await ctx.supabase.from('transactions').insert(insertRows);
  assertNoDbError(error);
  return insertRows.length;
}

// ── Rubros / cuentas ──────────────────────────────────────────────────────

export async function listFinanceCategories(ctx: DomainContext): Promise<FinanceCategory[]> {
  const { data, error } = await ctx.supabase.from('finance_categories').select().order('position', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}
export async function createFinanceCategory(ctx: DomainContext, input: CreateFinanceCategoryInput): Promise<FinanceCategory> {
  const d = createFinanceCategoryInput.parse(input);
  const { count } = await ctx.supabase.from('finance_categories').select('id', { count: 'exact', head: true });
  const { data, error } = await ctx.supabase
    .from('finance_categories')
    .insert({ user_id: ctx.userId, name: d.name, kind: d.kind, color: d.color ?? null, position: count ?? 0 })
    .select().single();
  assertNoDbError(error);
  return data!;
}
export async function deleteFinanceCategory(ctx: DomainContext, id: string): Promise<void> {
  const { error } = await ctx.supabase.from('finance_categories').delete().eq('id', id);
  assertNoDbError(error);
}

export async function listAccounts(ctx: DomainContext): Promise<Account[]> {
  const { data, error } = await ctx.supabase.from('accounts').select().order('position', { ascending: true });
  assertNoDbError(error);
  return data ?? [];
}
export async function createAccount(ctx: DomainContext, input: CreateAccountInput): Promise<Account> {
  const d = createAccountInput.parse(input);
  const { count } = await ctx.supabase.from('accounts').select('id', { count: 'exact', head: true });
  const { data, error } = await ctx.supabase
    .from('accounts')
    .insert({ user_id: ctx.userId, name: d.name, type: d.type, currency: d.currency, position: count ?? 0 })
    .select().single();
  assertNoDbError(error);
  return data!;
}
export async function deleteAccount(ctx: DomainContext, id: string): Promise<void> {
  const { error } = await ctx.supabase.from('accounts').delete().eq('id', id);
  assertNoDbError(error);
}

// ── Reportes (pivots) ─────────────────────────────────────────────────────

export type FinanceReport = {
  byCategory: { name: string; total: number }[];
  byAccount: { name: string; total: number }[];
  totalExpense: number;
  totalIncome: number;
  net: number;
  count: number;
};

export async function getFinanceReport(ctx: DomainContext, month: string): Promise<FinanceReport> {
  const { start, end } = monthRange(month);
  const [{ data: txs, error: e1 }, { data: cats }, { data: accs }] = await Promise.all([
    ctx.supabase.from('transactions').select().gte('occurred_on', start).lte('occurred_on', end),
    ctx.supabase.from('finance_categories').select('id,name'),
    ctx.supabase.from('accounts').select('id,name'),
  ]);
  assertNoDbError(e1);
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const accName = new Map((accs ?? []).map((a) => [a.id, a.name]));
  const byCat = new Map<string, number>();
  const byAcc = new Map<string, number>();
  let totalExpense = 0;
  let totalIncome = 0;
  for (const t of txs ?? []) {
    const amount = Number(t.amount);
    if (t.kind === 'income') {
      totalIncome += amount;
      continue;
    }
    totalExpense += amount;
    const cn = t.category_id ? (catName.get(t.category_id) ?? 'Sin rubro') : 'Sin rubro';
    const an = t.account_id ? (accName.get(t.account_id) ?? 'Sin forma') : 'Sin forma';
    byCat.set(cn, (byCat.get(cn) ?? 0) + amount);
    byAcc.set(an, (byAcc.get(an) ?? 0) + amount);
  }
  const sort = (m: Map<string, number>) =>
    [...m].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  return {
    byCategory: sort(byCat),
    byAccount: sort(byAcc),
    totalExpense,
    totalIncome,
    net: totalIncome - totalExpense,
    count: txs?.length ?? 0,
  };
}

// ── FX (blue / MEP / oficial) ─────────────────────────────────────────────

export async function latestFxRates(ctx: DomainContext): Promise<Partial<Record<FxRateType, number>>> {
  const { data, error } = await ctx.supabase.from('fx_rates').select().order('as_of', { ascending: false });
  assertNoDbError(error);
  const latest: Partial<Record<FxRateType, number>> = {};
  for (const r of data ?? []) if (latest[r.rate_type] === undefined) latest[r.rate_type] = Number(r.rate);
  return latest;
}
