'use client';

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Leaf,
  Check,
  ArrowRight,
  ChevronLeft,
  Store,
  ChefHat,
  ShoppingBag,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

// ─── PLAN DATA ──────────────────────────────────────────────────────────────
const plans = [
  {
    id: "seed",
    emoji: "🌱",
    name: "Seed",
    tagline: "Benih pertama tumbuh dari tanah yang baik.",
    price: "Gratis",
    priceSub: "Selamanya · Tanpa kartu kredit",
    features: ["5 Produk", "1 Kasir", "QR Menu Digital", "Cetak Struk"],
    color: "#73796D",
    bgColor: "#F3F4EF",
    featured: false,
  },
  {
    id: "sprout",
    emoji: "🌿",
    name: "Sprout",
    tagline: "Bayar saat tumbuh, bukan saat menunggu.",
    price: "Rp 200",
    priceSub: "/ transaksi · Rp 0 bulanan",
    features: ["Produk Unlimited", "Kasir & KDS Unlimited", "Inventori AI", "Laporan SAK EP"],
    badge: "Paling Fleksibel",
    color: "#436831",
    bgColor: "#BBEDA6",
    featured: true,
  },
  {
    id: "bloom",
    emoji: "🌸",
    name: "Bloom",
    tagline: "Saat akar kuat, bunga mekar penuh.",
    price: "Rp 899k",
    priceSub: "/ bulan · All-inclusive",
    features: ["Semua di Sprout", "Custom Branding", "Multi-cabang", "Dedicated Support"],
    color: "#2C4F1B",
    bgColor: "#C3EFAA",
    featured: false,
  },
];

// ─── BUSINESS TYPES ─────────────────────────────────────────────────────────
const businessTypes = [
  { id: "fnb", label: "Restoran / Kafe", icon: ChefHat },
  { id: "booth", label: "Booth / Event", icon: Store },
  { id: "retail", label: "Retail / Toko", icon: ShoppingBag },
];

// ─── GOOGLE ICON ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
      </g>
    </svg>
  );
}

// ─── STEP INDICATOR ─────────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Pilih Paket", "Info Bisnis", "Buat Akun"];
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isDone
                    ? "bg-[#436831] text-white"
                    : isActive
                    ? "bg-[#2C4F1B] text-white shadow-lg shadow-[#436831]/30"
                    : "bg-[#E2E3DE] text-[#73796D]"
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-bold whitespace-nowrap ${
                  isActive ? "text-[#2C4F1B]" : "text-[#73796D]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-12 mb-5 transition-all duration-300 ${
                  isDone ? "bg-[#436831]" : "bg-[#E2E3DE]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1: PLAN SELECTION ─────────────────────────────────────────────────
function PlanStep({
  selectedPlan,
  onSelect,
  onNext,
}: {
  selectedPlan: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-[#1A1C19] mb-2">
          Pilih Paket Growth-mu
        </h2>
        <p className="text-sm text-[#73796D]">
          Mulai gratis, upgrade kapanpun bisnismu siap berkembang.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              id={`register-plan-${plan.id}`}
              onClick={() => onSelect(plan.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected
                  ? "border-[#436831] bg-[#BBEDA6]/20 shadow-md"
                  : "border-[#E2E3DE] bg-white hover:border-[#C3C9BA] hover:bg-[#F9FAF5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{plan.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1A1C19]">
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span className="text-[10px] font-bold bg-[#BBEDA6] text-[#2C4F1B] px-2 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#436831]">
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#73796D] ml-1">
                      {plan.priceSub}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "border-[#436831] bg-[#436831]"
                      : "border-[#C3C9BA]"
                  }`}
                >
                  {isSelected && <Check size={11} className="text-white" />}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.features.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-semibold bg-white text-[#43493E] border border-[#E2E3DE] px-2.5 py-1 rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <button
        id="register-next-step1"
        onClick={onNext}
        disabled={!selectedPlan}
        className="w-full py-4 rounded-full font-bold text-white sage-gradient shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Lanjutkan <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ─── STEP 2: BUSINESS INFO ───────────────────────────────────────────────────
function BusinessStep({
  businessType,
  businessName,
  onTypeSelect,
  onNameChange,
  onNext,
  onBack,
}: {
  businessType: string;
  businessName: string;
  onTypeSelect: (id: string) => void;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-[#1A1C19] mb-2">
          Ceritakan Bisnis Anda
        </h2>
        <p className="text-sm text-[#73796D]">
          Kami akan personalisasi pengalaman lioo.io sesuai tipe bisnis Anda.
        </p>
      </div>

      {/* Business Type */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-3 block">
          Tipe Bisnis
        </label>
        <div className="grid grid-cols-3 gap-3">
          {businessTypes.map(({ id, label, icon: Icon }) => {
            const isSelected = businessType === id;
            return (
              <button
                key={id}
                id={`register-type-${id}`}
                onClick={() => onTypeSelect(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#436831] bg-[#BBEDA6]/20"
                    : "border-[#E2E3DE] bg-white hover:border-[#C3C9BA]"
                }`}
              >
                <Icon
                  size={22}
                  className={isSelected ? "text-[#436831]" : "text-[#73796D]"}
                />
                <span
                  className={`text-[11px] font-bold text-center leading-tight ${
                    isSelected ? "text-[#2C4F1B]" : "text-[#73796D]"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Name */}
      <div className="mb-8">
        <label
          htmlFor="business-name"
          className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-3 block"
        >
          Nama Bisnis / Toko
        </label>
        <input
          id="business-name"
          type="text"
          value={businessName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="cth: Kopi Nusantara, Warung Pak Budi..."
          className="w-full border-2 border-[#E2E3DE] focus:border-[#436831] outline-none rounded-2xl px-5 py-4 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#C3C9BA]"
        />
      </div>

      <div className="flex gap-3">
        <button
          id="register-back-step2"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-full font-bold text-[#43493E] border-2 border-[#E2E3DE] hover:border-[#C3C9BA] hover:bg-[#F9FAF5] transition-all duration-200"
        >
          <ChevronLeft size={18} /> Kembali
        </button>
        <button
          id="register-next-step2"
          onClick={onNext}
          disabled={!businessType || !businessName.trim()}
          className="flex-1 py-4 rounded-full font-bold text-white sage-gradient shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Lanjutkan <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: CREATE ACCOUNT ──────────────────────────────────────────────────
function AccountStep({
  selectedPlan,
  businessName,
  onBack,
}: {
  selectedPlan: string;
  businessName: string;
  onBack: () => void;
}) {
  // 'choose' | 'email' | 'success'
  const [mode, setMode] = useState<'choose' | 'email' | 'success'>('choose');
  const [isLoading, setIsLoading] = useState(false);

  // Email form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const plan = plans.find((p) => p.id === selectedPlan);

  // Password strength
  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-[#BBEDA6]', 'bg-[#436831]'][passwordStrength];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: `/onboarding?plan=${selectedPlan}&business=${encodeURIComponent(businessName)}`,
    });
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    // ── TODO: call your real API endpoint to create the account ──────────
    // e.g.: await fetch('/api/register', { method: 'POST', body: JSON.stringify({ fullName, email, password, plan: selectedPlan, businessName }) })
    // Then sign in automatically:
    // const result = await signIn('credentials', { email, password, redirect: false })
    // Then redirect: router.push(`/onboarding?plan=${selectedPlan}&business=${encodeURIComponent(businessName)}`)

    // Simulate network delay for demo
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setMode('success');
  };

  // ── SUCCESS STATE ────────────────────────────────────────────────────────
  if (mode === 'success') {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-20 h-20 bg-[#BBEDA6] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#436831]/20">
          <CheckCircle2 size={44} className="text-[#2C4F1B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1A1C19] mb-2">Akun Berhasil Dibuat!</h2>
        <p className="text-sm text-[#73796D] mb-2">
          Selamat datang di <span className="font-bold text-[#436831]">lioo.io</span>!
        </p>
        <p className="text-xs text-[#C3C9BA] mb-8">
          Cek email <span className="font-semibold text-[#73796D]">{email}</span> untuk verifikasi akun Anda.
        </p>
        <a
          id="register-goto-onboarding"
          href={`/onboarding?plan=${selectedPlan}&business=${encodeURIComponent(businessName)}`}
          className="w-full py-4 rounded-full font-bold text-white sage-gradient shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          Lanjutkan Aktivasi Paket <ArrowRight size={18} />
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-[#1A1C19] mb-2">
          Buat Akun lioo.io
        </h2>
        <p className="text-sm text-[#73796D]">
          Pilih cara mendaftar yang paling mudah untuk Anda.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-[#F3F4EF] rounded-2xl p-4 mb-6 border border-[#E2E3DE]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-2">
          Ringkasan Pendaftaran
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{plan?.emoji}</span>
          <div>
            <div className="font-extrabold text-[#1A1C19] text-sm">Paket {plan?.name}</div>
            <div className="text-xs text-[#73796D]">{plan?.price} {plan?.priceSub}</div>
          </div>
        </div>
        {businessName && (
          <div className="mt-2 pt-2 border-t border-[#E2E3DE] flex items-center gap-2">
            <Store size={12} className="text-[#436831]" />
            <span className="text-xs font-semibold text-[#43493E]">{businessName}</span>
          </div>
        )}
      </div>

      {/* ── CHOOSE MODE ── */}
      {mode === 'choose' && (
        <>
          {/* Google */}
          <button
            id="register-google-signin"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#E2E3DE] hover:border-[#436831] shadow-sm text-[#1A1C19] font-bold py-4 px-6 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-70 mb-3"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-[#436831]" />
            ) : (
              <GoogleIcon />
            )}
            {isLoading ? "Menghubungkan ke Google..." : "Daftar dengan Google"}
          </button>

          {/* Email */}
          <button
            id="register-email-method"
            onClick={() => setMode('email')}
            className="w-full flex items-center justify-center gap-3 bg-[#F7F8F3] border-2 border-[#E2E3DE] hover:border-[#436831] text-[#43493E] font-bold py-4 px-6 rounded-full transition-all duration-200 active:scale-95 mb-6"
          >
            <Mail size={20} className="text-[#73796D]" />
            Daftar dengan Email & Password
          </button>

          <p className="text-center text-xs text-[#73796D] mb-5">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="text-[#436831] font-semibold hover:underline">Syarat Layanan</a>{" "}
            dan{" "}
            <a href="#" className="text-[#436831] font-semibold hover:underline">Kebijakan Privasi</a>{" "}
            lioo.io.
          </p>

          <button
            id="register-back-step3"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-[#43493E] border-2 border-[#E2E3DE] hover:border-[#C3C9BA] hover:bg-[#F9FAF5] transition-all duration-200"
          >
            <ChevronLeft size={18} /> Kembali ke Info Bisnis
          </button>
        </>
      )}

      {/* ── EMAIL FORM ── */}
      {mode === 'email' && (
        <form onSubmit={handleEmailRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="reg-fullname" className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-2 block">
              Nama Lengkap
            </label>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Budi Santoso"
              required
              className="w-full border-2 border-[#E2E3DE] focus:border-[#436831] outline-none rounded-2xl px-5 py-3.5 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#C3C9BA]"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-2 block">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@toko.com"
              required
              className="w-full border-2 border-[#E2E3DE] focus:border-[#436831] outline-none rounded-2xl px-5 py-3.5 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#C3C9BA]"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                required
                className="w-full border-2 border-[#E2E3DE] focus:border-[#436831] outline-none rounded-2xl px-5 py-3.5 pr-12 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#C3C9BA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C3C9BA] hover:text-[#73796D] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength ? strengthColor : 'bg-[#E2E3DE]'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold ${passwordStrength <= 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-yellow-500' : 'text-[#436831]'}`}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-2 block">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                required
                className={`w-full border-2 focus:border-[#436831] outline-none rounded-2xl px-5 py-3.5 pr-12 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#C3C9BA] ${
                  confirmPassword.length > 0
                    ? confirmPassword === password
                      ? 'border-[#436831]'
                      : 'border-red-300'
                    : 'border-[#E2E3DE]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C3C9BA] hover:text-[#73796D] transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#73796D] pt-1">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="text-[#436831] font-semibold hover:underline">Syarat Layanan</a>{" "}
            dan{" "}
            <a href="#" className="text-[#436831] font-semibold hover:underline">Kebijakan Privasi</a>.
          </p>

          <button
            id="register-email-submit"
            type="submit"
            disabled={isLoading || !fullName || !email || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-white sage-gradient shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isLoading ? 'Membuat Akun...' : 'Buat Akun Sekarang'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E2E3DE]" />
            <span className="text-xs text-[#C3C9BA] font-bold">atau</span>
            <div className="flex-1 h-px bg-[#E2E3DE]" />
          </div>

          <button
            type="button"
            id="register-back-to-choose"
            onClick={() => { setMode('choose'); setError(''); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-[#43493E] border-2 border-[#E2E3DE] hover:border-[#C3C9BA] hover:bg-[#F9FAF5] transition-all duration-200 text-sm"
          >
            ← Pilihan Pendaftaran Lainnya
          </button>
        </form>
      )}
    </div>
  );
}

// ─── INNER REGISTER PAGE (uses useSearchParams) ───────────────────────────────
function RegisterPageInner() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const validPlans = ['seed', 'sprout', 'bloom'];
  const initialPlan = planParam && validPlans.includes(planParam) ? planParam : 'seed';

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-72 sage-gradient opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#BBEDA6]/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <Link
          href="http://localhost:3000"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 sage-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">
            lioo.io
          </span>
        </Link>

        <div className="flex items-center gap-2 text-sm text-[#73796D]">
          <span>Sudah punya akun?</span>
          <Link
            href="/"
            id="register-login-link"
            className="font-bold text-[#436831] hover:text-[#2C4F1B] transition-colors"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#E2E3DE]/50">
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} />

            {/* Step Content */}
            {currentStep === 0 && (
              <PlanStep
                selectedPlan={selectedPlan}
                onSelect={setSelectedPlan}
                onNext={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 1 && (
              <BusinessStep
                businessType={businessType}
                businessName={businessName}
                onTypeSelect={setBusinessType}
                onNameChange={setBusinessName}
                onNext={() => setCurrentStep(2)}
                onBack={() => setCurrentStep(0)}
              />
            )}
            {currentStep === 2 && (
              <AccountStep
                selectedPlan={selectedPlan}
                businessName={businessName}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: "🔒", label: "Enkripsi End-to-End" },
              { icon: "⚡", label: "Setup < 10 Menit" },
              { icon: "🎯", label: "Tanpa Kartu Kredit" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-[#73796D] font-medium"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── MAIN REGISTER PAGE ──────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F3]">
        <div className="w-12 h-12 sage-gradient rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  );
}
