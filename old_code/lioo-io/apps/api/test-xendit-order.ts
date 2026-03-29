import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst();
  if (!branch) throw new Error("No branch found");

  const category = await prisma.category.findFirst({ where: { branch_id: branch.id }});
  
  const product = await prisma.product.findFirst({
    where: { branch_id: branch.id }
  });

  if (!product) throw new Error("No product found");

  const order = await prisma.order.create({
    data: {
      branch_id: branch.id,
      customer_name: "Test Customer Xendit",
      total_amount: 15000,
      status: "PENDING",
      source: "DINE_IN",
      order_items: {
        create: [
          {
            product_id: product.id,
            quantity: 1,
            subtotal: 15000
          }
        ]
      }
    }
  });

  console.log("Created Test Order:", order.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
