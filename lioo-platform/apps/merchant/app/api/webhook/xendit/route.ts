import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

// Endpoint ini akan dipanggil oleh peladen Xendit saat fajar menyingsing (transaksi selesai)
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verifikasi sederhana untuk callback token jika ada (Best Practice Security)
    const callbackToken = req.headers.get("x-callback-token");
    if (process.env.XENDIT_WEBHOOK_TOKEN && callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized Secret Webhook Token" }, { status: 403 });
    }

    const { status, external_id } = payload;
    
    // Kita hanya memroses transaksi yang sudah LUNAS (PAID/SETTLED)
    if (status !== "PAID" && status !== "SETTLED") {
      return NextResponse.json({ message: "Ignored, status not paid" }, { status: 200 });
    }

    // Parsing External ID (Format: upgrade_PLANNAME_TENANTID_TIMESTAMP)
    // Contoh: upgrade_SPROUT_cm752ab9_17300099999
    if (external_id.startsWith("upgrade_")) {
       const parts = external_id.split("_");
       if (parts.length >= 3) {
          const planString = parts[1]; // SPROUT atau BLOOM
          const tenantId = parts[2];

          // Validasi tipe plan
          if (planString !== "SPROUT" && planString !== "BLOOM") {
             return NextResponse.json({ error: "Invalid Plan Upgrade Callback" }, { status: 400 });
          }

          // Sinkronisasi Perubahan Hak Langganan ke Database Prisma
          await prisma.tenant.update({
             where: { id: tenantId },
             data: { planType: planString as any }
          });

          // Opsional: Buat catatan mutasi wallet log jika perlu
          await prisma.walletTransaction.create({
             data: {
               tenantId: tenantId,
               amount: payload.amount,
               type: "DEBIT", // Karena user bayar ke platform
               description: `Pembelian Paket ${planString}`,
               status: "COMPLETED",
               xenditId: payload.id // id dari invoice xendit
             }
          });

          console.log(`[XENDIT WEBHOOK] Sukses Upgrade Tenant ${tenantId} ke ${planString}`);
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
