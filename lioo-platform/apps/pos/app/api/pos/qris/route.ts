import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';

/**
 * POST /api/pos/qris
 * Body: { orderId: string }
 *
 * Membuat Xendit Invoice untuk pembayaran QRIS di terminal kasir.
 * external_id format: qris_{orderId}_{tenantId}_{timestamp}
 * Webhook (di merchant app) menangani konfirmasi bayar dan update DB.
 */
export async function POST(req: Request) {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kindeUser = await getUser();
    if (!kindeUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: kindeUser.id },
      select: { tenantId: true, role: true, tenant: { select: { name: true } } },
    });

    if (!dbUser?.tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 403 });
    if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
      return NextResponse.json({ error: 'Role tidak punya akses POS' }, { status: 403 });
    }

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId wajib' }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: dbUser.tenantId },
      select: {
        id: true,
        orderNumber: true,
        grandTotal: true,
        paymentStatus: true,
        paymentReference: true,
        customerName: true,
      },
    });

    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Pesanan sudah lunas' }, { status: 409 });
    }

    const apiKey = process.env.XENDIT_SECRET_KEY;
    if (!apiKey) throw new Error('XENDIT_SECRET_KEY tidak dikonfigurasi');

    const tenantId = dbUser.tenantId;
    const timestamp = Date.now();
    const external_id = `qris_${orderId}_${tenantId}_${timestamp}`;

    const token = Buffer.from(apiKey + ':').toString('base64');
    const posUrl = process.env.NEXT_PUBLIC_POS_URL || 'http://localhost:3003';

    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${token}` },
      body: JSON.stringify({
        external_id,
        amount: Math.round(order.grandTotal),
        description: `${order.orderNumber} — ${dbUser.tenant?.name ?? 'lioo POS'}`,
        success_redirect_url: `${posUrl}/pos/orders`,
        failure_redirect_url: `${posUrl}/pos/orders`,
        customer: { given_names: order.customerName ?? 'Pelanggan' },
        items: [
          {
            name: `Pesanan ${order.orderNumber}`,
            quantity: 1,
            price: Math.round(order.grandTotal),
          },
        ],
        // Hanya aktifkan QRIS
        payment_methods: ['QRIS'],
      }),
    });

    const xenditData = await xenditRes.json();
    if (!xenditRes.ok) {
      console.error('[POS QRIS] Xendit error:', xenditData);
      throw new Error(xenditData.message || 'Gagal membuat invoice Xendit');
    }

    // Simpan xenditId ke order agar webhook bisa identifikasi
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentReference: xenditData.id },
    });

    return NextResponse.json({
      invoiceUrl: xenditData.invoice_url,
      xenditId: xenditData.id,
      externalId: external_id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[POS QRIS]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
