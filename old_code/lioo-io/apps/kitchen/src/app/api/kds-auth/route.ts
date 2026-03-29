import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/kds-auth?merchantId=xxx&tier=SPROUT&redirect=/
 *
 * Endpoint ini dipanggil oleh SSO saat merchant diklik "Buka KDS".
 * SSO akan redirect ke URL ini dengan parameter merchantId & tier.
 * Kita set cookie lalu redirect ke halaman KDS utama.
 *
 * Contoh URL dari SSO:
 * http://localhost:3144/api/kds-auth?merchantId=abc&tier=SPROUT&redirect=/
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get('merchantId') || '';
  const tier = searchParams.get('tier') || 'SEED';
  const redirectTo = searchParams.get('redirect') || '/';

  const response = NextResponse.redirect(new URL(redirectTo, req.url));

  // Set cookies dengan expiry 8 jam (satu shift kerja dapur)
  const maxAge = 8 * 60 * 60; // 8 jam dalam detik

  response.cookies.set('kds_merchant_id', merchantId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  response.cookies.set('kds_merchant_tier', tier, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  return response;
}
