'use server';

import { revalidatePath } from 'next/cache';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  createFinanceCategory,
  createAccount,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type CreateAccountInput,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ImportResult = { ok: true; count: number } | { ok: false; error: string };

async function run(
  fn: (ctx: NonNullable<Awaited<ReturnType<typeof getDomainContext>>>) => Promise<void>,
): Promise<ActionResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    await fn(ctx);
    revalidatePath('/finanzas');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Algo salió mal.' };
  }
}

export async function createTransactionAction(input: CreateTransactionInput) {
  return run((ctx) => createTransaction(ctx, input).then(() => undefined));
}
export async function updateTransactionAction(id: string, patch: UpdateTransactionInput) {
  return run((ctx) => updateTransaction(ctx, id, patch));
}
export async function deleteTransactionAction(id: string) {
  return run((ctx) => deleteTransaction(ctx, id));
}
export async function createFinanceCategoryAction(name: string) {
  return run((ctx) => createFinanceCategory(ctx, { name }).then(() => undefined));
}
export async function createAccountAction(input: CreateAccountInput) {
  return run((ctx) => createAccount(ctx, input).then(() => undefined));
}

export async function importTransactionsAction(rows: CreateTransactionInput[]): Promise<ImportResult> {
  const ctx = await getDomainContext();
  if (!ctx) return { ok: false, error: 'Sesión expirada.' };
  try {
    const count = await importTransactions(ctx, rows);
    revalidatePath('/finanzas');
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Import falló.' };
  }
}
