import type { NextRequest } from 'next/server';

type AuthRouteContext = { params: Promise<{ kindeAuth: string }> };

/** Hindari evaluasi Kinde saat `next build` (Vercel tanpa env di build). */
export const dynamic = 'force-dynamic';

async function runKindeAuth(req: NextRequest, ctx: AuthRouteContext) {
  const { handleAuth } = await import('@kinde-oss/kinde-auth-nextjs/server');
  const handler = handleAuth();
  return handler(req, ctx);
}

export async function GET(req: NextRequest, ctx: AuthRouteContext) {
  return runKindeAuth(req, ctx);
}

export async function POST(req: NextRequest, ctx: AuthRouteContext) {
  return runKindeAuth(req, ctx);
}
