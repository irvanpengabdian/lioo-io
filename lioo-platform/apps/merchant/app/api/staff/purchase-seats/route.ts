import { NextResponse } from "next/server";
import { prisma, ROLE_PERMISSIONS, guardAccess } from "@repo/database";
import { getMerchantDbUser } from "../../../lib/merchant-session";

// Paket seat tambahan yang tersedia
const SEAT_PACKAGES: Record<string, { seats: number; price: number; label: string }> = {
  "1seat": { seats: 1, price: 49000, label: "1 Seat Tambahan" },
  "3seats": { seats: 3, price: 129000, label: "3 Seat Tambahan" },
  "5seats": { seats: 5, price: 199000, label: "5 Seat Tambahan" },
};

export async function POST(req: Request) {
  try {
    const sessionUser = await getMerchantDbUser();
    if (!sessionUser?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { tenant: true },
    });

    if (!dbUser?.tenant) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });

    // Guard: hanya OWNER
    const guard = guardAccess(dbUser.role, dbUser.tenant.planType, ROLE_PERMISSIONS.manageBilling);
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: 403 });

    const { packageId } = await req.json();
    const pkg = SEAT_PACKAGES[packageId];
    if (!pkg) return NextResponse.json({ error: "Paket seat tidak valid" }, { status: 400 });

    const apiKey = process.env.XENDIT_SECRET_KEY;
    if (!apiKey) throw new Error("XENDIT_SECRET_KEY tidak terkonfigurasi");

    const tenantId = dbUser.tenant.id;
    const timestamp = Date.now();

    // Format external_id: seat_PACKAGEID_TENANTID_TIMESTAMP
    const external_id = `seat_${packageId}_${tenantId}_${timestamp}`;

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
        description: `${pkg.label} - lioo.io Staff Seat`,
        success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"}/dashboard/teams?payment=success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"}/dashboard/teams?payment=failed`,
        customer: {
          given_names: dbUser.tenant.name,
          email: dbUser.email ?? "",
        },
        items: [{ name: pkg.label, quantity: 1, price: pkg.price }],
      }),
    });

    const xenditData = await xenditRes.json();
    if (!xenditRes.ok) throw new Error(xenditData.message || "Gagal membuat invoice Xendit");

    return NextResponse.json({ invoiceUrl: xenditData.invoice_url });
  } catch (error: any) {
    console.error("[SEAT PURCHASE] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
