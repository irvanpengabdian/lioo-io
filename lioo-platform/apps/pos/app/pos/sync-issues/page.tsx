import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database';
import Link from 'next/link';
import SyncIssuesClient from './SyncIssuesClient';

export const dynamic = 'force-dynamic';

export default async function SyncIssuesPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });

  if (!dbUser?.tenantId) redirect('/');

  return (
    <div className="h-full overflow-y-auto bg-[#F9FAF5] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/pos/orders"
            className="p-2 rounded-full hover:bg-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#43493E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h2 className="text-base font-bold text-[#1A1C19]">Pesanan Bermasalah</h2>
            <p className="text-xs text-[#787868]">Pesanan yang gagal atau konflik saat sinkronisasi</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 text-xs text-amber-800">
          <p className="font-semibold mb-1">Apa itu pesanan bermasalah?</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li><strong>KONFLIK</strong> — Produk tidak lagi tersedia atau meja tidak aktif saat disinkronkan</li>
            <li><strong>GAGAL</strong> — Koneksi terputus terlalu lama; bisa dicoba ulang</li>
          </ul>
        </div>

        <SyncIssuesClient tenantId={dbUser.tenantId} />
      </div>
    </div>
  );
}
