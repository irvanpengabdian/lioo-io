import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/check-payment?orderId=xxx
 * Digunakan oleh halaman paying untuk polling status pembayaran.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ paid: false, error: 'orderId wajib' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ paid: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ paid: order.paymentStatus === 'PAID' });
}
