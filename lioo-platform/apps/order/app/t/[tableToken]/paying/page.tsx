import { notFound } from 'next/navigation';
import { resolveByTableToken, prisma } from '@repo/database';
import PayingPage from '../../../_components/PayingPage';

type Props = {
  params: Promise<{ tableToken: string }>;
  searchParams: Promise<{ orderId?: string; orderNumber?: string; grandTotal?: string }>;
};

export default async function DineInPayingPage({ params, searchParams }: Props) {
  const { tableToken } = await params;
  const sp = await searchParams;

  const result = await resolveByTableToken(tableToken);
  if (!result.ok) notFound();

  const orderId = sp.orderId;
  if (!orderId) notFound();

  // Ambil data order dari DB untuk keamanan (jangan percaya query param grandTotal)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, grandTotal: true, paymentStatus: true },
  });
  if (!order) notFound();
  if (order.paymentStatus === 'PAID') {
    // Kalau sudah dibayar, redirect ke konfirmasi
    const qs = new URLSearchParams({
      orderId: order.id,
      orderNumber: order.orderNumber,
      mode: 'PAY_NOW',
      grandTotal: String(order.grandTotal),
    }).toString();
    return (
      <meta httpEquiv="refresh" content={`0;url=/t/${tableToken}/confirmation?${qs}`} />
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
      confirmationHref={`/t/${tableToken}/confirmation?${qs}`}
    />
  );
}
