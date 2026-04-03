import { Prisma } from '@prisma/client';

/** Format: ORD-YYYYMMDD- (prefix untuk satu hari per tenant) */
export function orderNumberDatePrefix(now = new Date()): string {
  const pad = (n: number, d = 2) => String(n).padStart(d, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `ORD-${dateStr}-`;
}

/**
 * Nomor urut berikutnya untuk tenant & tanggal (hari ini).
 * Memakai MAX numerik suffix, bukan COUNT — konsisten jika ada gap,
 * dan dipanggil di dalam transaksi + retry untuk hindari bentrok konkuren.
 */
export async function allocateNextOrderNumberTx(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now = new Date()
): Promise<string> {
  const prefix = orderNumberDatePrefix(now);
  const rows = await tx.order.findMany({
    where: { tenantId, orderNumber: { startsWith: prefix } },
    select: { orderNumber: true },
  });
  let maxSeq = 0;
  for (const row of rows) {
    const n = parseInt(row.orderNumber.slice(prefix.length), 10);
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
  }
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

export function isOrderNumberConflict(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code === 'P2034') return true;
  if (err.code !== 'P2002') return false;
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    return target.includes('tenantId') && target.includes('orderNumber');
  }
  if (typeof target === 'string') {
    return target.includes('tenantId') && target.includes('orderNumber');
  }
  return false;
}

export async function withRetryOnOrderNumberConflict<T>(
  fn: () => Promise<T>,
  maxAttempts = 15
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (isOrderNumberConflict(e) && attempt < maxAttempts - 1) {
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
