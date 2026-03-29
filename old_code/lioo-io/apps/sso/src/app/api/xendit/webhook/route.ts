import { NextRequest, NextResponse } from 'next/server';

// Xendit callback token for webhook verification
const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';

export async function POST(req: NextRequest) {
  try {
    // Verify Xendit webhook signature
    const callbackToken = req.headers.get('x-callback-token');
    if (XENDIT_CALLBACK_TOKEN && callbackToken !== XENDIT_CALLBACK_TOKEN) {
      console.warn('[Xendit Webhook] Invalid callback token');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { id, external_id, status, paid_at, payment_method, amount } = payload;

    console.log('[Xendit Webhook] Received:', { id, external_id, status });

    // Parse the externalId to determine payment type
    // Format: "lioo-wallet-{userId}-{timestamp}" or "lioo-bloom-{userId}-{timestamp}"
    const isWalletTopUp = external_id?.startsWith('lioo-wallet-');
    const isBloomSubscription = external_id?.startsWith('lioo-bloom-');

    if (status === 'PAID' || status === 'SETTLED') {
      if (isWalletTopUp) {
        // TODO: Credit user's Sprout Wallet balance in DB
        // await db.wallet.upsert({ where: { userId }, update: { balance: { increment: amount } }, create: {...} })
        console.log(`[Xendit Webhook] Wallet top-up successful: ${external_id}, amount: ${amount}`);
      }

      if (isBloomSubscription) {
        // TODO: Activate Bloom plan for user in DB
        // await db.subscription.create({ userId, plan: 'bloom', startDate: new Date(), ... })
        console.log(`[Xendit Webhook] Bloom subscription activated: ${external_id}`);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Xendit Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
