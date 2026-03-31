# Lioo.io - Roadmap & Task List

## ✅ Tuntas (Selesai Sepenuhnya)
1. **Arsitektur Monorepo & Setup Awal:** Konfigurasi Turborepo, integrasi TailwindCSS global 'Living Atelier'.
2. **E2E Autentikasi (Vercel + Kinde):** Integrasi Landing Page dengan tombol yang langsung menuju Kinde Auth Merchant untuk mencegah error cookie lintas-subdomain.
3. **Pembuatan & Penyatuan Aplikasi:** Aplikasi Landing Page `lioo.io`, SSO Portal (opsional), dan Merchant Portal `merchant.lioo.io` berhasil dibuat dan saling terhubung.
4. **Slicing & Integrasi Onboarding:** Langkah Kategori & Menu dengan pengunggahan gambar ke Cloudflare R2 berjalan mulus.
5. **Dashboard Analytics (Merchant):** Dashboard Live menampilkan data real produk, omzet historikal, transaksi, dan saldo wallet dari Database Supabase (Prisma).
6. **Billing & Top-Up Sprout Wallet:** Merchant dapat melakukan top-up melalui Invoice Xendit, dan saldo akan bertambah otomatis berkat integrasi Webhook Xendit.
7. **Production Deployment ke Vercel:** Platform resmi *live* dengan domain utama `lioo.io` dan kodingan *dynamic environment variables* (`NEXT_PUBLIC_...`) yang menyesuaikan mode Lokal vs Live secara otomatis.

---

## 🚀 Fokus Selanjutnya (Roadmap Terdekat)
Sekarang pilar utama (Landing Page, Otentikasi, Dashboard, Wallet) sudah kokoh berdiri di atas awan (Vercel). Langkah selanjutnya adalah masuk ke ranah **Operasional Bisnis (Transaksi & Kasir)**:

- [ ] **Slicing & Logic Aplikasi POS (Kasir):** Membangun aplikasi POS/Cashier yang cepat, efisien, dengan keranjang belanja, kalkulasi PPN/Diskon, dan pemilihan Tipe Order (Dine In / Takeaway).
- [ ] **Sistem Modifiers Lengkap (F&B Standar):** Mengizinkan merchant menambahkan opsi ekstra (Level Gula, Es, Topping) di setiap produk dengan pengaturan harga yang akurat.
- [ ] **Manajemen Meja & QR Order:** Sistem pembuatan QR Code untuk setiap meja, mendukung pemesanan mandiri oleh pelanggan (Dine-in Order Page).
- [ ] **Pembayaran Statis (QRIS Dinamis):** Mengaitkan POS Kasir dengan pembuatan Invoice Xendit Realtime (QRIS) saat pelanggan ingin membayar.
- [ ] **Realtime Kitchen Display System (KDS):** Memasang sistem sinkronisasi order dapur agar pesanan kasir bisa langsung muncul di tablet Dapur.

---

## 📅 Roadmap Jangka Menengah & Ekosistem Lengkap
- [ ] **PWA Offline Support & Storage:** Setup *Service Worker* di Cashier PWA untuk *offline-transaction* jika koneksi internet di lapangan tiba-tiba mati.
- [ ] **Manajemen Stok Otomatis:** Sistem COGS dan resep inventori (Setiap menu A terjual, maka gramasi biji kopi berkurang otomatis).
- [ ] **Otomatisasi Laporan Keuangan (SAK EP):** Sistem *Auto-Journaling* transaksi yang menyatu ke laporan laba/rugi, arus kas, dan neraca.
- [ ] **Role & Karyawan System:** Batasan akses antara Owner, Manajer, Kasir, dan Chef Dapur di satu platform.
