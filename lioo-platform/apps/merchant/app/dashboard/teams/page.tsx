import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import {
  prisma,
  getEffectiveMaxSeats,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  guardAccess,
} from "@repo/database";
import { Role } from "@prisma/client";
import TeamsClient from "./TeamsClient";
import { resolveMerchantAppOriginForLinks } from "../../lib/merchant-app-origin";

export const metadata = { title: "Tim & Staff | lioo.io Merchant" };

export default async function TeamsPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  const user = await getUser();
  if (!user?.id) redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser?.tenant) redirect("/dashboard");

  const { tenant } = dbUser;

  const guard = guardAccess(dbUser.role, tenant.planType, ROLE_PERMISSIONS.manageStaff);
  if (!guard.ok) redirect("/dashboard");

  const staffList = await prisma.user.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  const now = new Date();
  const pendingInvites = await prisma.staffInvite.findMany({
    where: {
      tenantId: tenant.id,
      status: "PENDING",
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true, token: true, createdAt: true },
  });

  const nonOwnerCount = staffList.filter((s) => s.role !== Role.OWNER).length;
  const occupiedSlots = nonOwnerCount + pendingInvites.length;
  const maxSeats = getEffectiveMaxSeats(tenant.planType, tenant.purchasedExtraSeats);
  const base = (await resolveMerchantAppOriginForLinks()).replace(/\/$/, "");

  return (
    <TeamsClient
      currentUserRole={dbUser.role}
      planType={tenant.planType}
      maxSeats={maxSeats}
      occupiedSlots={occupiedSlots}
      nonOwnerMemberCount={nonOwnerCount}
      staffList={staffList.map((s) => ({
        id: s.id,
        email: s.email,
        name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
        role: s.role,
        roleLabel: ROLE_LABELS[s.role],
        createdAt: s.createdAt.toISOString(),
        isCurrentUser: s.id === dbUser.id,
      }))}
      pendingInvites={pendingInvites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        roleLabel: ROLE_LABELS[inv.role],
        expiresAt: inv.expiresAt.toISOString(),
        inviteUrl: `${base}/join/${inv.token}`,
      }))}
    />
  );
}
