'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { updateOrderStatus } from '@/lib/api';

const TOTAL_SECONDS = 15 * 60; // 15 minutes

// QR Pattern (6×6 grid — symbolic QRIS pattern)
const QR_PATTERN = [
  [1,1,0,1,1,1],
  [1,0,1,0,0,1],
  [0,1,1,1,1,0],
  [1,0,1,0,1,1],
  [1,0,0,1,0,1],
  [1,1,0,1,1,1],
];

// Separate component that uses useSearchParams
function PaymentContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCart();

  const method   = searchParams.get('method')   ?? 'QRIS';
  const orderId  = searchParams.get('order_id') ?? `KIO-${Math.floor(10000 + Math.random() * 90000)}`;
  const total    = parseInt(searchParams.get('total') ?? '0', 10);
  const tableNum = searchParams.get('table')    ?? '4';

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [paid,        setPaid]        = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleHavePaid = async () => {
    setPaid(true);

    try {
      // ✅ SIMULATE WEBHOOK: Update status to PAID directly via API 
      await updateOrderStatus(orderId, 'PAID');
    } catch (e) {
      console.error('Failed to update order status internally', e);
    }

    // Encode cart items to pass as receipt data to success page
    const cartSnapshot = items.map(i => ({ name: i.name, qty: i.quantity, price: i.price }));
    const encodedItems = encodeURIComponent(JSON.stringify(cartSnapshot));
    // Clear the cart after taking snapshot
    clearCart();
    setTimeout(() => {
      router.push(
        `/order/success?order_id=${orderId}&total=${total}&table=${tableNum}&method=${encodeURIComponent(method)}&items=${encodedItems}`
      );
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── Top App Bar ── */}
      <header style={{
        width: '100%', maxWidth: 430,
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(194,201,187,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'var(--surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)', fontSize: 22 }}>arrow_back</span>
          </button>
          <h1 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>Lioo.io</h1>
        </div>
        <button
          style={{
            width: 40, height: 40, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: 'var(--surface-container-low)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)', fontSize: 22 }}>shopping_cart</span>
        </button>
      </header>

      <main style={{
        width: '100%', maxWidth: 430,
        padding: '28px 22px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
      }}>

        {/* ── Amount + Timer ── */}
        <section style={{ textAlign: 'center', width: '100%' }}>
          <p
            className="font-label"
            style={{ fontSize: 10, color: 'var(--on-surface-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}
          >
            Total Amount
          </p>
          <h2 className="font-headline" style={{ fontSize: 38, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
            Rp {total.toLocaleString('id-ID')}
          </h2>
          {/* Timer badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,202,152,0.3)',
            padding: '6px 14px', borderRadius: 99,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>schedule</span>
            <span className="font-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)' }}>
              {secondsLeft > 0 ? `${formatTime(secondsLeft)} remaining` : 'Waktu habis'}
            </span>
          </div>
        </section>

        {/* ── QR Code Container ── */}
        <section style={{
          position: 'relative',
          width: '100%', maxWidth: 300,
          aspectRatio: '1',
          background: '#ffffff',
          borderRadius: 28,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          padding: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(194,201,187,0.15)',
        }}>
          {/* QRIS label */}
          <div style={{
            position: 'absolute', top: 14, left: 16,
            fontFamily: 'Plus Jakarta Sans', fontSize: 10, fontWeight: 900,
            color: 'rgba(114,121,110,0.35)', letterSpacing: '0.05em',
          }}>
            QRIS
          </div>

          {/* Corner brackets */}
          {[
            { top: -2, left: -2, borderStyle: 'top' },
            { top: -2, right: -2, borderStyle: 'top-right' },
            { bottom: -2, left: -2, borderStyle: 'bottom' },
            { bottom: -2, right: -2, borderStyle: 'bottom-right' },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 32, height: 32,
                borderTop: i < 2 ? '4px solid var(--primary)' : 'none',
                borderBottom: i >= 2 ? '4px solid var(--primary)' : 'none',
                borderLeft: i === 0 || i === 2 ? '4px solid var(--primary)' : 'none',
                borderRight: i === 1 || i === 3 ? '4px solid var(--primary)' : 'none',
                borderTopLeftRadius:     i === 0 ? 10 : 0,
                borderTopRightRadius:    i === 1 ? 10 : 0,
                borderBottomLeftRadius:  i === 2 ? 10 : 0,
                borderBottomRightRadius: i === 3 ? 10 : 0,
                ...pos,
              }}
            />
          ))}

          {/* QR grid */}
          <div style={{
            width: '100%', height: '100%',
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 8, padding: 8,
            border: '3px solid rgba(21,66,18,0.1)',
            borderRadius: 12, background: '#fff',
            position: 'relative',
          }}>
            {QR_PATTERN.flat().map((cell, i) => (
              <div
                key={i}
                style={{
                  background: cell ? 'var(--on-surface)' : 'transparent',
                  borderRadius: 4,
                }}
              />
            ))}

            {/* Center logo */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 44, height: 44,
              background: '#ffffff',
              borderRadius: 10,
              border: '2px solid var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            }}>
              <span className="font-headline" style={{ fontSize: 10, fontWeight: 900, color: 'var(--primary)' }}>K.IO</span>
            </div>
          </div>
        </section>

        {/* ── Status ── */}
        <section style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>
              Scan QR with your payment app
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 99,
                background: '#a1d494',
                animation: 'pulse 1.5s infinite',
              }} />
              <p className="font-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-surface-muted)' }}>
                {paid ? 'Pembayaran terdeteksi! Mengalihkan...' : 'Waiting for payment...'}
              </p>
            </div>
          </div>

          {/* Info bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>account_balance_wallet</span>
              <span className="font-label" style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-surface-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Method</span>
              <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                {method === 'QRIS' ? 'QRIS / E-Wallet' : method}
              </span>
            </div>
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>receipt_long</span>
              <span className="font-label" style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-surface-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Order ID</span>
              <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>#{orderId}</span>
            </div>
          </div>

          {/* Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleHavePaid}
              disabled={paid}
              style={{
                width: '100%', padding: '16px 20px',
                background: paid ? 'var(--surface-container)' : 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                color: paid ? 'var(--on-surface-variant)' : '#fff',
                border: 'none', cursor: paid ? 'default' : 'pointer',
                borderRadius: 14, fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: paid ? 'none' : '0 4px 20px rgba(21,66,18,0.25)',
              }}
            >
              {paid ? 'Berhasil! Mengalihkan...' : 'I have paid'}
              {!paid && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
            </button>

            <button
              style={{
                width: '100%', padding: '12px', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
                color: 'var(--on-surface-muted)',
              }}
            >
              Need help with payment?
            </button>
          </div>

          {/* Supported apps (placeholder) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.55, marginTop: 8 }}>
            <p className="font-label" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
              Supported Apps
            </p>
            <div style={{ display: 'flex', gap: 18 }}>
              {[48, 48, 48, 48].map((w, i) => (
                <div key={i} style={{ height: 14, width: w, background: 'var(--outline-variant)', borderRadius: 4 }} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Pulse animation via inline style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)' }}>Memuat...</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
