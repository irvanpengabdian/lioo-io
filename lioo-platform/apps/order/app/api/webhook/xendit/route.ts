import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhook/xendit
 * Menangani webhook Xendit untuk konfirmasi pembayaran QRIS customer (PAY_NOW).
 * external_id format yang dikenali: customerqris_{orderId}_{tenantId}_{timestamp}
 */
export async function POST(req: NextRequest) {
  try {
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (webhookToken) {
      const incomingToken = req.headers.get('x-callback-token');
      if (incomingToken !== webhookToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { external_id, status } = body;

    if (!external_id || typeof external_id !== 'string') {
      return NextResponse.json({ received: true });
    }

    // Hanya proses yang berasal dari customer portal
    if (!external_id.startsWith('customerqris_')) {
      return NextResponse.json({ received: true });
    }

    if (status !== 'PAID' && status !== 'SETTLED') {
      return NextResponse.json({ received: true });
    }

    // Parse orderId dari external_id: customerqris_{orderId}_{tenantId}_{ts}
    const parts = external_id.split('_');
    // Format: customerqris _ {orderId} _ {tenantId} _ {ts}
    // orderId is parts[1], tenantId is parts[2]
    const orderId = parts[1];
    if (!orderId) {
      console.warn('[CustomerQRIS webhook] Tidak bisa parse orderId dari:', external_id);
      return NextResponse.json({ received: true });
    }

    await prisma.order.updateMany({
      where: {
        id: orderId,
        paymentStatus: 'UNPAID',
      },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: 'qris',
        status: 'CONFIRMED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[CustomerQRIS webhook]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
