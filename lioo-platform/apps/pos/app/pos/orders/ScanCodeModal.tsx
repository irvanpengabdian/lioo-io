'use client';

import { useState, useRef, useEffect } from 'react';
import { formatRupiah } from '../../../lib/types';
import PaymentModal from '../terminal/PaymentModal';

type OrderDetail = {
  id: string;
  orderNumber: string;
  publicOrderCode: string | null;
  source: string;
  orderType: string;
  tableNumber: string | null;
  customerName: string | null;
  grandTotal: number;
  subtotal: number;
  taxTotal: number;
  paymentStatus: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number; subtotal: number }[];
};

type Props = {
  onClose: () => void;
  onPaid: () => void;
};

export default function ScanCodeModal({ onClose, onPaid }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleLookup() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Kode harus tepat 6 karakter.');
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/api/pos/lookup-order?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Kode tidak ditemukan.');
        return;
      }
      setOrder(data);
    } finally {
      setLoading(false);
    }
  }

  if (showPayment && order) {
    return (
      <PaymentModal
        order={{ id: order.id, orderNumber: order.orderNumber, grandTotal: order.grandTotal, items: order.items }}
        onClose={onClose}
        onPaid={() => { onPaid(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#1A1C19]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.15)] w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#1A1C19]">Cari Pesanan Customer</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F3F4EF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#43493E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Code input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
            Kode Bayar (6 karakter dari HP customer)
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().slice(0, 6));
                setError(null);
                if (e.target.value.length < 6) setOrder(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              placeholder="mis. A1B2C3"
              maxLength={6}
              className="flex-1 px-3 py-2.5 border-2 border-[#D5D9CE] rounded-xl font-mono text-lg text-center uppercase tracking-[0.2em] font-bold text-[#1A1C19] focus:outline-none focus:border-[#2C4F1B]"
            />
            <button
              onClick={handleLookup}
              disabled={loading || code.length !== 6}
              className="px-4 py-2.5 bg-[#2C4F1B] text-white rounded-xl font-bold text-sm disabled:opacity-40 flex-shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Cari'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">{error}</p>
          )}
        </div>

        {/* Order detail */}
        {order && (
          <div className="border border-[#E8EBE4] rounded-2xl overflow-hidden mb-4">
            {/* Order header */}
            <div className="bg-[#F3F4EF] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#787868] font-semibold">Pesanan Ditemukan</p>
                <p className="font-bold font-mono text-[#1A1C19] text-sm">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#787868]">
                  {order.orderType === 'DINE_IN'
                    ? `🪑 ${order.tableNumber ?? 'Dine-in'}`
                    : '🛍️ Takeaway'}
                </p>
                {order.customerName && (
                  <p className="text-xs text-[#787868]">👤 {order.customerName}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="px-4 py-2 space-y-1 max-h-32 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-[#43493E]">{item.quantity}× {item.productName}</span>
                  <span className="text-[#787868]">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[#E8EBE4] px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-[#787868]">Total Tagihan</span>
              <span className="font-bold text-[#2C4F1B] text-base">{formatRupiah(order.grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Action */}
        {order && (
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full py-3 font-bold text-sm shadow-md"
          >
            Proses Pembayaran
          </button>
        )}

        {!order && (
          <p className="text-center text-xs text-[#787868]">
            Minta customer tunjukkan kode dari halaman konfirmasi pesanan
          </p>
        )}
      </div>
    </div>
  );
}
