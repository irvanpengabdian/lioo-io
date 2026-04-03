import { notFound } from 'next/navigation';
import { resolveBySlug, prisma } from '@repo/database';
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

  // Fetch initial order status for tracker
  let initialStatus = 'PENDING';
  if (sp.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: sp.orderId },
      select: { status: true },
    });
    if (order) initialStatus = order.status;
  }

  return (
    <ConfirmationPage
      orderId={sp.orderId ?? ''}
      orderNumber={sp.orderNumber ?? '—'}
      mode={(sp.mode as 'PAY_NOW' | 'PAY_AT_COUNTER') ?? 'PAY_AT_COUNTER'}
      publicOrderCode={sp.code ?? null}
      grandTotal={parseFloat(sp.grandTotal ?? '0')}
      backHref={`/o/${tenantSlug}`}
      initialStatus={initialStatus}
    />
  );
}
