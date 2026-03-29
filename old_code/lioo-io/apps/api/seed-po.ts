import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memulai proses seeding data Purchase Order dummy...');

  const branch = await prisma.branch.findFirst();
  if (!branch) throw new Error('Branch not found');
  
  const creator = await prisma.user.findFirst();
  if (!creator) throw new Error('User not found');

  const ingredients = await prisma.ingredient.findMany({ where: { branch_id: branch.id } });
  if (ingredients.length === 0) throw new Error('No ingredients found');

  // Ensure we have some suppliers
  let supplier1 = await prisma.supplier.findFirst({ where: { name: 'Supplier Sayur Segar' } });
  if (!supplier1) {
    supplier1 = await prisma.supplier.create({ data: { name: 'Supplier Sayur Segar', contact: '08123456789' } });
  }

  let supplier2 = await prisma.supplier.findFirst({ where: { name: 'Distributor Daging Sapi' } });
  if (!supplier2) {
    supplier2 = await prisma.supplier.create({ data: { name: 'Distributor Daging Sapi', contact: '08987654321' } });
  }

  let supplier3 = await prisma.supplier.findFirst({ where: { name: 'Agen Kopi Nusantara' } });
  if (!supplier3) {
    supplier3 = await prisma.supplier.create({ data: { name: 'Agen Kopi Nusantara', contact: '08561234123' } });
  }

  // Helper to get random ingredient
  const getRandomIngredient = () => ingredients[Math.floor(Math.random() * ingredients.length)];

  const poData = [
    // 1. PO DRAFT - Tanpa PPN
    {
      supplier_id: supplier1.id,
      notes: 'Tolong kirim pagi hari',
      ppn_rate: 0,
      status: 'DRAFT',
      daysAgo: 1,
      items: [
        { ing: getRandomIngredient(), qty: 10, price: 15000 },
        { ing: getRandomIngredient(), qty: 5, price: 12000 }
      ]
    },
    // 2. PO DRAFT - Dengan PPN 11%
    {
      supplier_id: supplier2.id,
      notes: 'Premium cut beef',
      ppn_rate: 11,
      status: 'DRAFT',
      daysAgo: 2,
      items: [
        { ing: getRandomIngredient(), qty: 20, price: 50000 },
      ]
    },
    // 3. PO SENT - Dengan PPN 11%
    {
      supplier_id: supplier3.id,
      notes: 'Kopi arabica 10kg',
      ppn_rate: 11,
      status: 'SENT',
      daysAgo: 3,
      items: [
        { ing: getRandomIngredient(), qty: 10000, price: 250 }, // assume grain config
        { ing: getRandomIngredient(), qty: 5000, price: 300 }
      ]
    },
    // 4. PO RECEIVED - Tanpa PPN
    {
      supplier_id: supplier1.id,
      notes: '',
      ppn_rate: 0,
      status: 'RECEIVED',
      daysAgo: 5,
      items: [
        { ing: getRandomIngredient(), qty: 50, price: 8000 },
        { ing: getRandomIngredient(), qty: 20, price: 12000 }
      ]
    },
    // 5. PO RECEIVED - Dengan PPN 11%
    {
      supplier_id: supplier2.id,
      notes: 'Daging wagyu bulanan',
      ppn_rate: 11,
      status: 'RECEIVED',
      daysAgo: 10,
      items: [
        { ing: getRandomIngredient(), qty: 15000, price: 600 }
      ]
    },
    // 6. PO CANCELLED - Tanpa PPN
    {
      supplier_id: null, // Tanpa supplier
      notes: 'Batal karena salah harga',
      ppn_rate: 0,
      status: 'CANCELLED',
      daysAgo: 15,
      items: [
        { ing: getRandomIngredient(), qty: 5, price: 100000 }
      ]
    }
  ];

  for (const data of poData) {
    const subtotal = data.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const ppnAmount = Math.round(subtotal * data.ppn_rate / 100);
    const totalPrice = subtotal + ppnAmount;
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - data.daysAgo);
    
    let receivedAt = undefined;
    if (data.status === 'RECEIVED') {
      receivedAt = new Date(createdAt);
      receivedAt.setDate(receivedAt.getDate() + 1); // received 1 day after create
    }

    await prisma.purchaseOrder.create({
      data: {
        branch_id: branch.id,
        supplier_id: data.supplier_id,
        created_by: creator.id,
        total_price: totalPrice,
        ppn_rate: data.ppn_rate,
        ppn_amount: ppnAmount,
        notes: data.notes,
        status: data.status as any,
        created_at: createdAt,
        received_at: receivedAt,
        po_items: {
          create: data.items.map(i => ({
            ingredient_id: i.ing.id,
            quantity_ordered: i.qty,
            unit_price: i.price,
            subtotal: i.qty * i.price
          }))
        }
      }
    });
  }

  console.log('✅ 6 Data Purchase Order (Dummy) berhasil diinjeksi!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding PO:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
