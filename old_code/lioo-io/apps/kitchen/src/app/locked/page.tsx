'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, RefreshCw, Leaf } from 'lucide-react';

const SSO_TOPUP_URL = process.env.NEXT_PUBLIC_SSO_URL || 'http://localhost:3424';

function LockedInner() {
  const params = useSearchParams();
  const merchantId = params.get('mid') || '';
  const [countdown, setCountdown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Cek saldo secara periodik — jika sudah terisi, redirect otomatis
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkBalance = async () => {
      if (!merchantId) return;
      try {
        const res = await fetch(`http://localhost:3001/finance/wallet/${merchantId}`);
        if (res.ok) {
          const data = await res.json();
          const bal = Number(data?.balance ?? 0);
          setBalance(bal);

          if (bal > 0) {
            // Saldo sudah terisi — redirect ke dashboard KDS
            window.location.href = '/';
          }
        }
      } catch {}
    };

    // Cek setiap 10 detik
    checkBalance();
    interval = setInterval(checkBalance, 10000);

    // Countdown timer untuk "auto recheck"
    let sec = 10;
    setCountdown(sec);
    const countdownInterval = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) sec = 10;
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [merchantId]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`http://localhost:3001/finance/wallet/${merchantId}`);
      if (res.ok) {
        const data = await res.json();
        const bal = Number(data?.balance ?? 0);
        setBalance(bal);
        if (bal > 0) window.location.href = '/';
      }
    } catch {}
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-8 font-sans">
      {/* Background subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center shadow-[0_0_12px_rgba(5,150,105,0.4)]">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">lioo.io</span>
          <span className="text-slate-500 text-sm">· Studio Dapur</span>
        </div>

        {/* Lock Icon with animation */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/10 border border-rose-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-3xl flex items-center justify-center">
            <Wallet size={40} className="text-rose-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Kitchen Display Dinonaktifkan
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          Saldo <strong className="text-rose-400">Sprout FlexWallet</strong> Anda sudah habis.
          KDS dikunci sementara untuk mencegah penggunaan tanpa saldo aktif.
        </p>

        {/* Current Balance Indicator */}
        <div className="bg-[#151B2B] border border-slate-800 rounded-2xl p-5 mb-8 mt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Sisa Saldo</p>
          <p className="text-3xl font-black font-mono text-rose-400">
            Rp {balance !== null ? balance.toLocaleString('id-ID') : '0'}
          </p>
          <p className="text-xs text-slate-600 mt-1">Diperlukan minimum saldo &gt; Rp 0 untuk akses</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={`${SSO_TOPUP_URL}/onboarding?plan=sprout`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30 group"
          >
            <Wallet size={18} />
            Top Up Sprout Wallet Sekarang
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#151B2B] hover:bg-[#1E2538] text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-700 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Memeriksa saldo...' : 'Cek ulang saldo sekarang'}
          </button>
        </div>

        {/* Auto-check indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-cek saldo dalam <strong className="text-slate-500">{countdown}s</strong> — KDS aktif otomatis setelah top up berhasil</span>
        </div>
      </div>
    </div>
  );
}

export default function LockedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LockedInner />
    </Suspense>
  );
}
