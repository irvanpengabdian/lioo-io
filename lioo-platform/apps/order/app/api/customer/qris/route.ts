import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/customer/qris
 * Body: { orderId: string }
 *
 * Membuat Xendit Invoice untuk pembayaran QRIS customer (PAY_NOW dari portal).
 * external_id format: customerqris_{orderId}_{tenantId}_{timestamp}
 * Webhook di /api/webhook/xendit di app ini menangani konfirmasi.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        grandTotal: true,
        paymentStatus: true,
        paymentReference: true,
        tenantId: true,
        tenant: { select: { name: true, slug: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Pesanan sudah lunas.' }, { status: 409 });
    }

    // Jika sudah ada invoice aktif, kembalikan URL-nya
    if (order.paymentReference) {
      try {
        const apiKey = process.env.XENDIT_SECRET_KEY!;
        const token = Buffer.from(apiKey + ':').toString('base64');
        const existing = await fetch(`https://api.xendit.co/v2/invoices/${order.paymentReference}`, {
          headers: { Authorization: `Basic ${token}` },
        });
        if (existing.ok) {
          const data = await existing.json();
          if (data.status === 'PENDING') {
            return NextResponse.json({ invoiceUrl: data.invoice_url, xenditId: data.id });
          }
        }
      } catch {
        // lanjut buat invoice baru
      }
    }

    const apiKey = process.env.XENDIT_SECRET_KEY;
    if (!apiKey) throw new Error('XENDIT_SECRET_KEY tidak dikonfigurasi');

    const timestamp  = Date.now();
    const externalId = `customerqris_${orderId}_${order.tenantId}_${timestamp}`;
    const token      = Buffer.from(apiKey + ':').toString('base64');
    const baseUrl    = process.env.NEXT_PUBLIC_ORDER_URL || 'http://localhost:3004';

    const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${token}` },
      body: JSON.stringify({
        external_id: externalId,
        amount: Math.round(order.grandTotal),
        description: `${order.orderNumber} — ${order.tenant?.name ?? 'Pesanan Anda'}`,
        success_redirect_url: `${baseUrl}/confirmation?orderId=${orderId}&paid=1`,
        failure_redirect_url:  `${baseUrl}/order/${orderId}/paying`,
        customer: { given_names: 'Pelanggan' },
        items: [
          {
            name: `Pesanan ${order.orderNumber}`,
            quantity: 1,
            price: Math.round(order.grandTotal),
          },
        ],
        payment_methods: ['QRIS'],
      }),
    });

    const xenditData = await xenditRes.json();
    if (!xenditRes.ok) {
      console.error('[Customer QRIS] Xendit error:', xenditData);
      throw new Error(xenditData.message || 'Gagal membuat invoice QRIS');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentReference: xenditData.id },
    });

    return NextResponse.json({
      invoiceUrl: xenditData.invoice_url,
      xenditId: xenditData.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[Customer QRIS]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
