# Sprint Tracker — lioo.io Platform (POS & Portal Pelanggan)

Dokumen ini mencatat **sprint yang sudah selesai** (detail deliverable & lokasi kode) dan **sprint yang direncanakan** untuk fase operasional F&B multi-tenant.

**Monorepo:** `lioo-platform/` (Turborepo)  
**Database:** Supabase (PostgreSQL) + Prisma (`packages/database`)  
**Referensi UX:** `UI-UX/pos_and_ordering/UI_UX_BRIEF.md` — *The Living Atelier / Biophilic Ledger*

---

## Ringkasan status

| Sprint | Nama | Status |
|--------|------|--------|
| 1 | Fondasi monorepo & schema | Selesai |
| 2 | Merchant dashboard & menu | Selesai |
| 3 | Staff, undangan, kuota paket | Selesai |
| 4 | POS kasir & pembayaran (tunai + QRIS) | Selesai |
| 5 | Offline-first & sync | Selesai |
| 6 | Portal pelanggan — menu, cart, checkout | Selesai |
| 7 | Integrasi kasir ↔ portal (kode order + QRIS PAY_NOW) | Selesai |
| — | Pelengkap dua konteks (QR meja + takeaway/delivery form) | Selesai |
| 8 | Registrasi pelanggan & riwayat pesanan | Selesai |
| 9 | Upstash Redis (cache menu, rate limit) | Selesai |
| 10 | KDS (Kitchen Display System) | Direncanakan |
| 11 | Delivery instan (Grab / Gojek API) | Direncanakan |

---

## Sprint selesai — detail

### Sprint 1 — Fondasi monorepo & database

**Tujuan:** Menyiapkan kerangka aplikasi, paket bersama, dan model data inti.

**Deliverable:**
- Turborepo: `apps/*` (landing-page, sso, merchant, pos, order), `packages/*` (database, ui, eslint-config, typescript-config).
- Prisma schema: `Tenant`, `User`, `Product`, `Category`, `Order`, `OrderItem`, `Table`, `Customer`, wallet, staff invite, enum peran & status order.
- Resolusi tenant server-side: `resolveBySlug`, `resolveByTableToken` (`packages/database/lib/tenant-context.ts`).
- Dokumen arsitektur: `docs/ADR-001-sprint1-foundations.md`.

---

### Sprint 2 — Merchant dashboard & katalog

**Tujuan:** Owner mengelola outlet, kategori, produk, modifier, dan meja (data).

**Deliverable:**
- Onboarding / profil toko, manajemen menu dengan gambar (Cloudflare R2).
- Modifier groups & opsi harga.
- Entitas `Table` dengan `qrToken` unik (pen-generation UI menyusul di batch konteks).

---

### Sprint 3 — Staff, undangan, kuota paket

**Tujuan:** Akses peran staff dan batas seat per paket (SEED / SPROUT / BLOOM).

**Deliverable:**
- `StaffInvite`, alur join token, email undangan (Resend).
- Logika kuota: `staff-quota.ts`, role guard untuk POS / dashboard.
- Pembelian seat tambahan via wallet (Xendit) sesuai desain billing.

---

### Sprint 4 — POS kasir & pembayaran

**Tujuan:** Terminal kasir fungsional dengan tunai dan QRIS.

**Deliverable:**
- `apps/pos`: layout 2 panel (katalog + cart), `POSTerminal`, modifier, `PaymentModal` (tunai + QRIS Xendit).
- API: `POST /api/pos/qris`, polling `GET /api/pos/check-payment`.
- Server action: `processPaymentCash`, `fetchOrderForPayment` (`apps/pos/app/actions/payments.ts`).
- Webhook merchant: prefix `qris_` pada `external_id` untuk menandai lunas (`apps/merchant/.../webhook/xendit`).
- Halaman daftar pesanan hari ini dengan tombol bayar untuk `UNPAID`.
- Perbaikan build Vercel: lazy-load Kinde `handleAuth` di `apps/pos/app/api/auth/[kindeAuth]/route.ts`.
- `apps/pos/vercel.json` untuk install/build monorepo.

---

### Sprint 5 — Offline-first & sinkronisasi

**Tujuan:** POS tetap jalan saat offline; antrian sync ke server.

**Deliverable:**
- IndexedDB (Dexie): `apps/pos/lib/db.ts` — cache menu, antrian order offline.
- Hook `useSync` dengan backoff & retry (`lib/use-sync.ts`).
- `POST /api/pos/sync` — batch, idempotensi `offlineId`, validasi harga server-side.
- UI: `SyncStatusBar`, halaman `sync-issues` untuk konflik/gagal.

---

### Sprint 6 — Portal pelanggan (inti)

**Tujuan:** Pelanggan pesan tanpa login wajib — menu, keranjang, submit order.

**Deliverable:**
- `apps/order`: route `/o/[tenantSlug]` (takeaway) dan `/t/[tableToken]` (dine-in).
- `proxy.ts` (Next.js 16): cookie httpOnly `lioo_guest_sid` (guest session).
- `fetchMenu`, `MenuPage`, `ModifierSheet`, `CartDrawer`, `ConfirmationPage`.
- Server action `createCustomerOrder` — validasi harga, `publicOrderCode` untuk bayar di kasir, PPN 11%.
- `OutletHeader`, styling selaras palet sage/forest.

---

### Sprint 7 — Kasir ↔ portal (kode order & QRIS pelanggan)

**Tujuan:** Kasir bisa menemukan order self-service; pelanggan bisa PAY_NOW QRIS di browser.

**Deliverable:**
- POS: tab **Self-Order**, badge unpaid, modal **Scan Kode** (`publicOrderCode`), API `GET /api/pos/lookup-order`.
- Order app: `POST /api/customer/qris`, `GET /api/customer/check-payment`, halaman `/paying`, webhook `POST /api/webhook/xendit` dengan prefix `customerqris_`.
- Env: `NEXT_PUBLIC_ORDER_URL`, webhook URL terpisah untuk app order di Vercel.

---

### Batch pelengkap — Dua konteks outlet (tanpa nomor sprint terpisah)

**Tujuan:** Menutup gap antara “hanya QR meja” vs takeaway/delivery.

**Deliverable:**
- **Konteks 1:** Merchant — halaman **Meja & QR Code** (`apps/merchant/app/dashboard/tables/`) — list meja, QR printable, salin URL `/t/{qrToken}`; item nav **Meja & QR Code**.
- **Konteks 2:** Portal — checkout takeaway: pilih **Ambil sendiri / Diantar**, HP wajib, alamat jika diantar; field `deliveryAddress` di schema `Order` (+ SQL manual jika perlu).
- `NEXT_PUBLIC_ORDER_URL` di contoh env merchant untuk URL portal.

---

### Sprint 8 — Registrasi pelanggan & riwayat (per outlet)

**Tujuan:** Opsional “simpan riwayat” tanpa mengunci alur anonim (selaras UI/UX brief §6.4; PIN dulu, OTP SMS bisa fase berikut).

**Deliverable:**
- Schema `Customer.pinHash` (bcrypt PIN 6 digit); cookie `lioo_customer_session` → `guestToken`.
- `apps/order/lib/customer-session.ts`, `lib/phone.ts` (normalisasi `08…`).
- Actions: `registerCustomer`, `loginCustomer`, `logoutCustomer` (`app/actions/customer-auth.ts`).
- Halaman `/o/.../account` dan `/t/.../account` — `AccountPortalClient` (hero biophilic, tab Daftar/Masuk, riwayat order `CUSTOMER_APP`).
- Gabung order anonim: `guestSessionId` → `customerId` saat daftar/masuk.
- `createCustomerOrder` menerima `registeredCustomerId` (validasi tenant + PIN terdaftar).
- Header **Akun**; banner di menu jika sudah login.
- Dependensi: `bcryptjs` di `apps/order`.
- SQL opsional: `packages/database/sql/sprint8_customer_pinhash.sql`.

---

### Sprint 9 — Upstash Redis (cache menu & rate limit)

**Tujuan:** Mengurangi beban database pada portal publik dan melindungi endpoint publik dari abuse.

**Deliverable:**
- Paket bersama `packages/redis-cache` — klien Upstash, kunci cache menu publik `lioo:publicMenu:v1:{tenantId}`, TTL (default 300 s, env `PUBLIC_MENU_CACHE_TTL_SECONDS`), `@upstash/ratelimit` sliding window.
- `apps/order/lib/menu.ts` — `fetchMenu` membaca/menulis cache Redis; fallback penuh ke Prisma jika Redis tidak tersedia atau parse gagal.
- `apps/order/proxy.ts` — rate limit per IP untuk `/o/*`, `/t/*` (default 120/menit, `PORTAL_RATE_LIMIT_PAGE_PER_MIN`) dan `/api/customer/*` (default 40/menit, `PORTAL_RATE_LIMIT_API_PER_MIN`); header `X-RateLimit-*` dan `429` + `Retry-After` saat limit; cookie tamu tetap seperti sebelumnya.
- `apps/merchant` — invalidasi cache setelah mutasi katalog (`dashboard/menu/actions.ts`) dan setelah onboarding (`app/actions/onboarding.ts`).
- Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` di **order** dan **merchant**; `transpilePackages: ['@repo/redis-cache']` di `next.config.js` kedua app; `turbo.json` `globalEnv` untuk variabel terkait.
- Dokumentasi contoh env: `apps/order/.env.local.example`.

**Tidak termasuk dalam sprint ini:** pub/sub real-time; cache menu di POS (tetap IndexedDB / server Prisma).

---

## Sprint yang akan dikerjakan

### Sprint 10 — KDS (Kitchen Display System)

**Target:**
- App `apps/kds` (atau route terdedikasi): board pesanan per outlet, status item (pending → preparing → ready).
- Integrasi data dari `Order` / `OrderItem`; perangkat tablet landscape, tipografi besar (brief §6.5).
- Setelah POS stabil di lapangan.

---

### Sprint 11 — Delivery instan (MVP)

**Target:**
- Integrasi API **Grab** / **Gojek** (estimasi ongkir, pemesanan kurir, status).
- Alur order type `DELIVERY` yang sudah ada di portal dihubungkan ke penyedia logistik; koordinasi dengan merchant untuk konfirmasi manual sementara bisa diganti otomatis.

---

## Catatan operasional & migrasi DB

| Kebutuhan | File / perintah |
|-----------|------------------|
| Kolom `deliveryAddress` pada `Order` | SQL manual di Supabase jika belum `db push` |
| Kolom `pinHash` pada `Customer` | `packages/database/sql/sprint8_customer_pinhash.sql` |
| Deploy POS | Root `apps/pos`, env Kinde + `DATABASE_URL` + Xendit |
| Deploy order | Root `apps/order`, `DATABASE_URL`, Xendit + webhook `/api/webhook/xendit`, `NEXT_PUBLIC_ORDER_URL`, Upstash (`UPSTASH_REDIS_REST_*`) |
| Deploy merchant (invalidasi cache menu) | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (sama database Redis) |

---

## Referensi cepat path kode

| Area | Lokasi utama |
|------|----------------|
| POS terminal | `apps/pos/app/pos/terminal/` |
| POS sync | `apps/pos/app/api/pos/sync`, `apps/pos/lib/use-sync.ts` |
| Portal order | `apps/order/app/o/`, `apps/order/app/t/`, `lib/menu.ts`, `proxy.ts` |
| Cache / rate limit (Upstash) | `packages/redis-cache/`, env di `apps/order` & `apps/merchant` |
| Auth pelanggan | `apps/order/app/actions/customer-auth.ts`, `lib/customer-session.ts` |
| Merchant meja & QR | `apps/merchant/app/dashboard/tables/` |
| Database | `packages/database/prisma/schema.prisma` |

---

*Terakhir diselaraskan dengan kondisi repo setelah Sprint 9 (Upstash Redis) ter-merge ke `main`. Perbarui baris status tabel di atas setiap kali sprint baru dimulai atau diselesaikan.*
