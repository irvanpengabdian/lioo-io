import { redirect } from 'next/navigation';
import { guardAccess, ROLE_PERMISSIONS, prisma } from '@repo/database';
import { requireMerchantUser } from '../require-merchant-user';
import { resolveOrderPortalBaseUrl } from '../../lib/order-portal-url';
import TablesClient from './TablesClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meja & QR Code | lioo.io Merchant' };

export default async function TablesPage() {
  const dbUser = await requireMerchantUser();

  const guard = guardAccess(dbUser.role, dbUser.tenant.planType, ROLE_PERMISSIONS.manageMenu);
  if (!guard.ok) redirect('/dashboard');

  const tables = await prisma.table.findMany({
    where: { tenantId: dbUser.tenant.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, label: true, qrToken: true, isActive: true },
  });

  const orderBaseUrl = (await resolveOrderPortalBaseUrl()).replace(/\/$/, '');

  return (
    <TablesClient
      tables={tables}
      orderBaseUrl={orderBaseUrl}
    />
  );
}
