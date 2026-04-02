import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import { getPosStaffUserId } from '../../../lib/pos-session';
import OrderListCard, { type OrderListCardOrder, type OrderListCardModifier } from './OrderListCard';
import OrdersPageClient from './OrdersPageClient';

export const dynamic = 'force-dynamic';

function coerceSelectedModifiers(value: unknown): OrderListCardModifier[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  return value
    .map((m): OrderListCardModifier | null => {
      if (!m || typeof m !== 'object') return null;
      const name = (m as { name?: unknown }).name;
      return { name: typeof name === 'string' ? name : undefined };
    })
    .filter((x): x is OrderListCardModifier => x !== null);
}

export default async function OrdersPage() {
  const staffId = await getPosStaffUserId();
  if (!staffId) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: staffId },
    select: { tenantId: true },
  });
  if (!dbUser?.tenantId) redirect('/');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      tenantId: dbUser.tenantId,
      createdAt: { gte: today },
      status: { not: 'CANCELLED' },
    },
    include: {
      orderItems: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          subtotal: true,
          unitPrice: true,
          selectedModifiers: true,
          specialInstructions: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const ordersForCard: OrderListCardOrder[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    source: order.source,
    tableNumber: order.tableNumber,
    customerName: order.customerName,
    publicOrderCode: order.publicOrderCode,
    grandTotal: order.grandTotal,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      subtotal: item.subtotal,
      unitPrice: item.unitPrice,
      selectedModifiers: coerceSelectedModifiers(item.selectedModifiers),
      specialInstructions: item.specialInstructions,
    })),
  }));

  const kasirOrders = ordersForCard.filter((o) => o.source !== 'CUSTOMER_APP');
  const customerOrders = ordersForCard.filter((o) => o.source === 'CUSTOMER_APP');
  const unpaidCustomer = customerOrders.filter((o) => o.paymentStatus === 'UNPAID').length;

  return (
    <OrdersPageClient unpaidCustomerCount={unpaidCustomer}>
      <div data-tab="kasir" className="space-y-3">
        {kasirOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-semibold text-[#1A1C19]">Belum ada pesanan kasir hari ini</p>
          </div>
        ) : (
          kasirOrders.map((order) => <OrderListCard key={order.id} order={order} />)
        )}
      </div>

      <div data-tab="customer" className="space-y-3">
        {customerOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
            <p className="text-5xl mb-3">📱</p>
            <p className="font-semibold text-[#1A1C19]">Belum ada pesanan self-order hari ini</p>
            <p className="text-xs text-[#787868] mt-1 max-w-xs mx-auto">
              Pesanan dari portal pelanggan (QR meja / takeaway) akan muncul di sini.
            </p>
          </div>
        ) : (
          customerOrders.map((order) => <OrderListCard key={order.id} order={order} />)
        )}
      </div>
    </OrdersPageClient>
  );
}
