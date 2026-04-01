import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true },
    });

    if (!dbUser?.tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const billGuard = guardAccess(
      dbUser.role,
      dbUser.tenant.planType,
      ROLE_PERMISSIONS.manageBilling
    );
    if (!billGuard.ok) {
      return NextResponse.json({ error: billGuard.message }, { status: 403 });
    }

    const { planType } = await req.json();
    
    // Validasi harga
    let amount = 0;
    if (planType === "SPROUT") {
      amount = 899000;
    } else if (planType === "BLOOM") {
      amount = 1499000;
    } else {
      return NextResponse.json({ error: "Invalid Plan Type" }, { status: 400 });
    }

    const external_id = `upgrade_${planType}_${dbUser.tenant.id}_${Date.now()}`;

    // Buat Invoice via Xendit API Backend
    const apiKey = process.env.XENDIT_SECRET_KEY;
    if (!apiKey) {
      throw new Error("XENDIT_SECRET_KEY environment variable is missing");
    }

    // Mengubah API key menjadi format Basic Auth
    const token = Buffer.from(apiKey + ":").toString("base64");

    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${token}`,
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: amount,
        description: `Upgrade ke ${planType} Plan Lioo.io`,
        success_redirect_url: `${process.env.KINDE_SITE_URL || "http://localhost:3002"}/dashboard/profile?payment=success`,
        failure_redirect_url: `${process.env.KINDE_SITE_URL || "http://localhost:3002"}/dashboard/profile?payment=failed`,
        customer: {
          given_names: dbUser.tenant.name,
          email: user.email,
        },
      }),
    });

    const xenditData = await xenditRes.json();

    if (!xenditRes.ok) {
      console.error("Xendit Error:", xenditData);
      throw new Error(xenditData.message || "Failed to create Xendit invoice");
    }

    return NextResponse.json({ invoiceUrl: xenditData.invoice_url });

  } catch (error: any) {
    console.error("Billing Checkout API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
