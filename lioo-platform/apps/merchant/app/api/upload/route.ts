import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma, guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { r2Client } from "../../lib/r2";

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const g = guardAccess(
      dbUser.role,
      dbUser.tenant.planType,
      ROLE_PERMISSIONS.manageMenu
    );
    if (!g.ok) {
      return NextResponse.json({ error: g.message }, { status: 403 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Judul file dan tipe file (contentType) tidak valid" },
        { status: 400 }
      );
    }

    // Kita masukkan ke folder cloudflare: "menu/" dan tambahkan timestamp agar unik
    const uniqueFilename = `menu/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // 1. Generate Presigned URL (Tiket masuk) yang valid selama 60 detik
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    // 2. Kirim balasan berisi tiketnya ke sisi depan layar (Client browser)
    return NextResponse.json({
      presignedUrl: presignedUrl,
      objectKey: uniqueFilename,
      method: "PUT"
    });
  } catch (error) {
    console.error("Presigned URL Generation Error:", error);
    return NextResponse.json({ error: "Gagal membuat koneksi ke Cloudflare R2" }, { status: 500 });
  }
}
