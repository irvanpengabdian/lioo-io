"use server";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(tenantId: string, name: string, icon?: string) {
  try {
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
