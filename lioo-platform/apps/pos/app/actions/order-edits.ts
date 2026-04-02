'use server';

import { revalidatePath } from 'next/cache';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import { getPosStaffUserId } from '../../lib/pos-session';

export async function updatePosOrderCustomerName(
  orderId: string,
  customerName: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const staffId = await getPosStaffUserId();
    if (!staffId) return { success: false, error: 'Sesi berakhir.' };

    const dbUser = await prisma.user.findUnique({
      where: { id: staffId },
      select: { tenantId: true, role: true },
    });
    if (!dbUser?.tenantId || !ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const updated = await prisma.order.updateMany({
      where: {
        id: orderId,
        tenantId: dbUser.tenantId,
        paymentStatus: 'UNPAID',
        status: { not: 'CANCELLED' },
      },
      data: { customerName: customerName?.trim() ? customerName.trim() : null },
    });

    if (updated.count === 0) return { success: false, error: 'Pesanan tidak bisa diubah.' };
    revalidatePath('/pos/orders');
    return { success: true };
  } catch (e) {
    console.error('[updatePosOrderCustomerName]', e);
    return { success: false, error: 'Gagal menyimpan.' };
  }
}

export async function updatePosOrderItemLine(input: {
  orderItemId: string;
  orderId: string;
  specialInstructions?: string | null;
  quantity?: number;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const staffId = await getPosStaffUserId();
    if (!staffId) return { success: false, error: 'Sesi berakhir.' };

    const dbUser = await prisma.user.findUnique({
      where: { id: staffId },
      select: { tenantId: true, role: true },
    });
    if (!dbUser?.tenantId || !ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: input.orderId,
        tenantId: dbUser.tenantId,
        paymentStatus: 'UNPAID',
        status: { not: 'CANCELLED' },
      },
      include: { orderItems: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!order) return { success: false, error: 'Pesanan tidak ditemukan.' };

    const line = order.orderItems.find((i) => i.id === input.orderItemId);
    if (!line) return { success: false, error: 'Item tidak ditemukan.' };

    if (input.quantity != null && input.quantity !== line.quantity) {
      if (order.source !== 'CASHIER') {
        return { success: false, error: 'Qty hanya untuk pesanan kasir.' };
      }
      if (input.quantity < 1 || input.quantity > 999) {
        return { success: false, error: 'Qty tidak valid.' };
      }
    }

    await prisma.$transaction(async (tx) => {
      const qty =
        input.quantity != null && order.source === 'CASHIER'
          ? input.quantity
          : line.quantity;
      const newLineSubtotal = Math.round(line.unitPrice * qty * 100) / 100;

      await tx.orderItem.update({
        where: { id: input.orderItemId },
        data: {
          quantity: qty,
          subtotal: newLineSubtotal,
          specialInstructions:
            input.specialInstructions !== undefined
              ? input.specialInstructions?.trim() || null
              : undefined,
        },
      });

      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });
      const newSubtotal = items.reduce((s, i) => s + i.subtotal, 0);
      const taxableBefore = order.subtotal - order.discountTotal;
      const rate = taxableBefore > 0 ? order.taxTotal / taxableBefore : 0;
      const newTaxable = Math.max(0, newSubtotal - order.discountTotal);
      const newTaxTotal = Math.round(newTaxable * rate * 100) / 100;
      const newGrandTotal = Math.round((newTaxable + newTaxTotal) * 100) / 100;

      await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal: newSubtotal,
          taxTotal: newTaxTotal,
          grandTotal: newGrandTotal,
        },
      });
    });

    revalidatePath('/pos/orders');
    return { success: true };
  } catch (e) {
    console.error('[updatePosOrderItemLine]', e);
    return { success: false, error: 'Gagal menyimpan.' };
  }
}
