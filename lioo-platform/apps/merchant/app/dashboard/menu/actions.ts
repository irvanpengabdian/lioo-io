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

export async function createProductAction(tenantId: string, categoryId: string, name: string, price: number, imageUrl?: string) {
  try {
    await prisma.product.create({
      data: { tenantId, categoryId, name, price, imageUrl, isAvailable: true }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan produk" };
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
