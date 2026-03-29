'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { createOrder, createXenditInvoice } from '@/lib/api';

type PaymentMethod = 'QRIS' | 'GoPay' | 'OVO' | 'ShopeePay' | 'VirtualAccount';

const WALLETS = [
  { id: 'GoPay' as PaymentMethod,       label: 'GoPay',           sub: 'Fast & Secure',                icon: 'account_balance_wallet', iconColor: '#009A44' },
  { id: 'OVO' as PaymentMethod,         label: 'OVO',             sub: 'Earn points with every pay',   icon: 'wallet',                iconColor: '#7B3DB5' },
  { id: 'ShopeePay' as PaymentMethod,   label: 'ShopeePay',       sub: 'Exclusive merchant deals',     icon: 'payments',              iconColor: '#EE4D2D' },
];

function CheckoutContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tableNumber  = searchParams.get('table') ?? '4';
  const { items, totalPrice, clearCart } = useCart();

  const [selected, setSelected] = useState<PaymentMethod>('QRIS');
  const [loading,  setLoading]  = useState(false);
  
  // In-frame Payment State
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderId,     setOrderId]     = useState<string | null>(null);

  const ppn   = Math.round(totalPrice * 0.11);
  const total = totalPrice + ppn;

  const handlePayNow = async () => {
    setLoading(true);
    try {
      // 1. Create order
      const res = await createOrder({
        branch_id:    process.env.NEXT_PUBLIC_BRANCH_ID ?? '',
        table_number: tableNumber,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, notes: i.notes })),
        payment_method: selected,
      });
      
      // 2. Clear Cart
      clearCart();

      // 3. Create Xendit Invoice
      const invoice = await createXenditInvoice(res.id);
      
      if (invoice?.success && invoice?.data?.invoiceUrl) {
        // Open Xendit in an iframe overlay instead of redirecting
        setOrderId(res.id);
        setCheckoutUrl(invoice.data.invoiceUrl);
      } else {
        // Error fallback
        console.error("Xendit URL not found", invoice);
        router.push(`/order/failed?orderId=${res.id}`);
      }
    } catch {
      // Use mock order ID for demo if backend fails
      const mockId = `KIO-${Math.floor(10000 + Math.random() * 90000)}`;
      router.push(`/payment?method=${selected}&order_id=${mockId}&total=${total}&table=${tableNumber}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top App Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,250,242,0.88)', backdropFilter: 'blur(16px)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(194,201,187,0.3)',
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

      <main style={{ flex: 1, padding: '0 22px 160px' }}>
        {/* ── Hero ── */}
        <section style={{ marginTop: 28, marginBottom: 36 }}>
          <h2 className="font-headline" style={{ fontSize: 30, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>
            Select Payment Method
          </h2>
          <p className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: 14, marginTop: 8 }}>
            Choose your preferred way to pay for your delicious order.
          </p>
        </section>

        {/* ── RECOMMENDED: QRIS ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Recommended</SectionLabel>
          <div
            onClick={() => setSelected('QRIS')}
            style={{
              position: 'relative',
              background: '#ffffff',
              borderRadius: 14,
              padding: '22px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: selected === 'QRIS' ? '2px solid var(--primary)' : '2px solid rgba(188,240,174,0.4)',
              cursor: 'pointer',
            }}
          >
            {/* Recommended badge */}
            <div style={{ position: 'absolute', top: 14, right: 14 }}>
              <span style={{
                background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)',
                fontSize: 9, fontWeight: 700, fontFamily: 'Inter',
                padding: '3px 10px', borderRadius: 99, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Recommended
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(188,240,174,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 28 }}>qr_code_2</span>
              </div>
              <div>
                <h3 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>QRIS</h3>
                <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  Instant payment via any banking or e-wallet app
                </p>
              </div>
              <div style={{ height: 4, background: 'var(--surface-container)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'var(--primary)', opacity: 0.12 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── DIGITAL WALLETS ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Digital Wallets</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WALLETS.map(w => (
              <div
                key={w.id}
                onClick={() => setSelected(w.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#ffffff',
                  borderRadius: 14, padding: '16px 18px',
                  border: selected === w.id ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: 'var(--surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: w.iconColor }}>{w.icon}</span>
                  </div>
                  <div>
                    <p className="font-headline" style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{w.label}</p>
                    <p className="font-body" style={{ fontSize: 11.5, color: 'var(--on-surface-variant)' }}>{w.sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ color: selected === w.id ? 'var(--primary)' : 'var(--outline-variant)', fontSize: 22 }}>
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Fixed Footer ── */}
      <footer style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        padding: '20px 22px 28px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(194,201,187,0.2)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.06)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, padding: '0 4px' }}>
          <div>
            <p className="font-label" style={{ fontSize: 9, color: 'var(--on-surface-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Total Payment
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="font-headline" style={{ fontSize: 17, fontWeight: 600, color: 'var(--on-surface)' }}>Rp</span>
              <span className="font-headline" style={{ fontSize: 30, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.5px' }}>
                {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <p className="font-body" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            Meja {tableNumber.padStart(2, '0')}
          </p>
        </div>

        <button
          onClick={handlePayNow}
          disabled={loading || items.length === 0}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: loading || items.length === 0 ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
            color: loading || items.length === 0 ? 'var(--on-surface-muted)' : '#fff',
            border: 'none', cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 20px rgba(21,66,18,0.25)',
            fontFamily: 'Plus Jakarta Sans', fontSize: 17, fontWeight: 700,
          }}
        >
          {loading ? 'Memproses...' : 'Pay Now'}
          {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>}
        </button>

        {/* Bottom indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
          <div style={{ width: 44, height: 5, background: 'var(--surface-container-high)', borderRadius: 99 }} />
        </div>
      </footer>

      {/* ── Seamless Xendit Payment Overlay (IFrame) ── */}
      {checkoutUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out forwards'
        }}>
          {/* Header Controls */}
          <header style={{
            padding: '16px 20px', background: 'var(--surface-bright)', borderBottom: '1px solid var(--outline-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <button onClick={() => setCheckoutUrl(null)} style={{ border: 'none', background: 'var(--surface-container)', width: 32, height: 32, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
               </button>
               <div>
                 <h3 className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>Secure Payment</h3>
                 <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Powered by Xendit</p>
               </div>
             </div>
             <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.open(checkoutUrl, '_blank')}
                  style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                >
                  Buka di Tab Baru
                </button>
                <button
                  onClick={() => router.push(`/order/success?orderId=${orderId}`)}
                  style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(21,66,18,0.2)' }}
                >
                  Saya Sudah Bayar
                </button>
             </div>
          </header>
          {/* IFrame Sub-Browser */}
          <div style={{ flex: 1, backgroundColor: '#f4f5f7', position: 'relative' }}>
             <iframe
               src={checkoutUrl}
               style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
               allow="payment"
               title="Xendit Payment Gateway"
             />
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}} />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-label"
      style={{
        fontSize: 10, fontWeight: 700, color: 'var(--on-surface-muted)',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)' }}>Memuat...</p>
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
