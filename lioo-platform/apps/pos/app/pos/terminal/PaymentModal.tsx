'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { processPaymentCash } from '../../actions/payments';
import { formatRupiah } from '../../../lib/types';

type OrderSummary = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  customerName?: string | null;
  items?: { productName: string; quantity: number; subtotal: number }[];
};

type PaymentMethod = 'TUNAI' | 'QRIS';

type ReceiptData = {
  orderNumber: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  change?: number;
};

type Props = {
  order: OrderSummary;
  onClose: () => void;
  onPaid: (receipt: ReceiptData) => void;
};

// ─── Cash Quick Amounts ────────────────────────────────────────────────────────
function quickAmounts(grandTotal: number): number[] {
  const roundings = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const result: number[] = [];
  for (const r of roundings) {
    const rounded = Math.ceil(grandTotal / r) * r;
    if (!result.includes(rounded) && rounded >= grandTotal) {
      result.push(rounded);
      if (result.length >= 4) break;
    }
  }
  return result;
}

// ─── QRIS Step ────────────────────────────────────────────────────────────────
function QRISStep({
  orderId,
  grandTotal,
  onPaid,
}: {
  orderId: string;
  grandTotal: number;
  onPaid: () => void;
}) {
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledRef = useRef(false);

  const createInvoice = useCallback(async () => {
    if (calledRef.current) return;
    calledRef.current = true;
    try {
      const res = await fetch('/api/pos/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat invoice QRIS');
      setInvoiceUrl(data.invoiceUrl);
      setPolling(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Buat invoice sekali saat mount
  useEffect(() => {
    createInvoice();
  }, [createInvoice]);

  // Poll status setiap 3 detik
  useEffect(() => {
    if (!polling) return;
    pollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pos/check-payment?orderId=${orderId}`);
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollerRef.current!);
          onPaid();
        }
      } catch {
        // abaikan error polling sementara
      }
    }, 3000);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [polling, orderId, onPaid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-12 h-12 border-4 border-[#2C4F1B] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#787868] text-sm">Membuat QRIS…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
          </svg>
        </div>
        <p className="text-red-600 text-sm font-medium">{error}</p>
        <button
          onClick={() => {
            calledRef.current = false;
            setError(null);
            setLoading(true);
            createInvoice();
          }}
          className="text-sm text-[#2C4F1B] underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* QR Display via Google Chart API (no extra package) */}
      {invoiceUrl && (
        <div className="bg-white border-4 border-[#2C4F1B] rounded-2xl p-2 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(invoiceUrl)}`}
            alt="QRIS Code"
            width={220}
            height={220}
            className="rounded-xl"
          />
        </div>
      )}

      {/* Nominal */}
      <div className="bg-[#F3F4EF] rounded-2xl px-8 py-3 text-center">
        <p className="text-xs text-[#787868] font-semibold uppercase tracking-wider mb-0.5">
          Total Bayar
        </p>
        <p className="text-2xl font-bold text-[#2C4F1B]">{formatRupiah(grandTotal)}</p>
      </div>

      {/* Link fallback */}
      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#2C4F1B] underline"
        >
          Buka halaman pembayaran →
        </a>
      )}

      {/* Status waiting */}
      <div className="flex items-center gap-2 text-sm text-[#787868]">
        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
        Menunggu pembayaran pelanggan…
      </div>
    </div>
  );
}

// ─── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptView({
  receipt,
  orderNumber,
  onClose,
}: {
  receipt: ReceiptData;
  orderNumber: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Success Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] rounded-full flex items-center justify-center shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1A1C19]">Pembayaran Berhasil!</h2>
        <div className="bg-[#F3F4EF] rounded-xl px-5 py-2 text-center">
          <p className="text-xs text-[#787868] uppercase tracking-wider font-semibold mb-0.5">
            Nomor Pesanan
          </p>
          <p className="text-xl font-bold text-[#2C4F1B] font-mono">{orderNumber}</p>
        </div>
      </div>

      {/* Payment Detail */}
      <div className="border border-[#E8EBE4] rounded-2xl divide-y divide-[#E8EBE4] text-sm">
        <div className="flex justify-between px-4 py-3">
          <span className="text-[#787868]">Total Tagihan</span>
          <span className="font-bold text-[#1A1C19]">{formatRupiah(receipt.grandTotal)}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-[#787868]">Metode</span>
          <span className="font-semibold text-[#1A1C19]">
            {receipt.paymentMethod === 'TUNAI' ? 'Tunai' : 'QRIS'}
          </span>
        </div>
        {receipt.paymentMethod === 'TUNAI' && receipt.amountReceived != null && (
          <>
            <div className="flex justify-between px-4 py-3">
              <span className="text-[#787868]">Uang Diterima</span>
              <span className="font-semibold text-[#1A1C19]">
                {formatRupiah(receipt.amountReceived)}
              </span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-[#787868]">Kembalian</span>
              <span className="font-bold text-green-700 text-base">
                {formatRupiah(receipt.change ?? 0)}
              </span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-3 rounded-full font-bold shadow-md"
      >
        Selesai
      </button>
    </div>
  );
}

// ─── Main PaymentModal ─────────────────────────────────────────────────────────
export default function PaymentModal({ order, onClose, onPaid }: Props) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashInput, setCashInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const grandTotal = order.grandTotal;
  const cashAmount = parseInt(cashInput.replace(/\D/g, ''), 10) || 0;
  const change = cashAmount - grandTotal;
  const isEnough = cashAmount >= grandTotal;

  async function handleCashConfirm() {
    setIsPending(true);
    setError(null);
    try {
      const result = await processPaymentCash(order.id, cashAmount);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const r: ReceiptData = {
        orderNumber: order.orderNumber,
        grandTotal,
        paymentMethod: 'TUNAI',
        amountReceived: cashAmount,
        change: result.change,
      };
      setReceipt(r);
      onPaid(r);
    } finally {
      setIsPending(false);
    }
  }

  function handleQRISPaid() {
    const r: ReceiptData = {
      orderNumber: order.orderNumber,
      grandTotal,
      paymentMethod: 'QRIS',
    };
    setReceipt(r);
    onPaid(r);
  }

  return (
    <div className="pos-modal-backdrop">
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={receipt ? onClose : undefined}
      />

      {/* Card */}
      <div className="pos-modal-card">
        {/* Header */}
        {!receipt && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            {method ? (
              <button
                onClick={() => {
                  setMethod(null);
                  setError(null);
                  setCashInput('');
                }}
                className="p-2 rounded-full hover:bg-[#F3F4EF]"
                aria-label="Kembali"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#43493E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div />
            )}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
              {method === 'TUNAI' ? 'Pembayaran Tunai' : method === 'QRIS' ? 'Pembayaran QRIS' : 'Pilih Metode Bayar'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F3F4EF]"
              aria-label="Tutup"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#43493E" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* ── RECEIPT ── */}
        {receipt ? (
          <ReceiptView receipt={receipt} orderNumber={order.orderNumber} onClose={onClose} />
        ) : !method ? (
          /* ── METHOD SELECTION ── */
          <div className="flex flex-col gap-4">
            {/* Order summary */}
            <div style={{ background: 'var(--color-surface-low)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: 0, marginBottom: '0.25rem' }}>
                {order.orderNumber}
              </p>
              {order.customerName && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: '-0.25rem 0 0.5rem', fontWeight: 600 }}>
                  👤 {order.customerName}
                </p>
              )}
              <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>{formatRupiah(grandTotal)}</p>
            </div>

            <button
              onClick={() => setMethod('TUNAI')}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                border: '2px solid var(--color-surface-container)', borderRadius: '0.875rem',
                background: 'var(--color-background)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 150ms ease', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = '#F7F9F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-surface-container)'; e.currentTarget.style.background = 'var(--color-background)'; }}
            >
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(44,79,27,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="13" rx="2" stroke="#2C4F1B" strokeWidth="2" />
                  <path d="M12 10v5M10 12h4" stroke="#2C4F1B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Tunai</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: 0 }}>Bayar dengan uang tunai, hitung kembalian</p>
              </div>
            </button>

            <button
              onClick={() => setMethod('QRIS')}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                border: '2px solid var(--color-surface-container)', borderRadius: '0.875rem',
                background: 'var(--color-background)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 150ms ease', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = '#F7F9F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-surface-container)'; e.currentTarget.style.background = 'var(--color-background)'; }}
            >
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(44,79,27,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="1" stroke="#2C4F1B" strokeWidth="2" />
                  <rect x="13" y="3" width="8" height="8" rx="1" stroke="#2C4F1B" strokeWidth="2" />
                  <rect x="3" y="13" width="8" height="8" rx="1" stroke="#2C4F1B" strokeWidth="2" />
                  <path d="M13 17h2m2 0h2M13 13h2m4 0v2m0 2v2" stroke="#2C4F1B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>QRIS</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: 0 }}>Scan QR, bayar pakai e-wallet / m-banking</p>
              </div>
            </button>
          </div>
        ) : method === 'TUNAI' ? (
          /* ── CASH FLOW ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--color-surface-low)', borderRadius: '1rem', padding: '0.875rem 1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: 0, marginBottom: '0.25rem' }}>
                Total Tagihan
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>{formatRupiah(grandTotal)}</p>
            </div>

            {/* Input nominal */}
            <div>
              <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
                Uang Diterima
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787868] font-semibold">
                  Rp
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={cashInput}
                  onChange={(e) =>
                    setCashInput(
                      e.target.value.replace(/\D/g, '').replace(/^0+/, '') || ''
                    )
                  }
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-3 border-2 border-[#D5D9CE] rounded-xl text-[#1A1C19] font-bold text-lg focus:outline-none focus:border-[#2C4F1B] transition-colors"
                />
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts(grandTotal).map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashInput(String(amt))}
                  className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    cashAmount === amt
                      ? 'border-[#2C4F1B] bg-[#2C4F1B] text-white'
                      : 'border-[#D5D9CE] text-[#43493E] hover:border-[#2C4F1B]'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>

            {/* Kembalian */}
            <div
              className={`rounded-2xl px-5 py-3 text-center transition-all ${
                isEnough ? 'bg-green-50 border border-green-200' : 'bg-[#F3F4EF]'
              }`}
            >
              <p className="text-xs text-[#787868] font-semibold uppercase tracking-wider mb-0.5">
                Kembalian
              </p>
              <p
                className={`text-2xl font-bold ${
                  isEnough ? 'text-green-700' : 'text-[#787868]'
                }`}
              >
                {isEnough ? formatRupiah(change) : '—'}
              </p>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              onClick={handleCashConfirm}
              disabled={!isEnough || isPending}
              className="pos-cta-btn sage-gradient"
              style={{ marginTop: 0, padding: '0.875rem', fontSize: '0.9375rem', opacity: (!isEnough || isPending) ? 0.4 : 1 }}
            >
              {isPending ? 'Memproses…' : 'Konfirmasi Pembayaran'}
            </button>
          </div>
        ) : (
          /* ── QRIS FLOW ── */
          <QRISStep
            orderId={order.id}
            grandTotal={grandTotal}
            onPaid={handleQRISPaid}
          />
        )}
      </div>
    </div>
  );
}
