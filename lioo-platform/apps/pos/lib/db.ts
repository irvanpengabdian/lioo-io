/**
 * IndexedDB schema untuk POS terminal (client-only).
 * Diakses HANYA dari komponen client-side / hooks.
 */
import Dexie, { type EntityTable } from 'dexie';
import type { CatalogProduct, CatalogCategory, TableOption, SelectedModifier, OrderType } from './types';

// ─── Local product cache ───────────────────────────────────────────────────
export type LocalProduct = CatalogProduct & {
  tenantId: string;
  cachedAt: number; // Date.now()
};

export type LocalCategory = CatalogCategory & {
  tenantId: string;
  sortOrder: number;
};

export type LocalTable = TableOption & {
  tenantId: string;
};

// ─── Offline order ─────────────────────────────────────────────────────────
export type OfflineOrderStatus =
  | 'PENDING'    // belum di-sync
  | 'SYNCING'    // sedang di-upload
  | 'SYNCED'     // berhasil disimpan ke server
  | 'FAILED'     // gagal, akan coba ulang
  | 'CONFLICT';  // server menolak (stok/produk tidak ada)

export type OfflineOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
};

export type OfflineOrder = {
  /** Auto-increment PK di IndexedDB */
  id?: number;
  /** UUID unik dibuat client, untuk idempotency di server */
  offlineId: string;
  tenantId: string;
  deviceId: string;
  orderType: OrderType;
  tableId: string | null;
  tableLabel: string | null;
  items: OfflineOrderItem[];
  subtotal: number;
  taxPercent: number;
  taxTotal: number;
  discountPercent: number;
  discountTotal: number;
  grandTotal: number;
  status: OfflineOrderStatus;
  /** orderId dari server setelah sync berhasil */
  serverOrderId?: string;
  /** orderNumber human-readable dari server */
  serverOrderNumber?: string;
  /** Pesan error / konflik dari server */
  errorMessage?: string;
  createdAt: number;      // Date.now() saat order dibuat
  syncAttempts: number;   // jumlah percobaan sync
  lastSyncAt?: number;    // Date.now() percobaan terakhir
};

// ─── Sync log (opsional, untuk audit trail lokal) ──────────────────────────
export type SyncLog = {
  id?: number;
  offlineId: string;
  attemptAt: number;
  success: boolean;
  serverOrderId?: string;
  errorMessage?: string;
};

// ─── Dexie class ───────────────────────────────────────────────────────────
class POSDatabase extends Dexie {
  products!: EntityTable<LocalProduct, 'id'>;
  categories!: EntityTable<LocalCategory, 'id'>;
  posTables!: EntityTable<LocalTable, 'id'>;
  orders!: EntityTable<OfflineOrder, 'id'>;
  syncLogs!: EntityTable<SyncLog, 'id'>;

  constructor() {
    super('lioo-pos-db');
    this.version(1).stores({
      products:   'id, tenantId, categoryId, cachedAt',
      categories: 'id, tenantId, sortOrder',
      posTables:  'id, tenantId',
      orders:     '++id, offlineId, tenantId, status, createdAt',
      syncLogs:   '++id, offlineId, attemptAt',
    });
  }
}

// Singleton — di SSR export null-safe
let _db: POSDatabase | null = null;

export function getPOSDb(): POSDatabase {
  if (typeof window === 'undefined') {
    throw new Error('POSDatabase tidak bisa dipakai di server-side');
  }
  if (!_db) _db = new POSDatabase();
  return _db;
}

// ─── Cache helpers ─────────────────────────────────────────────────────────

/** Simpan snapshot katalog ke IndexedDB */
export async function cacheMenuSnapshot(
  tenantId: string,
  categories: CatalogCategory[],
  products: CatalogProduct[],
  tables: TableOption[]
) {
  const db = getPOSDb();
  const now = Date.now();

  await db.transaction('rw', db.products, db.categories, db.posTables, async () => {
    // Hapus cache lama untuk tenant ini
    await db.products.where('tenantId').equals(tenantId).delete();
    await db.categories.where('tenantId').equals(tenantId).delete();
    await db.posTables.where('tenantId').equals(tenantId).delete();

    await db.categories.bulkAdd(
      categories.map((c, i) => ({ ...c, tenantId, sortOrder: i }))
    );
    await db.products.bulkAdd(
      products.map((p) => ({ ...p, tenantId, cachedAt: now }))
    );
    await db.posTables.bulkAdd(tables.map((t) => ({ ...t, tenantId })));
  });
}

/** Baca menu dari cache lokal */
export async function readMenuFromCache(tenantId: string) {
  const db = getPOSDb();
  const [categories, products, tables] = await Promise.all([
    db.categories.where('tenantId').equals(tenantId).sortBy('sortOrder'),
    db.products.where('tenantId').equals(tenantId).toArray(),
    db.posTables.where('tenantId').equals(tenantId).toArray(),
  ]);
  return { categories, products, tables };
}

/** Apakah cache menu masih segar (< maxAgeMs, default 30 menit) */
export async function isMenuCacheFresh(
  tenantId: string,
  maxAgeMs = 30 * 60 * 1000
): Promise<boolean> {
  const db = getPOSDb();
  const newest = await db.products
    .where('tenantId')
    .equals(tenantId)
    .last();
  if (!newest) return false;
  return Date.now() - newest.cachedAt < maxAgeMs;
}

// ─── Order helpers ─────────────────────────────────────────────────────────

/** Buat order baru di IndexedDB (offline queue) */
export async function enqueueOfflineOrder(order: Omit<OfflineOrder, 'id'>): Promise<number> {
  const db = getPOSDb();
  const id = await db.orders.add(order as OfflineOrder);
  return id as number;
}

/** Ambil semua order yang perlu di-sync */
export async function getPendingOrders(tenantId: string): Promise<OfflineOrder[]> {
  const db = getPOSDb();
  return db.orders
    .where('[tenantId+status]')
    .anyOf([[tenantId, 'PENDING'], [tenantId, 'FAILED']])
    .toArray()
    .catch(() =>
      // Fallback jika compound index belum tersedia
      db.orders
        .where('tenantId')
        .equals(tenantId)
        .filter((o) => o.status === 'PENDING' || o.status === 'FAILED')
        .toArray()
    );
}

/** Update status order lokal */
export async function updateOrderStatus(
  offlineId: string,
  patch: Partial<Pick<OfflineOrder, 'status' | 'serverOrderId' | 'serverOrderNumber' | 'errorMessage' | 'lastSyncAt' | 'syncAttempts'>> & { syncAttempts?: number }
) {
  const db = getPOSDb();
  await db.orders.where('offlineId').equals(offlineId).modify(patch);
}
