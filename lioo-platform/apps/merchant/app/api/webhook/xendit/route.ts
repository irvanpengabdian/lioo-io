import { NextResponse } from "next/server";
import { prisma, PLAN_DEFAULT_SEATS } from "@repo/database";
import { PlanType } from "@prisma/client";

// Paket top-up yang valid (harus sinkron dengan /api/wallet/topup)
const TOPUP_PACKAGES: Record<string, { transactions: number; price: number }> = {
  lite: { transactions: 20, price: 20000 },
  bisnis: { transactions: 55, price: 50000 },
  populer: { transactions: 120, price: 100000 },
};

// Paket seat tambahan (harus sinkron dengan /api/staff/purchase-seats)
const SEAT_PACKAGES: Record<string, { seats: number; price: number }> = {
  "1seat": { seats: 1, price: 49000 },
  "3seats": { seats: 3, price: 129000 },
  "5seats": { seats: 5, price: 199000 },
};

// Endpoint ini dipanggil oleh server Xendit saat transaksi selesai
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verifikasi callback token (Security Best Practice)
    const callbackToken = req.headers.get("x-callback-token");
    if (
      process.env.XENDIT_WEBHOOK_TOKEN &&
      callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN
    ) {
      return NextResponse.json(
        { error: "Unauthorized Secret Webhook Token" },
        { status: 403 }
      );
    }

    const { status, external_id } = payload;

    // Hanya proses transaksi yang sudah LUNAS
    if (status !== "PAID" && status !== "SETTLED") {
      return NextResponse.json(
        { message: "Ignored, status not paid" },
        { status: 200 }
      );
    }

    // ─── CASE 1: Top-up Sprout Wallet ───
    // Format: topup_PACKAGEID_TENANTID_TIMESTAMP
    if (external_id.startsWith("topup_")) {
      const parts = external_id.split("_");
      if (parts.length >= 3) {
        const packageId = parts[1]; // lite, bisnis, populer
        const tenantId = parts[2];

        const pkg = TOPUP_PACKAGES[packageId];
        if (!pkg) {
          console.error(`[XENDIT WEBHOOK] Paket top-up tidak valid: ${packageId}`);
          return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        // Update walletTransaction menjadi COMPLETED
        await prisma.walletTransaction.updateMany({
          where: {
            xenditId: payload.id,
            tenantId,
            status: "PENDING",
          },
          data: { status: "COMPLETED" },
        });

        // Tambahkan saldo wallet tenant
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            walletBalance: {
              increment: pkg.price,
            },
          },
        });

        console.log(
          `[XENDIT WEBHOOK] Top-up Wallet: Tenant ${tenantId} +Rp${pkg.price} (${packageId})`
        );
      }
    }

    // ─── CASE 2: Upgrade Plan Berlangganan ───
    // Format: upgrade_PLANNAME_TENANTID_TIMESTAMP
    else if (external_id.startsWith("upgrade_")) {
      const parts = external_id.split("_");
      if (parts.length >= 3) {
        const planString = parts[1]; // SPROUT atau BLOOM
        const tenantId = parts[2];

        if (planString !== "SPROUT" && planString !== "BLOOM") {
          return NextResponse.json(
            { error: "Invalid Plan Upgrade Callback" },
            { status: 400 }
          );
        }

        const plan = planString as PlanType;
        const planDefaultSeats = PLAN_DEFAULT_SEATS[plan] ?? 1;

        // Sinkronisasi plan + kuota kursi staff (selaras dengan staff-quota)
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            planType: plan,
            maxStaffSeats: planDefaultSeats,
          },
        });

        // Buat catatan mutasi wallet log
        await prisma.walletTransaction.create({
          data: {
            tenantId,
            amount: payload.amount,
            type: "DEBIT",
            description: `Pembelian Paket ${planString}`,
            status: "COMPLETED",
            xenditId: payload.id,
          },
        });

        console.log(
          `[XENDIT WEBHOOK] Sukses Upgrade Tenant ${tenantId} ke ${planString}`
        );
      }
    }

    // ─── CASE 3: Beli Seat Tambahan ───
    // Format: seat_PACKAGEID_TENANTID_TIMESTAMP
    else if (external_id.startsWith("seat_")) {
      const parts = external_id.split("_");
      if (parts.length >= 3) {
        const packageId = parts[1]; // "1seat", "3seats", "5seats"
        const tenantId = parts[2];

        const pkg = SEAT_PACKAGES[packageId];
        if (!pkg) {
          console.error(`[XENDIT WEBHOOK] Paket seat tidak valid: ${packageId}`);
          return NextResponse.json({ error: "Invalid seat package" }, { status: 400 });
        }

        // Increment purchasedExtraSeats
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            purchasedExtraSeats: { increment: pkg.seats },
          },
        });

        console.log(
          `[XENDIT WEBHOOK] Seat Purchase: Tenant ${tenantId} +${pkg.seats} extra seats`
        );
      }
    }

    // ─── CASE 4: QRIS POS ───
    // Format: qris_{orderId}_{tenantId}_{timestamp}
    else if (external_id.startsWith("qris_")) {
      const parts = external_id.split("_");
      // orderId bisa mengandung "-" tapi bukan "_", tenantId sama
      // format: qris _ orderId _ tenantId _ timestamp  → parts[1], parts[2], parts[3]
      if (parts.length >= 4) {
        const orderId = parts[1];
        const tenantId = parts[2];

        // Idempotency: skip jika sudah PAID
        const order = await prisma.order.findFirst({
          where: { id: orderId, tenantId },
          select: { id: true, paymentStatus: true, grandTotal: true },
        });

        if (!order) {
          console.error(`[XENDIT WEBHOOK] QRIS: Order ${orderId} tidak ditemukan`);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paymentMethod: "qris",
              paymentReference: payload.id,
              status: "CONFIRMED",
              completedAt: new Date(),
            },
          });
          console.log(`[XENDIT WEBHOOK] QRIS POS: Order ${orderId} PAID via QRIS`);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Xendit Webhook Processing Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Webhook Error" },
      { status: 500 }
    );
  }
}
