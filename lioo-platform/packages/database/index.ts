import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Session pooler Supabase (:5432 pada host pooler) punya limit sangat kecil → MaxClientsInSessionMode di Vercel.
 * Transaction pooler memakai :6543 + ?pgbouncer=true (lihat README paket ini).
 */
function warnIfSupabaseSessionPoolerUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.DATABASE_URL_SUPPRESS_POOL_WARN === '1') return;
  if (/pooler\.supabase\.com:5432\b/.test(url)) {
    console.warn(
      '[@repo/database] DATABASE_URL memakai Supabase pooler port 5432 (biasanya Session mode). ' +
        'Ganti ke Transaction pooler port 6543 dan tambahkan ?pgbouncer=true. Lihat packages/database/README.md'
    );
  }
}

function createPrismaClient() {
  warnIfSupabaseSessionPoolerUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

/** Satu instance per proses Node (penting untuk Vercel/serverless + connection pool). */
export const prisma =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());

export {
  resolveBySlug,
  resolveByTableToken,
  resolveStaffTenantAccess,
  type TenantContext,
  type TenantContextError,
  type TenantContextResult,
} from './lib/tenant-context';

export {
  getEffectiveMaxSeats,
  getEffectiveStaffSeatLimit,
  isRoleAllowedForPlan,
  canAddStaff,
  PLAN_DEFAULT_SEATS,
  PLAN_ALLOWED_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
} from './lib/staff-quota';

export {
  hasMinRole,
  guardAccess,
  ROLE_PERMISSIONS,
  type GuardResult,
} from './lib/role-guard';
