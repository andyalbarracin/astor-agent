import { z } from 'zod';

export const transactionKindSchema = z.enum(['expense', 'income', 'transfer']);
export const financeCatKindSchema = z.enum(['expense', 'income']);
export const accountTypeSchema = z.enum([
  'efectivo', 'banco', 'billetera', 'tarjeta_credito', 'tarjeta_debito', 'usd', 'otro',
]);
export const transactionSourceSchema = z.enum(['app', 'import', 'telegram', 'api', 'mcp']);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha YYYY-MM-DD');

export const createTransactionInput = z.object({
  description: z.string().trim().min(1).max(300),
  amount: z.number().finite(),
  currency: z.string().max(8).default('ARS'),
  categoryId: z.string().uuid().nullish(),
  accountId: z.string().uuid().nullish(),
  occurredOn: isoDate,
  kind: transactionKindSchema.default('expense'),
  note: z.string().max(500).nullish(),
  source: transactionSourceSchema.default('app'),
});
export type CreateTransactionInput = z.input<typeof createTransactionInput>;

export const updateTransactionInput = z.object({
  description: z.string().trim().min(1).max(300).optional(),
  amount: z.number().finite().optional(),
  currency: z.string().max(8).optional(),
  categoryId: z.string().uuid().nullish(),
  accountId: z.string().uuid().nullish(),
  occurredOn: isoDate.optional(),
  kind: transactionKindSchema.optional(),
  note: z.string().max(500).nullish(),
});
export type UpdateTransactionInput = z.input<typeof updateTransactionInput>;

export const listTransactionsFilter = z
  .object({
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    kind: transactionKindSchema.optional(),
  })
  .default({});
export type ListTransactionsFilter = z.input<typeof listTransactionsFilter>;

export const createFinanceCategoryInput = z.object({
  name: z.string().trim().min(1).max(120),
  kind: financeCatKindSchema.default('expense'),
  color: z.string().max(32).nullish(),
});
export type CreateFinanceCategoryInput = z.input<typeof createFinanceCategoryInput>;

export const createAccountInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: accountTypeSchema.default('billetera'),
  currency: z.string().max(8).default('ARS'),
});
export type CreateAccountInput = z.input<typeof createAccountInput>;
