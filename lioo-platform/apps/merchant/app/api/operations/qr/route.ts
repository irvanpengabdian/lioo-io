import { NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * GET /api/operations/qr?u=<encoded-url>&download=1
 * Menghasilkan PNG QR untuk pratinjau atau unduhan (dashboard merchant).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("u");
  if (!data || data.length > 2048) {
    return NextResponse.json({ error: "Parameter u tidak valid" }, { status: 400 });
  }

  try {
    const png = await QRCode.toBuffer(data, {
      type: "png",
      margin: 2,
      width: 480,
      color: { dark: "#1A1C19", light: "#FFFFFF" },
    });
    const download = searchParams.get("download") === "1";
    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=120",
        ...(download && {
          "Content-Disposition": 'attachment; filename="lioo-qr-outlet.png"',
        }),
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal membuat QR" }, { status: 500 });
  }
}
