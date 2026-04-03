'use server';

import { prisma, guardAccess, ROLE_PERMISSIONS } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { requireMerchantUser } from '../require-merchant-user';

async function getAuthorizedTenant() {
  const dbUser = await requireMerchantUser();
  const guard = guardAccess(dbUser.role, dbUser.tenant.planType, ROLE_PERMISSIONS.manageMenu);
  if (!guard.ok) throw new Error('Akses ditolak');
  return dbUser;
}

export async function createTable(label: string) {
  const dbUser = await getAuthorizedTenant();
  const trimmed = label.trim();
  if (!trimmed) return { success: false as const, error: 'Label meja tidak boleh kosong.' };

  const existing = await prisma.table.findFirst({
    where: { tenantId: dbUser.tenant.id, label: trimmed },
  });
  if (existing) return { success: false as const, error: 'Label meja sudah digunakan.' };

  const table = await prisma.table.create({
    data: { tenantId: dbUser.tenant.id, label: trimmed },
  });
  revalidatePath('/dashboard/tables');
  return {
    success: true as const,
    table: {
      id: table.id,
      label: table.label,
      qrToken: table.qrToken,
      isActive: table.isActive,
    },
  };
}

export async function updateTableLabel(tableId: string, label: string) {
  const dbUser = await getAuthorizedTenant();
  const trimmed = label.trim();
  if (!trimmed) return { success: false as const, error: 'Label tidak boleh kosong.' };

  await prisma.table.updateMany({
    where: { id: tableId, tenantId: dbUser.tenant.id },
    data: { label: trimmed },
  });
  revalidatePath('/dashboard/tables');
  return { success: true as const };
}

export async function toggleTableActive(tableId: string, isActive: boolean) {
  const dbUser = await getAuthorizedTenant();
  await prisma.table.updateMany({
    where: { id: tableId, tenantId: dbUser.tenant.id },
    data: { isActive },
  });
  revalidatePath('/dashboard/tables');
  return { success: true as const };
}

export async function deleteTable(tableId: string) {
  const dbUser = await getAuthorizedTenant();
  await prisma.table.deleteMany({
    where: { id: tableId, tenantId: dbUser.tenant.id },
  });
  revalidatePath('/dashboard/tables');
  return { success: true as const };
}
