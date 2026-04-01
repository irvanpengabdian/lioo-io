import { notFound } from 'next/navigation';
import { resolveBySlug } from '@repo/database';
import ConfirmationPage from '../../../_components/ConfirmationPage';

type Props = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{
    orderId?: string;
    orderNumber?: string;
    mode?: string;
    code?: string;
    grandTotal?: string;
  }>;
};

export default async function TakeawayConfirmationPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;

  const result = await resolveBySlug(tenantSlug);
  if (!result.ok) notFound();

  return (
    <ConfirmationPage
      orderNumber={sp.orderNumber ?? '—'}
      mode={(sp.mode as 'PAY_NOW' | 'PAY_AT_COUNTER') ?? 'PAY_AT_COUNTER'}
      publicOrderCode={sp.code ?? null}
      grandTotal={parseFloat(sp.grandTotal ?? '0')}
      backHref={`/o/${tenantSlug}`}
    />
  );
}
