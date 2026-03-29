'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Leaf } from 'lucide-react';

function FailedInner() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'sprout';
  const business = searchParams.get('business') ? decodeURIComponent(searchParams.get('business')!) : '';

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-xl border border-[#E2E3DE]/50 text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle size={44} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#1A1C19] mb-2">Pembayaran Gagal</h1>
          {business && <p className="text-[#73796D] font-semibold mb-2">{business}</p>}
          <p className="text-sm text-[#73796D] max-w-xs mx-auto mb-8 leading-relaxed">
            Pembayaran tidak berhasil diproses. Silakan coba lagi atau pilih metode pembayaran lain.
          </p>

          <a
            href={`/onboarding?plan=${plan}&business=${encodeURIComponent(business)}`}
            id="payment-failed-retry"
            className="w-full py-4 rounded-full font-bold text-white bg-[#305221] hover:bg-[#2C4F1B] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mb-3"
          >
            <ArrowLeft size={18} /> Coba Lagi
          </a>

          <a
            href="/"
            className="block text-sm text-center text-[#73796D] hover:text-[#436831] font-semibold mt-2"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F3]">
        <div className="w-12 h-12 sage-gradient rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
      </div>
    }>
      <FailedInner />
    </Suspense>
  );
}
