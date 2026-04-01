'use client';

import Link from 'next/link';
import { formatRupiah } from '../../lib/types';

type Props = {
  orderNumber: string;
  mode: 'PAY_NOW' | 'PAY_AT_COUNTER';
  publicOrderCode: string | null;
  grandTotal: number;
  backHref: string;
  tableLabel?: string;
};

export default function ConfirmationPage({
  orderNumber, mode, publicOrderCode, grandTotal, backHref, tableLabel,
}: Props) {
  return (
    <div className="min-h-screen bg-[#F9FAF5] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.12)] w-full max-w-sm p-8 text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#1A1C19] mb-1">Pesanan Berhasil!</h2>
        <p className="text-sm text-[#787868] mb-5">
          {mode === 'PAY_AT_COUNTER'
            ? 'Tunjukkan kode di bawah ke kasir saat membayar.'
            : 'Selesaikan pembayaran QRIS sebentar lagi.'}
        </p>

        {/* Nomor order */}
        <div className="bg-[#F3F4EF] rounded-xl px-4 py-2 mb-4">
          <p className="text-xs text-[#787868] uppercase tracking-wider font-semibold mb-0.5">
            Nomor Pesanan
          </p>
          <p className="font-mono font-bold text-[#1A1C19] text-base">{orderNumber}</p>
        </div>

        {/* PAY_AT_COUNTER: kode kasir */}
        {mode === 'PAY_AT_COUNTER' && publicOrderCode && (
          <div className="bg-[#E8F5E2] border-2 border-[#4CAF50] rounded-2xl px-6 py-5 mb-4">
            <p className="text-xs text-[#2C6B1A] font-semibold uppercase tracking-wider mb-1">
              Kode Bayar di Kasir
            </p>
            <p className="text-4xl font-bold font-mono text-[#2C4F1B] tracking-[0.15em]">
              {publicOrderCode}
            </p>
            <p className="text-xs text-[#2C6B1A] mt-1.5">Tunjukkan atau sebutkan kode ini ke kasir</p>
          </div>
        )}

        {/* PAY_NOW: placeholder QRIS (Sprint 7) */}
        {mode === 'PAY_NOW' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4 text-center">
            <p className="text-sm font-semibold text-amber-800 mb-1">Menunggu Pembayaran QRIS</p>
            <p className="text-xs text-amber-700">
              Fitur QRIS otomatis akan segera aktif. Silakan hubungi kasir untuk konfirmasi.
            </p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-sm px-2 mb-6">
          <span className="text-[#787868]">Total Tagihan</span>
          <span className="font-bold text-[#2C4F1B]">{formatRupiah(grandTotal)}</span>
        </div>

        {tableLabel && (
          <p className="text-xs text-[#787868] mb-4">📍 {tableLabel}</p>
        )}

        {/* Actions */}
        <Link
          href={backHref}
          className="block w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full py-3 font-bold text-sm shadow-md text-center"
        >
          Pesan Lagi
        </Link>
      </div>
    </div>
  );
}
