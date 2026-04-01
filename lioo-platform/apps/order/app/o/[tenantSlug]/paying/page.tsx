import { notFound } from 'next/navigation';
import { resolveBySlug, prisma } from '@repo/database';
import PayingPage from '../../../_components/PayingPage';

type Props = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export default async function TakeawayPayingPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;

  const result = await resolveBySlug(tenantSlug);
  if (!result.ok) notFound();

  const orderId = sp.orderId;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, grandTotal: true, paymentStatus: true },
  });
  if (!order) notFound();
  if (order.paymentStatus === 'PAID') {
    const qs = new URLSearchParams({
      orderId: order.id,
      orderNumber: order.orderNumber,
      mode: 'PAY_NOW',
      grandTotal: String(order.grandTotal),
    }).toString();
    return (
      <meta httpEquiv="refresh" content={`0;url=/o/${tenantSlug}/confirmation?${qs}`} />
    );
  }

  const qs = new URLSearchParams({
    orderId: order.id,
    orderNumber: order.orderNumber,
    mode: 'PAY_NOW',
    grandTotal: String(order.grandTotal),
  }).toString();

  return (
    <PayingPage
      orderId={order.id}
      orderNumber={order.orderNumber}
      grandTotal={order.grandTotal}
      confirmationHref={`/o/${tenantSlug}/confirmation?${qs}`}
    />
  );
}
