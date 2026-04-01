/**
 * role-guard.ts
 *
 * Server-side helpers untuk memvalidasi akses berdasarkan role dan plan.
 * Digunakan di layout/page server components di apps/merchant dan apps/pos.
 */

import { Role, PlanType } from '@prisma/client';
import { isRoleAllowedForPlan } from './staff-quota';

// ─────────────────────────────────────────────
// ROLE HIERARCHY
// ─────────────────────────────────────────────

/** Urutan hierarki — angka lebih tinggi = akses lebih luas. */
const ROLE_LEVEL: Record<Role, number> = {
  OWNER: 100,
  MANAGER: 70,
  STAFF: 40,
  KITCHEN: 30,
  FINANCE: 30,
};

/** Apakah `userRole` punya akses minimal `requiredRole`? */
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

// ─────────────────────────────────────────────
// FEATURE GATES per ROLE
// ─────────────────────────────────────────────

/** Fitur-fitur yang dikunci per role. Digunakan untuk disable/hide UI dan guard server actions. */
export const ROLE_PERMISSIONS = {
  /** Bisa membuka terminal kasir */
  accessPOS: (role: Role) => hasMinRole(role, Role.STAFF),

  /** Bisa membuka merchant dashboard */
  accessMerchantDashboard: (role: Role) => hasMinRole(role, Role.MANAGER),

  /** Bisa lihat/kelola menu */
  manageMenu: (role: Role) => hasMinRole(role, Role.MANAGER),

  /** Bisa invite/hapus staff (OWNER dan MANAGER; MANAGER tidak boleh menyentuh OWNER/MANAGER lain — dicek di action) */
  manageStaff: (role: Role) => hasMinRole(role, Role.MANAGER),

  /** Bisa lihat laporan keuangan */
  viewFinanceReports: (role: Role) =>
    role === Role.OWNER || role === Role.MANAGER || role === Role.FINANCE,

  /** Bisa akses KDS */
  accessKDS: (role: Role) =>
    role === Role.OWNER || role === Role.MANAGER || role === Role.KITCHEN,

  /** Bisa upgrade plan / top-up wallet */
  manageBilling: (role: Role) => role === Role.OWNER,

  /** Bisa atur profil toko */
  manageStoreProfile: (role: Role) => hasMinRole(role, Role.MANAGER),

  /** Akses ke shell portal merchant (semua anggota tim dengan tenant) */
  accessMerchantPortal: (_role: Role) => true,

  /** Dashboard analytics / overview (termasuk role keuangan) */
  viewDashboardAnalytics: (role: Role) =>
    hasMinRole(role, Role.MANAGER) || role === Role.FINANCE,

  /** Lihat saldo & riwayat wallet (top-up tetap manageBilling) */
  viewWallet: (role: Role) =>
    role === Role.OWNER || role === Role.MANAGER || role === Role.FINANCE,

  /** Tautan POS / portal pelanggan / KDS */
  viewOperationalHub: (_role: Role) => true,
} as const;

// ─────────────────────────────────────────────
// PLAN + ROLE GUARD
// ─────────────────────────────────────────────

export type GuardResult =
  | { ok: true }
  | { ok: false; reason: 'ROLE_FORBIDDEN' | 'PLAN_UPGRADE_REQUIRED' | 'UNAUTHENTICATED'; message: string };

/**
 * Periksa apakah user (role + plan) boleh melakukan sebuah aksi.
 * Digunakan di server actions sebelum eksekusi query.
 *
 * @param userRole  - Role user saat ini
 * @param planType  - PlanType tenant
 * @param permissionCheck - fungsi dari ROLE_PERMISSIONS
 */
export function guardAccess(
  userRole: Role,
  planType: PlanType,
  permissionCheck: (role: Role) => boolean
): GuardResult {
  // Cek apakah role diizinkan di plan ini
  if (!isRoleAllowedForPlan(planType, userRole)) {
    return {
      ok: false,
      reason: 'PLAN_UPGRADE_REQUIRED',
      message: `Role ${userRole} membutuhkan upgrade plan. Saat ini: ${planType}.`,
    };
  }

  // Cek permission spesifik
  if (!permissionCheck(userRole)) {
    return {
      ok: false,
      reason: 'ROLE_FORBIDDEN',
      message: 'Akses ditolak. Role Anda tidak memiliki izin untuk tindakan ini.',
    };
  }

  return { ok: true };
}
