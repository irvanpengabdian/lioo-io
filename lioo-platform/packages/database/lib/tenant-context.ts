/**
 * resolveTenantContext
 *
 * Fungsi server-side untuk mengonversi pintu masuk publik (tenantSlug atau tableToken)
 * menjadi { tenantId, tableId? } yang terverifikasi dari database.
 *
 * JANGAN percaya tenantId dari request body/query langsung —
 * selalu resolve dari slug atau token yang sudah tervalidasi DB.
 *
 * Digunakan oleh:
 *  - apps/order (portal pelanggan): layout middleware
 *  - apps/pos (kasir): auth callback
 */

import { PrismaClient } from '@prisma/client';
import { getEffectiveMaxSeats } from './staff-quota';

export type TenantContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  logoUrl: string | null;
  selfServiceTheme: string | null;
  tableId?: string;
  tableLabel?: string;
};

export type TenantContextError =
  | 'TENANT_NOT_FOUND'
  | 'TENANT_INACTIVE'
  | 'TABLE_NOT_FOUND'
  | 'TABLE_INACTIVE'
  | 'INVALID_TOKEN';

export type TenantContextResult =
  | { ok: true; data: TenantContext }
  | { ok: false; error: TenantContextError };

const prisma = new PrismaClient();

/**
 * Resolve context dari slug outlet (jalur takeaway / delivery).
 * URL contoh: /o/[tenantSlug]
 */
export async function resolveBySlug(
  slug: string
): Promise<TenantContextResult> {
  if (!slug || typeof slug !== 'string' || slug.length > 100) {
    return { ok: false, error: 'INVALID_TOKEN' };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      selfServiceTheme: true,
    },
  });

  if (!tenant) {
    return { ok: false, error: 'TENANT_NOT_FOUND' };
  }

  return {
    ok: true,
    data: {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      logoUrl: tenant.logoUrl,
      selfServiceTheme: tenant.selfServiceTheme,
    },
  };
}

/**
 * Resolve context dari token meja yang ter-embed di QR code.
 * URL contoh: /t/[tableToken]
 * Token harus unik secara global (field @unique di schema).
 */
export async function resolveByTableToken(
  token: string
): Promise<TenantContextResult> {
  if (!token || typeof token !== 'string' || token.length > 200) {
    return { ok: false, error: 'INVALID_TOKEN' };
  }

  const table = await prisma.table.findUnique({
    where: { qrToken: token },
    select: {
      id: true,
      label: true,
      isActive: true,
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          selfServiceTheme: true,
        },
      },
    },
  });

  if (!table) {
    return { ok: false, error: 'TABLE_NOT_FOUND' };
  }

  if (!table.isActive) {
    return { ok: false, error: 'TABLE_INACTIVE' };
  }

  return {
    ok: true,
    data: {
      tenantId: table.tenant.id,
      tenantName: table.tenant.name,
      tenantSlug: table.tenant.slug,
      logoUrl: table.tenant.logoUrl,
      selfServiceTheme: table.tenant.selfServiceTheme,
      tableId: table.id,
      tableLabel: table.label,
    },
  };
}

/**
 * Verifikasi bahwa user (staff) memiliki akses ke tenant tertentu.
 * Digunakan oleh POS sebelum setiap operasi.
 * Kembalikan tenantId + planType agar komponen bisa enforce feature gating.
 */
export async function resolveStaffTenantAccess(
  userId: string,
  tenantId: string
): Promise<
  | {
      ok: true;
      tenantId: string;
      role: string;
      planType: string;
      maxSeats: number;
    }
  | { ok: false; error: 'UNAUTHORIZED' | 'USER_NOT_FOUND' }
> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenantId: true,
      role: true,
      tenant: {
        select: {
          id: true,
          planType: true,
          purchasedExtraSeats: true,
        },
      },
    },
  });

  if (!user) return { ok: false, error: 'USER_NOT_FOUND' };
  if (user.tenantId !== tenantId) return { ok: false, error: 'UNAUTHORIZED' };

  return {
    ok: true,
    tenantId: user.tenantId,
    role: user.role,
    planType: user.tenant!.planType,
    maxSeats: getEffectiveMaxSeats(
      user.tenant!.planType,
      user.tenant?.purchasedExtraSeats ?? 0
    ),
  };
}
