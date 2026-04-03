'use server';

import { prisma } from '@repo/database';

/**
 * Server action: fetch current order status for customer tracking.
 * Returns the current status string from the database.
 */
export async function getOrderTracking(
  orderId: string
): Promise<{ status: string | null }> {
  if (!orderId) return { status: null };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    return { status: order?.status ?? null };
  } catch (err) {
    console.error('[getOrderTracking]', err);
    return { status: null };
  }
}
