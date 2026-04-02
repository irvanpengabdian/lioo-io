/**
 * Pakai DATABASE_URL dari apps/pos/.env.local agar sama dengan app POS.
 * Jalankan dari packages/database: node scripts/migrate-with-pos-env.mjs
 */
import { readFileSync, existsSync, renameSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const platformRoot = join(__dirname, '../../..');
const posEnv = join(platformRoot, 'apps/pos/.env.local');
const dbEnv = join(__dirname, '../.env');

if (!existsSync(posEnv)) {
  console.error('Missing:', posEnv);
  process.exit(1);
}

const raw = readFileSync(posEnv, 'utf8');
function parseKey(text, key) {
  const line = text.split(/\r?\n/).find((l) => new RegExp(`^\\s*${key}\\s*=`).test(l));
  if (!line) return null;
  let v = line.replace(new RegExp(`^\\s*${key}\\s*=\\s*`), '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

const dbUrl = parseKey(raw, 'DATABASE_URL');
if (!dbUrl) {
  console.error('DATABASE_URL not found in apps/pos/.env.local');
  process.exit(1);
}
let directUrl = parseKey(raw, 'DIRECT_URL') || dbUrl;

let restored = false;
if (existsSync(dbEnv)) {
  renameSync(dbEnv, `${dbEnv}.bak_migrate`);
  restored = true;
}

try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: directUrl },
  });
} finally {
  if (restored && existsSync(`${dbEnv}.bak_migrate`)) {
    renameSync(`${dbEnv}.bak_migrate`, dbEnv);
  }
}
