import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pos/lookup-order?code=XXXXXX
 * Cari order dari portal pelanggan berdasarkan publicOrderCode (6 karakter).
 * Hanya kasir yang sudah login ke tenant ini yang boleh mengakses.
 */
export async function GET(req: NextRequest) {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kindeUser = await getUser();
    if (!kindeUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: kindeUser.id },
      select: { tenantId: true, role: true },
    });

    if (!dbUser?.tenantId) {
      return NextResponse.json({ error: 'Akun tidak terhubung ke toko.' }, { status: 403 });
    }

    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Kode harus 6 karakter.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        publicOrderCode: code,
        tenantId: dbUser.tenantId,
        paymentStatus: 'UNPAID',
        status: { not: 'CANCELLED' },
      },
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

    if (!order) {
      return NextResponse.json(
        { error: 'Kode tidak ditemukan, sudah dibayar, atau bukan milik toko ini.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      publicOrderCode: order.publicOrderCode,
      source: order.source,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      grandTotal: order.grandTotal,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      items: order.orderItems.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
    });
  } catch (err) {
    console.error('[lookup-order]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
