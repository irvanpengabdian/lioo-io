import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import POSChrome from './POSChrome';

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) redirect('/');

  const user = await getUser();
  if (!user?.id) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
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
