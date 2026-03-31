import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blogs = [
    {
      slug: "menjemput-momentum-2026-tahun-emas-umkm-fb",
      title: "Menjemput Momentum: Mengapa 2026 Adalah Tahun Emas bagi UMKM F&B Indonesia?",
      category: "Tren Bisnis",
      readTime: 4,
      excerpt: "Indonesia tidak hanya sedang minum kopi; Indonesia sedang meredefinisi cara bersosialisasi. Dengan proyeksi pertumbuhan ekonomi digital yang stabil...",
      content: `Indonesia tidak hanya sedang minum kopi; Indonesia sedang meredefinisi cara bersosialisasi. Dengan proyeksi pertumbuhan ekonomi digital yang stabil, sektor F&B (Food & Beverage) kini bertransformasi dari sekadar pemuas lapar menjadi pusat gaya hidup.

Namun, di tengah hiruk-pikuk munculnya brand-brand baru, ada satu pola yang terlihat: Hanya mereka yang terukur yang akan bertahan. Konsumen tahun 2026 lebih cerdas; mereka menghargai konsistensi rasa dan kecepatan layanan. Bagi pemilik cafe atau retail, ini berarti Anda tidak bisa lagi mengandalkan "feeling" dalam mengelola stok atau melayani pelanggan.

Poin Utama:
- Digital-First Generation: Gen Z dan Milenial mendominasi pasar, menuntut pembayaran cashless yang praktis.
- Efisiensi adalah Kunci: Margin keuntungan yang tipis menuntut operasional yang ramping.
- Lioo Insight: Dengan sistem yang terintegrasi, Anda bisa fokus pada inovasi menu, sementara Lioo menjaga operasional di balik layar tetap stabil.`
    },
    {
      slug: "sistem-pos-jantung-pertumbuhan-bisnis",
      title: "Bukan Sekadar Mencatat: Mengapa Sistem POS adalah Jantung dari Pertumbuhan Bisnis.",
      category: "Edukasi Teknologi",
      readTime: 5,
      excerpt: "Banyak yang menganggap POS (Point of Sale) hanyalah mesin kasir modern. Di Atelier Lioo, kami melihatnya lebih dalam: POS adalah sistem saraf bisnis Anda...",
      content: `Banyak yang menganggap POS (Point of Sale) hanyalah mesin kasir modern. Di Atelier Lioo, kami melihatnya lebih dalam: POS adalah "sistem saraf" bisnis Anda. Setiap kali pelanggan memesan, terjadi aliran data yang sangat berharga.

Tanpa sistem yang mumpuni, data ini menguap begitu saja. Namun dengan Lioo, setiap transaksi diubah menjadi informasi strategis. Anda akan tahu kapan jam tersibuk Anda, siapa pelanggan setia Anda, dan produk mana yang paling memberikan profit.

Keunggulan Menggunakan Lioo POS:
- Sinkronisasi Dapur & Kasir: Tidak ada lagi teriakan pesanan yang salah.
- Data Real-Time: Pantau performa toko dari mana saja melalui smartphone Anda.
- Loyalty Program: Bangun hubungan lebih dalam dengan pelanggan Anda tanpa kartu fisik yang merepotkan.`
    },
    {
      slug: "memahami-sak-ep-transformasi-laporan-keuangan",
      title: "Memahami SAK EP: Transformasi Laporan Keuangan UMKM Menuju Standar Profesional.",
      category: "Akuntansi & Legalitas",
      readTime: 6,
      excerpt: "Bagi sebagian pemilik bisnis, kata \"Akuntansi\" terdengar mengintimidasi. Namun, dengan berlakunya standar SAK EP, laporan keuangan yang rapi bukan lagi pilihan...",
      content: `Bagi sebagian pemilik bisnis, kata "Akuntansi" terdengar mengintimidasi. Namun, dengan berlakunya standar SAK EP (Standar Akuntansi Keuangan Entitas Privat), laporan keuangan yang rapi bukan lagi pilihan, melainkan keharusan untuk tumbuh besar.

Laporan keuangan yang sesuai standar adalah "tiket" Anda untuk mendapatkan kepercayaan investor atau akses pendanaan perbankan. Di Lioo, kami telah memahat sistem laporan keuangan yang otomatis mengikuti kaidah akuntansi ini.

Apa yang Lioo Sederhanakan untuk Anda?
- Laba Rugi Otomatis: Lihat keuntungan bersih setelah dipotong HPP dan biaya operasional secara instan.
- Kesiapan Pajak: Data yang rapi memudahkan Anda melaporkan SPT Tahunan tanpa drama di akhir tahun.
- Transparansi Arus Kas: Ketahui ke mana setiap rupiah bisnis Anda mengalir.`
    },
    {
      slug: "seni-memprediksi-masa-depan-inventori-ai",
      title: "Seni Memprediksi Masa Depan: Bagaimana Inventori AI Mengurangi Pemborosan Bahan Baku.",
      category: "Inovasi AI",
      readTime: 5,
      excerpt: "Dalam bisnis F&B, setiap helai sayuran atau gram biji kopi yang terbuang (food waste) adalah kerugian yang seharusnya bisa dicegah. Fitur Inventori AI dari Lioo membantu otomatisasi...",
      content: `Di dalam sebuah "Atelier", setiap bahan baku dihargai. Dalam bisnis F&B, setiap helai sayuran atau gram biji kopi yang terbuang (food waste) adalah kerugian yang seharusnya bisa dicegah.

Fitur Inventori AI dari Lioo bekerja seperti asisten pintar yang tidak pernah tidur. Dengan mempelajari pola penjualan mingguan, cuaca, hingga tren musiman, AI kami memberikan rekomendasi belanja stok yang presisi.

Manfaat Inventori AI:
- Smart Alerts: Notifikasi otomatis saat stok mencapai batas minimum.
- Prediksi Akurat: "Minggu depan Anda butuh 20kg Susu, bukan 10kg."
- Efisiensi Modal: Uang Anda tidak "mati" di gudang karena stok yang menumpuk tak terjual.`
    },
    {
      slug: "menciptakan-pengalaman-pelanggan-organic",
      title: "Menciptakan Pengalaman Pelanggan yang Organic: Tips Meningkatkan Kecepatan Pelayanan.",
      category: "Tips Operasional",
      readTime: 4,
      excerpt: "Kecepatan bukan berarti terburu-buru. Dalam konsep Organic Growth, kecepatan adalah tentang alur yang lancar (seamless flow).",
      content: `Kecepatan bukan berarti terburu-buru. Dalam konsep Organic Growth, kecepatan adalah tentang alur yang lancar (seamless flow). Pelanggan menghargai waktu mereka, dan mereka akan kembali ke tempat yang menghormati waktu tersebut.

Lioo merancang fitur Kitchen Display System (KDS) dan E-Menu untuk memastikan alur kerja dari meja pelanggan ke dapur tidak terhambat oleh hambatan fisik (seperti kertas pesanan yang hilang atau pelayan yang lupa mencatat).

3 Langkah Meningkatkan Kecepatan:
- Self-Ordering: Biarkan pelanggan memesan dari meja melalui QR Code Lioo.
- Digital Ticket: Pesanan langsung muncul di layar dapur dalam milidetik.
- Quick Pay: Integrasi QRIS yang sekali scan langsung terverifikasi.`
    }
  ];

  console.log("Seeding blog posts...");
  // Clear first if needed (optional) / Upsert by title or slug
  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: b,
      create: b
    });
    console.log("Upserted:", b.slug);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
