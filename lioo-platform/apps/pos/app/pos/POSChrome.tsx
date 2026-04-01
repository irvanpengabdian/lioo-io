'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSync } from '../../lib/use-sync';
import SyncStatusBar from './SyncStatusBar';

type Props = {
  tenantName: string;
  staffName: string;
  role: string;
  tenantId: string;
  children: React.ReactNode;
};

export default function POSChrome({ tenantName, staffName, role, tenantId, children }: Props) {
  const [isOnline, setIsOnline] = useState(true);
  const pathname = usePathname();
  const syncState = useSync(tenantId);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { href: '/pos', label: 'Kasir', icon: '🧾', exact: true },
    { href: '/pos/orders', label: 'Pesanan', icon: '📋', exact: false },
    { href: '/pos/sync-issues', label: 'Sinkron', icon: '🔄', exact: false },
  ];

  const pendingTotal = syncState.pendingCount + syncState.failedCount;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F9FAF5]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7C8B6F] rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {tenantName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1C19] leading-none">{tenantName}</p>
            <p className="text-xs text-[#787868] mt-0.5">{staffName} · {role}</p>
          </div>
        </div>

        {/* Online/offline badge */}
        <div
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            isOnline
              ? 'bg-[#E8F5E2] text-[#2C6B1A]'
              : 'bg-[#FFF3E0] text-[#B35900]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#4CAF50]' : 'bg-[#FF9800]'}`}
          />
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {/* Offline warning banner */}
      {!isOnline && (
        <div className="bg-[#FFF3E0] border-b border-[#FFD54F] px-4 py-2 text-center text-xs text-[#B35900]">
          Mode offline — Pesanan disimpan lokal dan akan dikirim saat koneksi pulih. QRIS tidak tersedia.
        </div>
      )}

      {/* Sync status bar */}
      <SyncStatusBar syncState={syncState} onSyncNow={syncState.syncNow} />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Bottom nav */}
      <nav className="flex bg-white shadow-[0_-4px_24px_rgba(44,79,27,0.06)] border-t border-[#EDEEE9]">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const showBadge = item.href === '/pos/sync-issues' && pendingTotal > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-[#2C4F1B]' : 'text-[#787868]'
              }`}
            >
              <span className="relative">
                <span className={`text-lg leading-none ${active ? 'scale-110' : ''} transition-transform block`}>
                  {item.icon}
                </span>
                {showBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {pendingTotal > 9 ? '9+' : pendingTotal}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
