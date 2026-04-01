'use server';

import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export type ProcessPaymentResult =
  | { success: true; orderId: string; orderNumber: string; change: number }
  | { success: false; error: string };

/**
 * Proses pembayaran TUNAI — kasir menerima uang fisik.
 * Tandai order PAID + COMPLETED seketika.
 */
export async function processPaymentCash(
  orderId: string,
  amountReceived: number
): Promise<ProcessPaymentResult> {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) return { success: false, error: 'Sesi berakhir.' };

    const kindeUser = await getUser();
    if (!kindeUser?.id) return { success: false, error: 'Sesi tidak valid.' };

    const dbUser = await prisma.user.findUnique({
      where: { id: kindeUser.id },
      select: { tenantId: true, role: true },
    });

    if (!dbUser?.tenantId) return { success: false, error: 'Akun tidak terhubung ke toko.' };
    if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) return { success: false, error: 'Akses ditolak.' };

    // Fetch order & validasi kepemilikan tenant
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: dbUser.tenantId },
      select: { id: true, orderNumber: true, grandTotal: true, paymentStatus: true },
    });

    if (!order) return { success: false, error: 'Pesanan tidak ditemukan.' };
    if (order.paymentStatus === 'PAID') {
      return { success: true, orderId: order.id, orderNumber: order.orderNumber, change: 0 };
    }

    if (amountReceived < order.grandTotal) {
      return {
        success: false,
        error: `Uang tidak cukup. Kurang Rp${(order.grandTotal - amountReceived).toLocaleString('id-ID')}.`,
      };
    }

    const change = amountReceived - order.grandTotal;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: 'cash',
        status: 'CONFIRMED',
        completedAt: new Date(),
      },
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber, change };
  } catch (err: unknown) {
    console.error('[processPaymentCash]', err);
    return { success: false, error: 'Terjadi kesalahan server.' };
  }
}

/**
 * Fetch detail pesanan untuk modal pembayaran (server-side).
 */
export async function fetchOrderForPayment(orderId: string) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;

  const kindeUser = await getUser();
  if (!kindeUser?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: kindeUser.id },
    select: { tenantId: true, role: true },
  });

  if (!dbUser?.tenantId) return null;

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: dbUser.tenantId },
    include: {
      orderItems: {
        orderBy: { sortOrder: 'asc' },
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
          subtotal: true,
          selectedModifiers: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    taxTotal: order.taxTotal,
    discountTotal: order.discountTotal,
    grandTotal: order.grandTotal,
    paymentMethod: order.paymentMethod,
    items: order.orderItems.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
  };
}
