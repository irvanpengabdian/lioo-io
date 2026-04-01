/**
 * staff-quota.ts
 *
 * Business rules untuk kuota staff per plan dan enforcement invite.
 */

import { PlanType, Role } from '@prisma/client';

// ─────────────────────────────────────────────
// PLAN DEFAULTS
// ─────────────────────────────────────────────

/** Jumlah seat bawaan per plan (tidak termasuk purchasedExtraSeats). */
export const PLAN_DEFAULT_SEATS: Record<PlanType, number> = {
  SEED: 1,
  SPROUT: 2,
  BLOOM: 5,
  FOREST: 10, // enterprise: custom, 10 sebagai minimum default
};

/** Role yang diizinkan per plan.
 *  KITCHEN dan FINANCE hanya tersedia mulai plan BLOOM. */
export const PLAN_ALLOWED_ROLES: Record<PlanType, Role[]> = {
  SEED: [Role.OWNER, Role.MANAGER, Role.STAFF],
  SPROUT: [Role.OWNER, Role.MANAGER, Role.STAFF],
  BLOOM: [Role.OWNER, Role.MANAGER, Role.STAFF, Role.KITCHEN, Role.FINANCE],
  FOREST: [Role.OWNER, Role.MANAGER, Role.STAFF, Role.KITCHEN, Role.FINANCE],
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Total kursi staff efektif = default plan + seat tambahan yang dibeli.
 * Pemilik (OWNER) tidak menghabiskan kursi ini.
 */
export function getEffectiveMaxSeats(
  planType: PlanType,
  purchasedExtraSeats: number
): number {
  return PLAN_DEFAULT_SEATS[planType] + (purchasedExtraSeats ?? 0);
}

/** Alias eksplisit untuk kebijakan kuota tim (sama dengan getEffectiveMaxSeats). */
export function getEffectiveStaffSeatLimit(
  planType: PlanType,
  purchasedExtraSeats: number
): number {
  return getEffectiveMaxSeats(planType, purchasedExtraSeats);
}

/**
 * Apakah role tertentu diizinkan di plan ini?
 */
export function isRoleAllowedForPlan(planType: PlanType, role: Role): boolean {
  return PLAN_ALLOWED_ROLES[planType].includes(role);
}

/**
 * Validasi apakah tenant bisa menambah satu slot staff lagi (undangan atau accept).
 * `occupiedSlots` = jumlah anggota non-OWNER + undangan PENDING yang belum kedaluwarsa
 * (masing-masing memakai satu slot agar tidak over-book).
 */
export function canAddStaff(
  planType: PlanType,
  purchasedExtraSeats: number,
  occupiedSlots: number
): { allowed: true } | { allowed: false; reason: string } {
  const maxSeats = getEffectiveMaxSeats(planType, purchasedExtraSeats);

  if (occupiedSlots >= maxSeats) {
    return {
      allowed: false,
      reason: `Kuota staff penuh (${occupiedSlots}/${maxSeats}). Upgrade plan atau tambah seat untuk mengundang lebih banyak staff.`,
    };
  }

  return { allowed: true };
}

/**
 * Label ramah untuk setiap role (Bahasa Indonesia).
 */
export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Pemilik',
  MANAGER: 'Manajer',
  STAFF: 'Kasir',
  KITCHEN: 'Dapur',
  FINANCE: 'Keuangan',
};

/**
 * Deskripsi singkat role untuk UI invite.
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Akses penuh ke semua fitur dan pengaturan toko.',
  MANAGER: 'Dapat mengelola menu, staf, dan melihat laporan.',
  STAFF: 'Dapat mengoperasikan kasir dan membuat pesanan.',
  KITCHEN: 'Hanya akses ke Kitchen Display System (KDS).',
  FINANCE: 'Akses ke laporan keuangan dan rekap transaksi.',
};
