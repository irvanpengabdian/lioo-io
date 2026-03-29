import { NextRequest, NextResponse } from 'next/server';
import { Xendit } from 'xendit-node';

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, externalId, payerEmail, successRedirectUrl, failureRedirectUrl } = body;

    if (!amount || !description || !externalId) {
      return NextResponse.json(
        { success: false, message: 'amount, description, externalId are required' },
        { status: 400 }
      );
    }

    const invoiceRequest: any = {
      externalId,
      amount: Number(amount),
      description,
      successRedirectUrl: successRedirectUrl || `${process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3424'}/onboarding/success`,
      failureRedirectUrl: failureRedirectUrl || `${process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3424'}/onboarding/failed`,
      currency: 'IDR',
    };

    if (payerEmail) {
      invoiceRequest.customer = {
        email: payerEmail,
      };
      invoiceRequest.customerNotificationPreference = {
        invoiceCreated: ['email'],
        invoicePaid: ['email'],
      };
    }

    const invoice = await xenditClient.Invoice.createInvoice({ data: invoiceRequest });

    return NextResponse.json({
      success: true,
      data: {
        id: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
        status: invoice.status,
        amount: invoice.amount,
        externalId: invoice.externalId,
      },
    });
  } catch (error: any) {
    console.error('[Xendit Invoice] Error creating invoice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
