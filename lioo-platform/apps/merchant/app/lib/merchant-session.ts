/**
 * Resolusi user merchant: Kinde (normal) atau bypass dev (tanpa login SSO).
 *
 * Bypass HANYA jika semua kondisi terpenuhi:
 * - NODE_ENV === 'development'
 * - MERCHANT_DEV_BYPASS=1 (atau true / yes)
 * - MERCHANT_DEV_BYPASS_EMAIL=email@... yang ada di tabel User (Prisma), idealnya dengan tenant
 *
 * Sebelum deploy: jangan set variabel tersebut di production — bypass tidak jalan di build production.
 */
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@repo/database";
import type { Tenant, User } from "@prisma/client";

export type MerchantDbUser = User & { tenant: Tenant | null };

function merchantDevBypassEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const v = process.env.MERCHANT_DEV_BYPASS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * User DB (dengan relasi tenant bila ada). null = tidak terautentikasi / bypass email tidak cocok.
 */
export async function getMerchantDbUser(): Promise<MerchantDbUser | null> {
  if (merchantDevBypassEnabled()) {
    const email = process.env.MERCHANT_DEV_BYPASS_EMAIL?.trim().toLowerCase();
    if (!email) {
      if (process.env.MERCHANT_DEV_BYPASS_LOG === "1") {
        console.warn(
          "[merchant-session] MERCHANT_DEV_BYPASS aktif tapi MERCHANT_DEV_BYPASS_EMAIL kosong."
        );
      }
      return null;
    }
    const u = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!u) {
      console.warn(
        `[merchant-session] Dev bypass: tidak ada User dengan email "${email}".`
      );
      return null;
    }
    return u;
  }

  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;
  const kinde = await getUser();
  if (!kinde?.id) return null;
  return prisma.user.findUnique({
    where: { id: kinde.id },
    include: { tenant: true },
  });
}
