/**
 * Cek apakah "Order"."deliveryAddress" ada di DB untuk DATABASE_URL dan DIRECT_URL.
 * Prisma migrate memakai DIRECT_URL; runtime app memakai DATABASE_URL.
 * Jika keduanya beda project/database → migrasi sukses tapi app tetap P2022.
 */
import { PrismaClient } from '@prisma/client';

function maskUrl(url) {
  if (!url) return '(missing)';
  try {
    const forParse = url.replace(/^postgres(ql)?:/i, 'https:');
    const u = new URL(forParse);
    return `${u.hostname}${u.port ? `:${u.port}` : ''}${u.pathname || ''}`;
  } catch {
    return '(unparseable)';
  }
}

async function probe(url, label) {
  if (!url) {
    console.error(`[verify-order-delivery] ${label}: URL kosong.`);
    return { ok: false, label, target: '(missing)', error: 'missing URL' };
  }
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: [],
  });
  try {
    await prisma.$queryRaw`SELECT "deliveryAddress" FROM "Order" LIMIT 1`;
    return { ok: true, label, target: maskUrl(url) };
  } catch (e) {
    const msg = e?.message ?? String(e);
    return { ok: false, label, target: maskUrl(url), error: msg };
  } finally {
    await prisma.$disconnect();
  }
}

const dbUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

const rDb = await probe(dbUrl, 'DATABASE_URL (runtime)');

/** Di Vercel wajib ada DIRECT_URL untuk migrate; lokal boleh hanya DATABASE_URL. */
let rDirect;
if (!directUrl) {
  console.warn(
    '[verify-order-delivery] DIRECT_URL tidak di-set — lewati probe migrate (wajib di Vercel).'
  );
  rDirect = { ok: true, label: 'DIRECT_URL (migrate)', target: '(skipped)' };
} else {
  rDirect = await probe(directUrl, 'DIRECT_URL (migrate)');
}

console.log('[verify-order-delivery] Probe:');
for (const r of [rDb, rDirect]) {
  console.log(`  ${r.label}: ${r.ok ? 'OK' : 'GAGAL'} → ${r.target}`);
  if (!r.ok) console.error(`    ${r.error}`);
}

if (!rDb.ok) {
  console.error(
    '\n[verify-order-delivery] DATABASE_URL tidak bisa baca "Order"."deliveryAddress". ' +
      'Ini DB yang dipakai app di Vercel. Samakan env dengan project Supabase tempat Anda cek Table Editor.\n'
  );
  process.exit(1);
}

if (!rDirect.ok) {
  console.error(
    '\n[verify-order-delivery] DIRECT_URL gagal — migrate deploy mengarah ke DB lain atau koneksi salah. ' +
      'DIRECT_URL dan DATABASE_URL harus satu project Supabase (beda port/pooler boleh).\n'
  );
  process.exit(1);
}

if (directUrl) {
  console.log('[verify-order-delivery] DATABASE_URL dan DIRECT_URL sama-sama punya kolom ini.');
} else {
  console.log('[verify-order-delivery] DATABASE_URL OK untuk "Order"."deliveryAddress".');
}
process.exit(0);
