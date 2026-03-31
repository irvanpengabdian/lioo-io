"use client";

import { useState } from "react";
import Link from "next/link";

function Navbar({ active }: { active: string }) {
  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Fitur", href: "/features" },
    { label: "Solusi", href: "/solutions" },
    { label: "Harga", href: "/pricing" },
    { label: "Hardware", href: "/hardware" },
  ];
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#F9FAF5]/80 backdrop-blur-xl border-b border-[#C3C9BA]/20">
      <div className="flex justify-between items-center px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>S</div>
          <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`relative group transition-colors duration-200 ${l.href === active ? "text-[#2C4F1B]" : "text-[#43493E] hover:text-[#2C4F1B]"}`}>
              {l.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#436831] rounded-full transition-all duration-200 ${l.href === active ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="https://sso.lioo.io" className="text-[#2C4F1B] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#BBEDA6]/40 transition-all">Masuk</Link>
          <Link href="https://sso.lioo.io/register" className="text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>Mulai Menyemai</Link>
        </div>
      </div>
    </nav>
  );
}

const industries = [
  {
    id: "coffee",
    icon: "coffee",
    tag: "Coffee Shop & Kafe",
    emoji: "☕",
    tier: "🌱 Seed · 🌿 Sprout",
    headline: "Kalahkan Antrean dengan Kecepatan Kilat.",
    desc: "Di jam sibuk, setiap detik sangat berarti. Interface lioo.io yang intuitif memungkinkan barista menyelesaikan pesanan dalam hitungan detik tanpa kesalahan input — bahkan dengan tangan yang sibuk latte art.",
    points: [
      { icon: "bolt", title: "Kecepatan Transaksi", desc: "Sistem kasir dioptimalkan untuk volume tinggi, mengurangi waktu tunggu hingga 40%." },
      { icon: "qr_code_2", title: "QR Self-Order", desc: "Pelanggan memesan dari meja via QR, mengurangi beban staf counter di jam puncak." },
    ],
    bg: "#F9FAF5",
    accent: "#436831",
    visual: [
      { emoji: "☕", name: "Kopi Susu", price: "Rp 28k", qty: "×2", color: "#BBEDA6" },
      { emoji: "🧋", name: "Taro Latte", price: "Rp 35k", qty: "×1", color: "#E2E3DE" },
      { emoji: "🍰", name: "Croissant", price: "Rp 22k", qty: "×3", color: "#E2E3DE" },
    ],
  },
  {
    id: "popup",
    icon: "festival",
    tag: "Pop-up Event & Bazar",
    emoji: "🎪",
    tier: "🌿 Sprout (Pay-as-you-go)",
    headline: "Siap Beraksi dalam Hitungan Menit.",
    desc: "Tidak perlu komitmen jangka panjang. Paket Sprout hadir dengan model Rp 200/transaksi yang sangat fleksibel untuk event berdurasi singkat, festival kuliner, hingga bazaar tahunan.",
    points: [
      { icon: "payments", title: "Pay-as-you-go Sprout", desc: "Bayar hanya saat aktif berjualan. Nol biaya langganan yang membebani margin profit event Anda." },
      { icon: "offline_pin", title: "Setup Cepat + Offline Mode", desc: "Buat menu dari HP dalam 5 menit dan tetap bisa berjualan meski sinyal di lokasi tidak stabil." },
    ],
    bg: "#1A1C19",
    accent: "#BBEDA6",
    visual: [
      { emoji: "🌮", name: "Taco Jawa", price: "Rp 18k", qty: "×4", color: "#2C4F1B" },
      { emoji: "🍜", name: "Mie Jancuk", price: "Rp 25k", qty: "×2", color: "#2C4F1B" },
      { emoji: "🥤", name: "Es Tebu", price: "Rp 12k", qty: "×5", color: "#2C4F1B" },
    ],
  },
  {
    id: "restaurant",
    icon: "restaurant",
    tag: "Restoran & Franchise",
    emoji: "🍽️",
    tier: "🌸 Bloom · 🌲 Forest",
    headline: "Manajemen Kompleks Jadi Sederhana.",
    desc: "Kelola ratusan meja dan ribuan pesanan setiap hari dengan kontrol penuh. Pantau performa setiap cabang secara real-time dari satu dashboard terpusat — dengan laporan SAK EP yang siap audit.",
    points: [
      { icon: "call_split", title: "Split Bill Pro", desc: "Pisahkan tagihan berdasarkan item, orang, atau nominal hanya dengan sekali geser." },
      { icon: "monitoring", title: "Multi-Outlet Analytics", desc: "Laporan inventori otomatis dan analisis jam sibuk untuk optimasi jadwal staf seluruh cabang." },
    ],
    bg: "#F3F4EF",
    accent: "#2C4F1B",
    visual: [
      { emoji: "🥩", name: "Wagyu Steak", price: "Rp 185k", qty: "×1", color: "#BBEDA6" },
      { emoji: "🍷", name: "Red Wine", price: "Rp 95k", qty: "×2", color: "#E2E3DE" },
      { emoji: "🥗", name: "Caesar Salad", price: "Rp 55k", qty: "×2", color: "#E2E3DE" },
    ],
  },
];

export default function SolutionsPage() {
  const [activeIndustry, setActiveIndustry] = useState("coffee");

  return (
    <>
      <Navbar active="/solutions" />

      <main className="pt-28 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F9FAF5" }}>

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="md:w-3/5">
              <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 text-[#2C4F1B]" style={{ backgroundColor: "#BBEDA6" }}>
                🌿 Solusi per Industri
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#2C4F1B] tracking-tighter leading-[1.05] mb-6">
                Dirancang untuk<br />
                <span className="text-[#43493E]/40 italic font-medium">Cara Anda Bekerja.</span>
              </h1>
              <p className="text-[#43493E] text-lg max-w-xl leading-relaxed">
                Dari kedai kopi yang sibuk hingga restoran multi-cabang — lioo.io memberikan fleksibilitas operasional tanpa batas di setiap tahap pertumbuhan.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-end">
              {/* Growth Stage selector pills */}
              <div className="flex flex-col gap-3">
                {industries.map((ind) => (
                  <button key={ind.id} onClick={() => setActiveIndustry(ind.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 ${activeIndustry === ind.id ? "text-white shadow-lg scale-105" : "text-[#43493E] bg-white border border-[#C3C9BA]/40 hover:border-[#436831]/40"}`}
                    style={activeIndustry === ind.id ? { background: "linear-gradient(145deg,#436831,#2C4F1B)" } : {}}>
                    <span>{ind.emoji}</span>
                    <span>{ind.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Z-PATTERN SOLUTIONS ── */}
        <div className="flex flex-col gap-4">
          {industries.map((ind, i) => (
            <section key={ind.id} id={ind.id}
              className={`py-24 transition-all duration-300 ${activeIndustry === ind.id ? "opacity-100" : "opacity-60"}`}
              style={{ backgroundColor: ind.bg }}>
              <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>

                  {/* Visual - alternating */}
                  <div className={`lg:col-span-7 ${i % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="relative rounded-[2.5rem] overflow-hidden h-[420px] group shadow-2xl">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, ${ind.accent}66, transparent)` }} />
                      {/* Background pattern */}
                      <div className="absolute inset-0" style={{ backgroundColor: ind.bg === "#1A1C19" ? "#2C4F1B" : "#BBEDA6" }} />
                      {/* Mock POS UI */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full max-w-sm">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="text-3xl">{ind.emoji}</div>
                              <div>
                                <div className="font-bold text-white text-sm">{ind.tag}</div>
                                <div className="text-white/60 text-xs">{ind.tier}</div>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-[10px] text-green-400 font-bold">Live</span>
                              </div>
                            </div>
                            <div className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Pesanan Terkini</div>
                            <div className="flex flex-col gap-2">
                              {ind.visual.map((v) => (
                                <div key={v.name} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ backgroundColor: v.color + "33" }}>
                                  <div className="flex items-center gap-2">
                                    <span>{v.emoji}</span>
                                    <span className="text-white text-xs font-semibold">{v.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-white/60 text-[10px]">{v.qty}</span>
                                    <span className="text-white text-xs font-bold">{v.price}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                              <span className="text-white/60 text-xs">Total</span>
                              <span className="text-white font-extrabold text-sm">
                                Rp {ind.visual.reduce((sum, v) => sum + parseInt(v.price.replace(/[^0-9]/g, '')), 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className={`lg:col-span-5 ${i % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3" style={{ color: ind.accent }}>
                        <span className="material-symbols-outlined">{ind.icon}</span>
                        <span className="text-sm font-black tracking-widest uppercase">{ind.tag}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
                        style={{ color: ind.bg === "#1A1C19" ? "#FFFFFF" : "#1A1C19" }}>
                        {ind.headline}
                      </h2>
                      <p className="leading-relaxed text-lg" style={{ color: ind.bg === "#1A1C19" ? "#BBEDA6" : "#43493E" }}>
                        {ind.desc}
                      </p>

                      <div className="rounded-2xl space-y-4 p-6" style={{ backgroundColor: ind.bg === "#1A1C19" ? "#2C4F1B33" : "#F3F4EF" }}>
                        {ind.points.map((p) => (
                          <div key={p.title} className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: ind.accent + "33" }}>
                              <span className="material-symbols-outlined text-sm" style={{ color: ind.accent }}>{p.icon}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm mb-1" style={{ color: ind.bg === "#1A1C19" ? "#FFFFFF" : "#1A1C19" }}>{p.title}</h4>
                              <p className="text-sm leading-relaxed" style={{ color: ind.bg === "#1A1C19" ? "#BBEDA6" : "#73796D" }}>{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: ind.accent + "22", color: ind.accent }}>
                          {ind.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
          <div className="text-center mb-16">
            <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">🌱 The Growth Journey</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1C19] tracking-tight mb-4">Dari Benih hingga Hutan,<br />dalam 3 Langkah.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", emoji: "🌱", title: "Daftar & Setup", desc: "Buat akun dalam 2 menit. Isi nama toko, pilih kategori menu, dan upload foto produk pertama. No kartu kredit.", tier: "Seed — Gratis" },
              { step: "02", emoji: "🌿", title: "Operasional Penuh", desc: "Aktifkan kasir, KDS dapur, dan QR menu. Mulai berjualan dan bayar hanya Rp 200 per transaksi berhasil.", tier: "Sprout — Rp 200/txn" },
              { step: "03", emoji: "🌸", title: "Scale & Analytics", desc: "Ketika volume transaksi tumbuh, beralih ke Bloom dengan laporan SAK EP lengkap dan multi-cabang sync.", tier: "Bloom — Rp 899k/bln" },
            ].map((s) => (
              <div key={s.step} className="relative bg-white rounded-[2rem] p-8 shadow-sm border border-[#E2E3DE]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-6">{s.emoji}</div>
                <div className="text-[10px] font-black text-[#C3C9BA] tracking-widest mb-3">Langkah {s.step}</div>
                <h3 className="text-xl font-extrabold text-[#1A1C19] mb-3">{s.title}</h3>
                <p className="text-[#43493E] leading-relaxed text-sm mb-4">{s.desc}</p>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#BBEDA6]/60 text-[#2C4F1B]">{s.tier}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-24 text-center" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#BBEDA6]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Siap meningkatkan standar<br />bisnis kulinermu?
              </h2>
              <p className="text-[#BBEDA6] text-lg mb-10 max-w-2xl mx-auto opacity-90">
                Bergabunglah dengan ratusan merchant yang sudah mentransformasi operasional mereka bersama lioo.io.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="https://sso.lioo.io/register" className="bg-white text-[#2C4F1B] px-10 py-4 rounded-full font-extrabold text-lg hover:shadow-xl transition-all active:scale-95">
                  🌱 Mulai Menyemai
                </Link>
                <Link href="/pricing" className="border border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                  Lihat Semua Paket
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
