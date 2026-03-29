'use client';

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Leaf, Monitor, LayoutGrid, ChefHat, HandCoins, Lock, ArrowRight,
  UserCircle2, LogOut, ExternalLink, Mail, Eye, EyeOff, Loader2,
} from "lucide-react";
import Link from "next/link";

// ─── MODULES CONFIG ──────────────────────────────────────────────────────────
const modules = [
  {
    id: 'cashier',
    name: 'POS & Kasir',
    description: 'Sistem Point of Sale untuk menerima dan memproses pesanan dengan cepat.',
    icon: Monitor,
    colorClass: 'bg-[#BBEDA6] text-[#2C4F1B]',
    link: 'http://localhost:3002',
    lockedFor: [],
  },
  {
    id: 'customer',
    name: 'E-Menu Pelanggan',
    description: 'Portal Self-Service QR Code untuk meja dine-in.',
    icon: LayoutGrid,
    colorClass: 'bg-amber-100 text-amber-700',
    link: 'http://localhost:3005',
    lockedFor: ['BASIC'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen Display (KDS)',
    description: 'Terima tiket memasak secara realtime tanpa kertas.',
    icon: ChefHat,
    colorClass: 'bg-indigo-100 text-indigo-700',
    link: 'http://localhost:3004',
    lockedFor: ['BASIC', 'LIGHT'],
  },
  {
    id: 'finance',
    name: 'Laporan Keuangan',
    description: 'Akuntansi SAK EP, Buku Besar, dan Inventori Otomatis.',
    icon: HandCoins,
    colorClass: 'bg-[#C3EFAA] text-[#2C4F1B]',
    link: 'http://localhost:3003',
    lockedFor: ['BASIC', 'LIGHT', 'PRO'],
  },
];

// ─── TIER BADGE COLORS ────────────────────────────────────────────────────────
const tierConfig: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  BASIC:      { label: "Seed",    emoji: "🌱", bg: "bg-[#F3F4EF]",      text: "text-[#73796D]" },
  LIGHT:      { label: "Sprout",  emoji: "🌿", bg: "bg-[#BBEDA6]/30",   text: "text-[#436831]" },
  PRO:        { label: "Bloom",   emoji: "🌸", bg: "bg-[#C3EFAA]/30",   text: "text-[#2C4F1B]" },
  ENTERPRISE: { label: "Forest",  emoji: "🌲", bg: "bg-[#2C4F1B]/10",   text: "text-[#2C4F1B]" },
};

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8F3]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 sage-gradient rounded-2xl flex items-center justify-center animate-pulse">
          <Leaf size={24} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-[#73796D]">Menghubungkan...</p>
      </div>
    </div>
  );
}

// ─── GOOGLE SVG ICON ─────────────────────────────────────────────────────────
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

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setIsLoading(false);
    if (result?.error) {
      setError('Email atau password salah. Silakan coba lagi.');
    }
    // on success, useSession will update and render DashboardScreen
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col">
      {/* Top decoration */}
      <div className="absolute top-0 left-0 w-full h-80 sage-gradient opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#BBEDA6]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sage-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#E2E3DE]/50 text-center">
            
            <h1 className="text-3xl font-black text-[#1A1C19] mb-2 tracking-tight font-jakarta">
              Selamat Datang
            </h1>
            <p className="text-[#73796D] mb-8 leading-relaxed text-sm max-w-xs mx-auto">
              Masuk untuk mengelola ruang atelier Anda.
            </p>

            {/* Google Sign In */}
            <button
              id="login-google-button"
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#E2E3DE] hover:border-[#436831] shadow-sm text-[#1A1C19] font-bold py-3.5 px-6 rounded-3xl transition-all duration-200 active:scale-95 hover:shadow-md mb-6"
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#E2E3DE]" />
              <span className="text-[10px] uppercase tracking-widest text-[#C3C9BA] font-bold">ATAU GUNAKAN EMAIL</span>
              <div className="flex-1 h-px bg-[#E2E3DE]" />
            </div>

            <form onSubmit={handleEmailLogin} className="text-left">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="login-email" className="text-xs font-black uppercase tracking-widest text-[#43493E] mb-2 block">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full border border-[#C3C9BA] focus:border-[#436831] focus:ring-1 focus:ring-[#436831] outline-none rounded-2xl px-5 py-3.5 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#8D9286]"
                />
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="text-xs font-black uppercase tracking-widest text-[#43493E]">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-[#305221] hover:text-[#2C4F1B] hover:underline">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-[#C3C9BA] focus:border-[#436831] focus:ring-1 focus:ring-[#436831] outline-none rounded-2xl px-5 py-3.5 pr-12 text-[#1A1C19] font-semibold text-sm transition-all bg-white placeholder:text-[#8D9286]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#43493E] hover:text-[#2C4F1B] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-8 pl-1">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-full border-[#C3C9BA] text-[#436831] focus:ring-[#436831] cursor-pointer" 
                />
                <label htmlFor="rememberMe" className="text-xs text-[#43493E] font-medium cursor-pointer">
                  Ingat Saya
                </label>
              </div>

              <button
                id="login-email-submit"
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-white bg-[#305221] hover:bg-[#2C4F1B] shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLoading ? 'Masuk...' : 'Masuk ke Dashboard'}
              </button>

              <p className="text-xs text-center text-[#43493E] font-medium">
                Belum punya akun?{" "}
                <Link href="/register" className="text-[#305221] font-bold hover:underline">
                  Daftar Sekarang
                </Link>
              </p>
            </form>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: "🔒", label: "SSL Enkripsi" },
              { icon: "🏢", label: "Multi-tenant Isolated" },
              { icon: "⚡", label: "99.9% Uptime" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[#73796D] font-medium">
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

// ─── DASHBOARD / PORTAL (LOGGED IN) ──────────────────────────────────────────
function DashboardScreen({ session }: { session: any }) {
  // @ts-ignore
  const tier = session.user?.tier || 'ENTERPRISE';
  const tierInfo = tierConfig[tier] || tierConfig['ENTERPRISE'];

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col font-sans">

      {/* Navbar SSO */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E2E3DE] px-6 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sage-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-[#1A1C19] leading-tight font-jakarta tracking-tight">lioo.io</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#436831]">Merchant Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1A1C19]">{session.user?.name}</p>
            <p className="text-xs text-[#73796D]">{session.user?.email}</p>
          </div>
          {session.user?.image ? (
            <img src={session.user.image} alt="Profile" className="w-9 h-9 rounded-full border-2 border-[#E2E3DE]" />
          ) : (
            <UserCircle2 size={36} className="text-[#C3C9BA]" />
          )}
          <button
            id="sso-signout"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#73796D] border border-[#E2E3DE] rounded-full hover:bg-[#F3F4EF] hover:border-[#C3C9BA] transition-all"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10 space-y-8">

        {/* Welcome Card */}
        <section className="relative sage-gradient rounded-[2rem] p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
            <Leaf size={180} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[#C3EFAA] text-xs font-bold uppercase tracking-widest mb-3">
              Selamat Datang Kembali 👋
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 font-jakarta">
              {session.user?.name?.split(' ')[0] || 'Merchant'}!
            </h2>
            <p className="text-[#BBEDA6]/80 mb-6 text-sm leading-relaxed max-w-lg">
              Akses semua modul operasional dan manajemen bisnis Anda dari satu dashboard terpusat.
            </p>

            <div className={`inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2`}>
              <span className="text-lg">{tierInfo.emoji}</span>
              <div>
                <span className="text-white/70 text-xs">Paket Aktif: </span>
                <span className="text-white font-black text-sm">{tierInfo.label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Apps Grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#1A1C19] font-jakarta">Aplikasi Anda</h3>
            {tier !== 'ENTERPRISE' && (
              <button
                id="sso-upgrade-plan"
                className="text-xs font-bold text-[#436831] hover:text-[#2C4F1B] bg-[#BBEDA6]/40 hover:bg-[#BBEDA6]/60 px-4 py-2 rounded-full transition-all"
              >
                Upgrade Paket →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => {
              const isLocked = mod.lockedFor.includes(tier);
              const Icon = mod.icon;

              return (
                <a
                  key={mod.id}
                  id={`sso-module-${mod.id}`}
                  href={isLocked ? '#' : mod.link}
                  target={isLocked ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className={`relative border rounded-2xl p-6 transition-all duration-300 group ${
                    isLocked
                      ? 'bg-[#F9FAF5] border-[#E2E3DE] opacity-50 cursor-not-allowed'
                      : 'bg-white border-[#E2E3DE] ambient-shadow hover:shadow-lg hover:-translate-y-1 hover:border-[#C3C9BA] cursor-pointer'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-4 right-4 bg-[#E2E3DE] p-2 rounded-full">
                      <Lock size={14} className="text-[#73796D]" />
                    </div>
                  )}
                  {!isLocked && (
                    <div className="absolute top-5 right-5 text-[#C3C9BA] group-hover:text-[#436831] transition-colors">
                      <ExternalLink size={16} />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isLocked ? 'bg-[#E2E3DE] text-[#C3C9BA]' : mod.colorClass
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold mb-1 font-jakarta ${
                        isLocked ? 'text-[#73796D]' : 'text-[#1A1C19]'
                      }`}>
                        {mod.name}
                      </h4>
                      <p className="text-xs text-[#73796D] leading-relaxed">{mod.description}</p>
                      {isLocked && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-[#E2E3DE]/50 text-[#73796D] text-[10px] font-bold px-2.5 py-1 rounded-md">
                          <Lock size={10} /> Upgrade untuk akses
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E3DE] ambient-shadow">
          <h4 className="text-sm font-bold text-[#1A1C19] mb-4 font-jakarta">Tautan Cepat</h4>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Kelola Profil Toko", href: "#" },
              { label: "Riwayat Transaksi", href: "#" },
              { label: "Pengaturan Akun", href: "#" },
              { label: "Hubungi Support", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs font-semibold text-[#436831] bg-[#BBEDA6]/30 hover:bg-[#BBEDA6]/60 px-4 py-2.5 rounded-full transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </main>

      <footer className="text-center py-6 text-xs text-[#C3C9BA]">
        © 2026 lioo.io Merchant Platform
      </footer>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function SSOHub() {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingScreen />;
  if (!session) return <LoginScreen />;
  return <DashboardScreen session={session} />;
}
