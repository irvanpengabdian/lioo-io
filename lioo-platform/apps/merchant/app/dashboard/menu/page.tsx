import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import CatalogClient from "./CatalogClient";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MenuCatalogPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user || !user.id) {
    redirect(process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001");
  }

  // Pelacakan eksklusif untuk menghindari bug "findFirst()"
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true }
  });

  const tenant = dbUser?.tenant;

  if (!tenant) {
    return (
       <div className="flex items-center justify-center p-20 text-center flex-col min-h-screen">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h1 className="text-2xl font-bold text-on-surface">Akses Gagal / Toko Belum Ada</h1>
          <p className="text-on-surface-variant">Sistem melacak Anda tidak mempunyai toko. Silakan selesaikan Setup Wizard Merchant terlebih dahulu.</p>
       </div>
    );
  }

  const menuGuard = guardAccess(dbUser.role, tenant.planType, ROLE_PERMISSIONS.manageMenu);
  if (!menuGuard.ok) {
    redirect("/dashboard/operations");
  }

  // Menarik kumpulan data asli dari PostgreSQL
  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'asc' }
  });

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { 
      category: true,
      modifierGroups: {
        include: { modifiers: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <CatalogClient 
       tenantId={tenant.id}
       categories={categories}
       originalProducts={products}
    />
  );
}
