import { NextRequest, NextResponse } from 'next/server';

const GUEST_COOKIE = 'lioo_guest_sid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

/**
 * Middleware: Set guest session cookie jika belum ada.
 * Cookie ini dipakai sebagai guestSessionId pada setiap order dari portal pelanggan
 * tanpa perlu login (anonymous session).
 */
export function proxy(req: NextRequest) {
  const response = NextResponse.next();

  if (!req.cookies.get(GUEST_COOKIE)) {
    response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: ['/t/:path*', '/o/:path*'],
};
