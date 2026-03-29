"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@repo/ui/components/logo";
// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav shadow-[0_12px_40px_rgba(67,73,62,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <Logo />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[
            { label: "Beranda", href: "/" },
            { label: "Fitur", href: "/features" },
            { label: "Solusi", href: "/solutions" },
            { label: "Harga", href: "/pricing" },
            { label: "Hardware", href: "/hardware" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#43493E] hover:text-[#2C4F1B] transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#436831] rounded-full transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="http://localhost:3001"
            className="text-[#2C4F1B] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#BBEDA6]/40 transition-all duration-200"
          >
            Masuk
          </a>
          <a
            href="http://localhost:3001/register?plan=seed"
            id="navbar-cta"
            className="sage-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Mulai Bertumbuh
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-[#EDEEE9] transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[#2C4F1B]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F9FAF5]/95 backdrop-blur-xl border-t border-[#C3C9BA]/20 px-6 py-6 flex flex-col gap-4">
          {[
            { label: "Beranda", href: "/" },
            { label: "Fitur", href: "/features" },
            { label: "Solusi", href: "/solutions" },
            { label: "Harga", href: "/pricing" },
            { label: "Hardware", href: "/hardware" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#43493E] font-semibold text-sm py-2 border-b border-[#C3C9BA]/20"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="http://localhost:3001/register?plan=seed"
            className="sage-gradient text-white px-6 py-3 rounded-full font-bold text-center text-sm mt-2"
          >
            Mulai Bertumbuh
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── HERO SECTION ──────────────────────────────────────────────────────────────
function HeroSection() {
  const stats = [
    { value: "< 10 mnt", label: "Setup Merchant" },
    { value: "Rp 0", label: "Biaya Bulanan Flex" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "5 App", label: "Dalam 1 Platform" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden bg-[#F7F8F3]"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#BBEDA6]/20 rounded-full blur-3xl transform translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C3EFAA]/15 rounded-full blur-3xl transform -translate-x-1/3" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content — 5 cols */}
          <div className="lg:col-span-5 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-[#BBEDA6]/60 text-[#2C4F1B] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-[#2C4F1B] rounded-full animate-pulse-green" />
              Platform POS Terbaru — 2026
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-[#2C4F1B] leading-[1.05] tracking-tight mb-6">
              Kelola Merchantmu
              <br />
              <span className="text-[#436831]">dengan Cara</span>
              <br />
              yang Artisan.
            </h1>

            <p className="text-lg text-[#43493E] mb-10 leading-relaxed max-w-md">
              Ekosistem digital organik untuk bisnis F&amp;B dan retail modern.
              Kasir, Dapur, Inventori, dan Keuangan — dalam satu platform yang
              elegan.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/pricing"
                id="hero-cta-primary"
                className="sage-gradient text-white px-8 py-4 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                Mulai Perjalananmu
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/features"
                id="hero-cta-secondary"
                className="bg-white text-[#2C4F1B] px-8 py-4 rounded-full font-bold border border-[#C3C9BA]/30 hover:bg-[#F3F4EF] active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  play_circle
                </span>
                Lihat Detail Fitur
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 ambient-shadow"
                >
                  <div className="text-2xl font-extrabold text-[#2C4F1B]">
                    {s.value}
                  </div>
                  <div className="text-xs text-[#43493E] font-medium mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content — 7 cols */}
          <div className="lg:col-span-7 relative">
            {/* Main Dashboard Card */}
            <div className="relative bg-[#1A1C19] rounded-[2.5rem] p-4 shadow-2xl animate-float">
              <div className="bg-[#F9FAF5] rounded-[2rem] overflow-hidden aspect-[4/3]">
                {/* Mock Dashboard UI */}
                <div className="h-full flex flex-col">
                  {/* Header bar */}
                  <div className="bg-white flex items-center justify-between px-6 py-4 border-b border-[#E2E3DE]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sage-gradient rounded-xl flex items-center justify-center">
                        <span className="text-white font-black text-xs">S</span>
                      </div>
                      <span className="font-bold text-sm text-[#2C4F1B]">lioo.io Dashboard</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#BBEDA6]" />
                      <div className="w-3 h-3 rounded-full bg-[#F9FAF5] border border-[#C3C9BA]" />
                      <div className="w-3 h-3 rounded-full bg-[#F9FAF5] border border-[#C3C9BA]" />
                    </div>
                  </div>
                  {/* Content area */}
                  <div className="flex-1 p-5 grid grid-cols-3 gap-3">
                    {/* Metric cards */}
                    {[
                      { label: "Pendapatan Hari Ini", val: "Rp 4.2 Jt", icon: "payments", up: true },
                      { label: "Total Pesanan", val: "148", icon: "receipt_long", up: true },
                      { label: "Avg. Wait Time", val: "4.2 mnt", icon: "timer", up: false },
                    ].map((m) => (
                      <div key={m.label} className="bg-white rounded-2xl p-4 ambient-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="material-symbols-outlined text-[#436831] text-lg">{m.icon}</span>
                          <span className={`text-xs font-bold ${m.up ? "text-[#436831]" : "text-[#BA1A1A]"}`}>
                            {m.up ? "↑" : "↓"} {m.up ? "+12%" : "-3%"}
                          </span>
                        </div>
                        <div className="text-lg font-extrabold text-[#1A1C19]">{m.val}</div>
                        <div className="text-[10px] text-[#73796D] font-medium mt-0.5">{m.label}</div>
                      </div>
                    ))}
                    {/* Chart placeholder */}
                    <div className="col-span-2 bg-white rounded-2xl p-4 ambient-shadow">
                      <div className="text-xs font-bold text-[#43493E] mb-3">Penjualan 7 Hari</div>
                      <div className="flex items-end gap-2 h-20">
                        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-lg sage-gradient opacity-80"
                              style={{ height: `${h}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Quick actions */}
                    <div className="bg-white rounded-2xl p-4 ambient-shadow flex flex-col gap-2 justify-center">
                      {["Kasir", "Dapur", "Laporan"].map((a) => (
                        <div
                          key={a}
                          className="flex items-center gap-2 text-xs font-semibold text-[#436831] bg-[#BBEDA6]/40 px-3 py-2 rounded-xl"
                        >
                          <div className="w-2 h-2 bg-[#436831] rounded-full" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge — Kasir Active */}
            <div className="absolute -left-4 top-1/3 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 ambient-shadow">
              <div className="w-10 h-10 bg-[#BBEDA6]/60 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2C4F1B] text-xl">point_of_sale</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1C19]">Kasir Online</div>
                <div className="text-[10px] text-[#73796D]">2 perangkat aktif</div>
              </div>
            </div>

            {/* Floating badge — Live Order */}
            <div className="absolute -right-4 bottom-1/4 bg-[#2C4F1B] text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#BBEDA6] text-xl">restaurant</span>
              <div>
                <div className="text-xs font-bold">Order Baru!</div>
                <div className="text-[10px] text-[#A8D390]">Meja 7 — 3 item</div>
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-[#BBEDA6]/30 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SOLUTIONS BY INDUSTRY ─────────────────────────────────────────────────────
function SolutionsSection() {
  const solutions = [
    {
      id: "resto",
      icon: "restaurant",
      tag: "Full-Service Restaurant",
      title: "Restoran & Kafe",
      desc: "Dari meja ke dapur dalam hitungan detik. Sistem KDS terintegrasi memastikan tiap pesanan diproses tepat waktu dengan notifikasi realtime.",
      features: ["Kanban Board KDS", "QR Self-Order", "Rekap Harian Otomatis", "Manajemen Meja"],
      color: "#436831",
      bgColor: "#BBEDA6",
    },
    {
      id: "event",
      icon: "celebration",
      tag: "Pop-up & Event",
      title: "Booth Event & Bazaar",
      desc: "Setup dalam 5 menit di lokasi manapun. Kasir ringan berbasis PWA yang tetap berjalan meski sinyal putus-putus di lapangan event.",
      features: ["Offline-capable PWA", "Bayar Per Transaksi", "Multi-booth Sync", "QR Payment"],
      color: "#27501A",
      bgColor: "#C3EFAA",
    },
    {
      id: "retail",
      icon: "storefront",
      tag: "Retail & Toko",
      title: "Minimarket & Retail",
      desc: "Inventori cerdas dengan prediksi AI. Kelola stok ratusan SKU, purchase order otomatis, dan laporan keuangan SAK EP-compliant.",
      features: ["Smart Inventory AI", "Purchase Order", "Multi-cabang", "Laporan SAK EP"],
      color: "#2C4F1B",
      bgColor: "#BBF7A0",
    },
  ];

  return (
    <section id="solutions" className="py-28 px-6 bg-[#F9FAF5]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">
            Solusi per Industri
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1C19] mb-4 tracking-tight">
            Dirancang untuk Bisnis Anda
          </h2>
          <p className="text-[#43493E] max-w-xl mx-auto leading-relaxed">
            Apapun tipe bisnis F&amp;B dan retail Anda, lioo.io memiliki arsitektur
            yang tepat untuk kebutuhan operasional spesifik Anda.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((sol, i) => (
            <div
              key={sol.id}
              id={`solution-${sol.id}`}
              className="bg-white rounded-[2rem] p-8 ambient-shadow hover:shadow-xl transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: sol.bgColor }}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ color: sol.color }}
                >
                  {sol.icon}
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#73796D] mb-3 block">
                {sol.tag}
              </span>
              <h3 className="text-xl font-bold text-[#1A1C19] mb-3">{sol.title}</h3>
              <p className="text-sm text-[#43493E] leading-relaxed mb-6">{sol.desc}</p>
              <div className="flex flex-col gap-2">
                {sol.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[#436831] text-base">check_circle</span>
                    <span className="text-[#43493E] font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/solutions" className="mt-6 flex items-center gap-2 text-[#436831] font-bold text-sm group-hover:gap-3 transition-all">
                Pelajari Lebih Lanjut
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES Z-PATTERN ────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: "point_of_sale",
      tag: "Kasir Digital",
      title: "POS Ringan & Cepat",
      desc: "UI kasir yang intuitif dengan latensi 0.1 detik per aksi. Hitung kembalian otomatis, split bill, dan cetak struk thermal langsung dari browser via Web Bluetooth.",
      highlights: ["Offline-capable PWA", "Web Bluetooth Printer", "Split Bill & Diskon", "Riwayat Transaksi"],
      align: "right",
    },
    {
      icon: "kitchen",
      tag: "Kitchen Display",
      title: "KDS Kanban Board Realtime",
      desc: "Dapur Anda selalu sinkron. Tiket pesanan tampil otomatis via WebSocket tanpa refresh. Lacak waktu tunggu dan identifikasi bottleneck dengan Performance History module.",
      highlights: ["WebSocket Realtime", "Timer Per Pesanan", "Performance Analytics", "Smart Inventory AI"],
      align: "left",
    },
    {
      icon: "account_balance",
      tag: "Akuntansi SAK EP",
      title: "Laporan Keuangan Komprehensif",
      desc: "Setiap transaksi otomatis dijurnal sesuai standar SAK EP. Laporan Laba/Rugi, Neraca, Arus Kas, dan Jurnal Umum ter-update realtime. Audit-ready kapanpun.",
      highlights: ["Auto-Journal SAK EP", "Laba/Rugi & Neraca", "Arus Kas Langsung", "Rekonsiliasi Bank"],
      align: "right",
    },
  ];

  return (
    <section id="features" className="py-28 px-6 bg-[#F3F4EF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">
            Fitur Unggulan
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1C19] tracking-tight">
            Semua yang Anda Butuhkan,
            <br />
            <span className="text-[#436831]">Dalam Satu Ekosistem.</span>
          </h2>
        </div>

        {/* Z-Pattern Features */}
        <div className="flex flex-col gap-24">
          {features.map((feat, i) => (
            <div
              key={feat.tag}
              id={`feature-${i}`}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                feat.align === "left" ? "" : "lg:flex-row-reverse"
              }`}
            >
              {/* Text side */}
              <div
                className={`lg:col-span-5 ${
                  feat.align === "left" ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <div className="inline-flex items-center gap-2 bg-[#BBEDA6]/60 text-[#2C4F1B] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <span className="material-symbols-outlined text-base">{feat.icon}</span>
                  {feat.tag}
                </div>
                <h3 className="text-3xl font-extrabold text-[#1A1C19] mb-4 leading-tight">
                  {feat.title}
                </h3>
                <p className="text-[#43493E] leading-relaxed mb-8">{feat.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {feat.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 ambient-shadow"
                    >
                      <span className="material-symbols-outlined text-[#436831] text-base">
                        check_circle
                      </span>
                      <span className="text-sm font-semibold text-[#1A1C19]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual side */}
              <div
                className={`lg:col-span-7 ${
                  feat.align === "left" ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <div className="relative bg-white rounded-[2.5rem] p-8 ambient-shadow overflow-hidden group">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#BBEDA6]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  {/* Feature visual mockup */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 sage-gradient rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl">{feat.icon}</span>
                      </div>
                      <div>
                        <div className="font-bold text-[#1A1C19] text-sm">{feat.tag}</div>
                        <div className="text-xs text-[#73796D]">Modul Aktif</div>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#436831] rounded-full animate-pulse-green" />
                        <span className="text-xs font-bold text-[#436831]">Live</span>
                      </div>
                    </div>

                    {/* Mini UI mockup based on feature */}
                    {i === 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {["Es Teh", "Nasi Goreng", "Mie Ayam", "Soto Ayam", "Jus Buah", "Kopi Susu"].map((item, idx) => (
                          <div
                            key={item}
                            className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${
                              idx === 1 ? "sage-gradient text-white" : "bg-[#F3F4EF] hover:bg-[#BBEDA6]/40"
                            }`}
                          >
                            <div className="text-2xl mb-2">
                              {["🧋", "🍳", "🍜", "🍲", "🥤", "☕"][idx]}
                            </div>
                            <div className={`text-xs font-bold ${idx === 1 ? "text-white" : "text-[#1A1C19]"}`}>
                              {item}
                            </div>
                            <div className={`text-[10px] mt-1 ${idx === 1 ? "text-[#C3EFAA]" : "text-[#73796D]"}`}>
                              Rp {[8, 25, 18, 20, 15, 12][idx]}k
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {i === 1 && (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { status: "Antri", items: 3, color: "#73796D", bg: "#E2E3DE", table: "Meja 3" },
                          { status: "Dimasak", items: 5, color: "#436831", bg: "#BBEDA6", table: "Meja 7" },
                          { status: "Selesai", items: 2, color: "#2C4F1B", bg: "#C3EFAA", table: "Meja 1" },
                        ].map((col) => (
                          <div key={col.status}>
                            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: col.color }}>
                              {col.status}
                            </div>
                            <div className="flex flex-col gap-2">
                              {Array.from({ length: col.items > 2 ? 2 : col.items }).map((_, j) => (
                                <div
                                  key={j}
                                  className="p-3 rounded-xl text-xs font-semibold"
                                  style={{ backgroundColor: col.bg, color: col.color }}
                                >
                                  <div className="font-bold">{col.table}</div>
                                  <div className="text-[10px] mt-1 opacity-70">#{100 + j + col.items}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {i === 2 && (
                      <div className="flex flex-col gap-3">
                        {[
                          { label: "Pendapatan Bersih", val: "Rp 42.850.000", up: true, pct: "+15%" },
                          { label: "Beban Operasional", val: "Rp 18.200.000", up: false, pct: "-3%" },
                          { label: "Laba Bersih", val: "Rp 24.650.000", up: true, pct: "+22%" },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between p-4 bg-[#F3F4EF] rounded-2xl"
                          >
                            <div>
                              <div className="text-xs text-[#73796D] font-medium">{row.label}</div>
                              <div className="font-extrabold text-[#1A1C19] mt-0.5">{row.val}</div>
                            </div>
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                row.up
                                  ? "bg-[#BBEDA6] text-[#2C4F1B]"
                                  : "bg-[#FFDAD6] text-[#93000A]"
                              }`}
                            >
                              {row.pct}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HARDWARE SUPPORT ──────────────────────────────────────────────────────────
function HardwareSection() {
  const hardwareItems = [
    { icon: "tablet_android", name: "Tablet POS", desc: "Layar sentuh 10\" optimal untuk kasir", status: "Didukung Penuh" },
    { icon: "print", name: "Printer Thermal", desc: "Auto-reconnect via Web Bluetooth", status: "Plug & Print" },
    { icon: "monitor", name: "Kitchen Display", desc: "Monitor fullscreen untuk KDS Dapur", status: "Realtime Sync" },
    { icon: "qr_code_scanner", name: "QR Scanner", desc: "Scan menu pelanggan via kamera", status: "Built-in" },
    { icon: "payment", name: "Payment Terminal", desc: "QRIS, Kartu Debit/Kredit via Xendit", status: "Terintegrasi" },
    { icon: "router", name: "Network Router", desc: "Stabil meski 50+ perangkat aktif", status: "Dioptimasi" },
  ];

  return (
    <section id="hardware" className="py-28 px-6 bg-[#1A1C19]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#A8D390] font-bold tracking-widest text-xs uppercase mb-4 block">
            Hardware Support
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Beroperasi dengan Perangkat
            <br />
            <span className="text-[#A8D390]">yang Sudah Anda Miliki.</span>
          </h2>
          <p className="text-[#A8D390]/70 max-w-xl mx-auto leading-relaxed">
            Tidak perlu beli hardware mahal. lioo.io berjalan di browser modern
            dan mendukung ekosistem perangkat yang sudah ada di toko Anda.
          </p>
        </div>

        {/* Hardware Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {hardwareItems.map((hw, i) => (
            <div
              key={hw.name}
              id={`hardware-${i}`}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 hover:border-[#436831]/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-[#BBEDA6]/15 rounded-2xl flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[#A8D390] text-2xl">{hw.icon}</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">{hw.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">{hw.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8D390] bg-[#BBEDA6]/10 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-[#A8D390] rounded-full" />
                {hw.status}
              </span>
            </div>
          ))}
        </div>

        {/* PWA Banner */}
        <div className="bg-gradient-to-r from-[#2C4F1B] to-[#436831] rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-[#BBEDA6] text-xs font-bold uppercase tracking-widest mb-3">PWA Ready</div>
            <h3 className="text-2xl font-extrabold text-white mb-3">Offline-Capable Kasir</h3>
            <p className="text-[#C3EFAA]/80 max-w-lg text-sm leading-relaxed">
              Service Worker + Cache Manifest memastikan kasir tablet tetap berjalan
              meski sinyal terputus beberapa detik. Semua transaksi tersinkron otomatis
              saat koneksi kembali.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#BBEDA6] text-4xl">offline_pin</span>
            </div>
            <span className="text-[#BBEDA6] text-xs font-bold">Offline Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const [transactions, setTransactions] = useState(2500);

  const sproutCost = transactions * 200;
  const bloomCost = 899000;
  const savings = Math.max(0, sproutCost - bloomCost);

  const plans = [
    {
      id: "seed",
      name: "Seed",
      emoji: "🌱",
      tagline: "Benih pertama tumbuh dari tanah yang baik.",
      desc: "Gratis selamanya. Untuk merchant yang baru menanam mimpi pertamanya.",
      price: "Gratis",
      sub: "Selamanya · Tanpa kartu kredit",
      features: [
        "5 Produk",
        "1 Kasir",
        "QR Menu Digital",
        "Cetak Struk",
        null,
        null,
      ],
      cta: "Mulai Menyemai",
      ctaHref: "http://localhost:3424/register?plan=seed",
      featured: false,
      color: "#73796D",
    },
    {
      id: "sprout",
      name: "Sprout",
      emoji: "🌿",
      tagline: "Bayar saat tumbuh, bukan saat menunggu.",
      desc: "Rp 200 per transaksi. Zero biaya bulanan. Cocok untuk pop-up, event, dan bisnis musiman.",
      price: "Rp 200",
      sub: "/ transaksi · Rp 0 bulanan",
      badge: "🌿 Paling Fleksibel",
      features: [
        "Produk Unlimited",
        "Kasir & KDS Unlimited",
        "Inventori Cerdas AI",
        "Laporan SAK EP",
        "API Access",
        "Support 24/7",
      ],
      cta: "Mulai Tumbuh",
      ctaHref: "http://localhost:3424/register?plan=sprout",
      featured: true,
      color: "#436831",
    },
    {
      id: "bloom",
      name: "Bloom",
      emoji: "🌸",
      tagline: "Saat akar kuat, bunga mekar penuh.",
      desc: "Langganan bulanan untuk operasional yang matang, stabil, dan multi-cabang.",
      price: "Rp 899k",
      sub: "/ bulan · All-inclusive",
      features: [
        "Semua di Sprout",
        "Custom Branding",
        "Multi-cabang Sync",
        "Dedicated Support",
        "White-label Option",
        "SLA 99.9%",
      ],
      cta: "Mekar Sekarang",
      ctaHref: "http://localhost:3424/register?plan=bloom",
      featured: false,
      color: "#2C4F1B",
    },
    {
      id: "forest",
      name: "Forest",
      emoji: "🌲",
      tagline: "Ekosistem besar dimulai dari satu pohon.",
      desc: "Solusi enterprise untuk jaringan multi-cabang, white-label penuh, dan SLA kelas dunia.",
      price: "Custom",
      sub: "Kontak tim kami",
      features: [
        "Semua di Bloom",
        "Unlimited Cabang",
        "Custom Integrasi ERP",
        "Dedicated Server",
        "Enterprise SLA",
        "Account Manager",
      ],
      cta: "Hubungi Kami",
      ctaHref: "mailto:enterprise@lioo.io",
      featured: false,
      color: "#1A1C19",
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6 bg-[#F3F4EF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">
            The Growth Stage
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1C19] mb-4 tracking-tight">
            Tumbuh Bersama Merchantmu.
          </h2>
          <p className="text-[#43493E] max-w-lg mx-auto">
            Dari benih pertama hingga hutan yang rimbun — setiap tahap pertumbuhan bisnismu punya paket yang tepat.
          </p>
        </div>

        {/* Growth Stage Journey */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2">
          {["🌱 Seed", "→", "🌿 Sprout", "→", "🌸 Bloom", "→", "🌲 Forest"].map((s, i) => (
            <span key={i} className={`text-sm font-bold whitespace-nowrap ${
              i % 2 === 0 ? "text-[#2C4F1B] bg-[#BBEDA6]/50 px-4 py-2 rounded-full" : "text-[#C3C9BA]"
            }`}>{s}</span>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              id={`plan-${plan.id}`}
              className={`relative rounded-[2rem] p-7 transition-all duration-300 ${
                plan.featured
                  ? "bg-white border-2 border-[#436831] shadow-2xl scale-105 z-10"
                  : "bg-white ambient-shadow hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#BBEDA6] text-[#2C4F1B] px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md">
                  {plan.badge}
                </div>
              )}

              {/* Tier Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1A1C19] leading-none">{plan.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: plan.color }}>Growth Tier</span>
                </div>
              </div>

              <p className="text-xs italic text-[#436831] font-semibold mb-2 leading-snug">&ldquo;{plan.tagline}&rdquo;</p>
              <p className="text-[11px] text-[#73796D] mb-5 leading-relaxed">{plan.desc}</p>

              <div className="mb-7">
                <div className="text-3xl font-black text-[#1A1C19]">{plan.price}</div>
                <div className="text-xs text-[#73796D] mt-1">{plan.sub}</div>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7">
                {plan.features.map((f, i) =>
                  f ? (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#436831] text-sm">check_circle</span>
                      <span className="text-[#43493E] font-medium">{f}</span>
                    </li>
                  ) : (
                    <li key={i} className="flex items-center gap-2 text-xs opacity-25">
                      <span className="material-symbols-outlined text-sm">remove</span>
                      <span className="text-[#73796D]">–</span>
                    </li>
                  )
                )}
              </ul>

              <a
                href={plan.ctaHref}
                id={`cta-${plan.id}`}
                className={`w-full block text-center py-3.5 rounded-full font-bold text-sm transition-all duration-200 active:scale-95 ${
                  plan.featured
                    ? "sage-gradient text-white shadow-md hover:opacity-90"
                    : "border-2 border-[#C3C9BA] text-[#1A1C19] hover:border-[#436831] hover:text-[#436831]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="bg-white rounded-[2rem] p-10 ambient-shadow">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-extrabold text-[#1A1C19] mb-2">
              🌿 Sprout vs 🌸 Bloom — Hitung Titik Impas
            </h3>
            <p className="text-sm text-[#43493E]">
              Geser slider untuk melihat kapan Bloom lebih hemat dari Sprout
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-[#1A1C19] text-sm">
                Transaksi per Bulan
              </label>
              <span className="text-2xl font-extrabold text-[#436831]">
                {transactions.toLocaleString("id-ID")}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={transactions}
              onChange={(e) => setTransactions(Number(e.target.value))}
              className="w-full mb-8"
              id="roi-slider"
            />
            <div className="grid grid-cols-2 gap-6">
              {/* Sprout Cost */}
              <div className={`rounded-2xl p-6 transition-all ${sproutCost < bloomCost ? "bg-[#BBEDA6]/30 border-2 border-[#436831]" : "bg-[#F3F4EF] opacity-60"}`}>
                <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${sproutCost < bloomCost ? "text-[#2C4F1B]" : "text-[#73796D]"}`}>
                  🌿 Total Biaya Sprout
                </p>
                <div className={`text-2xl font-extrabold ${sproutCost < bloomCost ? "text-[#1A1C19]" : "text-[#73796D]"}`}>
                  Rp {sproutCost.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-[#73796D] mt-1">= {transactions.toLocaleString("id-ID")} × Rp 200</div>
              </div>

              {/* Bloom Cost */}
              <div className={`rounded-2xl p-6 transition-all ${bloomCost <= sproutCost ? "bg-[#C3EFAA]/40 border-2 border-[#2C4F1B]" : "bg-[#F3F4EF] opacity-60"}`}>
                <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${bloomCost <= sproutCost ? "text-[#2C4F1B]" : "text-[#73796D]"}`}>
                  🌸 Total Biaya Bloom
                </p>
                <div className={`text-2xl font-extrabold ${bloomCost <= sproutCost ? "text-[#1A1C19]" : "text-[#73796D]"}`}>
                  Rp {bloomCost.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-[#73796D] mt-1">Flat per bulan (All-inclusive)</div>
              </div>
            </div>
            {transactions >= 4500 && (
              <div className="mt-6 p-4 bg-[#BBEDA6]/30 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-sm text-[#2C4F1B] font-semibold">
                  Di {transactions.toLocaleString("id-ID")} transaksi/bulan, upgrade ke <strong>🌸 Bloom</strong> sudah menghemat Rp {savings.toLocaleString("id-ID")} per bulan!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah lioo.io bisa digunakan offline?",
      a: "Ya! Aplikasi Kasir dilengkapi Service Worker PWA yang memungkinkan operasi offline. Semua transaksi yang terjadi saat offline akan otomatis tersinkron saat koneksi internet kembali.",
    },
    {
      q: "Bagaimana cara billing Sprout bekerja?",
      a: "Dengan paket Sprout 🌿, Anda hanya membayar Rp 200 per transaksi sukses. Tidak ada biaya bulanan, biaya setup, atau biaya tersembunyi. Bayar tepat sesuai volume penjualan Anda.",
    },
    {
      q: "Apakah data keuangan saya aman?",
      a: "Data Anda dienkripsi end-to-end dan diisolasi per merchant menggunakan Row Level Security (RLS) di level database. Tidak ada data antar merchant yang bisa saling bocor.",
    },
    {
      q: "Printer thermal apa yang didukung?",
      a: "lioo.io mendukung printer thermal yang kompatibel dengan Web Bluetooth API (umumnya ESC/POS). Sistem auto-reconnect kami memastikan printer selalu terhubung meski ada gangguan koneksi.",
    },
    {
      q: "Bisakah saya punya banyak cabang?",
      a: "Paket Bloom 🌸 mendukung multi-cabang dengan sinkronisasi real-time antar lokasi. Untuk jaringan besar (10+ cabang), paket Forest 🌲 menyediakan dedicated server dan account manager eksklusif.",
    },
    {
      q: "Apakah ada free trial?",
      a: "Paket Seed 🌱 kami sepenuhnya gratis selamanya — tidak perlu kartu kredit. Upgrade ke Sprout, Bloom, atau Forest kapanpun bisnismu siap berkembang.",
    },
  ];

  return (
    <section id="faq" className="py-28 px-6 bg-[#F9FAF5]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl font-extrabold text-[#1A1C19] mb-4">
            Pertanyaan yang Sering Ditanya
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              id={`faq-${i}`}
              className="bg-white rounded-[1.5rem] overflow-hidden ambient-shadow"
            >
              <button
                className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-[#F9FAF5] transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-bold text-[#1A1C19] pr-4">{faq.q}</span>
                <span
                  className={`material-symbols-outlined text-[#436831] shrink-0 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openIdx === i && (
                <div className="px-8 pb-6 text-sm text-[#43493E] leading-relaxed border-t border-[#F3F4EF]">
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ─────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-16 px-6 bg-[#F9FAF5]">
      <div className="max-w-7xl mx-auto">
        <div className="relative sage-gradient rounded-[3rem] overflow-hidden min-h-72 flex items-center justify-center text-center p-12">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <p className="text-[#C3EFAA] text-sm font-bold uppercase tracking-widest mb-4">
              Siap memulai?
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Kembangkan Merchantmu
              <br />
              Mulai Hari Ini.
            </h2>
            <p className="text-[#BBEDA6]/80 mb-10 max-w-lg mx-auto">
              Bergabung dengan ratusan merchant yang sudah menggunakan lioo.io.
              Setup gratis, tanpa kartu kredit, dalam 10 menit.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="http://localhost:3001/register?plan=seed"
                id="final-cta-primary"
                className="bg-white text-[#2C4F1B] px-10 py-4 rounded-full font-extrabold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                🌱 Mulai Menyemai
              </a>
              <a
                href="http://localhost:3001"
                id="final-cta-secondary"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-200"
              >
                Masuk ke Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Produk: ["Kasir Digital", "Kitchen Display", "E-Menu Pelanggan", "Laporan Keuangan", "Inventori AI"],
    Perusahaan: ["Tentang Kami", "Blog", "Karir", "Press Kit"],
    Support: ["Dokumentasi", "Status System", "Kontak Support", "Privacy Policy", "Syarat Layanan"],
  };

  return (
    <footer id="footer" className="bg-[#F3F4EF] rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 sage-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-black">S</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">lioo.io</span>
            </div>
            <p className="text-sm text-[#43493E] leading-relaxed max-w-xs mb-6">
              Ekosistem digital organik untuk pemberdayaan generasi berikutnya dari merchant
              F&amp;B dan retail Indonesia.
            </p>
            <div className="flex gap-3">
              {["language", "chat_bubble", "group"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-[#BBEDA6]/40 transition-colors ambient-shadow"
                >
                  <span className="material-symbols-outlined text-[#436831] text-lg">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2C4F1B] block mb-5">
                {category}
              </span>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-[#43493E] hover:text-[#2C4F1B] transition-colors font-medium"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#C3C9BA]/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#73796D]">
            © 2026 lioo.io. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#436831] rounded-full animate-pulse-green" />
            <span className="text-xs text-[#73796D] font-medium">Semua sistem berjalan normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ROOT ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SolutionsSection />
        <FeaturesSection />
        <HardwareSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
