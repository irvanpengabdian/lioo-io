"use server";

import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getMerchantDbUser } from "../../lib/merchant-session";

export async function setSelfServiceOrderingEnabled(enabled: boolean) {
  const sessionUser = await getMerchantDbUser();
  if (!sessionUser?.id) {
    throw new Error("Sesi tidak valid.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });
  if (!dbUser?.tenantId) throw new Error("Toko tidak ditemukan.");

  const tenantRow = await prisma.tenant.findUnique({
    where: { id: dbUser.tenantId },
    select: { planType: true },
  });
  if (!tenantRow) throw new Error("Toko tidak ditemukan.");

  const g = guardAccess(
    dbUser.role,
    tenantRow.planType,
    ROLE_PERMISSIONS.manageStoreProfile
  );
  if (!g.ok) throw new Error("Hanya pemilik atau manajer yang dapat mengubah pengaturan ini.");

  await prisma.tenant.update({
    where: { id: dbUser.tenantId },
    data: { selfServiceOrderingEnabled: Boolean(enabled) },
  });

  revalidatePath("/dashboard/operations");
}
