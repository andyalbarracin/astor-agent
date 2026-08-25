import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha YYYY-MM-DD');

export const createCreditCardInput = z.object({
  name: z.string().trim().min(1).max(120),
  brand: z.string().max(60).nullish(),
  bank: z.string().max(60).nullish(),
  accountId: z.string().uuid().nullish(),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
});
export type CreateCreditCardInput = z.input<typeof createCreditCardInput>;

export const createInstallmentPlanInput = z.object({
  cardId: z.string().uuid().nullish(),
  accountId: z.string().uuid().nullish(), // si no hay cardId, se resuelve la tarjeta por su cuenta
  description: z.string().trim().min(1).max(200),
  totalAmount: z.number().positive(),
  currency: z.string().max(8).default('ARS'),
  installmentsCount: z.number().int().min(1).max(60),
  firstChargeDate: isoDate,
  interestRate: z.number().min(0).max(1000).default(0), // TNA % (informativo)
});
export type CreateInstallmentPlanInput = z.input<typeof createInstallmentPlanInput>;
