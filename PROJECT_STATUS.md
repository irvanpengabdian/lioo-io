# Lioo.io - Project Status & Task List

## Perubahan Terakhir (Sesi Terkini)
✅ Melakukan review mendalam antara UI/UX Merchant Dashboard dan System Design PRD v2 (Kesimpulan: Sesuai & siap dieksekusi).
✅ Membuat repositori aplikasi baru: `apps/merchant` yang berjalan di port `3002`.
✅ *Slicing* UI untuk halaman "Merchant Setup Wizard - Atur Profil Toko" menggunakan palet *Living Atelier* ke dalam aplikasi merchant.
✅ Mengonfigurasi `apps/sso/.env.local` untuk meneruskan sesi log masuk dari `localhost:3001` menuju `localhost:3002`.
✅ Berhasil memvalidasi alur E2E (*End-to-End*): Landing Page ➡ Login/Daftar Kinde SSO ➡ Onboarding Merchant Dashboard.

## Task List (Rencana Untuk Sesi Selanjutnya)
- [ ] **Lanjutan Setup Wizard:** Melanjutkan dua langkah sisa di onboarding (Pembuatan Kategori dan Menu Pertama) agar wizard selesai dengan mulus.
- [ ] **Slicing UI Modul Utama:** Membangun antarmuka dari fitur:
  - Flex Wallet Balance (Tracker Saldo).
  - Menu Catalog Management (Daftar Produk/Katalog).
  - Team & Permissions Management (RBAC Dashboard).
- [ ] **Data Integration:** Mulai menyusun skema database atau *Server Actions* untuk menghubungkan antarmuka form statis ke Neon/Prisma (Database PostgreSQL).
- [ ] **Penyatuan Komponen UI:** (Opsional) Memindahkan *Ghost-Button*, *Card*, dan konfigurasi global Tailwind ke `packages/ui` agar rapi.
