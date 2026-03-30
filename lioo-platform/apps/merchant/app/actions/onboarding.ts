"use server";
import { prisma } from "@repo/database";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export interface OnboardingData {
  storeName: string;
  storeSlug: string;
  categoryName: string;
  categoryIcon: string;
  menuName: string;
  menuPrice: number;
  menuImageUrl?: string;
}

export async function submitMerchantOnboarding(data: OnboardingData) {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return { success: false, error: "Akses tertolak. Autentikasi Kinde terputus." };
    }
    
    const user = await getUser();
    if (!user || !user.id) {
       return { success: false, error: "Data sesi pengguna tidak valid. Silakan login ulang." };
    }

    // 1. Validasi Input Manual
    if (!data.storeName || !data.storeSlug || !data.categoryName || !data.menuName || !data.menuPrice) {
      return { success: false, error: "Tolong lengkapi semua kolom yang wajib diisi." };
    }

    // 2. Prisma Transaction (Atomicity - Jika gagal satu, batal semua)
    const result = await prisma.$transaction(async (tx) => {
      // 2a. Buat Toko Baru (Tenant Profil)
      // *Dalam mode real Auth, tenant.id biasanya dicek dari Kinde cookie session
      const tenant = await tx.tenant.create({
        data: {
          name: data.storeName,
          slug: data.storeSlug,
          planType: "SEED",
        }
      });

      // 2b. Buat Kategori Menu pertama untuk Toko tersebut
      const category = await tx.category.create({
        data: {
          name: data.categoryName,
          icon: data.categoryIcon || "restaurant",
          tenantId: tenant.id
        }
      });

      // 2c. Tambahkan Produk/Menu Pertama yang barusan diketik
      const product = await tx.product.create({
        data: {
          name: data.menuName,
          price: data.menuPrice,
          imageUrl: data.menuImageUrl || null,
          categoryId: category.id,
          tenantId: tenant.id
        }
      });

      // 2d. Kunci User ke Tenant Baru (Profil Toko)
      await tx.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id }
      });

      return { tenant, category, product };
    });

    console.log("Integrasi Onboarding Sukses ke Supabase! Tenant ID:", result.tenant.id);
    return { success: true, tenantId: result.tenant.id };

  } catch (error: any) {
    console.error("Gagal menjalankan Server Action Onboarding:", error);
    // Prisma Error Code Constraint
    if (error?.code === "P2002") {
       return { success: false, error: "Username web (slug) toko sudah dipakai orang lain. Silakan ubah Username Anda." };
    }
    return { success: false, error: error.message || "Gagal menyimpan secara rahasia ke Server Supabase." };
  }
}
