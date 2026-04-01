'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPOSDb,
  getPendingOrders,
  updateOrderStatus,
  type OfflineOrder,
} from './db';

// ─── Tipe respons dari server ──────────────────────────────────────────────
type SyncItemResult = {
  offlineId: string;
  status: 'synced' | 'duplicate' | 'conflict' | 'error';
  orderId?: string;
  orderNumber?: string;
  error?: string;
};

type SyncResponse = {
  results: SyncItemResult[];
};

// ─── Status sync untuk UI ──────────────────────────────────────────────────
export type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
  lastSyncAt: number | null;
  lastError: string | null;
};

const INITIAL_STATE: SyncState = {
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  conflictCount: 0,
  lastSyncAt: null,
  lastError: null,
};

// Eksponensial backoff config
const MAX_RETRY_ATTEMPTS = 5;
const BASE_DELAY_MS = 3_000;
const MAX_DELAY_MS = 120_000;

function backoffDelay(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
}

// ─── Hook utama ────────────────────────────────────────────────────────────
export function useSync(tenantId: string | null) {
  const [state, setState] = useState<SyncState>(INITIAL_STATE);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  // ── Hitung pending dari DB ──
  const refreshCounts = useCallback(async () => {
    if (!tenantId || typeof window === 'undefined') return;
    try {
      const db = getPOSDb();
      const all = await db.orders.where('tenantId').equals(tenantId).toArray();
      setState((prev) => ({
        ...prev,
        pendingCount: all.filter((o) => o.status === 'PENDING').length,
        failedCount: all.filter((o) => o.status === 'FAILED').length,
        conflictCount: all.filter((o) => o.status === 'CONFLICT').length,
      }));
    } catch {
      // Abaikan jika DB belum siap
    }
  }, [tenantId]);

  // ── Sync ke server ──
  const syncNow = useCallback(async () => {
    if (!tenantId || isSyncingRef.current || typeof window === 'undefined') return;

    const pending = await getPendingOrders(tenantId);
    if (pending.length === 0) {
      await refreshCounts();
      return;
    }

    isSyncingRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true, lastError: null }));

    // Tandai semua sebagai SYNCING
    for (const order of pending) {
      await updateOrderStatus(order.offlineId, {
        status: 'SYNCING',
        lastSyncAt: Date.now(),
        syncAttempts: (order.syncAttempts || 0) + 1,
      });
    }

    try {
      const res = await fetch('/api/pos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: pending.map(serializeOrder) }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        throw new Error(`Sync failed: HTTP ${res.status}`);
      }

      const data: SyncResponse = await res.json();

      // Update status tiap order berdasarkan hasil server
      for (const result of data.results) {
        if (result.status === 'synced' || result.status === 'duplicate') {
          await updateOrderStatus(result.offlineId, {
            status: 'SYNCED',
            serverOrderId: result.orderId,
            serverOrderNumber: result.orderNumber,
          });
        } else if (result.status === 'conflict') {
          await updateOrderStatus(result.offlineId, {
            status: 'CONFLICT',
            errorMessage: result.error ?? 'Konflik data dengan server',
          });
        } else {
          // Error item-level → kembalikan ke FAILED agar di-retry
          await updateOrderStatus(result.offlineId, {
            status: 'FAILED',
            errorMessage: result.error ?? 'Gagal disimpan ke server',
          });
        }
      }

      setState((prev) => ({
        ...prev,
        lastSyncAt: Date.now(),
        lastError: null,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi';
      // Kembalikan SYNCING → FAILED
      for (const order of pending) {
        const attempts = (order.syncAttempts || 0) + 1;
        if (attempts >= MAX_RETRY_ATTEMPTS) {
          await updateOrderStatus(order.offlineId, {
            status: 'FAILED',
            errorMessage: `Gagal setelah ${attempts} percobaan: ${msg}`,
          });
        } else {
          await updateOrderStatus(order.offlineId, {
            status: 'PENDING',
            errorMessage: msg,
          });
        }
      }
      setState((prev) => ({ ...prev, lastError: msg }));
    } finally {
      isSyncingRef.current = false;
      setState((prev) => ({ ...prev, isSyncing: false }));
      await refreshCounts();
    }
  }, [tenantId, refreshCounts]);

  // ── Auto-sync dengan backoff saat online ──
  const scheduleSync = useCallback(
    (delayMs = 0) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => syncNow(), delayMs);
    },
    [syncNow]
  );

  // ── Online / Offline event listeners ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      scheduleSync(500); // sedikit delay agar koneksi stabil dulu
    };
    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };

    setState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync saat pertama mount jika online
    if (navigator.onLine && tenantId) scheduleSync(1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [scheduleSync, tenantId]);

  // ── Refresh counts setiap 10 detik ──
  useEffect(() => {
    if (!tenantId) return;
    refreshCounts();
    const interval = setInterval(refreshCounts, 10_000);
    return () => clearInterval(interval);
  }, [tenantId, refreshCounts]);

  return { ...state, syncNow, refreshCounts };
}

// ─── Serialisasi order ke format API ──────────────────────────────────────
function serializeOrder(order: OfflineOrder) {
  return {
    offlineId: order.offlineId,
    deviceId: order.deviceId,
    orderType: order.orderType,
    tableId: order.tableId,
    items: order.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      selectedModifiers: i.selectedModifiers,
      specialInstructions: i.specialInstructions,
    })),
    taxPercent: order.taxPercent,
    discountPercent: order.discountPercent,
    createdAt: order.createdAt,
  };
}
