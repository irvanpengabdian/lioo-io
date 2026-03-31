import Link from "next/link";

export default function Footer() {
  const links = {
    Produk: [
      { label: "Kasir Digital", href: "/features" },
      { label: "Kitchen Display", href: "/features" },
      { label: "E-Menu Pelanggan", href: "/features" },
      { label: "Laporan Keuangan", href: "/features" },
      { label: "Inventori AI", href: "/features" },
    ],
    Perusahaan: [
      { label: "Tentang Kami", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "Press Kit", href: "/#press" },
    ],
    Support: [
      { label: "Dokumentasi", href: "/about-us" },
      { label: "Status System", href: "/status" },
      { label: "Kontak Support", href: "/" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Syarat Layanan", href: "/terms-of-service" },
    ],
  };

  return (
    <footer id="footer" className="bg-[#F3F4EF] rounded-t-[3rem] mt-auto">
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
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm text-[#43493E] hover:text-[#2C4F1B] transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#C3C9BA]/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#73796D]">
            © {new Date().getFullYear()} lioo.io. Hak cipta dilindungi undang-undang.
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
