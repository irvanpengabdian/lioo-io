'use client';

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Leaf, ArrowRight, Wallet, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

// ─── PLAN CONFIG ─────────────────────────────────────────────────────────────
const planConfig: Record<string, { emoji: string; name: string; color: string }> = {
  seed:   { emoji: "🌱", name: "Seed",   color: "#73796D" },
  sprout: { emoji: "🌿", name: "Sprout", color: "#436831" },
  bloom:  { emoji: "🌸", name: "Bloom",  color: "#2C4F1B" },
};

// ─── TOP-UP AMOUNTS (for Sprout Wallet) ──────────────────────────────────────
const topUpAmounts = [
  { label: "Rp 50.000", value: 50000, approxTx: "~250 transaksi" },
  { label: "Rp 100.000", value: 100000, approxTx: "~500 transaksi" },
  { label: "Rp 250.000", value: 250000, approxTx: "~1.250 transaksi" },
  { label: "Rp 500.000", value: 500000, approxTx: "~2.500 transaksi" },
];

// ─── SEED WELCOME ─────────────────────────────────────────────────────────────
function SeedWelcome({ businessName, onContinue }: { businessName: string; onContinue: () => void }) {
  return (
    <div className="text-center">
      <div className="text-7xl mb-6">🌱</div>
      <h1 className="text-3xl font-black text-[#1A1C19] mb-3 font-jakarta">
        Selamat Datang di lioo.io!
      </h1>
      {businessName && (
        <p className="text-[#436831] font-bold text-lg mb-2">{businessName}</p>
      )}
      <p className="text-[#73796D] mb-8 max-w-sm mx-auto leading-relaxed">
        Akun Seed Anda aktif dan gratis selamanya. Mulai eksplorasi platform dan upgrade kapan saja saat bisnis berkembang.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: "🏪", label: "5 Produk Aktif" },
          { icon: "🖥️", label: "1 Kasir Digital" },
          { icon: "📱", label: "QR Menu Digital" },
          { icon: "🧾", label: "Cetak Struk" },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-[#F3F4EF] rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-semibold text-[#43493E]">{label}</span>
          </div>
        ))}
      </div>

      <button
        id="onboarding-seed-continue"
        onClick={onContinue}
        className="w-full py-4 rounded-full font-bold text-white bg-[#436831] hover:bg-[#2C4F1B] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
      >
        Buka Dashboard Saya <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ─── SPROUT WALLET SETUP ──────────────────────────────────────────────────────
function SproutWalletSetup({ businessName, merchantId, onContinue }: { businessName: string; merchantId: string; onContinue: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTopUp = async () => {
    if (!selectedAmount) return;
    setIsLoading(true);
    setError('');
    try {
      const externalId = merchantId ? `TOPUP-${merchantId}-${Date.now()}` : `TOPUP-mock-${Date.now()}`;
      const res = await fetch('/api/xendit/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          description: `Top-up Sprout Wallet lioo.io — Rp ${selectedAmount.toLocaleString('id-ID')}`,
          externalId,
          successRedirectUrl: `${window.location.origin}/onboarding/success?plan=sprout&business=${encodeURIComponent(businessName)}`,
          failureRedirectUrl: `${window.location.origin}/onboarding/failed?plan=sprout&business=${encodeURIComponent(businessName)}`,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data?.invoiceUrl) {
        throw new Error(data.message || 'Gagal membuat invoice');
      }
      // Redirect ke halaman pembayaran Xendit
      window.location.href = data.data.invoiceUrl;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-2xl font-extrabold text-[#1A1C19] mb-2">Aktivasi Sprout Wallet</h1>
        {businessName && <p className="text-[#436831] font-bold mb-2">{businessName}</p>}
        <p className="text-sm text-[#73796D] max-w-xs mx-auto leading-relaxed">
          Isi Sprout Wallet untuk mulai menerima transaksi. Saldo akan dipotong <strong>Rp 200</strong> per transaksi berhasil.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#BBEDA6]/30 border border-[#BBEDA6] rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Wallet size={18} className="text-[#436831] shrink-0 mt-0.5" />
        <div className="text-xs text-[#2C4F1B]">
          <p className="font-bold mb-1">Cara Kerja Sprout Wallet</p>
          <p>Deposit saldo ke wallet Anda. Setiap transaksi POS berhasil, sistem memotong Rp 200 secara otomatis. Tidak ada biaya bulanan apapun.</p>
        </div>
      </div>

      {/* Amount Selector */}
      <p className="text-xs font-black uppercase tracking-widest text-[#73796D] mb-3">Pilih Jumlah Top-Up Pertama</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {topUpAmounts.map(({ label, value, approxTx }) => (
          <button
            key={value}
            id={`topup-${value}`}
            onClick={() => setSelectedAmount(value)}
            className={`text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
              selectedAmount === value
                ? 'border-[#436831] bg-[#BBEDA6]/20'
                : 'border-[#E2E3DE] bg-white hover:border-[#C3C9BA]'
            }`}
          >
            <div className="font-extrabold text-[#1A1C19] text-sm mb-1">{label}</div>
            <div className="text-[10px] text-[#73796D]">{approxTx}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <button
        id="onboarding-topup-submit"
        onClick={handleTopUp}
        disabled={!selectedAmount || isLoading}
        className="w-full py-4 rounded-full font-bold text-white bg-[#305221] hover:bg-[#2C4F1B] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {isLoading ? 'Membuka Halaman Pembayaran...' : selectedAmount ? `Bayar Rp ${selectedAmount.toLocaleString('id-ID')} via Xendit` : 'Pilih Jumlah Top-Up'}
      </button>

      <p className="text-center text-xs text-[#C3C9BA]">
        Pembayaran aman via <strong>Xendit Payment Gateway</strong> · SSL Encrypted
      </p>
    </div>
  );
}

// ─── BLOOM SUBSCRIPTION SETUP ─────────────────────────────────────────────────
function BloomSubscriptionSetup({ businessName, merchantId }: { businessName: string; merchantId: string; onContinue: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');
    try {
      const externalId = merchantId ? `BLOOM-${merchantId}-${Date.now()}` : `BLOOM-mock-${Date.now()}`;
      const res = await fetch('/api/xendit/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 899000,
          description: 'Langganan Paket Bloom lioo.io — Bulanan',
          externalId,
          successRedirectUrl: `${window.location.origin}/onboarding/success?plan=bloom&business=${encodeURIComponent(businessName)}`,
          failureRedirectUrl: `${window.location.origin}/onboarding/failed?plan=bloom&business=${encodeURIComponent(businessName)}`,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data?.invoiceUrl) {
        throw new Error(data.message || 'Gagal membuat invoice');
      }
      window.location.href = data.data.invoiceUrl;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🌸</div>
        <h1 className="text-2xl font-extrabold text-[#1A1C19] mb-2">Aktivasi Paket Bloom</h1>
        {businessName && <p className="text-[#2C4F1B] font-bold mb-2">{businessName}</p>}
        <p className="text-sm text-[#73796D] max-w-xs mx-auto">Berlangganan bulanan untuk operasional yang matang, stabil, dan multi-cabang.</p>
      </div>

      {/* Billing Summary */}
      <div className="bg-[#F3F4EF] rounded-2xl p-6 mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-[#73796D] mb-4">Ringkasan Tagihan</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[#43493E]">Paket Bloom 🌸</span>
          <span className="font-extrabold text-[#1A1C19]">Rp 899.000</span>
        </div>
        <div className="flex justify-between items-center mb-3 text-xs text-[#73796D]">
          <span>Periode</span>
          <span>Bulanan · Auto-renew</span>
        </div>
        <div className="border-t border-[#E2E3DE] pt-3 flex justify-between items-center">
          <span className="text-sm font-bold text-[#1A1C19]">Total Hari Ini</span>
          <span className="text-xl font-extrabold text-[#2C4F1B]">Rp 899.000</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {["Semua Fitur Sprout", "Custom Branding", "Multi-cabang Sync", "Dedicated Support", "White-label", "SLA 99.9%"].map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs">
            <CheckCircle2 size={13} className="text-[#436831] shrink-0" />
            <span className="text-[#43493E] font-medium">{f}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <button
        id="onboarding-bloom-subscribe"
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full py-4 rounded-full font-bold text-white bg-[#2C4F1B] hover:bg-[#1A1C19] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {isLoading ? 'Membuka Halaman Pembayaran...' : 'Bayar & Aktifkan Bloom via Xendit'}
      </button>

      <p className="text-center text-xs text-[#C3C9BA]">
        Pembayaran aman via <strong>Xendit Payment Gateway</strong> · Batalkan kapan saja
      </p>
    </div>
  );
}

// ─── MAIN ONBOARDING INNER ────────────────────────────────────────────────────
function OnboardingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const merchantId = (session?.user as any)?.merchantId || 'mock-merchant-id';

  const plan = searchParams.get('plan') || 'seed';
  const businessName = searchParams.get('business') ? decodeURIComponent(searchParams.get('business')!) : '';

  const planInfo = planConfig[plan] || planConfig['seed'];

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BBEDA6]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <header className="relative z-10 flex items-center justify-center px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sage-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-6 mb-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#436831] flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#436831]">Akun Dibuat</span>
          </div>
          <div className="h-px w-8 bg-[#436831]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2C4F1B] flex items-center justify-center text-white text-xs font-bold">2</div>
            <span className="text-xs font-semibold text-[#2C4F1B]">Aktivasi Paket</span>
          </div>
          <div className="h-px w-8 bg-[#E2E3DE]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E2E3DE] flex items-center justify-center text-[#73796D] text-xs font-bold">3</div>
            <span className="text-xs text-[#C3C9BA] font-semibold">Dashboard</span>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#E2E3DE]/50">
            {plan === 'seed' && <SeedWelcome businessName={businessName} onContinue={handleContinue} />}
            {plan === 'sprout' && <SproutWalletSetup businessName={businessName} merchantId={merchantId} onContinue={handleContinue} />}
            {plan === 'bloom' && <BloomSubscriptionSetup businessName={businessName} merchantId={merchantId} onContinue={handleContinue} />}
          </div>

          <p className="text-center text-xs text-[#C3C9BA] mt-6">
            Butuh bantuan?{' '}
            <a href="mailto:support@lioo.io" className="text-[#436831] font-semibold hover:underline">
              Hubungi support@lioo.io
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F3]">
        <div className="w-12 h-12 sage-gradient rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  );
}
