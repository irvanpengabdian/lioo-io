# Lioo.io - Roadmap & Task List

## ✅ Tuntas (Selesai)
1. **Arsitektur Monorepo & Setup Awal:** Konfigurasi Turborepo, integrasi TailwindCSS global 'Living Atelier'.
2. **Review Keselarasan PRD vs UI/UX:** Memastikan desain fungsional sesuai dengan Single-Schema RLS.
3. **E2E Autentikasi:** Integrasi Landing Page ➡ SSO Portal (Kinde Auth) ➡ *Redirect* ke aplikasi Merchant Portal.
4. **Pembuatan Aplikasi Merchant (`apps/merchant`):** Routing dan konfigurasi agar berjalan di atas port `3002`.
5. **UI Slicing Landing Page & Onboarding (Step 1):** Komponen "Atur Profil Toko" selesai dibuat.

---

## 🚀 Fokus Hari Ini (Bisa Diselesaikan dalam Waktu ±8 Jam Ke Depan)
Hari ini kita akan mengonsentrasikan tenaga pada **penyelesaian interface (UI Slicing) dari Merchant Portal** beserta pengkabelan (wiring) awal datanya ke backend.

- [x] **Slicing UI Onboarding (Selesai):** Mengerjakan "Langkah 2: Kategori" & "Langkah 3: Menu Pertama" agar *setup wizard* utuh.
- [x] **Slicing UI Dashboard Merchant (Menu Catalog):** Menerjemahkan desain Grid Menu/Produk menjadi komponen React (Tailwind).
- [x] **Slicing UI Dashboard Merchant (Flex Wallet):** Menerjemahkan tampilan Tracker Saldo Flex Wallet.
- [x] **Penyatuan Design System (Global UI):** Memindahkan komponen-komponen statis (*Button, Input, Card*) dari `apps/merchant` ke `packages/ui` agar bisa didaur ulang.
- [x] **Koneksi Database & Storage (Selesai):** Menambahkan skema tabel `categories` dan `products` di Supabase, mengonfigurasi Cloudflare R2 (Pre-Signed URL), dan menjalankan Server Actions untuk unggahan.

---

## 📅 Roadmap Jangka Menengah (Bukan Fokus Hari Ini)
Fase ini membutuhkan penyelesaian integrasi ke pihak ke-3 atau *overhead* infrastruktur yang agak kompleks:
- [ ] **Integrasi Xendit & Gateway:** Menyelesaikan webhook pembayaran untuk pengisian otomatis *Flex Wallet* (Sprout Wallet).
- [ ] **Realtime Kitchen Display System (KDS):** Memasang WebSockets/SSE dengan *Redis/Zept* untuk *push* pesanan instan.
- [ ] **PWA Offline Support & Storage:** Setup *Service Worker* di Cashier PWA untuk *offline-transaction* hingga koneksi internet membaik.
- [ ] **Otomatisasi Laporan Keuangan (SAK EP):** Sistem *Auto-Journaling* transaksi yang menyatu ke laporan laba/rugi, arus kas, dan neraca.
