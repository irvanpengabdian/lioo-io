/**
 * Resolusi user staff POS: Kinde (normal) atau bypass dev (tanpa login).
 *
 * Bypass HANYA jika semua kondisi terpenuhi:
 * - NODE_ENV === 'development' (npm run dev — bukan build production)
 * - POS_DEV_BYPASS=1 (atau true)
 * - POS_DEV_BYPASS_EMAIL=email@... yang ada di tabel User (Prisma)
 *
 * Sebelum deploy: hapus variabel tersebut dari .env.local — di production bypass tidak pernah jalan.
 */
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from '@repo/database';

function devBypassEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  const v = process.env.POS_DEV_BYPASS?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * ID user staff (sama dengan User.id / Kinde subject) atau null jika belum login.
 */
export async function getPosStaffUserId(): Promise<string | null> {
  if (devBypassEnabled()) {
    const email = process.env.POS_DEV_BYPASS_EMAIL?.trim().toLowerCase();
    if (!email) {
      if (process.env.POS_DEV_BYPASS_LOG === '1') {
        console.warn('[pos-session] POS_DEV_BYPASS aktif tapi POS_DEV_BYPASS_EMAIL kosong.');
      }
      return null;
    }
    const u = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!u) {
      console.warn(`[pos-session] Dev bypass: tidak ada User dengan email "${email}".`);
      return null;
    }
    return u.id;
  }

  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;
  const kinde = await getUser();
  return kinde?.id ?? null;
}

export async function isPosStaffAuthenticated(): Promise<boolean> {
  const id = await getPosStaffUserId();
  return id != null;
}
