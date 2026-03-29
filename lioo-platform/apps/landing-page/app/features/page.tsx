"use client";

import Link from "next/link";

// ─── SHARED BOTANICAL NAV ──────────────────────────────────────────────────────
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
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href}
              className={`relative group transition-colors duration-200 ${l.href === active ? "text-[#2C4F1B]" : "text-[#43493E] hover:text-[#2C4F1B]"}`}>
              {l.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#436831] rounded-full transition-all duration-200 ${l.href === active ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="http://localhost:3001" className="text-[#2C4F1B] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#BBEDA6]/40 transition-all">Masuk</Link>
          <Link href="http://localhost:3001/register" className="text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
            Mulai Menyemai
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const features = [
    {
      icon: "restaurant",
      tag: "Kitchen Display System",
      emoji: "🌿",
      title: "Dapur yang Merespons Secara Instan.",
      desc: "Eliminasi kertas pesanan dan miskomunikasi dapur. KDS kami menyinkronkan setiap order dari kasir ke layar dapur secara realtime — lengkap dengan alert waktu tiket dan prioritasi pesanan cerdas.",
      highlights: [
        { icon: "bolt", text: "Sinkron instan dengan kasir" },
        { icon: "timer", text: "Alert waktu masak otomatis" },
        { icon: "priority_high", text: "Prioritasi cerdas berdasarkan meja" },
        { icon: "devices", text: "Multi-layar, satu dapur" },
      ],
      visual: "kds",
      align: "right", // visual di kanan
      tier: "🌿 Sprout ke atas",
    },
    {
      icon: "inventory_2",
      tag: "Inventori & Stock Opname",
      emoji: "🌱",
      title: "Tidak Pernah Kehabisan Bahan Lagi.",
      desc: "Kelola stok bahan baku dengan presisi. Alert minimum stok otomatis, perhitungan HPP per resep, dan stock opname mobile yang mengubah pekerjaan 4 jam menjadi 20 menit.",
      highlights: [
        { icon: "warning", text: "Alert stok minimum real-time" },
        { icon: "calculate", text: "Kalkulasi HPP otomatis per resep" },
        { icon: "phone_android", text: "Stock opname via smartphone" },
        { icon: "history", text: "Riwayat mutasi bahan lengkap" },
      ],
      visual: "inventory",
      align: "left", // visual di kiri
      tier: "🌱 Seed (terbatas) atau 🌿 Sprout ke atas",
    },
    {
      icon: "analytics",
      tag: "Laporan Keuangan SAK EP",
      emoji: "🌸",
      title: "Laporan Audit-Ready, Selalu Mutakhir.",
      desc: "Setiap transaksi otomatis dijurnal sesuai standar SAK EP. Laporan Laba/Rugi, Neraca, Arus Kas, dan Jurnal Umum tersedia realtime. Siap audit kapanpun dibutuhkan.",
      highlights: [
        { icon: "auto_awesome", text: "Auto-journal setiap transaksi" },
        { icon: "balance", text: "Laba/Rugi & Neraca real-time" },
        { icon: "waterfall_chart", text: "Laporan Arus Kas langsung" },
        { icon: "account_balance", text: "Rekonsiliasi bank terintegrasi" },
      ],
      visual: "finance",
      align: "right",
      tier: "🌿 Sprout ke atas",
    },
  ];

  return (
    <>
      <Navbar active="/features" />

      <main className="pt-28 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F9FAF5" }}>

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-28">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            <div className="md:w-3/5">
              <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-5 block">
                🌿 Ekosistem Fitur
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#1A1C19] tracking-tighter leading-[0.95] mb-8">
                Platform Operasional<br />
                <span className="text-[#436831] italic">Merchant Modern.</span>
              </h1>
            </div>
            <div className="md:w-2/5 pb-2">
              <p className="text-[#43493E] text-lg leading-relaxed mb-6">
                Dari dapur hingga pelaporan keuangan — lioo.io menyatukan semua alat operasional dalam satu ekosistem yang tumbuh bersama bisnismu.
              </p>
              <div className="flex flex-wrap gap-2">
                {["🌱 Kasir Digital", "🍳 Kitchen Display", "📦 Inventori AI", "📊 Laporan SAK EP", "🌐 QR Menu"].map((t) => (
                  <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#BBEDA6]/60 text-[#2C4F1B]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Z-PATTERN FEATURES ── */}
        <div className="flex flex-col gap-36">
          {features.map((feat, i) => (
            <section key={feat.tag} className="max-w-7xl mx-auto px-6 lg:px-10 overflow-hidden">
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>

                {/* Text */}
                <div className={`lg:col-span-5 ${feat.align === "right" ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="inline-flex items-center gap-2 bg-[#BBEDA6]/60 text-[#2C4F1B] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                    <span className="material-symbols-outlined text-base">{feat.icon}</span>
                    {feat.tag}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1C19] tracking-tight mb-4 leading-tight">
                    {feat.title}
                  </h2>
                  <p className="text-[#43493E] leading-relaxed mb-8 text-lg">
                    {feat.desc}
                  </p>

                  {/* Highlights grid */}
                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {feat.highlights.map((h) => (
                      <div key={h.text} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-[#E2E3DE]/60">
                        <div className="w-8 h-8 rounded-lg bg-[#BBEDA6]/60 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#436831] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{h.icon}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#1A1C19]">{h.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#73796D]">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>Tersedia di: <span className="font-bold text-[#436831]">{feat.tier}</span></span>
                  </div>
                </div>

                {/* Visual */}
                <div className={`lg:col-span-7 ${feat.align === "right" ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="relative group">
                    <div className={`absolute -inset-4 bg-[#BBEDA6]/20 rounded-[2.5rem] ${i % 2 === 0 ? "-rotate-1" : "rotate-1"} group-hover:rotate-0 transition-transform duration-500`} />
                    <div className="relative bg-[#1A1C19] rounded-[2rem] p-4 shadow-2xl z-10">
                      <div className="bg-[#F9FAF5] rounded-[1.5rem] overflow-hidden">

                        {/* KDS Visual */}
                        {feat.visual === "kds" && (
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>S</div>
                                <span className="font-bold text-sm text-[#1A1C19]">Kitchen Display</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-[#436831] rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-[#436831]">Live</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: "Antri", orders: ["Meja 3 · #101", "Meja 8 · #104"], color: "#73796D", bg: "#EDEEE9" },
                                { label: "Dimasak", orders: ["Meja 1 · #99", "Meja 5 · #102", "Meja 7 · #103"], color: "#436831", bg: "#BBEDA6" },
                                { label: "Selesai", orders: ["Meja 2 · #98"], color: "#2C4F1B", bg: "#C3EFAA" },
                              ].map((col) => (
                                <div key={col.label}>
                                  <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: col.color }}>{col.label}</div>
                                  <div className="flex flex-col gap-1.5">
                                    {col.orders.map((o) => (
                                      <div key={o} className="px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ backgroundColor: col.bg, color: col.color }}>{o}</div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inventory Visual */}
                        {feat.visual === "inventory" && (
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-bold text-sm text-[#1A1C19]">Inventori Bahan Baku</span>
                              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ backgroundColor: "#436831" }}>Update Realtime</span>
                            </div>
                            <div className="flex flex-col gap-2.5">
                              {[
                                { name: "Susu Segar", stock: 12, unit: "liter", min: 5, pct: 80, status: "aman" },
                                { name: "Bubuk Kopi", stock: 2.5, unit: "kg", min: 3, pct: 25, status: "kritis" },
                                { name: "Gula Pasir", stock: 8, unit: "kg", min: 4, pct: 65, status: "aman" },
                                { name: "Oat Milk", stock: 4, unit: "liter", min: 6, pct: 40, status: "rendah" },
                              ].map((item) => (
                                <div key={item.name} className="bg-white rounded-xl p-3 border border-[#E2E3DE]/60">
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-[#1A1C19]">{item.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "aman" ? "bg-[#BBEDA6] text-[#2C4F1B]" : item.status === "kritis" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                      {item.stock} {item.unit}
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#E2E3DE] rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.status === "aman" ? "#436831" : item.status === "kritis" ? "#BA1A1A" : "#D97706" }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Finance Visual */}
                        {feat.visual === "finance" && (
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-bold text-sm text-[#1A1C19]">Laporan Keuangan</span>
                              <span className="text-[10px] font-bold text-[#436831]">SAK EP ✓</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {[
                                { label: "Pendapatan Bersih", val: "Rp 42.8jt", trend: "+15%", up: true },
                                { label: "Beban Operasional", val: "Rp 18.2jt", trend: "-3%", up: false },
                                { label: "Laba Bersih", val: "Rp 24.6jt", trend: "+22%", up: true },
                                { label: "Arus Kas", val: "Rp 31.4jt", trend: "+11%", up: true },
                              ].map((r) => (
                                <div key={r.label} className="bg-[#F3F4EF] rounded-xl p-3">
                                  <div className="text-[10px] text-[#73796D] font-medium mb-1">{r.label}</div>
                                  <div className="font-extrabold text-[#1A1C19] text-sm">{r.val}</div>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.up ? "bg-[#BBEDA6] text-[#2C4F1B]" : "bg-red-100 text-red-700"}`}>{r.trend}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-[#2C4F1B] text-white rounded-xl p-3 text-center">
                              <div className="text-[10px] opacity-70 mb-0.5">Neraca Balance</div>
                              <div className="font-extrabold text-sm">Aktiva = Kewajiban + Ekuitas ✓</div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          ))}
        </div>

        {/* ── OFFLINE-FIRST HERO CARD ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-36">
          <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-20" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 items-center">
              <div>
                <span className="text-[#BBEDA6] font-bold text-xs uppercase tracking-widest mb-4 block">☁️ Offline-First Technology</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                  Tetap Berjualan,<br />Meski Internet Mati.
                </h2>
                <p className="text-[#BBEDA6]/90 text-lg leading-relaxed mb-8">
                  Arsitektur "Atomic-Sync" memastikan setiap transaksi disimpan lokal secara aman, lalu tersinkron ke cloud begitu koneksi kembali. Tanpa transaksi yang hilang.
                </p>
                <div className="flex items-center gap-3 text-white font-bold bg-white/10 w-fit px-6 py-4 rounded-2xl border border-white/10">
                  <span className="material-symbols-outlined">cloud_off</span>
                  <span className="material-symbols-outlined">sync_alt</span>
                  <span className="material-symbols-outlined">cloud_done</span>
                  <span className="text-sm ml-2">Offline → Sync → Cloud</span>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                {[
                  { title: "Zero Downtime", desc: "Kasir & KDS tetap berjalan penuh meski ISP putus beberapa jam." },
                  { title: "Bulletproof Sync", desc: "Enkripsi lokal dengan rekonsiliasi otomatis di background saat online." },
                  { title: "State Terjamin", desc: "Tidak ada pesanan ganda atau data hilang akibat koneksi tidak stabil." },
                ].map((c, i) => (
                  <div key={c.title} className={`bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/5 ${i === 1 ? "ml-8" : ""}`}>
                    <h4 className="text-white font-bold text-lg mb-2">{c.title}</h4>
                    <p className="text-white/60 text-sm">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-6 text-center mt-28">
          <h3 className="text-4xl font-extrabold text-[#1A1C19] tracking-tight mb-4">
            Siap mengoperasikan<br />
            <span className="text-[#436831]">Living Atelier-mu?</span>
          </h3>
          <p className="text-[#43493E] text-lg mb-10">Bergabung dengan ratusan merchant yang sudah tumbuh bersama lioo.io.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="http://localhost:3001/register" className="text-white px-10 py-4 rounded-full font-extrabold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
              🌱 Mulai Menyemai
            </Link>
            <Link href="/pricing" className="bg-white border border-[#C3C9BA] text-[#1A1C19] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#F3F4EF] transition-all">
              Lihat Paket Harga
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
