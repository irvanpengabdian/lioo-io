'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OrderFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--error, #e53935)' }}>error</span>
        <h2 className="font-headline" style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Pembayaran Gagal</h2>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Maaf, proses pembayaran tagihan untuk pesanan #{orderId.slice(0, 8)} gagal atau dibatalkan.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: 24,
            padding: '12px 24px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Kembali ke Menu Utama
        </button>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <OrderFailedContent />
    </Suspense>
  );
}
