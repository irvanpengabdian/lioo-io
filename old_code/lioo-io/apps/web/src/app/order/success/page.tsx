'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';

// ─── Animated Checkmark SVG ───────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <svg
      viewBox="0 0 80 80"
      style={{ width: 80, height: 80, display: 'block' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="var(--primary)" opacity="0.12" />
      <circle cx="40" cy="40" r="32" fill="var(--primary)" opacity="0.18" />
      <circle cx="40" cy="40" r="24" fill="var(--primary)" />
      {/* Check mark */}
      <path
        d="M27 40.5L36 50L54 31"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 40,
          strokeDashoffset: 0,
          animation: 'drawCheck 0.5s ease 0.3s both',
        }}
      />
      <style>{`
        @keyframes drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes queuePop {
          0%   { transform: scale(0.7);   opacity: 0; }
          60%  { transform: scale(1.12);  opacity: 1; }
          100% { transform: scale(1);     opacity: 1; }
        }
        @keyframes statusPulse {
          0%, 100% { background: rgba(161,212,148,0.3); }
          50%       { background: rgba(161,212,148,0.65); }
        }
      `}</style>
    </svg>
  );
}

// ─── Order Status Step ────────────────────────────────────────────────────────
function StatusStep({
  icon, label, sublabel, active, done, delay,
}: {
  icon: string; label: string; sublabel: string;
  active?: boolean; done?: boolean; delay: number;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        animation: `fadeSlideUp 0.4s ease ${delay}s both`,
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: done
          ? 'var(--primary)'
          : active
          ? 'var(--primary-fixed)'
          : 'var(--surface-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? '0 2px 12px rgba(21,66,18,0.2)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            color: done ? '#fff' : active ? 'var(--primary)' : 'var(--on-surface-muted)',
            fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {done ? 'check_circle' : icon}
        </span>
      </div>

      {/* Text */}
      <div style={{ flexGrow: 1, paddingTop: 2 }}>
        <p
          className="font-headline"
          style={{
            fontSize: 14, fontWeight: 700,
            color: active || done ? 'var(--on-surface)' : 'var(--on-surface-muted)',
          }}
        >
          {label}
        </p>
        <p
          className="font-body"
          style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 1 }}
        >
          {sublabel}
        </p>
      </div>

      {/* Active pulsing dot */}
      {active && (
        <div style={{
          width: 10, height: 10, borderRadius: 99,
          background: '#a1d494', flexShrink: 0, marginTop: 6,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

// ─── Connector line between steps ────────────────────────────────────────────
function StepConnector({ done }: { done: boolean }) {
  return (
    <div style={{ paddingLeft: 19, margin: '4px 0' }}>
      <div style={{
        width: 2, height: 24, borderRadius: 99,
        background: done ? 'var(--primary)' : 'var(--outline-variant)',
        transition: 'background 0.6s ease',
      }} />
    </div>
  );
}

// ─── Receipt Item Row ─────────────────────────────────────────────────────────
function ReceiptRow({ name, qty, price }: { name: string; qty: number; price: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingTop: 2 }}>
      <div style={{ flexGrow: 1 }}>
        <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 500 }}>
          {name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginTop: 1 }}>x{qty}</p>
      </div>
      <p className="font-headline" style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', flexShrink: 0 }}>
        Rp {(price * qty).toLocaleString('id-ID')}
      </p>
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────
function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId  = searchParams.get('order_id') ?? `KIO-${Math.floor(10000 + Math.random() * 90000)}`;

  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [queueNumber] = useState(() => Math.floor(Math.random() * 90) + 10);
  const [currentStep, setCurrentStep] = useState(0); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(API_URL);

    const handleDataUpdate = (data: any) => {
      setOrderInfo((prev: any) => prev ? { ...prev, ...data } : data);
      const status = data.status;
      if (status) {
        if (['PENDING', 'PAID'].includes(status)) setCurrentStep(0);
        else if (status === 'COOKING') setCurrentStep(1);
        else if (status === 'SERVED') setCurrentStep(2);
        else if (status === 'COMPLETED') setCurrentStep(3);
      }
    };

    // Initial check
    fetch(`${API_URL}/order/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.status) {
          if (data.status === 'PENDING') {
             fetch(`${API_URL}/order/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAID' })
             })
             .then(r => r.json())
             .then(patched => handleDataUpdate(patched));
             handleDataUpdate({ ...data, status: 'PAID' }); // Optimistic setup
          } else {
             handleDataUpdate(data);
          }
        }
      })
      .catch(() => {});

    // Listen for real-time updates
    socket.on('orderStatusUpdated', (updatedOrder: any) => {
      console.log('socket event', updatedOrder);
      if (updatedOrder.id === orderId) {
        handleDataUpdate(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // Fallback to URL params if data is not loaded yet (for visual smoothness)
  const totalAmountStr = orderInfo ? Number(orderInfo.total_amount) : parseInt(searchParams.get('total') ?? '0', 10);
  const total = isNaN(totalAmountStr) ? 0 : totalAmountStr;
  const tax = Math.round(total * 0.1);
  const subtotal = total - tax;
  
  const paymentMethodInfo = orderInfo ? orderInfo.payment_method : searchParams.get('method') ?? 'QRIS';
  const tableNumberInfo = orderInfo?.table?.table_number ? orderInfo.table.table_number : searchParams.get('table') ?? '4';
  
  const itemsList = orderInfo?.order_items 
      ? orderInfo.order_items.map((i: any) => ({ name: i.product?.name || 'Item', qty: i.quantity, price: Number(i.subtotal)/i.quantity }))
      : [];

  const steps = [
    {
      icon: 'receipt_long',
      label: 'Pesanan Dikonfirmasi',
      sublabel: 'Pembayaran diterima & pesanan tercatat',
    },
    {
      icon: 'outdoor_grill',
      label: 'Sedang Disiapkan',
      sublabel: 'Dapur sedang memasak pesananmu',
    },
    {
      icon: 'dining',
      label: 'Siap Diambil / Diantar',
      sublabel: 'Pesananmu akan segera tiba di mejamu',
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      {/* ── Header ── */}
      <header style={{
        width: '100%', maxWidth: 430,
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(235,235,223,0.92)', backdropFilter: 'blur(16px)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(198,200,192,0.4)',
      }}>
        <h1 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
          Lioo.io
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--secondary-container)', borderRadius: 99, padding: '4px 12px 4px 8px',
        }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--on-secondary-container)', fontSize: 14 }}>table_restaurant</span>
          <span className="font-label" style={{ fontSize: 10, fontWeight: 700, color: 'var(--on-secondary-container)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Table {tableNumberInfo.padStart(2, '0')}
          </span>
        </div>
      </header>

      <main style={{
        width: '100%', maxWidth: 430,
        padding: '28px 20px 48px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>

        {/* ── Success Hero ── */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, textAlign: 'center',
          animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <AnimatedCheck />
          <div>
            <h2 className="font-headline" style={{ fontSize: 26, fontWeight: 800, color: 'var(--on-surface)', marginBottom: 6 }}>
              Pembayaran Berhasil! 🎉
            </h2>
            <p className="font-body" style={{ fontSize: 14, color: 'var(--on-surface-muted)' }}>
              Pesananmu sedang kami proses. Terima kasih!
            </p>
          </div>
        </section>

        {/* ── Queue Number ── */}
        <section style={{
          background: 'var(--primary)',
          borderRadius: 24,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(21,66,18,0.25)',
          animation: 'queuePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
              Nomor Antrean
            </p>
            <p className="font-headline" style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              {queueNumber}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '8px 14px', marginBottom: 8,
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Order ID</p>
              <p className="font-headline" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>#{orderId}</p>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'Manrope' }}>
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </div>
        </section>

        {/* ── Order Status Tracker ── */}
        <section style={{
          background: 'var(--surface-card)',
          borderRadius: 20, padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 99,
              background: '#a1d494',
              animation: 'statusPulse 1.8s ease-in-out infinite',
            }} />
            <p className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
              Status Pesanan
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <StatusStep
                  icon={step.icon}
                  label={step.label}
                  sublabel={step.sublabel}
                  done={currentStep > i}
                  active={currentStep === i}
                  delay={0.3 + i * 0.12}
                />
                {i < steps.length - 1 && <StepConnector done={currentStep > i} />}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ── Receipt Summary ── */}
        <section style={{
          background: 'var(--surface-card)',
          borderRadius: 20, padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          animation: 'fadeSlideUp 0.5s ease 0.6s both',
        }}>
          <p className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 16 }}>
            Ringkasan Pesanan
          </p>

          {itemsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itemsList.map((item: any, i: number) => (
                <ReceiptRow key={i} name={item.name} qty={item.qty} price={item.price} />
              ))}
            </div>
          ) : (
            <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>
              Detail item tidak tersedia.
            </p>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--outline-variant)', margin: '16px 0' }} />

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>Subtotal</p>
              <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface)' }}>
                Rp {subtotal.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>PPN 10%</p>
              <p className="font-body" style={{ fontSize: 13, color: 'var(--on-surface)' }}>
                + Rp {tax.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <p className="font-headline" style={{ fontSize: 15, fontWeight: 800, color: 'var(--on-surface)' }}>Total Dibayar</p>
              <p className="font-headline" style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>
                Rp {total.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="font-body" style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>Metode Pembayaran</p>
              <div style={{
                background: 'var(--primary-fixed)', borderRadius: 99,
                padding: '3px 10px',
              }}>
                <p className="font-label" style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }}>
                  {paymentMethodInfo === 'QRIS' ? 'QRIS / E-Wallet' : paymentMethodInfo}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Info tiles ── */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          animation: 'fadeSlideUp 0.5s ease 0.75s both',
        }}>
          <div style={{
            background: 'var(--surface-card)', borderRadius: 16, padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)' }}>
              schedule
            </span>
            <p className="font-label" style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-surface-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Estimasi Waktu
            </p>
            <p className="font-headline" style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)' }}>
              10–15 mnt
            </p>
          </div>
          <div style={{
            background: 'var(--surface-card)', borderRadius: 16, padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)' }}>
              table_restaurant
            </span>
            <p className="font-label" style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-surface-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Meja
            </p>
            <p className="font-headline" style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)' }}>
              No. {tableNumberInfo.padStart(2, '0')}
            </p>
          </div>
        </section>

        {/* ── Back to Menu CTA ── */}
        <section style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          animation: 'fadeSlideUp 0.5s ease 0.9s both',
        }}>
          <button
            onClick={() => router.push(`/?table=${tableNumberInfo}`)}
            style={{
              width: '100%', padding: '16px',
              background: 'var(--primary)',
              color: '#fff', border: 'none', cursor: 'pointer',
              borderRadius: 14, fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(21,66,18,0.25)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>storefront</span>
            Pesan Lagi
          </button>
          <p
            className="font-body"
            style={{ textAlign: 'center', fontSize: 12, color: 'var(--on-surface-muted)' }}
          >
            Butuh bantuan?{' '}
            <span
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => alert('Hubungi staff kami di meja kasir 😊')}
            >
              Hubungi Staff
            </span>
          </p>
        </section>
      </main>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes queuePop {
          0%   { transform: scale(0.7);   opacity: 0; }
          60%  { transform: scale(1.05);  opacity: 1; }
          100% { transform: scale(1);     opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes statusPulse {
          0%, 100% { background: rgba(161,212,148,0.35); }
          50%       { background: rgba(161,212,148,0.8); }
        }
      `}</style>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)' }}>Memuat...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
