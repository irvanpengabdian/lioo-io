import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import type { PlanType, Role, Tenant, User } from "@prisma/client";

export type MerchantUserWithTenant = User & { tenant: Tenant };

function initialsFromUser(u: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const a = (u.firstName ?? "").trim().charAt(0);
  const b = (u.lastName ?? "").trim().charAt(0);
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase();
  return (u.email?.charAt(0) ?? "?").toUpperCase();
}

function headerSubtitle(tenant: Tenant): string {
  if (tenant.address) {
    const line = tenant.address.split("\n")[0]?.trim();
    if (line && line.length > 0) return line.length > 48 ? `${line.slice(0, 45)}…` : line;
  }
  return `Plan ${tenant.planType}`;
}

/**
 * User terautentikasi dengan tenant — dipakai layout dashboard.
 */
export async function requireMerchantUser(): Promise<MerchantUserWithTenant> {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const kinde = await getUser();
  if (!kinde?.id) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: kinde.id },
    include: { tenant: true },
  });

  if (!dbUser?.tenant) {
    redirect("/");
  }

  return dbUser as MerchantUserWithTenant;
}

export function merchantShellDisplay(
  dbUser: MerchantUserWithTenant,
  kindeEmail: string | null
) {
  const t = dbUser.tenant;
  const displayName =
    [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ").trim() ||
    kindeEmail ||
    dbUser.email;

  return {
    storeName: t.name,
    subtitle: headerSubtitle(t),
    userDisplayName: displayName,
    initials: initialsFromUser(dbUser),
    tenantSlug: t.slug,
    planType: t.planType as PlanType,
    role: dbUser.role as Role,
  };
}
