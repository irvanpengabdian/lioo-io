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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A1C19]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.15)] w-full max-w-sm p-8 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(44,79,27,0.25)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#1A1C19] mb-1">
          {isOffline ? 'Pesanan Disimpan!' : 'Pesanan Dibuat!'}
        </h2>
        <p className="text-[#787868] text-sm mb-5">
          {isOffline
            ? 'Pesanan tersimpan lokal dan akan dikirim ke server saat online.'
            : 'Pesanan berhasil masuk ke sistem.'}
        </p>

        {/* Order number badge */}
        <div className="bg-[#F3F4EF] rounded-2xl px-6 py-4 mb-6">
          <p className="text-xs text-[#787868] uppercase tracking-wider font-semibold mb-1">
            Nomor Pesanan
          </p>
          <p className="text-2xl font-bold text-[#2C4F1B] font-mono tracking-wide">
            {orderNumber}
          </p>
        </div>

        {/* Offline badge */}
        {isOffline && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
            <span>🕐</span> Menunggu sinkronisasi
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!isOffline && (
            <button
              onClick={onPayNow}
              className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-3 rounded-full font-bold text-sm shadow-md"
            >
              Bayar Sekarang
            </button>
          )}
          <button
            onClick={onNewOrder}
            className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${
              isOffline
                ? 'bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white shadow-md'
                : 'text-[#43493E] bg-[#F3F4EF] hover:bg-[#EDEEE9]'
            }`}
          >
            Pesanan Baru
          </button>
          <Link
            href={isOffline ? '/pos/sync-issues' : '/pos/orders'}
            className="w-full py-3 rounded-full font-semibold text-sm text-[#787868] hover:text-[#43493E] transition-colors text-center"
          >
            {isOffline ? 'Lihat Antrian Offline' : 'Lihat Daftar Pesanan'}
          </Link>
        </div>
        
      </div>
    </div>
  );
}
