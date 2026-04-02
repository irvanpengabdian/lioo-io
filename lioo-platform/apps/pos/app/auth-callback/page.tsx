import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import { getPosStaffUserId } from '../../lib/pos-session';

export default async function POSAuthCallbackPage() {
  if (await getPosStaffUserId()) {
    redirect('/pos');
  }

  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) redirect('/');

  const user = await getUser();
  if (!user?.id) redirect('/');

  // Cari atau buat user di DB
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? '',
        firstName: user.given_name ?? '',
        lastName: user.family_name ?? '',
      },
      include: { tenant: true },
    });
  }

  // Belum terhubung ke tenant
  if (!dbUser.tenantId || !dbUser.tenant) {
    redirect(
      `${process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3001'}?error=no_staff_access`
    );
  }

  // Role harus punya izin akses POS
  if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
    redirect(
      `${process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3001'}?error=role_forbidden`
    );
  }

  redirect('/pos');
}
