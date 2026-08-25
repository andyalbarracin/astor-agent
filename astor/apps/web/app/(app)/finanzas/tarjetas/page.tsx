import { redirect } from 'next/navigation';
import {
  listCreditCards,
  listInstallmentPlans,
  listUpcomingInvoices,
  getInflacionMensual,
} from '@astor/core';
import { getDomainContext } from '@/lib/domain';
import { TarjetasView } from '@/components/finance/tarjetas-view';

export default async function TarjetasPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  const [cards, plans, invoices, inflacion] = await Promise.all([
    listCreditCards(ctx),
    listInstallmentPlans(ctx),
    listUpcomingInvoices(ctx),
    getInflacionMensual(ctx),
  ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <TarjetasView cards={cards} plans={plans} invoices={invoices} inflacion={inflacion} />
    </div>
  );
}
