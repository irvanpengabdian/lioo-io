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
          <Link href={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"} className="text-[#2C4F1B] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#BBEDA6]/40 transition-all">Masuk</Link>
          <Link href={`${process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}/register`} className="text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>Mulai Menyemai</Link>
        </div>
      </div>
    </nav>
  );
}

// ─── FEATURE COMPARISON TABLE ──────────────────────────────────────────────────
const compareRows = [
  {
    feature: "Produk / SKU",
    sub: "Jumlah item menu yang bisa dibuat",
    seed: "5 Produk", sprout: "Unlimited", bloom: "Unlimited", forest: "Unlimited",
    sproutHighlight: true,
  },
  {
    feature: "Akun Staf",
    sub: "Jumlah akun karyawan per merchant",
    seed: "1 Akun", sprout: "Unlimited", bloom: "Unlimited", forest: "Unlimited",
    sproutHighlight: true,
  },
  {
    feature: "Kasir Digital (POS)",
    sub: "Aplikasi kasir tablet / smartphone",
    seed: true, sprout: true, bloom: true, forest: true,
  },
  {
    feature: "Kitchen Display (KDS)",
    sub: "Layar order realtime untuk dapur",
    seed: false, sprout: true, bloom: true, forest: true,
    sproutHighlight: true,
  },
  {
    feature: "QR Menu Digital",
    sub: "Menu self-order pelanggan via QR",
    seed: true, sprout: true, bloom: true, forest: true,
  },
  {
    feature: "Inventori & Resep",
    sub: "Manajemen stok bahan baku & HPP",
    seed: false, sprout: true, bloom: true, forest: true,
    sproutHighlight: true,
  },
  {
    feature: "Laporan SAK EP",
    sub: "Laba/Rugi, Neraca, Arus Kas",
    seed: false, sprout: true, bloom: true, forest: true,
    sproutHighlight: true,
  },
  {
    feature: "Multi-Cabang Sync",
    sub: "Kelola banyak outlet dalam 1 dashboard",
    seed: false, sprout: false, bloom: true, forest: true,
  },
  {
    feature: "Custom Branding",
    sub: "Logo, warna, dan domain custom",
    seed: false, sprout: false, bloom: true, forest: true,
  },
  {
    feature: "API Access",
    sub: "Integrasi sistem ERP / third-party",
    seed: false, sprout: false, bloom: false, forest: true,
  },
  {
    feature: "Dedicated Account Manager",
    sub: "Tim khusus untuk enterprise",
    seed: false, sprout: false, bloom: false, forest: true,
  },
  {
    feature: "SLA Uptime",
    sub: "Jaminan ketersediaan layanan",
    seed: "99%", sprout: "99%", bloom: "99.9%", forest: "99.99%",
  },
];

function CellValue({ val }: { val: string | boolean }) {
  if (val === true) return <span className="material-symbols-outlined text-[#436831]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
  if (val === false) return <span className="text-[#C3C9BA] font-bold">—</span>;
  return <span className="text-sm font-semibold text-[#1A1C19]">{val as string}</span>;
}

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    category: "Billing & Paket",
    icon: "payments",
    questions: [
      {
        q: "Bagaimana cara billing Sprout 🌿 bekerja?",
        a: "Saldo top-up ke FlexWallet di dashboard Anda. Setiap transaksi yang berhasil (Order PAID) otomatis memotong Rp 200 dari saldo. Tidak ada biaya bulanan tetap — bayar tepat sesuai volume penjualan.",
      },
      {
        q: "Bisakah saya berganti paket sewaktu-waktu?",
        a: "Ya, Anda bisa upgrade atau downgrade antar tier (Seed → Sprout → Bloom → Forest) kapanpun melalui dashboard Pengaturan Akun, tanpa biaya penalti atau administrasi.",
      },
      {
        q: "Apa perbedaan Sprout 🌿 dan Bloom 🌸?",
        a: "Sprout adalah pay-as-you-go (Rp 200/transaksi, 0 bulanan) — ideal untuk bisnis musiman atau sedang tumbuh. Bloom adalah flat Rp 899k/bulan dengan fitur multi-cabang dan custom branding — cocok untuk operasional stabil di atas ~4.500 transaksi/bulan.",
      },
    ],
  },
  {
    category: "Teknis & Keamanan",
    icon: "security",
    questions: [
      {
        q: "Apakah lioo.io bisa digunakan offline?",
        a: "Ya! Aplikasi Kasir dilengkapi Service Worker PWA yang memungkinkan operasi offline penuh. Semua transaksi saat offline akan otomatis tersinkron ke cloud begitu koneksi kembali — tidak ada data yang hilang.",
      },
      {
        q: "Apakah data keuangan saya aman?",
        a: "Data dienkripsi end-to-end dan diisolasi per merchant menggunakan Row Level Security (RLS) di level database PostgreSQL. Tidak ada data antar merchant yang bisa saling bocor.",
      },
      {
        q: "Metode pembayaran apa yang didukung untuk pelanggan?",
        a: "QRIS, Transfer Bank (Virtual Account), Kartu Kredit/Debit via Xendit, serta dompet digital GoPay, OVO, dan ShopeePay. Semua tersedia tanpa integrasi tambahan.",
      },
    ],
  },
  {
    category: "Onboarding & Support",
    icon: "support_agent",
    questions: [
      {
        q: "Berapa lama waktu setup awal?",
        a: "Target kami: merchant pertama sudah bisa berjualan dalam 10 menit. Wizard onboarding 3 langkah memandu Anda mengisi profil toko, pilih kategori menu, dan upload produk pertama.",
      },
      {
        q: "Apakah ada free trial untuk paket berbayar?",
        a: "Paket Seed 🌱 gratis selamanya — itu sudah merupakan free trial permanen. Upgrade ke Sprout atau Bloom tidak memerlukan kartu kredit di awal; Anda hanya mulai ditagih saat pertama kali aktif bertransaksi.",
      },
    ],
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [transactions, setTransactions] = useState(2500);

  const sproutCost = transactions * 200;
  const bloomCost = 899000;
  const savings = Math.max(0, sproutCost - bloomCost);
  const breakeven = Math.ceil(bloomCost / 200);

  return (
    <>
      <Navbar active="/pricing" />

      <main className="pt-28 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F9FAF5" }}>

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-20 text-center">
          <span className="text-[#436831] font-bold tracking-widest text-xs uppercase mb-4 block">🌱 The Growth Stage</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#1A1C19] tracking-tight mb-6 leading-tight">
            Investasi Tepat untuk<br />
            <span className="text-[#436831] italic">Pertumbuhan Pesat.</span>
          </h1>
          <p className="text-[#43493E] max-w-2xl mx-auto text-lg leading-relaxed">
            Dari benih pertama hingga hutan yang rimbun — setiap tahap pertumbuhan bisnismu punya paket yang tepat. Tidak ada jebakan, tidak ada biaya tersembunyi.
          </p>

          {/* Growth journey bar */}
          <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">
            {["🌱 Seed · Gratis", "→", "🌿 Sprout · Rp 200/txn", "→", "🌸 Bloom · Rp 899k/bln", "→", "🌲 Forest · Custom"].map((s, i) => (
              <span key={i} className={`text-sm font-bold ${i % 2 === 0 ? "text-[#2C4F1B] bg-[#BBEDA6]/50 px-4 py-2 rounded-full" : "text-[#C3C9BA]"}`}>{s}</span>
            ))}
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            {[
              {
                id: "seed", emoji: "🌱", name: "Seed", tagline: "Benih pertama tumbuh dari tanah yang baik.",
                desc: "Gratis selamanya. Untuk merchant yang baru menanam mimpi pertamanya.",
                price: "Gratis", sub: "Selamanya · Tanpa kartu kredit",
                features: ["5 Produk", "1 Kasir", "QR Menu Digital", "Cetak Struk"],
                cta: "Mulai Menyemai", ctaHref: `${process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}/register`,
                featured: false, color: "#73796D",
              },
              {
                id: "sprout", emoji: "🌿", name: "Sprout", tagline: "Bayar saat tumbuh, bukan saat menunggu.",
                desc: "Rp 200 per transaksi. Zero biaya bulanan. Cocok untuk pop-up dan bisnis musiman.",
                price: "Rp 200", sub: "/ transaksi · Rp 0 bulanan",
                badge: "🌿 Paling Fleksibel",
                features: ["Produk Unlimited", "Kasir & KDS Unlimited", "Inventori Cerdas AI", "Laporan SAK EP", "API Access", "Support 24/7"],
                cta: "Mulai Tumbuh", ctaHref: `${process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}/register`,
                featured: true, color: "#436831",
              },
              {
                id: "bloom", emoji: "🌸", name: "Bloom", tagline: "Saat akar kuat, bunga mekar penuh.",
                desc: "Langganan bulanan untuk operasional matang, stabil, dan multi-cabang.",
                price: "Rp 899k", sub: "/ bulan · All-inclusive",
                features: ["Semua di Sprout", "Custom Branding", "Multi-cabang Sync", "Dedicated Support", "White-label Option", "SLA 99.9%"],
                cta: "Mekar Sekarang", ctaHref: `${process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}/register`,
                featured: false, color: "#2C4F1B",
              },
              {
                id: "forest", emoji: "🌲", name: "Forest", tagline: "Ekosistem besar dimulai dari satu pohon.",
                desc: "Solusi enterprise untuk jaringan multi-cabang, white-label penuh, dan SLA kelas dunia.",
                price: "Custom", sub: "Kontak tim kami",
                features: ["Semua di Bloom", "Unlimited Cabang", "Custom Integrasi ERP", "Dedicated Server", "Enterprise SLA", "Account Manager"],
                cta: "Hubungi Kami", ctaHref: "mailto:enterprise@lioo.io",
                featured: false, color: "#1A1C19",
              },
            ].map((plan) => (
              <div key={plan.id} id={`plan-${plan.id}`}
                className={`relative rounded-[2rem] p-7 transition-all duration-300 bg-white ${plan.featured ? "border-2 shadow-2xl scale-105 z-10" : "border border-[#E2E3DE]/60 shadow-sm hover:-translate-y-1 hover:shadow-lg"}`}
                style={plan.featured ? { borderColor: "#436831" } : {}}>
                {(plan as any).badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md text-[#2C4F1B] bg-[#BBEDA6]">
                    {(plan as any).badge}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">{plan.emoji}</span>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1C19] leading-none">{plan.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70" style={{ color: plan.color }}>Growth Tier</span>
                  </div>
                </div>
                <p className="text-xs italic font-semibold text-[#436831] mb-2 leading-snug">&ldquo;{plan.tagline}&rdquo;</p>
                <p className="text-[11px] text-[#73796D] mb-5 leading-relaxed">{plan.desc}</p>
                <div className="mb-6">
                  <div className="text-3xl font-black text-[#1A1C19]">{plan.price}</div>
                  <div className="text-xs text-[#73796D] mt-1">{plan.sub}</div>
                </div>
                <ul className="flex flex-col gap-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#436831] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-[#43493E] font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref}
                  className={`w-full block text-center py-3 rounded-full font-bold text-sm transition-all active:scale-95 ${plan.featured ? "text-white shadow-md hover:opacity-90" : "border-2 border-[#C3C9BA] text-[#1A1C19] hover:border-[#436831] hover:text-[#436831]"}`}
                  style={plan.featured ? { background: "linear-gradient(145deg,#436831,#2C4F1B)" } : {}}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="max-w-5xl mx-auto px-6 lg:px-10 mb-24">
          <h2 className="text-3xl font-extrabold text-[#1A1C19] text-center mb-12 tracking-tight">
            Bandingkan Detail Fitur
          </h2>
          <div className="overflow-x-auto rounded-[2rem] shadow-sm border border-[#E2E3DE]/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F4EF]">
                  <th className="p-5 font-semibold text-[#1A1C19] border-b border-[#E2E3DE]/60 w-1/3">Fitur & Layanan</th>
                  {[
                    { label: "🌱 Seed", sub: "Gratis" },
                    { label: "🌿 Sprout", sub: "Rp 200/txn", highlight: true },
                    { label: "🌸 Bloom", sub: "Rp 899k/bln" },
                    { label: "🌲 Forest", sub: "Custom" },
                  ].map((h) => (
                    <th key={h.label} className={`p-5 text-center border-b border-[#E2E3DE]/60 ${h.highlight ? "bg-[#BBEDA6]/20" : ""}`}>
                      <div className="font-extrabold text-[#1A1C19] text-sm">{h.label}</div>
                      <div className="text-[10px] text-[#73796D] font-medium">{h.sub}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {compareRows.map((row, i) => (
                  <tr key={row.feature} className="group hover:bg-[#F9FAF5] transition-colors border-b border-[#E2E3DE]/30 last:border-b-0">
                    <td className="p-5">
                      <div className="font-semibold text-[#1A1C19] text-sm">{row.feature}</div>
                      <div className="text-xs text-[#73796D] mt-0.5">{row.sub}</div>
                    </td>
                    <td className="p-5 text-center"><CellValue val={row.seed} /></td>
                    <td className={`p-5 text-center ${row.sproutHighlight ? "bg-[#BBEDA6]/10 font-semibold" : ""}`}><CellValue val={row.sprout} /></td>
                    <td className="p-5 text-center"><CellValue val={row.bloom} /></td>
                    <td className="p-5 text-center"><CellValue val={row.forest} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── ROI CALCULATOR ── */}
        <section className="max-w-3xl mx-auto px-6 lg:px-10 mb-24">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-[#E2E3DE]/60">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold text-[#1A1C19] mb-2">🌿 Sprout vs 🌸 Bloom — Hitung Titik Impas</h3>
              <p className="text-sm text-[#73796D]">Geser untuk melihat kapan Bloom lebih hemat dari Sprout</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-[#1A1C19] text-sm">Transaksi per Bulan</label>
              <span className="text-2xl font-extrabold text-[#436831]">{transactions.toLocaleString("id-ID")}</span>
            </div>
            <input type="range" min={100} max={10000} step={100} value={transactions}
              onChange={(e) => setTransactions(Number(e.target.value))}
              className="w-full mb-2" id="roi-slider-pricing" />
            <div className="flex justify-between text-xs text-[#73796D] mb-8">
              <span>100 txn</span>
              <span className="text-[#436831] font-bold">Break-even: {breakeven.toLocaleString("id-ID")} txn/bln</span>
              <span>10.000 txn</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F3F4EF] rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#73796D] font-bold mb-2">🌿 Biaya Sprout</p>
                <div className="text-2xl font-extrabold text-[#1A1C19]">Rp {sproutCost.toLocaleString("id-ID")}</div>
                <div className="text-xs text-[#73796D] mt-1">{transactions} × Rp 200</div>
              </div>
              <div className={`rounded-2xl p-5 ${savings > 0 ? "bg-[#BBEDA6]/30" : "bg-[#F3F4EF]"}`}>
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${savings > 0 ? "text-[#436831]" : "text-[#73796D]"}`}>
                  {savings > 0 ? "🌸 Bloom Lebih Hemat" : "🌿 Sprout Lebih Hemat"}
                </p>
                <div className={`text-2xl font-extrabold ${savings > 0 ? "text-[#2C4F1B]" : "text-[#1A1C19]"}`}>
                  Rp {Math.abs(savings > 0 ? savings : bloomCost - sproutCost).toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-[#73796D] mt-1">Bloom = Rp 899.000/bln</div>
              </div>
            </div>
            {transactions >= breakeven && (
              <div className="mt-4 p-4 bg-[#BBEDA6]/30 rounded-2xl flex items-center gap-3">
                <span className="text-xl">💡</span>
                <p className="text-sm text-[#2C4F1B] font-semibold">
                  Di {transactions.toLocaleString("id-ID")} transaksi/bulan, upgrade ke <strong>🌸 Bloom</strong> hemat Rp {savings.toLocaleString("id-ID")} per bulan!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── BENTO FAQ ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col justify-center">
              <span className="text-[#436831] font-bold text-xs uppercase tracking-widest mb-4 block">FAQ</span>
              <h2 className="text-4xl font-extrabold text-[#1A1C19] tracking-tight mb-4">
                Pertanyaan Populer
              </h2>
              <p className="text-[#43493E] leading-relaxed">
                Punya pertanyaan lain? Tim support kami siap 24/7 melalui chat atau email.
              </p>
              <Link href="mailto:halo@lioo.io" className="mt-6 inline-flex items-center gap-2 font-bold text-[#436831] hover:gap-3 transition-all duration-200">
                <span className="material-symbols-outlined text-lg">chat</span>
                Hubungi Support
              </Link>
            </div>
            <div className="lg:col-span-8">
              {faqs.map((cat) => (
                <div key={cat.category} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#436831] text-base">{cat.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#436831]">{cat.category}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.questions.map((faq) => {
                      const key = `${cat.category}-${faq.q}`;
                      return (
                        <div key={key} className="bg-white rounded-2xl p-6 border border-[#E2E3DE]/60 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setOpenFaq(openFaq === key ? null : key)}>
                          <h4 className="font-bold text-[#1A1C19] text-sm mb-2 leading-snug">{faq.q}</h4>
                          {openFaq === key && (
                            <p className="text-[#43493E] text-xs leading-relaxed border-t border-[#E2E3DE]/60 pt-3 mt-3">{faq.a}</p>
                          )}
                          <div className={`mt-3 text-[#436831] text-xs font-bold flex items-center gap-1 ${openFaq === key ? "opacity-60" : ""}`}>
                            {openFaq === key ? "Sembunyikan" : "Baca jawaban"}
                            <span className="material-symbols-outlined text-sm">{openFaq === key ? "expand_less" : "expand_more"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-20 text-center" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10">
              <p className="text-[#C3EFAA] text-sm font-bold uppercase tracking-widest mb-4">Siap memulai?</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Tumbuh dari Benih,<br />Jadilah Hutan.
              </h2>
              <p className="text-[#BBEDA6]/80 mb-10 max-w-lg mx-auto">
                Mulai Menyemai dengan Seed 🌱, bayar saat tumbuh dengan Sprout 🌿, dan berkembang penuh dengan Bloom 🌸 atau Forest 🌲.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href={`${process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}/register`} className="bg-white text-[#2C4F1B] px-10 py-4 rounded-full font-extrabold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  🌱 Mulai Menyemai
                </Link>
                <Link href={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"} className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
                  Masuk ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
