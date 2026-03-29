/**
 * lib/wallet-logic.ts
 *
 * Logika pemotongan saldo FlexWallet untuk tier SPROUT.
 *
 * Aturan:
 * - Hanya berlaku untuk merchant dengan subscription_tier = SPROUT
 * - Dicharge Rp 200 per transaksi (Order) dengan status PAID
 * - Tier lain (SEED, BLOOM, FOREST) tidak menggunakan logika ini
 *   SEED   → gratis, tidak ada charge
 *   BLOOM  → billing via Xendit invoice bulanan
 *   FOREST → enterprise billing manual
 */

import { PrismaClient, SubscriptionTier, Order } from "@prisma/client";

const SPROUT_CHARGE_PER_TXN = 200; // Rp 200 per transaksi

/**
 * Potong saldo FlexWallet merchant sebesar Rp 200.
 * Hanya berjalan jika tier merchant = SPROUT.
 *
 * @param prisma  - Instance PrismaClient (gunakan tx di dalam transaksi)
 * @param order   - Order yang baru saja PAID
 * @returns       - WalletTransaction record, atau null jika tier bukan SPROUT
 */
export async function chargeWalletForOrder(
  prisma: PrismaClient,
  order: Pick<Order, "id" | "branch_id">
) {
  // 1. Temukan merchant dari branch
  const branch = await prisma.branch.findUnique({
    where: { id: order.branch_id },
    include: { merchant: { include: { wallet: true } } },
  });

  if (!branch || !branch.merchant) {
    // Branch belum terhubung ke Merchant (backward compat) — skip
    return null;
  }

  const { merchant } = branch;

  // 2. Hanya proses tier SPROUT
  if (merchant.subscription_tier !== SubscriptionTier.SPROUT) {
    return null; // SEED, BLOOM, FOREST diabaikan di sini
  }

  // 3. Pastikan wallet ada (seharusnya auto-dibuat saat merchant upgrade ke SPROUT)
  const wallet = merchant.wallet;
  if (!wallet) {
    throw new Error(
      `[wallet-logic] Merchant ${merchant.id} (${merchant.name}) bertier SPROUT ` +
        `tetapi tidak memiliki FlexWallet. Harap buat wallet terlebih dahulu.`
    );
  }

  // 4. Kurangi saldo
  const [updatedWallet, txn] = await prisma.$transaction([
    prisma.flexWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: SPROUT_CHARGE_PER_TXN },
        total_charged: { increment: SPROUT_CHARGE_PER_TXN },
        last_charged_at: new Date(),
      },
    }),
    prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        order_id: order.id,
        amount: -SPROUT_CHARGE_PER_TXN, // negatif = debit
        description: `Biaya transaksi SPROUT — Order #${order.id.slice(-8).toUpperCase()}`,
      },
    }),
  ]);

  return { updatedWallet, txn };
}

/**
 * Topup saldo FlexWallet (dipanggil dari Xendit webhook saat topup berhasil).
 */
export async function topupWallet(
  prisma: PrismaClient,
  merchantId: string,
  amount: number,
  description = "Topup saldo FlexWallet"
) {
  const wallet = await prisma.flexWallet.findUnique({
    where: { merchant_id: merchantId },
  });

  if (!wallet) {
    throw new Error(`[wallet-logic] FlexWallet tidak ditemukan untuk merchant ${merchantId}`);
  }

  return prisma.$transaction([
    prisma.flexWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        amount: +amount, // positif = kredit
        description,
      },
    }),
  ]);
}
