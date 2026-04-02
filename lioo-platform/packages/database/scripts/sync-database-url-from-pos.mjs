/**
 * Salin DATABASE_URL (dan DIRECT_URL jika ada) dari apps/pos/.env.local → packages/database/.env
 *
 * DIRECT_URL: koneksi langsung ke Postgres (Supabase: host `db.<project>.supabase.co:5432`).
 * Wajib untuk `prisma migrate` jika DATABASE_URL memakai transaction pooler (:6543).
 * Jika tidak ada di .env.local, DIRECT_URL di database .env diset sama dengan DATABASE_URL
 * (cocok untuk Postgres lokal tanpa pooler).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const platformRoot = join(__dirname, '../../..');
const posEnv = join(platformRoot, 'apps/pos/.env.local');
const dbEnv = join(__dirname, '../.env');

if (!existsSync(posEnv)) {
  console.error('Tidak ada:', posEnv);
  process.exit(1);
}

const raw = readFileSync(posEnv, 'utf8');
const linesIn = raw.split(/\r?\n/);

function parseLine(key) {
  const line = linesIn.find((l) => new RegExp(`^\\s*${key}\\s*=`).test(l));
  if (!line) return null;
  let v = line.replace(new RegExp(`^\\s*${key}\\s*=\\s*`), '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

const dbUrl = parseLine('DATABASE_URL');
if (!dbUrl) {
  console.error('DATABASE_URL tidak ditemukan di apps/pos/.env.local');
  process.exit(1);
}

let directUrl = parseLine('DIRECT_URL');
if (!directUrl) {
  directUrl = dbUrl;
  console.warn(
    'Catatan: DIRECT_URL tidak ada di apps/pos/.env.local — memakai nilai sama dengan DATABASE_URL. ' +
      'Untuk Supabase + pooler :6543, tambahkan DIRECT_URL (koneksi langsung db.xxx.supabase.co:5432) agar migrate tidak hang.'
  );
}

let body = '';
if (existsSync(dbEnv)) {
  body = readFileSync(dbEnv, 'utf8');
}

const lines = body.split(/\r?\n/).filter((l) => l !== undefined);

function upsert(key, value) {
  const fullLine = `${key}=${value}`;
  const idx = lines.findIndex((l) => new RegExp(`^\\s*${key}\\s*=`).test(l));
  if (idx >= 0) {
    lines[idx] = fullLine;
  } else {
    if (lines.length && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push(fullLine);
  }
}

upsert('DATABASE_URL', dbUrl);
upsert('DIRECT_URL', directUrl);

writeFileSync(dbEnv, lines.join('\n'), 'utf8');
console.log('OK: DATABASE_URL & DIRECT_URL disalin ke packages/database/.env');
