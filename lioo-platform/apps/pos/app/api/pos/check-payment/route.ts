import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { getPosStaffUserId } from '../../../../lib/pos-session';

/**
 * GET /api/pos/check-payment?orderId=xxx
 * Dipanggil setiap ~3 detik oleh PaymentModal saat menunggu konfirmasi QRIS.
 * Webhook Xendit (merchant app) sudah mengupdate Order.paymentStatus → PAID.
 */
export async function GET(req: Request) {
  try {
    const staffId = await getPosStaffUserId();
    if (!staffId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: staffId },
      select: { tenantId: true },
    });

    if (!dbUser?.tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId wajib' }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: dbUser.tenantId },
      select: { paymentStatus: true, paymentMethod: true, status: true },
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      paid: order.paymentStatus === 'PAID',
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    });
  } catch (err: unknown) {
    console.error('[check-payment]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
