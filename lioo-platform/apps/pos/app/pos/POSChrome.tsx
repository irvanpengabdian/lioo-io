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
    { href: '/pos', label: 'Kasir', msIcon: 'point_of_sale', exact: true },
    { href: '/pos/orders', label: 'Pesanan', msIcon: 'receipt_long', exact: false },
    { href: '/pos/sync-issues', label: 'Sinkronisasi', msIcon: 'sync', exact: false },
  ];

  const pendingTotal = syncState.pendingCount + syncState.failedCount;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAF5]">

      {/* ── Left Sidebar (tablet / desktop) ── */}
      <aside className="hidden md:flex flex-col h-full w-64 shrink-0 bg-stone-50 p-4">

        {/* Brand */}
        <div className="px-4 pt-6 pb-4 mb-2">
          <h1 className="text-xl font-extrabold text-[#062100] leading-none truncate">{tenantName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-medium text-[#787868] uppercase tracking-widest truncate">
              Terminal · {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const showBadge = item.href === '/pos/sync-issues' && pendingTotal > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-emerald-100/60 text-[#2C4F1B]'
                    : 'text-[#787868] hover:bg-stone-200/50 hover:text-[#1A1C19]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.msIcon}</span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                {showBadge && (
                  <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                    {pendingTotal > 9 ? '9+' : pendingTotal}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: sync status + staff info */}
        <div className="mt-auto space-y-1 pt-4 border-t border-stone-100">
          {/* Sync pill */}
          <div
            className={`px-4 py-2 mb-2 flex items-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter ${
              syncState.isSyncing
                ? 'bg-blue-50 text-blue-800'
                : pendingTotal > 0
                ? 'bg-amber-50 text-amber-800'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {syncState.isSyncing ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Menyinkronkan…
              </>
            ) : pendingTotal > 0 ? (
              <>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                {pendingTotal} pesanan pending
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Semua tersinkron
              </>
            )}
          </div>

          {/* Staff */}
          <div className="px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7C8B6F] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(staffName.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1A1C19] truncate">{staffName || 'Staff'}</p>
              <p className="text-[10px] text-[#787868] capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile-only top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-[0_4px_24px_rgba(44,79,27,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7C8B6F] rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {tenantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1C19] leading-none">{tenantName}</p>
              <p className="text-xs text-[#787868] mt-0.5">{staffName} · {role}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            isOnline ? 'bg-[#E8F5E2] text-[#2C6B1A]' : 'bg-[#FFF3E0] text-[#B35900]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#4CAF50]' : 'bg-[#FF9800]'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </header>

        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-[#FFF3E0] border-b border-[#FFD54F] px-4 py-2 text-center text-xs text-[#B35900]">
            Mode offline — Pesanan disimpan lokal dan akan dikirim saat koneksi pulih. QRIS tidak tersedia.
          </div>
        )}

        {/* Sync status bar */}
        <SyncStatusBar syncState={syncState} onSyncNow={syncState.syncNow} />

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Mobile-only bottom nav */}
        <nav className="md:hidden flex bg-white border-t border-[#EDEEE9]">
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
                  <span className="material-symbols-outlined text-xl leading-none block">{item.msIcon}</span>
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
    </div>
  );
}
