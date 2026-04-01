import { cookies } from 'next/headers';
import { prisma } from '@repo/database';

export const CUSTOMER_SESSION_COOKIE = 'lioo_customer_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

export type CustomerSession = {
  id: string;
  name: string | null;
  phone: string | null;
};

export type CustomerOrderHistoryRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  grandTotal: number;
  paymentStatus: string;
  orderType: string;
  itemCount: number;
};

/**
 * Baca sesi pelanggan terdaftar dari cookie httpOnly (scoped per tenant).
 */
export async function getCustomerSession(tenantId: string): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const customer = await prisma.customer.findFirst({
    where: {
      guestToken: token,
      tenantId,
      isGuest: false,
      pinHash: { not: null },
    },
    select: { id: true, name: true, phone: true },
  });

  return customer;
}

/** Riwayat pesanan portal untuk sesi saat ini (scoped tenant). */
export async function getCustomerOrderHistoryRows(
  tenantId: string
): Promise<CustomerOrderHistoryRow[]> {
  const session = await getCustomerSession(tenantId);
  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      customerId: session.id,
      source: 'CUSTOMER_APP',
    },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      grandTotal: true,
      paymentStatus: true,
      orderType: true,
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt.toISOString(),
    grandTotal: o.grandTotal,
    paymentStatus: o.paymentStatus,
    orderType: o.orderType,
    itemCount: o._count.orderItems,
  }));
}
