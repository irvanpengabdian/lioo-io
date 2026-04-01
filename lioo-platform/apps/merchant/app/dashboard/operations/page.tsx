import { redirect } from "next/navigation";
import { guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { requireMerchantUser } from "../require-merchant-user";
import OperationsHub from "./OperationsHub";

export const metadata = { title: "Operasional | lioo.io Merchant" };

/**
 * Kontrak URL POS (jangan ubah di merchant saja — selaraskan dengan apps/pos):
 * - Login: `{POS_BASE}/api/auth/login?post_login_redirect_url={encode(POS_BASE + '/auth-callback')}`
 *   → Kinde session di domain POS; callback: `apps/pos/app/auth-callback/page.tsx`
 * - Terminal: `{POS_BASE}/pos` → App Router `apps/pos/app/pos/`, layout cek `accessPOS`
 * - `POS_BASE` = `NEXT_PUBLIC_POS_URL` (tanpa trailing slash)
 * Jika tim POS memindahkan route, update string di sini + OperationsHub agar tidak putus.
 */

export default async function OperationsPage() {
  const dbUser = await requireMerchantUser();

  const g = guardAccess(
    dbUser.role,
    dbUser.tenant.planType,
    ROLE_PERMISSIONS.viewOperationalHub
  );
  if (!g.ok) {
    redirect("/dashboard");
  }

  const posBase = (process.env.NEXT_PUBLIC_POS_URL || "http://localhost:3003").replace(/\/$/, "");
  const orderBase = (process.env.NEXT_PUBLIC_ORDER_URL || "http://localhost:3004").replace(/\/$/, "");
  const kdsUrl = process.env.NEXT_PUBLIC_KDS_URL?.replace(/\/$/, "") ?? null;

  const posCallback = `${posBase}/auth-callback`;
  const posLoginUrl = `${posBase}/api/auth/login?post_login_redirect_url=${encodeURIComponent(posCallback)}`;
  const slug = dbUser.tenant.slug;

  return (
    <OperationsHub
      tenantName={dbUser.tenant.name}
      tenantSlug={slug}
      userRole={dbUser.role}
      posLoginUrl={posLoginUrl}
      posTerminalUrl={`${posBase}/pos`}
      orderBaseUrl={orderBase}
      takeawayPath={`/o/${slug}`}
      tablePath="/t/[token-meja]"
      kdsUrl={kdsUrl}
    />
  );
}
