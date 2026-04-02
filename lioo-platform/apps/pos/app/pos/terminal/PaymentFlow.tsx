'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { processPaymentCash } from '../../actions/payments';
import { formatRupiah } from '../../../lib/types';

export type PaymentOrderSummary = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  customerName?: string | null;
  /** Opsional (mis. dari ScanCodeModal) — tidak dipakai UI inti */
  items?: { productName: string; quantity: number; subtotal: number }[];
};

type PaymentMethod = 'TUNAI' | 'QRIS';

export type ReceiptData = {
  orderNumber: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  change?: number;
};

type Props = {
  order: PaymentOrderSummary;
  onClose: () => void;
  onPaid: (receipt: ReceiptData) => void;
  /** sidebar = compact layout di panel kanan; modal = lebar penuh */
  variant?: 'modal' | 'sidebar';
};

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

function QRISStep({
  orderId,
  grandTotal,
  onPaid,
  compact,
}: {
  orderId: string;
  grandTotal: number;
  onPaid: () => void;
  compact?: boolean;
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

  useEffect(() => {
    createInvoice();
  }, [createInvoice]);

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
        // ignore
      }
    }, 3000);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [polling, orderId, onPaid]);

  const qrSize = compact ? 160 : 220;

  if (loading) {
    return (
      <div className={`flex flex-col items-center gap-3 ${compact ? 'py-6' : 'py-10'}`}>
        <div className="w-10 h-10 border-4 border-[#2C4F1B] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#787868] text-xs">Membuat QRIS…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-red-600 text-xs font-medium">{error}</p>
        <button
          type="button"
          onClick={() => {
            calledRef.current = false;
            setError(null);
            setLoading(true);
            createInvoice();
          }}
          className="text-xs text-[#2C4F1B] underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-3' : 'gap-5'}`}>
      {invoiceUrl && (
        <div className="bg-white border-2 border-[#2C4F1B] rounded-xl p-1.5 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(invoiceUrl)}`}
            alt="QRIS"
            width={qrSize}
            height={qrSize}
            className="rounded-lg"
          />
        </div>
      )}
      <div className="bg-[#F3F4EF] rounded-xl px-4 py-2 text-center">
        <p className="text-[10px] text-[#787868] font-semibold uppercase mb-0.5">Total</p>
        <p className={`font-bold text-[#2C4F1B] ${compact ? 'text-lg' : 'text-2xl'}`}>
          {formatRupiah(grandTotal)}
        </p>
      </div>
      {invoiceUrl && (
        <a href={invoiceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#2C4F1B] underline">
          Buka pembayaran →
        </a>
      )}
      <div className="flex items-center gap-2 text-[11px] text-[#787868]">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Menunggu bayar…
      </div>
    </div>
  );
}

function ReceiptView({
  receipt,
  orderNumber,
  onClose,
  compact,
}: {
  receipt: ReceiptData;
  orderNumber: string;
  onClose: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] rounded-full flex items-center justify-center shadow-lg`}
        >
          <svg width={compact ? 24 : 32} height={compact ? 24 : 32} viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className={`font-bold text-[#1A1C19] ${compact ? 'text-sm' : 'text-lg'}`}>Pembayaran berhasil</h2>
        <p className="font-mono font-bold text-[#2C4F1B] text-sm">{orderNumber}</p>
      </div>
      <div className="border border-[#E8EBE4] rounded-xl divide-y divide-[#E8EBE4] text-xs">
        <div className="flex justify-between px-3 py-2">
          <span className="text-[#787868]">Total</span>
          <span className="font-bold">{formatRupiah(receipt.grandTotal)}</span>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-[#787868]">Metode</span>
          <span className="font-semibold">{receipt.paymentMethod === 'TUNAI' ? 'Tunai' : 'QRIS'}</span>
        </div>
        {receipt.paymentMethod === 'TUNAI' && receipt.amountReceived != null && (
          <>
            <div className="flex justify-between px-3 py-2">
              <span className="text-[#787868]">Diterima</span>
              <span>{formatRupiah(receipt.amountReceived)}</span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-[#787868]">Kembali</span>
              <span className="font-bold text-green-700">{formatRupiah(receipt.change ?? 0)}</span>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-2.5 rounded-full font-bold text-sm shadow-md"
      >
        Selesai
      </button>
    </div>
  );
}

export default function PaymentFlow({ order, onClose, onPaid, variant = 'modal' }: Props) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashInput, setCashInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const compact = variant === 'sidebar';
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
    <div className={compact ? 'flex flex-col min-h-0' : ''}>
      {!receipt && (
        <div
          className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-5'}`}
        >
          {method ? (
            <button
              type="button"
              onClick={() => {
                setMethod(null);
                setError(null);
                setCashInput('');
              }}
              className="p-1.5 rounded-full hover:bg-[#F3F4EF]"
              aria-label="Kembali"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#43493E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="w-8" />
          )}
          <h3 className="text-sm font-bold text-[#1A1C19] m-0 text-center flex-1 truncate px-1">
            {method === 'TUNAI' ? 'Tunai' : method === 'QRIS' ? 'QRIS' : 'Bayar'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F3F4EF]"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#43493E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {receipt ? (
        <ReceiptView receipt={receipt} orderNumber={order.orderNumber} onClose={onClose} compact={compact} />
      ) : !method ? (
        <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-4'}`}>
          <div className="bg-[#F3F4EF] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#787868] font-bold uppercase tracking-wide m-0">{order.orderNumber}</p>
            {order.customerName && (
              <p className="text-[11px] text-[#787868] m-0 mt-0.5 font-semibold truncate">{order.customerName}</p>
            )}
            <p className="text-xl font-extrabold text-[#2C4F1B] m-0 mt-1">{formatRupiah(grandTotal)}</p>
          </div>
          <button
            type="button"
            onClick={() => setMethod('TUNAI')}
            className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#E0E4DA] bg-white hover:border-[#2C4F1B] hover:bg-[#F7F9F5] text-left transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(44,79,27,0.08)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#2C4F1B]">payments</span>
            </div>
            <div>
              <p className="font-bold text-[#1A1C19] m-0 text-sm">Tunai</p>
              <p className="text-[11px] text-[#787868] m-0">Uang & kembalian</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMethod('QRIS')}
            className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#E0E4DA] bg-white hover:border-[#2C4F1B] hover:bg-[#F7F9F5] text-left transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(44,79,27,0.08)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#2C4F1B]">qr_code_2</span>
            </div>
            <div>
              <p className="font-bold text-[#1A1C19] m-0 text-sm">QRIS</p>
              <p className="text-[11px] text-[#787868] m-0">E-wallet / m-banking</p>
            </div>
          </button>
        </div>
      ) : method === 'TUNAI' ? (
        <div className="flex flex-col gap-3">
          <div className="bg-[#F3F4EF] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#787868] font-bold uppercase m-0">Tagihan</p>
            <p className="text-lg font-bold text-[#2C4F1B] m-0">{formatRupiah(grandTotal)}</p>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#43493E] mb-1">Uang diterima</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787868] text-sm font-semibold">Rp</span>
              <input
                type="tel"
                inputMode="numeric"
                value={cashInput}
                onChange={(e) =>
                  setCashInput(e.target.value.replace(/\D/g, '').replace(/^0+/, '') || '')
                }
                placeholder="0"
                className="w-full pl-8 pr-3 py-2.5 border-2 border-[#D5D9CE] rounded-xl text-[#1A1C19] font-bold text-base focus:outline-none focus:border-[#2C4F1B]"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {quickAmounts(grandTotal).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCashInput(String(amt))}
                className={`py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all ${
                  cashAmount === amt
                    ? 'border-[#2C4F1B] bg-[#2C4F1B] text-white'
                    : 'border-[#D5D9CE] text-[#43493E]'
                }`}
              >
                {amt >= 1000 ? `${amt / 1000}rb` : amt}
              </button>
            ))}
          </div>
          <div
            className={`rounded-xl px-3 py-2 text-center ${
              isEnough ? 'bg-green-50 border border-green-200' : 'bg-[#F3F4EF]'
            }`}
          >
            <p className="text-[10px] text-[#787868] font-semibold uppercase m-0">Kembalian</p>
            <p className={`text-lg font-bold m-0 ${isEnough ? 'text-green-700' : 'text-[#787868]'}`}>
              {isEnough ? formatRupiah(change) : '—'}
            </p>
          </div>
          {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 m-0">{error}</p>}
          <button
            type="button"
            onClick={handleCashConfirm}
            disabled={!isEnough || isPending}
            className="pos-cta-btn sage-gradient py-2.5 text-sm"
            style={{ opacity: !isEnough || isPending ? 0.45 : 1 }}
          >
            {isPending ? 'Memproses…' : 'Konfirmasi'}
          </button>
        </div>
      ) : (
        <QRISStep orderId={order.id} grandTotal={grandTotal} onPaid={handleQRISPaid} compact={compact} />
      )}
    </div>
  );
}
