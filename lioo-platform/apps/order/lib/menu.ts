import { prisma } from '@repo/database';
import type { MenuCategory, MenuProduct } from './types';

/**
 * Fetch katalog (kategori + produk + modifier) dari DB untuk tenant tertentu.
 * Dipanggil dari server component halaman menu.
 */
export async function fetchMenu(tenantId: string): Promise<{
  categories: MenuCategory[];
  products: MenuProduct[];
}> {
  const [rawCategories, rawProducts] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, icon: true },
    }),
    prisma.product.findMany({
      where: { tenantId, isAvailable: true },
      orderBy: [{ categoryId: 'asc' }, { createdAt: 'asc' }],
      include: {
        modifierGroups: {
          include: { modifiers: { orderBy: { price: 'asc' } } },
        },
      },
    }),
  ]);

  const categories: MenuCategory[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));

  const products: MenuProduct[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    promoPrice: p.promoPrice,
    promoValidUntil: p.promoValidUntil?.toISOString() ?? null,
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    categoryId: p.categoryId,
    modifierGroups: p.modifierGroups.map((g) => ({
      id: g.id,
      name: g.name,
      isRequired: g.isRequired,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      options: g.modifiers.map((m) => ({ id: m.id, name: m.name, price: m.price })),
    })),
  }));

  return { categories, products };
}
