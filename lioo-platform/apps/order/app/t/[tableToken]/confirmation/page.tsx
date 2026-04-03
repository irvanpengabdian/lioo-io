import { notFound } from 'next/navigation';
import { resolveByTableToken } from '@repo/database';
import { prisma } from '@repo/database';
import ConfirmationPage from '../../../_components/ConfirmationPage';

type Props = {
  params: Promise<{ tableToken: string }>;
  searchParams: Promise<{
    orderId?: string;
    orderNumber?: string;
    mode?: string;
    code?: string;
    grandTotal?: string;
  }>;
};

export default async function DineInConfirmationPage({ params, searchParams }: Props) {
  const { tableToken } = await params;
  const sp = await searchParams;

  const result = await resolveByTableToken(tableToken);
  if (!result.ok) notFound();

  const { tableLabel } = result.data;

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
      backHref={`/t/${tableToken}`}
      tableLabel={tableLabel}
      initialStatus={initialStatus}
    />
  );
}
