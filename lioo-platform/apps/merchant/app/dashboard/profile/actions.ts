"use server";
import { prisma } from "@repo/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateStoreProfile(data: {
  name: string;
  merchantCategory: string;
  description: string;
  contactNumber: string;
  address: string;
  selfServiceTheme: string;
  logoUrl: string;
}) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    throw new Error("Akses tertolak. Autentikasi Kinde terputus.");
  }
  
  const user = await getUser();
  if (!user || !user.id) {
    throw new Error("Data sesi pengguna tidak valid.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.tenantId) {
    throw new Error("Toko tidak ditemukan.");
  }

  await prisma.tenant.update({
    where: { id: dbUser.tenantId },
    data: {
      name: data.name,
      merchantCategory: data.merchantCategory || null,
      description: data.description || null,
      contactNumber: data.contactNumber || null,
      address: data.address || null,
      selfServiceTheme: data.selfServiceTheme || null,
      logoUrl: data.logoUrl || null,
    },
  });

  revalidatePath("/dashboard/profile");
}
