'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';

function SuccessInner() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'sprout';
  const business = searchParams.get('business') ? decodeURIComponent(searchParams.get('business')!) : '';

  const planLabels: Record<string, { emoji: string; name: string; msg: string }> = {
    sprout: {
      emoji: '🌿',
      name: 'Sprout Wallet',
      msg: 'Saldo Sprout Wallet Anda telah aktif. Setiap transaksi POS berhasil akan memotong Rp 200 secara otomatis.',
    },
    bloom: {
      emoji: '🌸',
      name: 'Bloom',
      msg: 'Paket Bloom Anda kini aktif. Nikmati semua fitur premium tanpa batas.',
    },
  };

  const info = planLabels[plan] || planLabels['sprout'];

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-xl border border-[#E2E3DE]/50 text-center">
          <div className="mx-auto w-20 h-20 bg-[#BBEDA6] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#436831]/20">
            <CheckCircle2 size={44} className="text-[#2C4F1B]" />
          </div>

          <div className="text-4xl mb-3">{info.emoji}</div>
          <h1 className="text-2xl font-extrabold text-[#1A1C19] mb-2">Pembayaran Berhasil!</h1>
          {business && <p className="text-[#436831] font-bold mb-2">{business}</p>}
          <p className="text-sm text-[#73796D] max-w-xs mx-auto mb-8 leading-relaxed">{info.msg}</p>

          <Link
            href="/"
            id="payment-success-dashboard"
            className="w-full py-4 rounded-full font-bold text-white bg-[#305221] hover:bg-[#2C4F1B] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Buka Dashboard Saya <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex items-center justify-center mt-6 gap-2">
          <div className="w-7 h-7 sage-gradient rounded-lg flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="text-sm font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F3]">
        <div className="w-12 h-12 sage-gradient rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
