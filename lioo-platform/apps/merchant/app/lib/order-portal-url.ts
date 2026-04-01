import { headers } from "next/headers";

/**
 * Base URL app order (portal pelanggan / QR meja `/t/[token]`).
 *
 * Prioritas:
 * 1. NEXT_PUBLIC_ORDER_URL (atau NEXT_PUBLIC_CUSTOMER_PORTAL_URL)
 * 2. Inferensi dari host request: `merchant.example.com` → `order.example.com`
 * 3. Lokal: localhost:3004
 */
export async function resolveOrderPortalBaseUrl(): Promise<string> {
  const fromEnv =
    process.env.NEXT_PUBLIC_ORDER_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const h = await headers();
  const hostHeader = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const host = hostHeader.split(":")[0] ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";

  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] === "merchant") {
    parts[0] = "order";
    const inferred = `${proto}://${parts.join(".")}`;
    return inferred;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3004";
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[merchant] QR meja: set NEXT_PUBLIC_ORDER_URL ke URL production order app (mis. https://order.lioo.io)."
    );
  }

  return "http://localhost:3004";
}
