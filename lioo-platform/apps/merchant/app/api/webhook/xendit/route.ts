import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

// Paket top-up yang valid (harus sinkron dengan /api/wallet/topup)
const TOPUP_PACKAGES: Record<string, { transactions: number; price: number }> = {
  lite: { transactions: 20, price: 20000 },
  bisnis: { transactions: 55, price: 50000 },
  populer: { transactions: 120, price: 100000 },
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

        // Sinkronisasi Perubahan Hak Langganan ke Database Prisma
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { planType: planString as any },
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

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Xendit Webhook Processing Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Webhook Error" },
      { status: 500 }
    );
  }
}
