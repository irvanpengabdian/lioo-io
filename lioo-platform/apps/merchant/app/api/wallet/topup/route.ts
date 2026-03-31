import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@repo/database";

// Paket top-up yang valid (server-side validation)
const VALID_PACKAGES: Record<string, { transactions: number; price: number; label: string }> = {
  lite: { transactions: 20, price: 20000, label: "Top-up Ringan (20 Trx)" },
  bisnis: { transactions: 55, price: 50000, label: "Top-up Bisnis (55 Trx)" },
  populer: { transactions: 120, price: 100000, label: "Top-up Populer (120 Trx)" },
};

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true },
    });

    if (!dbUser?.tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const { packageId } = await req.json();

    // Validasi paket di server
    const pkg = VALID_PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: "Paket top-up tidak valid" }, { status: 400 });
    }

    const apiKey = process.env.XENDIT_SECRET_KEY;
    if (!apiKey) {
      throw new Error("XENDIT_SECRET_KEY tidak terkonfigurasi");
    }

    const tenantId = dbUser.tenant.id;
    const timestamp = Date.now();

    // Format: topup_PACKAGEID_TENANTID_TIMESTAMP
    // Contoh: topup_populer_cm752ab9_17300099999
    const external_id = `topup_${packageId}_${tenantId}_${timestamp}`;

    const token = Buffer.from(apiKey + ":").toString("base64");

    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        external_id,
        amount: pkg.price,
        description: `${pkg.label} - Sprout Wallet lioo.io`,
        success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://merchant.lioo.io"}/dashboard/wallet?payment=success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://merchant.lioo.io"}/dashboard/wallet?payment=failed`,
        customer: {
          given_names: dbUser.tenant.name,
          email: user.email ?? "",
        },
        items: [
          {
            name: pkg.label,
            quantity: 1,
            price: pkg.price,
          },
        ],
      }),
    });

    const xenditData = await xenditRes.json();

    if (!xenditRes.ok) {
      console.error("[WALLET TOPUP] Xendit Error:", xenditData);
      throw new Error(xenditData.message || "Gagal membuat invoice Xendit");
    }

    // Catat transaksi PENDING ke database sebelum redirect
    await prisma.walletTransaction.create({
      data: {
        tenantId,
        amount: pkg.price,
        type: "CREDIT",
        description: pkg.label,
        status: "PENDING",
        xenditId: xenditData.id,
      },
    });

    return NextResponse.json({ invoiceUrl: xenditData.invoice_url });
  } catch (error: any) {
    console.error("[WALLET TOPUP] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
