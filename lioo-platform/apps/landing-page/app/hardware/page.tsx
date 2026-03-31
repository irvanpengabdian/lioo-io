"use client";

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

const printers = {
  bluetooth: [
    { name: "Epson TM-P20II", desc: "58mm, portabel, baterai 12 jam" },
    { name: "Star Micronics SM-S230i", desc: "iOS & Android compatible" },
    { name: "Munbyn ITPP047", desc: "Budget-friendly, 58mm thermal" },
    { name: "Woosim WSP-R240", desc: "Waterproof, outdoor-ready" },
  ],
  lan: [
    { name: "Epson TM-T88VII", desc: "80mm, kecepatan tertinggi 500mm/s" },
    { name: "Star mC-Print3", desc: "3-inch, Cloud-ready" },
    { name: "Sunmi Cloud Printer", desc: "Built-in Android, standalone" },
    { name: "Bixolon SRP-350V", desc: "Auto-cutter, industri standar" },
  ],
};

const tablets = [
  { os: "iPadOS", icon: "ios", models: "iPad Air 4+, iPad Pro (all models), iPad mini 6", minVer: "iOS 15+" },
  { os: "Android", icon: "android", models: "Samsung Tab S7+, Google Pixel Tablet, Lenovo P11 Pro, Xiaomi Pad 6", minVer: "Android 10+" },
  { os: "Web Browser", icon: "language", models: "Chrome, Safari, Edge (PWA) — bisa di laptop/PC kasir", minVer: "Chromium 90+" },
];

const setupSteps = [
  {
    step: "01",
    emoji: "🔌",
    icon: "power_settings_new",
    title: "Nyalakan Hardware",
    desc: "Colok printer dan nyalakan tablet. Tunggu hingga lampu indikator stabil (biasanya 15–30 detik).",
    time: "~30 detik",
  },
  {
    step: "02",
    emoji: "📱",
    icon: "settings_bluetooth",
    title: "Hubungkan via Bluetooth / LAN",
    desc: "Buka Saji App → Pengaturan → Hardware. Pilih perangkat dari daftar yang terdeteksi otomatis.",
    time: "~2 menit",
  },
  {
    step: "03",
    emoji: "🖨️",
    icon: "print",
    title: "Test Print & Mulai",
    desc: "Cetak struk test dari dashboard. Jika berhasil, sistem siap digunakan. Mulai terima pesanan!",
    time: "~1 menit",
  },
];

export default function HardwarePage() {
  return (
    <>
      <Navbar active="/hardware" />

      <main className="pt-28 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F9FAF5" }}>

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <span className="text-[#436831] font-bold text-xs uppercase tracking-widest mb-5 block">🔧 Hardware Support</span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#1A1C19] tracking-tight leading-[1.05] mb-6">
                Hardware untuk<br />
                <span className="text-[#436831] italic">Living Atelier-mu.</span>
              </h1>
              <p className="text-[#43493E] text-lg leading-relaxed mb-8">
                Plug-and-play sejak hari pertama. lioo.io mendukung berbagai printer thermal dan tablet profesional — tanpa konfigurasi rumit, tanpa driver khusus.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "print", text: "Printer Thermal" },
                  { icon: "tablet_android", text: "Tablet POS" },
                  { icon: "wifi_off", text: "Offline Mode" },
                  { icon: "bluetooth", text: "Bluetooth & LAN" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-[#E2E3DE]/60">
                    <span className="material-symbols-outlined text-[#436831] text-sm">{b.icon}</span>
                    <span className="text-xs font-bold text-[#1A1C19]">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual — POS Setup mock */}
            <div className="relative">
              <div className="relative bg-[#1A1C19] rounded-[2rem] p-5 shadow-2xl lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-[#F9FAF5] rounded-[1.5rem] overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>S</div>
                      <span className="font-bold text-sm text-[#1A1C19]">Kasir · Tablet POS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-[#436831] rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-[#436831]">Connected</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { icon: "print", label: "Epson TM-T88VII", sub: "LAN · Terhubung", ok: true },
                      { icon: "tablet_android", label: "Samsung Tab S8", sub: "Kasir Utama", ok: true },
                      { icon: "monitor", label: "Kitchen Display", sub: "HDMI · Aktif", ok: true },
                      { icon: "qr_code_scanner", label: "QR Scanner", sub: "Built-in · Aktif", ok: true },
                    ].map((d) => (
                      <div key={d.label} className="bg-white rounded-xl p-3 border border-[#E2E3DE]/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="material-symbols-outlined text-[#436831] text-base">{d.icon}</span>
                          <span className={`w-2 h-2 rounded-full ${d.ok ? "bg-[#436831]" : "bg-red-500"}`} />
                        </div>
                        <div className="font-bold text-[10px] text-[#1A1C19] leading-tight">{d.label}</div>
                        <div className="text-[9px] text-[#73796D]">{d.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#BBEDA6]/40 rounded-xl p-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2C4F1B] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <div className="font-bold text-xs text-[#2C4F1B]">Semua perangkat siap</div>
                      <div className="text-[10px] text-[#436831]">Setup selesai dalam 4 menit 23 detik</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-STEP SETUP GUIDE ── */}
        <section className="py-24 mb-24" style={{ backgroundColor: "#F3F4EF" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-[#436831] font-bold text-xs uppercase tracking-widest mb-4 block">🌱 Cara Setup</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1C19] tracking-tight mb-3">Setup 3 Langkah, Siap dalam &lt;10 Menit.</h2>
              <p className="text-[#43493E]">Dirancang untuk mudah dioperasikan staf tanpa keahlian teknis.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {setupSteps.map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center group">
                  {/* Connector line */}
                  {i < setupSteps.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 w-8 h-0.5 bg-[#C3C9BA]" />
                  )}
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300 border-2 border-[#BBEDA6]">
                    <span className="material-symbols-outlined text-[#436831] text-4xl">{s.icon}</span>
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-[#C3C9BA] mb-2">LANGKAH {s.step}</div>
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <h3 className="text-lg font-extrabold text-[#1A1C19] mb-2">{s.title}</h3>
                  <p className="text-[#43493E] text-sm leading-relaxed px-4 mb-3">{s.desc}</p>
                  <span className="text-xs font-bold text-[#436831] bg-[#BBEDA6]/50 px-3 py-1 rounded-full">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SUPPORTED DEVICES BENTO ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
          <h2 className="text-3xl font-extrabold text-[#1A1C19] tracking-tight mb-12">Perangkat yang Didukung</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Thermal Printers — large card */}
            <div className="lg:col-span-7 bg-white rounded-[2rem] p-10 border border-[#E2E3DE]/60 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#BBEDA6]/60 rounded-2xl">
                  <span className="material-symbols-outlined text-[#436831]">print</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A1C19]">Printer Thermal</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#436831] mb-4">Bluetooth</h4>
                  <ul className="space-y-3">
                    {printers.bluetooth.map((p) => (
                      <li key={p.name} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BBEDA6] mt-2 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#1A1C19]">{p.name}</div>
                          <div className="text-xs text-[#73796D]">{p.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#436831] mb-4">LAN / Ethernet</h4>
                  <ul className="space-y-3">
                    {printers.lan.map((p) => (
                      <li key={p.name} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BBEDA6] mt-2 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-[#1A1C19]">{p.name}</div>
                          <div className="text-xs text-[#73796D]">{p.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-4 bg-[#F3F4EF] rounded-xl text-[11px] text-[#73796D] italic">
                * Semua printer di atas kompatibel dengan standar ESC/POS dan mendukung koneksi auto-reconnect.
              </div>
            </div>

            {/* Tablets — right column */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-[2rem] p-8 border border-[#E2E3DE]/60 shadow-sm flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#BBEDA6]/60 rounded-2xl">
                    <span className="material-symbols-outlined text-[#436831]">tablet_mac</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1A1C19]">Tablet & Browser POS</h3>
                </div>
                <div className="space-y-5">
                  {tablets.map((t) => (
                    <div key={t.os} className="flex items-start gap-4 pb-5 border-b border-[#E2E3DE]/40 last:border-b-0 last:pb-0">
                      <div className="w-12 h-12 rounded-xl bg-[#F3F4EF] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#436831]">{t.icon}</span>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#1A1C19]">{t.os}</p>
                        <p className="text-xs text-[#43493E] mt-0.5 leading-relaxed">{t.models}</p>
                        <p className="text-[10px] text-[#73796D] mt-1 font-bold">Min: {t.minVer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatibility badge */}
              <div className="bg-[#2C4F1B] rounded-[2rem] p-6 text-center">
                <div className="text-3xl mb-3">🌿</div>
                <p className="text-white font-extrabold text-lg mb-1">Hardware Tidak Cocok?</p>
                <p className="text-[#BBEDA6]/80 text-xs leading-relaxed mb-4">Tim hardware specialist kami siap membantu memilih bundle yang sesuai layout dan budget restoran Anda.</p>
                <Link href="mailto:hardware@lioo.io" className="inline-block bg-[#BBEDA6] text-[#2C4F1B] font-bold text-sm px-6 py-3 rounded-full hover:bg-white transition-all">
                  Konsultasi Hardware Gratis
                </Link>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div className="lg:col-span-12 rounded-[2rem] p-12 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(145deg,#436831,#2C4F1B)" }}>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-4">Butuh Panduan Memilih Hardware?</h3>
                <p className="text-[#BBEDA6]/90 mb-8 max-w-xl mx-auto">
                  Tim hardware specialist kami siap membantu merekomendasikan bundle printer + tablet yang sesuai dengan skala dan layout merchant Anda.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Link href="mailto:hardware@lioo.io" className="bg-white text-[#2C4F1B] px-8 py-3 rounded-full font-extrabold hover:shadow-lg hover:scale-105 transition-all">
                    Hubungi Specialist
                  </Link>
                  <Link href="/pricing" className="border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">
                    Lihat Paket Harga
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── OFFLINE RELIABILITY ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#436831] font-bold text-xs uppercase tracking-widest mb-5 block">☁️ Reliabilitas</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1C19] tracking-tight mb-5 leading-tight">
                Beroperasi Meski<br />Internet Terputus.
              </h2>
              <p className="text-[#43493E] leading-relaxed text-lg mb-8">
                Service Worker + Cache Manifest memastikan kasir tablet tetap berjalan meski sinyal terputus beberapa jam. Semua transaksi tersinkron otomatis saat koneksi kembali.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: "wifi_off", title: "Offline Mode Penuh", desc: "POS, KDS, dan QR Menu tetap berfungsi tanpa internet." },
                  { icon: "sync", title: "Auto-Sync Background", desc: "Data tersinkron ke cloud secara otomatis begitu online." },
                  { icon: "lock", title: "Data Tidak Hilang", desc: "Enkripsi lokal mencegah kehilangan data saat gangguan." },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-[#E2E3DE]/60">
                    <div className="w-10 h-10 rounded-xl bg-[#BBEDA6]/60 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#436831] text-base">{f.icon}</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1A1C19] mb-0.5">{f.title}</div>
                      <div className="text-xs text-[#73796D]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1A1C19] rounded-[2rem] p-8">
              <div className="text-center mb-6">
                <div className="text-xs font-black uppercase tracking-widest text-[#BBEDA6]/60 mb-4">Status Koneksi Real-time</div>
                <div className="flex items-center justify-center gap-4 text-4xl">
                  <span>📡</span>
                  <span className="text-[#BBEDA6]">→</span>
                  <span>💾</span>
                  <span className="text-[#BBEDA6]">→</span>
                  <span>☁️</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Transaksi Offline Tersimpan", val: "247", unit: "pesanan", ok: true },
                  { label: "Sinkronisasi Terakhir", val: "2 mnt lalu", unit: "", ok: true },
                  { label: "Data Terenkripsi", val: "AES-256", unit: "", ok: true },
                  { label: "Uptime Bulan Ini", val: "99.97%", unit: "", ok: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3">
                    <span className="text-[#BBEDA6]/70 text-xs">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{s.val} {s.unit}</span>
                      <span className="material-symbols-outlined text-[#A8D390] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
