import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../../lib/r2";

export async function POST(req: Request) {
  try {
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
