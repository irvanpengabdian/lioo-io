'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatRupiah } from '../../lib/types';

type Props = {
  orderId: string;
  orderNumber: string;
  grandTotal: number;
  confirmationHref: string;
};

export default function PayingPage({ orderId, orderNumber, grandTotal, confirmationHref }: Props) {
  const [step, setStep] = useState<'loading' | 'qr' | 'paid' | 'error'>('loading');
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledRef = useRef(false);

  const createInvoice = useCallback(async () => {
    if (calledRef.current) return;
    calledRef.current = true;
    try {
      const res = await fetch('/api/customer/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat QRIS');
      setInvoiceUrl(data.invoiceUrl);
      setStep('qr');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Terjadi kesalahan');
      setStep('error');
    }
  }, [orderId]);

  // Buat invoice saat mount
  useEffect(() => {
    createInvoice();
  }, [createInvoice]);

  // Poll pembayaran setiap 3 detik
  useEffect(() => {
    if (step !== 'qr') return;
    pollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/customer/check-payment?orderId=${orderId}`);
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollerRef.current!);
          setStep('paid');
          setTimeout(() => {
            window.location.href = confirmationHref;
          }, 1500);
        }
      } catch {
        // abaikan error polling sementara
      }
    }, 3000);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [step, orderId, confirmationHref]);

  if (step === 'paid') {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#1A1C19] mb-1">Pembayaran Berhasil!</h2>
          <p className="text-sm text-[#787868]">Mengalihkan ke konfirmasi…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5] flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-[0_24px_48px_rgba(44,79,27,0.12)] w-full max-w-sm p-6">
        {/* Header */}
        <div className="text-center mb-5">
          <p className="text-xs text-[#787868] font-semibold uppercase tracking-wide mb-1">Pesanan</p>
          <p className="font-bold font-mono text-[#1A1C19] text-sm">{orderNumber}</p>
        </div>

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-[#2C4F1B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#787868]">Membuat QR pembayaran…</p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{errorMsg}</p>
            <button
              onClick={() => {
                calledRef.current = false;
                setErrorMsg(null);
                setStep('loading');
                createInvoice();
              }}
              className="text-sm text-[#2C4F1B] underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {step === 'qr' && invoiceUrl && (
          <div className="flex flex-col items-center gap-4">
            {/* QR Code */}
            <div className="bg-white border-4 border-[#2C4F1B] rounded-2xl p-2 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(invoiceUrl)}`}
                alt="QRIS"
                width={220}
                height={220}
                className="rounded-xl"
              />
            </div>

            {/* Nominal */}
            <div className="bg-[#F3F4EF] rounded-2xl px-8 py-3 text-center w-full">
              <p className="text-xs text-[#787868] font-semibold uppercase tracking-wider mb-0.5">Total Bayar</p>
              <p className="text-2xl font-bold text-[#2C4F1B]">{formatRupiah(grandTotal)}</p>
            </div>

            {/* Link fallback */}
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#2C4F1B] underline"
            >
              Buka halaman pembayaran →
            </a>

            {/* Waiting indicator */}
            <div className="flex items-center gap-2 text-sm text-[#787868]">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              Menunggu konfirmasi pembayaran…
            </div>

            <p className="text-[10px] text-[#787868] text-center">
              Scan QR dengan aplikasi GoPay, OVO, Dana, BCA Mobile, atau e-wallet lain yang mendukung QRIS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
