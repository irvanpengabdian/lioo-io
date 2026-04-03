import { NextRequest, NextResponse } from 'next/server';
import { getPortalApiRatelimit, getPortalPageRatelimit } from '@repo/redis-cache';

const GUEST_COOKIE = 'lioo_guest_sid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

function clientIp(request: NextRequest): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return request.headers.get('cf-connecting-ip')?.trim() || '127.0.0.1';
}

function applyRateHeaders(
  res: NextResponse,
  limit: number,
  remaining: number,
  reset: number
) {
  res.headers.set('X-RateLimit-Limit', String(limit));
  res.headers.set('X-RateLimit-Remaining', String(remaining));
  res.headers.set('X-RateLimit-Reset', String(reset));
}

/**
 * Proxy: rate limit publik + cookie sesi tamu untuk /o/* dan /t/*.
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isApiCustomer = pathname.startsWith('/api/customer');
  const isGuestPortal = pathname.startsWith('/o/') || pathname.startsWith('/t/');

  if (isApiCustomer || isGuestPortal) {
    const limiter = isApiCustomer ? getPortalApiRatelimit() : getPortalPageRatelimit();
    if (limiter) {
      const { success, limit, remaining, reset } = await limiter.limit(clientIp(req));
      if (!success) {
        const res = NextResponse.json(
          { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' },
          { status: 429 }
        );
        applyRateHeaders(res, limit, remaining, reset);
        const retrySec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
        res.headers.set('Retry-After', String(retrySec));
        return res;
      }

      if (isApiCustomer) {
        const res = NextResponse.next();
        applyRateHeaders(res, limit, remaining, reset);
        return res;
      }

      const response = NextResponse.next();
      applyRateHeaders(response, limit, remaining, reset);
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
  }

  const response = NextResponse.next();
  if (!req.cookies.get(GUEST_COOKIE) && isGuestPortal) {
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
  matcher: ['/t/:path*', '/o/:path*', '/api/customer/:path*'],
};
