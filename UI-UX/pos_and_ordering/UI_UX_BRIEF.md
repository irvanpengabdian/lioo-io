# UI/UX Brief — POS Kasir, Portal Pelanggan & KDS (lioo.io)

**Versi:** 1.0  
**Audiens:** Product Designer, UX Researcher, Visual Designer  
**Tujuan:** Menyelaraskan desain dengan roadmap produk (multi-tenant SaaS, offline-first kasir, self-service pelanggan, pembayaran QRIS/tunai, delivery MVP, KDS fase belakang).

---

## 1. Konteks produk

lioo.io adalah **SaaS POS untuk F&B**. Satu platform melayani **banyak merchant**; setiap transaksi, layar kasir, dan portal pelanggan harus jelas berada di konteks **Resto A vs B vs C** (isolasi tenant), tanpa membingungkan pengguna.

**Yang sudah ada:** Landing, SSO merchant, dashboard merchant (onboarding menu, wallet, analytics).  
**Yang didesain sekarang:** Antarmuka **operasional** — cepat, dapat diandalkan di lapangan, dan aman secara multi-tenant.

---

## 2. North star desain (selaras dokumen existing)

Ikuti **The Living Atelier / Biophilic Ledger** seperti di `UI-UX/merchant/merchant_dashboard/DESIGN.md`:

- Palet sage/forest, hierarki permukaan tanpa garis keras (“no-line rule” untuk sectioning).
- Tipografi **Plus Jakarta Sans**; skala editorial untuk dashboard; **POS & portal pelanggan boleh sedikit lebih padat** demi kecepatan baca di lapangan.
- Tombol primary: gradient signature / sage; sudut membulat konsisten; shadow ambient hijau halus.
- Jangan #000; gunakan `on_surface` (#1A1C19) dan varian untuk teks sekunder.

**Pengecualian pragmatis:** Di **POS saat rush hour**, boleh sedikit lebih “utilitarian”: kontras tinggi untuk harga/total, area sentuh besar, label angka monospace opsional untuk alignment — tetap dalam palet yang sama agar tidak terasa produk lain.

---

## 3. Tiga permukaan utama

| Permukaan | Perangkat utama | Prioritas UX |
|-----------|-----------------|-------------|
| **POS Kasir** | Tablet landscape (utama), bisa desktop | Kecepatan input, minim langkah, error recoverable |
| **Portal pelanggan** | Smartphone (utama), bisa tablet | Pemindaian QR, menu jelas, checkout QRIS sederhana |
| **KDS** (fase belakang) | Tablet landscape dapur | Legibility jarak jauh, status item jelas, minim tap salah |

---

## 4. Persona & skenario singkat

| Persona | Kebutuhan |
|---------|-----------|
| **Kasir** | Cart cepat, modifier jelas, bayar tunai/QRIS, panggil pesanan self-service, lihat antrian sync offline |
| **Pelanggan (anonim)** | Buka dari QR meja/outlet, pilih menu, bayar QRIS atau pilih bayar di kasir |
| **Pelanggan (terdaftar)** | Login ringan (HP/OTP), lihat riwayat order per outlet |
| **Owner / admin** | (Dashboard existing) tidak fokus brief ini, kecuali **tema self-service** per tenant |

---

## 5. Multi-tenant & branding outlet

- Setiap sesi portal pelanggan terikat **satu merchant** (dari URL/token QR). **Wajib** menampilkan identitas outlet: **nama, logo (jika ada), warna tema** (`selfServiceTheme` / token tema dari backend).
- Jangan desain seolah “app lioo generik” saja di flow order — header/konteks outlet harus konsisten dari landing menu sampai konfirmasi bayar.
- Kasir/KDS: branding bisa lebih netral **lioo** + badge nama outlet kecil, atau mengikuti merchant jika ada kebijakan white-label nanti.

**Deliverable desainer:** Spesifikasi **header portal** (logo + nama + optional banner), state **loading/salah token** (“Outlet tidak ditemukan”), dan **empty states** yang tidak memecah trust.

---

## 6. Alur yang harus tercakup (user journeys)

### 6.1 POS Kasir — jalur utama

1. Login staff → masuk konteks tenant.
2. Pilih **tipe order:** Dine-in / Takeaway (dan meja jika dine-in dari kasir).
3. Tambah item → **modifier** (wajib/opsional, multi-pilih).
4. Diskon/PPN (jika produk sudah mendukung) — tampilkan subtotal, pajak, grand total jelas.
5. **Bayar:** Tunai / QRIS (kasir) → konfirmasi sukses + **struk/receipt** (print optional, fase 2).
6. **Pesanan dari pelanggan (unpaid):** daftar order menunggu bayar → **scan kode order** atau pilih dari list → tutup dengan tunai/QRIS.

### 6.2 POS — offline-first (state khusus)

- Indikator **Online / Offline** permanen di chrome UI.
- Order dibuat saat offline: status **“Menunggu sinkron”** dengan jumlah antrian.
- Sync gagal / konflik: pesan jelas, aksi **ulang** atau **hubungi supervisor** (copy singkat).
- Pembayaran non-tunai saat offline: **tidak tersedia** — blokir dengan penjelasan satu kalimat.

**Deliverable:** Wireframe state mesin: online, offline aktif, antrian sync, error sync.

### 6.3 Portal pelanggan — satu domain, konteks beda path

- **Dine-in (QR meja):** setelah scan, tampilkan **meja / zona** (jika tersedia) + menu.
- **Takeaway / delivery:** entry dari slug outlet; alamat & ongkir (fase delivery) mengikuti alur terpisah tapi **komponen menu/cart sama**.

Alur checkout:

1. Keranjang → konfirmasi.
2. Pilih **Bayar sekarang (QRIS)** atau **Bayar di kasir**.
3. QRIS: layar instruksi + QR + status “memverifikasi pembayaran…” + sukses/gagal.
4. Bayar di kasir: **kode/QR untuk kasir** + instruksi singkat bahasa Indonesia.

### 6.4 Registrasi ringan & riwayat

- CTA opsional: “Simpan riwayat dengan nomor HP” → OTP → halaman **Pesanan saya** (scoped outlet atau global dengan filter outlet — ikut keputusan produk).
- Jangan mengganggu alur anonim: registrasi **setelah** checkout atau dari menu profil, bukan gate wajib.

### 6.5 KDS (referensi fase akhir)

- Board per stasiun atau per order; warna status **pending → preparing → ready**.
- Ukuran teks besar, mode “gangguan rendah” (kurang animasi berlebihan).

---

## 7. Pembayaran — batasan UI (produk)

| Konteks | UI yang didesain |
|---------|------------------|
| Portal pelanggan | **Hanya QRIS** (tunai tidak ditawarkan di browser) |
| Dine-in bayar di kasir | Alur **tunai di kasir** + konfirmasi kasir |
| Kasir | Tunai + QRIS (invoice), konsisten dengan “ledger” merchant |

---

## 8. Kuota staff & error bisnis (bukan prioritas visual berat)

- Saat merchant mencapai batas paket (SEED / SPROUT / BLOOM): **modal atau halaman** yang menjelaskan limit + CTA upgrade / beli seat (copy dari product).
- Desainer menyiapkan **ilustrasi ringan** atau ikon + hierarki teks; tidak perlu flow pembayaran penuh di mockup jika sama dengan wallet existing.

---

## 9. Aksesibilitas & lokalisasi

- Kontras teks memenuhi **WCAG AA** minimum untuk angka harga dan status pembayaran.
- Target utama **Bahasa Indonesia**; ruang untuk string panjang (label modifier, nama menu).
- Area sentuh minimum ~44px untuk CTA di mobile portal.

---

## 10. Deliverable yang diharapkan dari designer

1. **User flow diagram** (FigJam/Miro): kasir online/offline, customer checkout dua mode bayar, handoff ke kasir scan.
2. **Wireframe tinggi** POS: layout landscape — grid kategori + panel cart + sheet modifier.
3. **Hi-fi key screens** portal pelanggan: menu, cart, QRIS, bayar di kasir (QR/kode), error outlet.
4. **Komponen library delta:** badge sync, banner offline, tile order unpaid, QR container, status pembayaran.
5. **Responsive breakpoints:** minimal mobile 360px untuk portal; tablet 1024+ untuk POS.
6. **Spesifikasi tema merchant** untuk portal (token warna: primary, surface, on-surface) agar dev bisa map dari `selfServiceTheme`.

---

## 11. Referensi internal

- Design system merchant: `UI-UX/merchant/merchant_dashboard/DESIGN.md`
- Roadmap produk: `PROJECT_STATUS.md` + dokumen perencanaan epic/sprint (POS, order, KDS)

---

## 12. Di luar scope brief ini (jangan blokir desain, tapi tidak wajib hi-fi sekarang)

- Print Bluetooth/USB struk
- White-label domain penuh per merchant
- Admin internal lioo untuk semua tenant

---

*Dokumen ini hidup bersama produk; revisi ketika API Grab/Gojek atau role BLOOM (kitchen/finance) mengubah alur.*
