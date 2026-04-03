import { prisma } from '@repo/database';
import {
  getCachedPublicMenuJson,
  setCachedPublicMenuJson,
} from '@repo/redis-cache';
import type { MenuCategory, MenuProduct } from './types';

function mapMenuFromDb(
  rawCategories: { id: string; name: string; icon: string | null }[],
  rawProducts: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    promoPrice: number | null;
    promoValidUntil: Date | null;
    imageUrl: string | null;
    isAvailable: boolean;
    categoryId: string;
    modifierGroups: {
      id: string;
      name: string;
      isRequired: boolean;
      minSelect: number;
      maxSelect: number;
      modifiers: { id: string; name: string; price: number }[];
    }[];
  }[]
): { categories: MenuCategory[]; products: MenuProduct[] } {
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

async function loadMenuFromDb(tenantId: string): Promise<{
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

  return mapMenuFromDb(rawCategories, rawProducts);
}

/**
 * Fetch katalog (kategori + produk + modifier) untuk tenant.
 * Memakai cache Upstash (TTL + invalidasi dari merchant) bila env Redis terset.
 */
export async function fetchMenu(tenantId: string): Promise<{
  categories: MenuCategory[];
  products: MenuProduct[];
}> {
  const cached = await getCachedPublicMenuJson(tenantId);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as {
        categories: MenuCategory[];
        products: MenuProduct[];
      };
      if (
        parsed &&
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.products)
      ) {
        return { categories: parsed.categories, products: parsed.products };
      }
    } catch {
      /* bad cache → DB */
    }
  }

  const fresh = await loadMenuFromDb(tenantId);
  void setCachedPublicMenuJson(tenantId, JSON.stringify(fresh));
  return fresh;
}
