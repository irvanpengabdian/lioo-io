/**
 * Menu demo kopi / makanan ringan dengan foto (Unsplash).
 * Jalankan dari folder packages/database:
 *   npx prisma generate && npx tsx seed-pos-menu.ts
 *
 * Gunakan env SEED_TENANT_ID=cuid atau biarkan kosong = tenant pertama di DB.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMG = {
  espresso: 'https://images.unsplash.com/photo-1510591509090-fd1b4042fd17?w=800&q=80',
  latte: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&q=80',
  cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
  coldBrew: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
  matcha: 'https://images.unsplash.com/photo-1515825838458-f2a751b65010?w=800&q=80',
  tea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
  chocolate: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80',
  smoothie: 'https://images.unsplash.com/photo-1553530664-ba256a2d4e4db?w=800&q=80',
  nasi: 'https://images.unsplash.com/photo-1603133872878-684f208fb84a?w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4fbcc?w=800&q=80',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  donut: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
};

async function upsertCategory(tenantId: string, name: string, icon: string, sortOrder: number) {
  return prisma.category.upsert({
    where: { tenantId_name: { tenantId, name } },
    create: { tenantId, name, icon, sortOrder },
    update: { icon, sortOrder },
  });
}

async function upsertProduct(
  tenantId: string,
  categoryId: string,
  data: { name: string; description: string; price: number; imageUrl: string }
) {
  const existing = await prisma.product.findFirst({
    where: { tenantId, categoryId, name: data.name },
  });
  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        isAvailable: true,
      },
    });
  }
  return prisma.product.create({
    data: {
      tenantId,
      categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      isAvailable: true,
    },
  });
}

async function main() {
  const tenantId =
    process.env.SEED_TENANT_ID ??
    (await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } }))?.id;

  if (!tenantId) {
    console.error('Tidak ada tenant. Buat tenant dulu atau set SEED_TENANT_ID.');
    process.exit(1);
  }

  console.log('Seeding menu untuk tenant', tenantId);

  const coffee = await upsertCategory(tenantId, 'Coffee', 'local_cafe', 0);
  const nonCoffee = await upsertCategory(tenantId, 'Non Coffee', 'water_drop', 1);
  const meals = await upsertCategory(tenantId, 'Meals', 'restaurant', 2);
  const snacks = await upsertCategory(tenantId, 'Snacks', 'cookie', 3);

  const coffeeItems = [
    { name: 'Espresso', description: 'Shot klasik, crema tebal', price: 18000, imageUrl: IMG.espresso },
    { name: 'Kopi Susu Gula Aren', description: 'Susu segar + gula aren', price: 22000, imageUrl: IMG.latte },
    { name: 'Cappuccino', description: 'Espresso, susu steamed, foam', price: 24000, imageUrl: IMG.cappuccino },
    { name: 'Cold Brew', description: 'Seduh dingin 12 jam', price: 26000, imageUrl: IMG.coldBrew },
    { name: 'Kopi Tetangga', description: 'House blend filter', price: 17000, imageUrl: IMG.latte },
  ];

  const nonCoffeeItems = [
    { name: 'Matcha Latte', description: 'Matcha Jepang + susu', price: 28000, imageUrl: IMG.matcha },
    { name: 'Earl Grey Tea', description: 'Teh hitam bergamot', price: 16000, imageUrl: IMG.tea },
    { name: 'Hot Chocolate', description: 'Cokelat Belgia', price: 24000, imageUrl: IMG.chocolate },
    { name: 'Berry Smoothie', description: 'Mixed berry yogurt', price: 30000, imageUrl: IMG.smoothie },
  ];

  const mealItems = [
    { name: 'Nasi Ayam Geprek', description: 'Nasi + ayam geprek + sambal', price: 35000, imageUrl: IMG.nasi },
    { name: 'Creamy Pasta', description: 'Fettuccine carbonara', price: 42000, imageUrl: IMG.pasta },
    { name: 'Club Sandwich', description: 'Triple deck, telur & bacon', price: 38000, imageUrl: IMG.sandwich },
    { name: 'Salad Bowl', description: 'Sayur, quinoa, dressing lemon', price: 32000, imageUrl: IMG.salad },
  ];

  const snackItems = [
    { name: 'Croissant Butter', description: 'Pastry renyah', price: 22000, imageUrl: IMG.croissant },
    { name: 'Kentang Goreng', description: 'Fries + saus', price: 18000, imageUrl: IMG.fries },
    { name: 'Slice Cake', description: 'Cokelat / red velvet', price: 28000, imageUrl: IMG.cake },
    { name: 'Donut Glaze', description: 'Donat lembut', price: 15000, imageUrl: IMG.donut },
  ];

  for (const p of coffeeItems) await upsertProduct(tenantId, coffee.id, p);
  for (const p of nonCoffeeItems) await upsertProduct(tenantId, nonCoffee.id, p);
  for (const p of mealItems) await upsertProduct(tenantId, meals.id, p);
  for (const p of snackItems) await upsertProduct(tenantId, snacks.id, p);

  console.log('Selesai: 4 kategori,', coffeeItems.length + nonCoffeeItems.length + mealItems.length + snackItems.length, 'produk.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
