import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import CatalogClient from "./CatalogClient";
import { redirect } from "next/navigation";
import { requireMerchantUser } from "../require-merchant-user";

export const dynamic = 'force-dynamic';

export default async function MenuCatalogPage() {
  const dbUser = await requireMerchantUser();
  const tenant = dbUser.tenant;

  const menuGuard = guardAccess(dbUser.role, tenant.planType, ROLE_PERMISSIONS.manageMenu);
  if (!menuGuard.ok) {
    redirect("/dashboard/operations");
  }

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { tenantId: tenant.id },
      include: {
        category: true,
        modifierGroups: {
          include: { modifiers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <CatalogClient 
       tenantId={tenant.id}
       categories={categories}
       originalProducts={products}
    />
  );
}
