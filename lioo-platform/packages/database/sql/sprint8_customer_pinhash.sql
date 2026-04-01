-- Sprint 8: registrasi pelanggan portal (PIN 6 digit, bcrypt di app)
-- Jalankan di Supabase SQL Editor jika `prisma db push` belum dijalankan.

ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "pinHash" TEXT;
