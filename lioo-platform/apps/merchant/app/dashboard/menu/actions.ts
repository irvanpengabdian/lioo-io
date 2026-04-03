"use server";
import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getMerchantDbUser } from "../../lib/merchant-session";

async function assertManageMenuTenant(tenantId: string): Promise<{ error?: string }> {
  const dbUser = await getMerchantDbUser();
  if (!dbUser?.id) return { error: "Unauthorized" };
  if (!dbUser.tenantId || dbUser.tenantId !== tenantId || !dbUser.tenant) {
    return { error: "Akses ditolak" };
  }
  const g = guardAccess(dbUser.role, dbUser.tenant.planType, ROLE_PERMISSIONS.manageMenu);
  if (!g.ok) return { error: g.message };
  return {};
}

async function assertManageMenuCategory(categoryId: string): Promise<{ error?: string }> {
  const row = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { tenantId: true },
  });
  if (!row) return { error: "Kategori tidak ditemukan" };
  return assertManageMenuTenant(row.tenantId);
}

async function assertManageMenuProduct(productId: string): Promise<{ error?: string }> {
  const row = await prisma.product.findUnique({
    where: { id: productId },
    select: { tenantId: true },
  });
  if (!row) return { error: "Produk tidak ditemukan" };
  return assertManageMenuTenant(row.tenantId);
}

export async function createCategoryAction(tenantId: string, name: string, icon?: string) {
  try {
    const auth = await assertManageMenuTenant(tenantId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.category.create({
      data: { tenantId, name, icon: icon || "restaurant" }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan kategori" };
  }
}

export async function updateCategoryAction(categoryId: string, name: string) {
  try {
    const auth = await assertManageMenuCategory(categoryId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.category.update({
      where: { id: categoryId },
      data: { name }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const auth = await assertManageMenuCategory(categoryId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.category.delete({
      where: { id: categoryId }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal menghapus kategori" };
  }
}

type ModifierInput = { id?: string; name: string; price: number };
type ModifierGroupInput = {
  id?: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: ModifierInput[];
};

export async function createProductAction(
  tenantId: string, 
  categoryId: string, 
  name: string, 
  price: number, 
  imageUrl?: string,
  promoPrice?: number | null,
  promoValidUntil?: Date | null,
  modifierGroups?: ModifierGroupInput[]
) {
  try {
    const auth = await assertManageMenuTenant(tenantId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.product.create({
      data: { 
        tenantId, 
        categoryId, 
        name, 
        price, 
        imageUrl, 
        isAvailable: true,
        promoPrice,
        promoValidUntil,
        ...(modifierGroups && modifierGroups.length > 0 ? {
          modifierGroups: {
            create: modifierGroups.map(mg => ({
              name: mg.name,
              isRequired: mg.isRequired,
              minSelect: mg.minSelect,
              maxSelect: mg.maxSelect,
              modifiers: {
                create: mg.modifiers.map(m => ({
                  name: m.name,
                  price: m.price
                }))
              }
            }))
          }
        } : {})
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan produk: " + e.message };
  }
}

export async function updateProductAction(
  productId: string,
  categoryId: string, 
  name: string, 
  price: number, 
  imageUrl?: string,
  promoPrice?: number | null,
  promoValidUntil?: Date | null,
  modifierGroups?: ModifierGroupInput[]
) {
  try {
    const auth = await assertManageMenuProduct(productId);
    if (auth.error) return { success: false, error: auth.error };

    // We will clear existing modifier groups and recreate them for simplicity
    await prisma.modifierGroup.deleteMany({
      where: { productId }
    });

    await prisma.product.update({
      where: { id: productId },
      data: { 
        categoryId, 
        name, 
        price, 
        ...(imageUrl ? { imageUrl } : {}), 
        promoPrice,
        promoValidUntil,
        ...(modifierGroups && modifierGroups.length > 0 ? {
          modifierGroups: {
            create: modifierGroups.map(mg => ({
              name: mg.name,
              isRequired: mg.isRequired,
              minSelect: mg.minSelect,
              maxSelect: mg.maxSelect,
              modifiers: {
                create: mg.modifiers.map(m => ({
                  name: m.name,
                  price: m.price
                }))
              }
            }))
          }
        } : {})
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal memperbarui produk: " + e.message };
  }
}

export async function updateProductStatusAction(productId: string, isAvailable: boolean) {
  try {
    const auth = await assertManageMenuProduct(productId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.product.update({
      where: { id: productId },
      data: { isAvailable }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal mengubah status produk" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const auth = await assertManageMenuProduct(productId);
    if (auth.error) return { success: false, error: auth.error };

    await prisma.product.delete({
      where: { id: productId }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal menghapus produk" };
  }
}
