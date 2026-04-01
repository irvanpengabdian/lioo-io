'use server';

import { prisma } from '@repo/database';
import type { SelectedModifier, OrderMode } from '../../lib/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CreateCustomerOrderInput = {
  tenantId: string;
  tableId: string | null;
  guestSessionId: string;
  items: {
    productId: string;
    quantity: number;
    selectedModifiers: SelectedModifier[];
    specialInstructions?: string;
  }[];
  orderMode: OrderMode;
  customerName?: string;
};

export type CreateCustomerOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      publicOrderCode: string | null;
      grandTotal: number;
      tableToken?: string;
      payMode: OrderMode;
    }
  | { success: false; error: string };

// ─── publicOrderCode generator (6 char alphanumeric uppercase) ─────────────
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter ambigu

async function generatePublicOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    const exists = await prisma.order.findFirst({
      where: { publicOrderCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error('Gagal generate kode order unik');
}

// ─── Order number generator (sama pola dengan POS) ─────────────────────────
async function generateOrderNumber(tenantId: string): Promise<string> {
  const now = new Date();
  const pad = (n: number, d = 2) => String(n).padStart(d, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const count = await prisma.order.count({
    where: { tenantId, createdAt: { gte: startOfDay } },
  });
  return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
}

// ─── Main action ────────────────────────────────────────────────────────────

export async function createCustomerOrder(
  input: CreateCustomerOrderInput
): Promise<CreateCustomerOrderResult> {
  try {
    const { tenantId, tableId, guestSessionId, items, orderMode, customerName } = input;

    // 1. Validasi input dasar
    if (!tenantId || !guestSessionId) {
      return { success: false, error: 'Sesi tidak valid.' };
    }
    if (!items || items.length === 0) {
      return { success: false, error: 'Keranjang kosong.' };
    }

    // 2. Verifikasi tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) return { success: false, error: 'Outlet tidak ditemukan.' };

    // 3. Verifikasi meja (dine-in)
    let resolvedTableLabel: string | null = null;
    let tableToken: string | undefined;
    if (tableId) {
      const table = await prisma.table.findFirst({
        where: { id: tableId, tenantId, isActive: true },
        select: { label: true, qrToken: true },
      });
      if (!table) return { success: false, error: 'Meja tidak ditemukan atau tidak aktif.' };
      resolvedTableLabel = table.label;
      tableToken = table.qrToken;
    }

    // 4. Server-side price validation (jangan percaya harga dari client)
    const productIds = [...new Set(items.map((i) => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId, isAvailable: true },
      include: {
        modifierGroups: { include: { modifiers: true } },
      },
    });

    const unavailable = productIds.filter((id) => !dbProducts.some((p) => p.id === id));
    if (unavailable.length > 0) {
      return { success: false, error: `Produk tidak tersedia: ${unavailable.join(', ')}` };
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    type ValidatedItem = {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      selectedModifiers: SelectedModifier[];
      specialInstructions: string | null;
    };

    const validatedItems: ValidatedItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      let basePrice = product.price;
      if (
        product.promoPrice != null &&
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
      const validatedModifiers: SelectedModifier[] = [];

      for (const sel of item.selectedModifiers) {
        if (!allModifierIds.has(sel.id)) {
          return { success: false, error: `Modifier tidak valid untuk ${product.name}.` };
        }
        const mod = modifierPriceMap.get(sel.id)!;
        modifiersTotal += mod.price;
        validatedModifiers.push({ id: sel.id, name: mod.name, price: mod.price });
      }

      // Cek required modifier groups
      for (const group of product.modifierGroups) {
        if (!group.isRequired) continue;
        const selected = validatedModifiers.filter((m) =>
          group.modifiers.some((gm) => gm.id === m.id)
        ).length;
        if (selected < group.minSelect) {
          return {
            success: false,
            error: `${product.name}: modifier "${group.name}" wajib dipilih.`,
          };
        }
      }

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

    // 5. Hitung total (PPN 11%, tanpa diskon untuk portal pelanggan)
    const taxTotal = Math.round((subtotal * 11) / 100);
    const grandTotal = subtotal + taxTotal;

    // 6. Generate kode & nomor order
    const orderNumber = await generateOrderNumber(tenantId);
    const publicOrderCode =
      orderMode === 'PAY_AT_COUNTER' ? await generatePublicOrderCode() : null;

    // 7. Simpan ke DB
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          tenantId,
          orderNumber,
          source: 'CUSTOMER_APP',
          orderType: tableId ? 'DINE_IN' : 'TAKEAWAY',
          tableId: tableId ?? null,
          tableNumber: resolvedTableLabel,
          guestSessionId,
          customerName: customerName ?? null,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          subtotal,
          taxTotal,
          discountTotal: 0,
          grandTotal,
          publicOrderCode,
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
        select: { id: true, orderNumber: true, publicOrderCode: true, grandTotal: true },
      });
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      publicOrderCode: order.publicOrderCode,
      grandTotal: order.grandTotal,
      tableToken,
      payMode: orderMode,
    };
  } catch (err: unknown) {
    console.error('[createCustomerOrder]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan server.',
    };
  }
}
