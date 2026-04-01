import Image from 'next/image';
import Link from 'next/link';

type Props = {
  tenantName: string;
  logoUrl: string | null;
  badge?: string;
  mode: 'dine-in' | 'takeaway';
  /** Link ke halaman akun / riwayat (Sprint 8) */
  accountHref?: string;
};

export default function OutletHeader({ tenantName, logoUrl, badge, mode, accountHref }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-[0_4px_24px_rgba(44,79,27,0.06)] px-4 py-3">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={tenantName}
            width={36}
            height={36}
            className="rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 bg-[#7C8B6F] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
            {tenantName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1C19] truncate">{tenantName}</p>
          {badge && (
            <p className="text-xs text-[#787868] truncate">{badge}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {accountHref && (
            <Link
              href={accountHref}
              className="text-[11px] font-bold text-[#2C4F1B] px-2.5 py-1 rounded-full bg-[#F3F4EF] hover:bg-[#E8EBE4] transition-colors border border-[#E8EBE4]"
            >
              Akun
            </Link>
          )}
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              mode === 'dine-in'
                ? 'bg-[#E8F5E2] text-[#2C6B1A]'
                : 'bg-[#FFF8E1] text-[#B35900]'
            }`}
          >
            {mode === 'dine-in' ? 'Makan di Tempat' : 'Takeaway'}
          </span>
        </div>
      </div>
    </header>
  );
}
