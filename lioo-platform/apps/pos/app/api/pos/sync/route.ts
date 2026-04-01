import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma, ROLE_PERMISSIONS } from '@repo/database';

/**
 * POST /api/pos/sync
 *
 * Endpoint batch sinkronisasi order dari terminal kasir yang sedang/pernah offline.
 * Setiap item di-proses secara idempoten menggunakan `offlineId`.
 *
 * Body:
 * {
 *   orders: OfflineSyncPayload[]
 * }
 *
 * Response per item:
 *   - synced:    berhasil dibuat (pertama kali)
 *   - duplicate: offlineId sudah ada, kembalikan data existing
 *   - conflict:  produk tidak ada / tidak aktif
 *   - error:     kesalahan validasi atau server
 */

type SyncOrderItem = {
  productId: string;
  quantity: number;
  selectedModifiers: { id: string; name: string; price: number }[];
  specialInstructions?: string;
};

type OfflineSyncPayload = {
  offlineId: string;
  deviceId?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  tableId?: string | null;
  items: SyncOrderItem[];
  taxPercent: number;
  discountPercent: number;
  createdAt?: number; // client timestamp (ms)
};

type SyncItemResult = {
  offlineId: string;
  status: 'synced' | 'duplicate' | 'conflict' | 'error';
  orderId?: string;
  orderNumber?: string;
  error?: string;
};

export async function POST(req: Request) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const kindeUser = await getUser();
    if (!kindeUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: kindeUser.id },
      include: { tenant: true },
    });

    if (!dbUser?.tenantId || !dbUser.tenant) {
      return NextResponse.json({ error: 'No tenant' }, { status: 403 });
    }
    if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const tenantId = dbUser.tenantId;

    // ── Parse body ─────────────────────────────────────────────────────────
    const body = await req.json();
    const orders: OfflineSyncPayload[] = body?.orders ?? [];

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Batasi batch maksimal 50 order sekaligus
    if (orders.length > 50) {
      return NextResponse.json(
        { error: 'Maks 50 order per batch' },
        { status: 400 }
      );
    }

    const results: SyncItemResult[] = [];

    for (const payload of orders) {
      const { offlineId } = payload;

      try {
        // ── 1. Idempotency: cek offlineId sudah ada ────────────────────
        const existing = await prisma.order.findFirst({
          where: { tenantId, offlineId },
          select: { id: true, orderNumber: true },
        });
        if (existing) {
          results.push({
            offlineId,
            status: 'duplicate',
            orderId: existing.id,
            orderNumber: existing.orderNumber,
          });
          continue;
        }

        // ── 2. Validasi produk (cek ketersediaan dari DB) ──────────────
        const productIds = [...new Set(payload.items.map((i) => i.productId))];
        const dbProducts = await prisma.product.findMany({
          where: { id: { in: productIds }, tenantId, isAvailable: true },
          include: {
            modifierGroups: { include: { modifiers: true } },
          },
        });

        const unavailableIds = productIds.filter(
          (id) => !dbProducts.some((p) => p.id === id)
        );
        if (unavailableIds.length > 0) {
          results.push({
            offlineId,
            status: 'conflict',
            error: `Produk tidak tersedia: ${unavailableIds.join(', ')}`,
          });
          continue;
        }

        const productMap = new Map(dbProducts.map((p) => [p.id, p]));

        // ── 3. Validasi meja ───────────────────────────────────────────
        let resolvedTableLabel: string | null = null;
        if (payload.orderType === 'DINE_IN' && payload.tableId) {
          const table = await prisma.table.findFirst({
            where: { id: payload.tableId, tenantId, isActive: true },
            select: { label: true },
          });
          if (!table) {
            results.push({
              offlineId,
              status: 'conflict',
              error: 'Meja tidak ditemukan atau tidak aktif',
            });
            continue;
          }
          resolvedTableLabel = table.label;
        }

        // ── 4. Build validated items & hitung total ────────────────────
        type ValidatedItem = {
          productId: string;
          productName: string;
          quantity: number;
          unitPrice: number;
          subtotal: number;
          selectedModifiers: { id: string; name: string; price: number }[];
          specialInstructions: string | null;
        };

        const validatedItems: ValidatedItem[] = [];
        let subtotal = 0;
        let hasItemError = false;

        for (const item of payload.items) {
          const product = productMap.get(item.productId);
          if (!product) {
            results.push({ offlineId, status: 'conflict', error: `Produk ${item.productId} tidak ada` });
            hasItemError = true;
            break;
          }

          let basePrice = product.price;
          if (
            product.promoPrice !== null &&
            product.promoPrice > 0 &&
            (product.promoValidUntil === null || product.promoValidUntil > new Date())
          ) {
            basePrice = product.promoPrice;
          }

          const modifierPriceMap = new Map(
            product.modifierGroups.flatMap((g) =>
              g.modifiers.map((m) => [m.id, { name: m.name, price: m.price }])
            )
          );
          const allModifierIds = new Set(modifierPriceMap.keys());

          let modifiersTotal = 0;
          const validatedModifiers: { id: string; name: string; price: number }[] = [];

          for (const sel of item.selectedModifiers) {
            if (!allModifierIds.has(sel.id)) {
              results.push({
                offlineId,
                status: 'conflict',
                error: `Modifier ${sel.name} tidak valid`,
              });
              hasItemError = true;
              break;
            }
            const mod = modifierPriceMap.get(sel.id)!;
            modifiersTotal += mod.price;
            validatedModifiers.push({ id: sel.id, name: mod.name, price: mod.price });
          }
          if (hasItemError) break;

          const unitPrice = basePrice + modifiersTotal;
          const itemSubtotal = unitPrice * item.quantity;
          subtotal += itemSubtotal;

          validatedItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice,
            subtotal: itemSubtotal,
            selectedModifiers: validatedModifiers,
            specialInstructions: item.specialInstructions ?? null,
          });
        }
        if (hasItemError) continue;

        // ── 5. Hitung final ───────────────────────────────────────────
        const discountAmount = Math.round((subtotal * payload.discountPercent) / 100);
        const taxable = subtotal - discountAmount;
        const taxAmount = Math.round((taxable * payload.taxPercent) / 100);
        const grandTotal = taxable + taxAmount;

        // ── 6. Generate order number ───────────────────────────────────
        const now = new Date();
        const pad = (n: number, d = 2) => String(n).padStart(d, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const prefix = `ORD-${dateStr}-`;
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const count = await prisma.order.count({ where: { tenantId, createdAt: { gte: startOfDay } } });
        const orderNumber = `${prefix}${String(count + 1).padStart(4, '0')}`;

        // ── 7. Simpan ke DB ────────────────────────────────────────────
        const order = await prisma.$transaction(async (tx) => {
          return tx.order.create({
            data: {
              tenantId,
              orderNumber,
              source: 'CASHIER',
              orderType: payload.orderType,
              tableId: payload.tableId ?? null,
              tableNumber: resolvedTableLabel,
              status: 'PENDING',
              paymentStatus: 'UNPAID',
              subtotal,
              taxTotal: taxAmount,
              discountTotal: discountAmount,
              grandTotal,
              createdById: dbUser.id,
              offlineId,
              deviceId: payload.deviceId ?? null,
              syncedAt: new Date(),
              orderItems: {
                create: validatedItems.map((item, idx) => ({
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: item.subtotal,
                  selectedModifiers: item.selectedModifiers as any,
                  specialInstructions: item.specialInstructions,
                  sortOrder: idx,
                })),
              },
            },
            select: { id: true, orderNumber: true },
          });
        });

        results.push({
          offlineId,
          status: 'synced',
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } catch (itemErr: unknown) {
        const msg = itemErr instanceof Error ? itemErr.message : 'Error tidak diketahui';
        console.error(`[SYNC] offlineId=${offlineId} error:`, itemErr);
        results.push({ offlineId, status: 'error', error: msg });
      }
    }

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[SYNC ROUTE]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
