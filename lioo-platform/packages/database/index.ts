import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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
