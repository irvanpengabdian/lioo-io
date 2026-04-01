import { headers } from "next/headers";

/**
 * Origin dari env (sinkron, di-inline Next saat build untuk NEXT_PUBLIC_*).
 * Dipakai dulu untuk link undangan / login agar tidak pernah tercampur Promise → "[object Promise]" di URL.
 */
export function getMerchantAppOriginFromEnv(): string | null {
  const u =
    process.env.NEXT_PUBLIC_MERCHANT_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return u || null;
}

async function getMerchantAppOriginFromRequest(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3002";
}

/**
 * Origin absolut untuk link yang harus mengarah ke app merchant ini.
 * Prioritas: NEXT_PUBLIC_MERCHANT_URL → NEXT_PUBLIC_APP_URL → Host request.
 *
 * Jangan memakai KINDE_SITE_URL — itu host Kinde (OAuth), bukan app merchant.
 */
export async function getMerchantAppOrigin(): Promise<string> {
  return resolveMerchantAppOriginForLinks();
}

/**
 * Origin absolut untuk redirect login & link undangan.
 * Memastikan selalu diawali http:// atau https:// (hindari redirect relatif dari /join/… yang salah resolve).
 */
export async function resolveMerchantAppOriginForLinks(): Promise<string> {
  let o = getMerchantAppOriginFromEnv() ?? (await getMerchantAppOriginFromRequest());
  o = o.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(o)) {
    o = `https://${o}`;
  }
  return o;
}
