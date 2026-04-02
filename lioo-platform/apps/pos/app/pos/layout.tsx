import { redirect } from 'next/navigation';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import { getPosStaffUserId } from '../../lib/pos-session';
import POSChrome from './POSChrome';

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffId = await getPosStaffUserId();
  if (!staffId) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: staffId },
    include: { tenant: true },
  });

  if (!dbUser?.tenantId || !dbUser.tenant) {
    redirect('/');
  }

  // Role guard — double-check di setiap render layout
  if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
    redirect('/');
  }

  return (
    <POSChrome
      tenantName={dbUser.tenant.name}
      staffName={`${dbUser.firstName ?? ''} ${dbUser.lastName ?? ''}`.trim()}
      role={dbUser.role}
      tenantId={dbUser.tenantId}
    >
      {children}
    </POSChrome>
  );
}
