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
    { href: '/pos', label: 'Register', msIcon: 'point_of_sale', exact: true },
    { href: '/pos/orders', label: 'Orders', msIcon: 'receipt_long', exact: false },
    { href: '/pos/sync-issues', label: 'Sync', msIcon: 'sync', exact: false },
  ];

  const pendingTotal = syncState.pendingCount + syncState.failedCount;

  return (
    <div className="pos-root">
      {/* ── Left Sidebar (tablet / desktop) ── */}
      <aside className="pos-sidebar hidden md:flex">

        {/* Brand */}
        <div className="pos-sidebar-brand">
          <h1>{tenantName}</h1>
          <div className="pos-sidebar-status">
            <span className={`pos-sidebar-dot ${isOnline ? 'pos-sidebar-dot--online' : 'pos-sidebar-dot--offline'}`} />
            <span className="pos-sidebar-status-text">
              Terminal · {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="pos-nav">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const showBadge = item.href === '/pos/sync-issues' && pendingTotal > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pos-nav-item ${active ? 'pos-nav-item--active' : ''}`}
              >
                <span className="material-symbols-outlined pos-nav-icon" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.msIcon}
                </span>
                <span>{item.label}</span>
                {showBadge && (
                  <span style={{
                    marginLeft: 'auto',
                    minWidth: '1.25rem',
                    height: '1.25rem',
                    background: '#DC2626',
                    color: '#fff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 0.25rem',
                  }}>
                    {pendingTotal > 9 ? '9+' : pendingTotal}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: sync status + staff info */}
        <div className="pos-sidebar-bottom">
          {/* Sync pill */}
          <div className={`pos-sync-pill ${
            syncState.isSyncing
              ? 'pos-sync-pill--syncing'
              : pendingTotal > 0
              ? 'pos-sync-pill--pending'
              : 'pos-sync-pill--ok'
          }`}>
            {syncState.isSyncing ? (
              <>
                <div style={{ width: '0.75rem', height: '0.75rem', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '9999px' }} className="animate-spin" />
                Syncing…
              </>
            ) : pendingTotal > 0 ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', fontVariationSettings: "'FILL' 1" }}>warning</span>
                {pendingTotal} pending
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                All synced
              </>
            )}
          </div>

          {/* Staff */}
          <div className="pos-staff-row">
            <div className="pos-staff-avatar">
              {(staffName.charAt(0) || '?').toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{staffName || 'Staff'}</p>
              <p style={{ fontSize: '0.625rem', color: 'var(--color-outline)', textTransform: 'capitalize', margin: 0 }}>{role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile-only top bar */}
        <header className="md:hidden" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'var(--color-surface-white)',
          boxShadow: '0 4px 24px rgba(44,79,27,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.5rem',
              background: '#7C8B6F', color: '#fff',
              fontSize: '0.875rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tenantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface)', lineHeight: 1, margin: 0 }}>{tenantName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginTop: '0.125rem', margin: 0 }}>{staffName} · {role}</p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: isOnline ? '#E8F5E2' : '#FFF8E1',
            color: isOnline ? '#1B5E20' : '#B35900',
          }}>
            <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: isOnline ? '#4CAF50' : '#FF9800' }} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </header>

        {/* Offline banner */}
        {!isOnline && (
          <div className="pos-offline-banner">
            Mode offline — Pesanan disimpan lokal dan akan dikirim saat koneksi pulih. QRIS tidak tersedia.
          </div>
        )}

        {/* Sync status bar */}
        <SyncStatusBar syncState={syncState} onSyncNow={syncState.syncNow} />

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>{children}</main>

        {/* Mobile-only bottom nav */}
        <nav className="md:hidden" style={{
          display: 'flex',
          background: 'var(--color-surface-white)',
          borderTop: '1px solid var(--color-surface-container)',
        }}>
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const showBadge = item.href === '/pos/sync-issues' && pendingTotal > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.625rem 0',
                  gap: '0.125rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: active ? 'var(--color-primary)' : 'var(--color-outline)',
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                }}
              >
                <span style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.375rem', display: 'block', lineHeight: 1 }}>{item.msIcon}</span>
                  {showBadge && (
                    <span style={{
                      position: 'absolute', top: '-0.25rem', right: '-0.625rem',
                      minWidth: '1rem', height: '1rem', background: '#DC2626', color: '#fff',
                      fontSize: '0.5625rem', fontWeight: 700, borderRadius: '9999px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.125rem',
                    }}>
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
