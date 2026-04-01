import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import POSTerminal from './terminal/POSTerminal';
import type { CatalogCategory, CatalogProduct, TableOption } from '../../lib/types';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser?.tenant) redirect('/');

  const tenantId = dbUser.tenant.id;

  // Fetch catalog
  const [categories, products, tables] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, icon: true },
    }),
    prisma.product.findMany({
      where: { tenantId },
      orderBy: [{ categoryId: 'asc' }, { createdAt: 'asc' }],
      include: {
        modifierGroups: {
          include: { modifiers: { orderBy: { price: 'asc' } } },
        },
      },
    }),
    prisma.table.findMany({
      where: { tenantId, isActive: true },
      orderBy: { label: 'asc' },
      select: { id: true, label: true },
    }),
  ]);

  const catalogCategories: CatalogCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));

  const catalogProducts: CatalogProduct[] = products.map((p) => ({
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
      modifiers: g.modifiers.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
      })),
    })),
  }));

  const tableOptions: TableOption[] = tables.map((t) => ({
    id: t.id,
    label: t.label,
  }));

  return (
    <POSTerminal
      categories={catalogCategories}
      products={catalogProducts}
      tables={tableOptions}
      taxPercent={11}
      tenantId={tenantId}
    />
  );
}
