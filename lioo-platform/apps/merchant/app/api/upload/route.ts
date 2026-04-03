import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { guardAccess, ROLE_PERMISSIONS } from "@repo/database";
import { getMerchantDbUser } from "../../lib/merchant-session";
import { r2Client } from "../../lib/r2";

function devSkipR2(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    ["1", "true", "yes"].includes(
      (process.env.MERCHANT_DEV_SKIP_R2 || "").trim().toLowerCase()
    )
  );
}

export async function POST(req: Request) {
  try {
    const dbUser = await getMerchantDbUser();
    if (!dbUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!dbUser.tenant) {
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

    const uniqueFilename = `menu/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    /** Tanpa unggah ke R2 — URL statis untuk uji lokal (mis. placeholder). */
    if (devSkipR2()) {
      const placeholder =
        process.env.MERCHANT_DEV_PLACEHOLDER_IMAGE_URL?.trim() ||
        "https://placehold.co/600x600/e8e8e8/666?text=dev+local";
      return NextResponse.json({
        presignedUrl: null,
        objectKey: uniqueFilename,
        method: "PUT",
        devSkipR2Upload: true,
        publicImageUrl: placeholder,
      });
    }

    if (
      !process.env.R2_BUCKET_NAME ||
      !process.env.CLOUDFLARE_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    ) {
      console.error(
        "R2 env missing: R2_BUCKET_NAME, CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
      );
      return NextResponse.json(
        {
          error:
            "Konfigurasi R2 tidak lengkap di server. Untuk dev tanpa R2, set MERCHANT_DEV_SKIP_R2=1 di .env.local.",
        },
        { status: 500 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    return NextResponse.json({
      presignedUrl: presignedUrl,
      objectKey: uniqueFilename,
      method: "PUT",
    });
  } catch (error) {
    console.error("Presigned URL Generation Error:", error);
    return NextResponse.json({ error: "Gagal membuat koneksi ke Cloudflare R2" }, { status: 500 });
  }
}
