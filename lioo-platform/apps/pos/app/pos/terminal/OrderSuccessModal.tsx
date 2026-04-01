'use client';

import Link from 'next/link';

type Props = {
  orderNumber: string;
  orderId: string;
  grandTotal: number;
  isOffline?: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  onPayNow: () => void;
};

export default function OrderSuccessModal({ orderNumber, isOffline = false, onClose, onNewOrder, onPayNow }: Props) {
  return (
    <div className="pos-modal-backdrop">
      {/* Backdrop click */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Card */}
      <div className="pos-modal-card" style={{ textAlign: 'center' }}>
        {/* Success icon */}
        <div style={{
          width: '5rem', height: '5rem',
          background: 'linear-gradient(145deg, #7C8B6F 0%, #2C4F1B 100%)',
          borderRadius: '9999px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px rgba(44,79,27,0.28)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>
          {isOffline ? 'Pesanan Disimpan!' : 'Pesanan Dibuat!'}
        </h2>
        <p style={{ color: 'var(--color-outline)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {isOffline
            ? 'Pesanan tersimpan lokal dan akan dikirim ke server saat online.'
            : 'Pesanan berhasil masuk ke sistem.'}
        </p>

        {/* Order number badge */}
        <div style={{
          background: 'var(--color-surface-low)',
          borderRadius: '1rem', padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: 0, marginBottom: '0.375rem' }}>
            Nomor Pesanan
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'monospace', letterSpacing: '0.04em', margin: 0 }}>
            {orderNumber}
          </p>
        </div>

        {/* Offline badge */}
        {isOffline && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.75rem', color: '#B35900',
            background: '#FFF8E1', border: '1px solid #FFE082',
            borderRadius: '9999px', padding: '0.375rem 1rem',
            marginBottom: '1rem',
          }}>
            <span>🕐</span> Menunggu sinkronisasi
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {!isOffline && (
            <button
              onClick={onPayNow}
              className="pos-cta-btn sage-gradient"
              style={{ marginTop: 0, padding: '0.875rem', fontSize: '0.9375rem' }}
            >
              Bayar Sekarang
            </button>
          )}
          <button
            onClick={onNewOrder}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '9999px',
              fontWeight: 600, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background-color 150ms ease',
              ...(isOffline
                ? { background: 'linear-gradient(145deg, #7C8B6F 0%, #2C4F1B 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(44,79,27,0.2)' }
                : { background: 'var(--color-surface-low)', color: 'var(--color-on-surface-variant)' }),
            }}
          >
            Pesanan Baru
          </button>
          <Link
            href={isOffline ? '/pos/sync-issues' : '/pos/orders'}
            style={{
              width: '100%', display: 'block', padding: '0.75rem',
              borderRadius: '9999px', fontWeight: 500, fontSize: '0.875rem',
              color: 'var(--color-outline)', textAlign: 'center', textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
          >
            {isOffline ? 'Lihat Antrian Offline' : 'Lihat Daftar Pesanan'} →
          </Link>
        </div>
      </div>
    </div>
  );
}
