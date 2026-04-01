# `@repo/database`

Satu **Prisma schema** + **Prisma Client** + helper (`staff-quota`, `role-guard`, `tenant-context`) untuk seluruh monorepo `lioo-platform`.

## Siapa yang memakai paket ini?

| App | Pemakaian utama |
|-----|-----------------|
| **merchant** | `prisma`, RBAC, kuota seat, billing |
| **pos** | `prisma`, `ROLE_PERMISSIONS` |
| **order** | `resolveBySlug`, `resolveByTableToken` |
| **sso** | `prisma`, invite / kuota |
| **landing-page** | `prisma` (blog, legal, about) |

Mengubah **`schema.prisma`** atau **`index.ts`** berpotensi memengaruhi **semua** app di atas: build bisa gagal, atau runtime error jika database belum dimigrasi.

## Setup lokal

1. `cp .env.example .env` dan isi `DATABASE_URL`.
2. Dari folder ini:
   - `npm run db:migrate:deploy` — terapkan migrasi (DB kosong / sudah sinkron dengan riwayat migrasi).
   - atau `npm run db:migrate` — iterasi dev (buat migrasi baru + terapkan).
3. `npm run db:generate` (juga jalan otomatis lewat `postinstall` / `build`).

## Baseline migrasi (`20260401120000_baseline`)

File SQL di `prisma/migrations/` mendeskripsikan **schema penuh** dari nol (PostgreSQL).

- **Database baru / kosong:** `db:migrate:deploy` biasanya cukup.
- **Database production yang sudah ada isinya** tanpa riwayat Prisma Migrate: jangan asal `deploy` tanpa cek — bisa bentrok dengan tabel yang sudah ada. Ikuti [baselining](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/add-prisma-migrate-to-an-existing-project) Prisma (mis. `migrate diff` dari URL DB Anda, atau `migrate resolve` hanya jika Anda yakin schema sudah identik).

## Cek apakah Supabase (atau Postgres lain) selaras dengan schema

Dari folder ini, dengan `DATABASE_URL` valid di `.env`:

```bash
npx prisma migrate status
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

- Jika output diff hanya `-- This is an empty migration.` → isi database sudah cocok dengan `schema.prisma` (tidak ada drift).
- Jika ada pernyataan SQL → jalankan lewat migrasi baru (`db:migrate`) atau sesuaikan schema, jangan langsung eksekusi SQL di production tanpa review.

## Deploy (Vercel / lainnya)

- Build app biasanya membutuhkan `prisma generate` — paket ini menjalankannya di `postinstall` / `build`.
- **`prisma migrate deploy`** umumnya dijalankan **terpisah** (CI, job manual, atau hook deploy) dengan `DATABASE_URL` production, bukan otomatis di setiap `next build` — kecuali Anda sengaja mengonfigurasi demikian.

## Skrip singkat

| Skrip | Fungsi |
|-------|--------|
| `db:generate` | Generate Prisma Client |
| `db:validate` | Validasi `schema.prisma` |
| `db:migrate` | Dev: buat & terapkan migrasi |
| `db:migrate:deploy` | Production/staging: terapkan migrasi tertunda |
| `db:migrate:status` | Cek status migrasi vs DB |
| `db:push` | Sinkron cepat tanpa file migrasi (hindari di production jika tim pakai Migrate) |
| `db:studio` | UI Prisma Studio |

Dari root `lioo-platform` bisa memakai workspace, misalnya: `npm run db:migrate:deploy -w @repo/database`.
