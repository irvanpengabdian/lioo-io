import { NextRequest, NextResponse } from 'next/server';

/**
 * KDS Wallet Guard — Middleware
 *
 * Memproteksi semua halaman KDS dari merchant SPROUT yang saldonya habis.
 *
 * Alur:
 * 1. Baca cookie `kds_merchant_id` dan `kds_merchant_tier` (di-set via /api/kds-auth).
 * 2. Jika tier = SPROUT, panggil backend untuk mengecek saldo FlexWallet.
 * 3. Jika saldo <= 0 → redirect ke /locked.
 * 4. Jika tier lain (SEED, BLOOM, FOREST) → lewat tanpa pengecekan saldo.
 * 5. Jika tidak ada cookie (belum diautentikasi oleh SSO) → redirect ke SSO.
 */

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';
const SSO_URL = process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3424';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Jangan intercept halaman ini agar tidak loop redirect
  if (
    pathname.startsWith('/locked') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const merchantId = req.cookies.get('kds_merchant_id')?.value;
  const tier = req.cookies.get('kds_merchant_tier')?.value;

  // Belum ada sesi cookie → redirect ke SSO untuk login
  if (!merchantId || !tier) {
    const ssoRedirect = `${SSO_URL}?redirect=${encodeURIComponent(req.url)}`;
    return NextResponse.redirect(ssoRedirect);
  }

  // Tier non-SPROUT (SEED, BLOOM, FOREST) → akses bebas
  if (tier !== 'SPROUT') {
    return NextResponse.next();
  }

  // SPROUT → Wajib cek saldo wallet
  try {
    const res = await fetch(`${BACKEND_URL}/finance/wallet/${merchantId}`);

    if (res.ok) {
      const wallet = await res.json();
      const balance = Number(wallet?.balance ?? 0);

      if (balance <= 0) {
        const lockedUrl = new URL('/locked', req.url);
        lockedUrl.searchParams.set('reason', 'empty_wallet');
        lockedUrl.searchParams.set('mid', merchantId);
        return NextResponse.redirect(lockedUrl);
      }
    }
  } catch (err) {
    // Fail-open: jika backend tidak bisa dihubungi sementara, izinkan akses
    // agar operasi dapur tidak tiba-tiba terhenti karena masalah koneksi
    console.error('[KDS Guard] Backend unreachable for wallet check:', err);
  }

  return NextResponse.next();
}

export const config = {
  // Berlaku untuk semua route kecuali static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
