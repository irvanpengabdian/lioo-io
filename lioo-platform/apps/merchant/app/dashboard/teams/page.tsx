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
import { requireMerchantUser } from "../require-merchant-user";

export const metadata = { title: "Tim & Staff | lioo.io Merchant" };

export default async function TeamsPage() {
  const dbUser = await requireMerchantUser();
  const { tenant } = dbUser;

  const guard = guardAccess(dbUser.role, tenant.planType, ROLE_PERMISSIONS.manageStaff);
  if (!guard.ok) redirect("/dashboard");

  const now = new Date();
  const [staffList, pendingInvites] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.staffInvite.findMany({
      where: {
        tenantId: tenant.id,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        token: true,
        createdAt: true,
      },
    }),
  ]);

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
