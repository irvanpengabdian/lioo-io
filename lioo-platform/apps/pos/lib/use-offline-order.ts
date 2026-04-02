'use client';

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  enqueueOfflineOrder,
  cacheMenuSnapshot,
  readMenuFromCache,
  isMenuCacheFresh,
  type OfflineOrder,
  type OfflineOrderItem,
} from './db';
import type { CartState, CatalogProduct, CatalogCategory, TableOption } from './types';
import { calcCartTotals } from './types';

/** Ambil deviceId unik per browser (localStorage) */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'lioo-pos-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(key, id);
  }
  return id;
}

type SaveOfflineOrderOptions = {
  cart: CartState;
  tenantId: string;
};

/**
 * Simpan order ke IndexedDB (mode offline atau force-offline).
 * Mengembalikan offlineId yang bisa digunakan sebagai referensi lokal.
 */
export async function saveOrderToQueue(opts: SaveOfflineOrderOptions): Promise<string> {
  const { cart, tenantId } = opts;
  const offlineId = uuidv4();
  const deviceId = getDeviceId();
  const totals = calcCartTotals(cart);

  const items: OfflineOrderItem[] = cart.items.map((i) => ({
    productId: i.productId,
    productName: i.productName,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    subtotal: i.subtotal,
    selectedModifiers: i.selectedModifiers,
    specialInstructions: i.specialInstructions,
  }));

  const order: Omit<OfflineOrder, 'id'> = {
    offlineId,
    tenantId,
    deviceId,
    orderType: cart.orderType,
    tableId: cart.tableId,
    tableLabel: cart.tableLabel,
    customerName: cart.customerName?.trim() || null,
    items,
    subtotal: totals.subtotal,
    taxPercent: cart.taxPercent,
    taxTotal: totals.taxAmount,
    discountPercent: cart.discountPercent,
    discountTotal: totals.discountAmount,
    grandTotal: totals.grandTotal,
    status: 'PENDING',
    createdAt: Date.now(),
    syncAttempts: 0,
  };

  await enqueueOfflineOrder(order);
  return offlineId;
}

/**
 * Simpan snapshot menu ke IndexedDB (dipanggil saat halaman POS dimuat dan online).
 */
export function useCacheMenu() {
  const saveCache = useCallback(
    async (
      tenantId: string,
      categories: CatalogCategory[],
      products: CatalogProduct[],
      tables: TableOption[]
    ) => {
      if (typeof window === 'undefined') return;
      try {
        await cacheMenuSnapshot(tenantId, categories, products, tables);
      } catch (e) {
        console.warn('[useCacheMenu] Gagal simpan cache:', e);
      }
    },
    []
  );

  const loadFromCache = useCallback(async (tenantId: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const fresh = await isMenuCacheFresh(tenantId);
      if (!fresh) return null;
      return await readMenuFromCache(tenantId);
    } catch {
      return null;
    }
  }, []);

  return { saveCache, loadFromCache };
}
