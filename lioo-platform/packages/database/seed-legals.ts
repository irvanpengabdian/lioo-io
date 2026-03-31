import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.legalDocument.upsert({
    where: { type: 'TERMS_OF_SERVICE' },
    update: {
      content: `Terakhir Diperbarui: 1 April 2026\n\n1. Penerimaan Layanan\nDengan mendaftar dan menggunakan platform lioo.io, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.\n\n2. Penggunaan Akun\nPengguna bertanggung jawab penuh atas kerahasiaan akun dan setiap aktivitas yang terjadi di bawah akun tersebut. Lioo.io berhak menangguhkan akun jika ditemukan aktivitas yang melanggar hukum atau merugikan pihak lain.\n\n3. Pembayaran & Langganan\nLayanan kami berbasis langganan (SaaS). Keterlambatan pembayaran dapat menyebabkan pembatasan akses fitur hingga pelunasan dilakukan.\n\n4. Batasan Tanggung Jawab\nLioo.io menyediakan sistem untuk membantu pencatatan bisnis. Kami tidak bertanggung jawab atas kerugian finansial yang disebabkan oleh kesalahan input pengguna atau keputusan bisnis yang diambil berdasarkan data dalam sistem.`
    },
    create: {
      type: 'TERMS_OF_SERVICE',
      content: `Terakhir Diperbarui: 1 April 2026\n\n1. Penerimaan Layanan\nDengan mendaftar dan menggunakan platform lioo.io, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.\n\n2. Penggunaan Akun\nPengguna bertanggung jawab penuh atas kerahasiaan akun dan setiap aktivitas yang terjadi di bawah akun tersebut. Lioo.io berhak menangguhkan akun jika ditemukan aktivitas yang melanggar hukum atau merugikan pihak lain.\n\n3. Pembayaran & Langganan\nLayanan kami berbasis langganan (SaaS). Keterlambatan pembayaran dapat menyebabkan pembatasan akses fitur hingga pelunasan dilakukan.\n\n4. Batasan Tanggung Jawab\nLioo.io menyediakan sistem untuk membantu pencatatan bisnis. Kami tidak bertanggung jawab atas kerugian finansial yang disebabkan oleh kesalahan input pengguna atau keputusan bisnis yang diambil berdasarkan data dalam sistem.`
    }
  });

  await prisma.legalDocument.upsert({
    where: { type: 'PRIVACY_POLICY' },
    update: {
      content: `1. Data yang Kami Kumpulkan\nKami mengumpulkan informasi identitas (nama, email, nomor telepon) dan data transaksi bisnis yang Anda masukkan ke dalam sistem untuk keperluan operasional fitur lioo.io.\n\n2. Keamanan Data\nData Anda disimpan dalam server terenkripsi. Kami berkomitmen untuk tidak menjual data spesifik merchant kepada pihak ketiga.\n\n3. Penggunaan Data\nData transaksi yang anonim dapat kami gunakan untuk pengembangan algoritma Inventori AI kami guna memberikan prediksi stok yang lebih akurat bagi Anda di masa depan.\n\n4. Hak Pengguna\nAnda memiliki hak untuk meminta ekspor data Anda atau penghapusan akun kapan saja melalui kontak support kami.`
    },
    create: {
      type: 'PRIVACY_POLICY',
      content: `1. Data yang Kami Kumpulkan\nKami mengumpulkan informasi identitas (nama, email, nomor telepon) dan data transaksi bisnis yang Anda masukkan ke dalam sistem untuk keperluan operasional fitur lioo.io.\n\n2. Keamanan Data\nData Anda disimpan dalam server terenkripsi. Kami berkomitmen untuk tidak menjual data spesifik merchant kepada pihak ketiga.\n\n3. Penggunaan Data\nData transaksi yang anonim dapat kami gunakan untuk pengembangan algoritma Inventori AI kami guna memberikan prediksi stok yang lebih akurat bagi Anda di masa depan.\n\n4. Hak Pengguna\nAnda memiliki hak untuk meminta ekspor data Anda atau penghapusan akun kapan saja melalui kontak support kami.`
    }
  });

  console.log("Seeded legal documents");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
