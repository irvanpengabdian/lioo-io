'use server';

import { prisma, ROLE_PERMISSIONS } from '@repo/database';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import type { CartItem, OrderType, SelectedModifier } from '../../lib/types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type CreateOrderInput = {
  items: {
    productId: string;
    quantity: number;
    selectedModifiers: SelectedModifier[];
    specialInstructions?: string;
  }[];
  orderType: OrderType;
  tableId?: string | null;
  taxPercent: number;
  discountPercent: number;
  /** optional: from offline PWA */
  offlineId?: string;
  deviceId?: string;
};

export type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

// ─────────────────────────────────────────────
// Order number generator
// Format: ORD-YYYYMMDD-XXXX  (XXXX = 4-digit sequence per day per tenant)
// ─────────────────────────────────────────────

async function generateOrderNumber(tenantId: string): Promise<string> {
  const now = new Date();
  const pad = (n: number, d = 2) => String(n).padStart(d, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const prefix = `ORD-${dateStr}-`;

  // Count today's orders to determine sequence
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.order.count({
    where: {
      tenantId,
      createdAt: { gte: startOfDay },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

// ─────────────────────────────────────────────
// Create Order
// ─────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    // 1. Auth
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return { success: false, error: 'Sesi berakhir. Silakan login ulang.' };
    }
    const kindeUser = await getUser();
    if (!kindeUser?.id) return { success: false, error: 'Sesi tidak valid.' };

    const dbUser = await prisma.user.findUnique({
      where: { id: kindeUser.id },
      include: { tenant: true },
    });

    if (!dbUser?.tenantId || !dbUser.tenant) {
      return { success: false, error: 'Akun tidak terhubung ke toko.' };
    }

    if (!ROLE_PERMISSIONS.accessPOS(dbUser.role)) {
      return { success: false, error: 'Role tidak memiliki izin membuat order.' };
    }

    const tenantId = dbUser.tenantId;

    // 2. Validasi input dasar
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Keranjang kosong.' };
    }
    if (!['DINE_IN', 'TAKEAWAY'].includes(input.orderType)) {
      return { success: false, error: 'Tipe order tidak valid.' };
    }
    if (input.taxPercent < 0 || input.taxPercent > 100) {
      return { success: false, error: 'Persentase pajak tidak valid.' };
    }
    if (input.discountPercent < 0 || input.discountPercent > 100) {
      return { success: false, error: 'Persentase diskon tidak valid.' };
    }

    // 3. Validasi meja jika dine-in
    let resolvedTableLabel: string | null = null;
    if (input.orderType === 'DINE_IN' && input.tableId) {
      const table = await prisma.table.findFirst({
        where: { id: input.tableId, tenantId, isActive: true },
        select: { label: true },
      });
      if (!table) {
        return { success: false, error: 'Meja tidak ditemukan atau tidak aktif.' };
      }
      resolvedTableLabel = table.label;
    }

    // 4. Server-side price validation
    //    Re-fetch semua produk dari DB — jangan pernah percaya harga dari client
    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId, isAvailable: true },
      include: {
        modifierGroups: {
          include: { modifiers: true },
        },
      },
    });

    if (dbProducts.length !== productIds.length) {
      const foundIds = dbProducts.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      return {
        success: false,
        error: `Produk tidak tersedia: ${missing.join(', ')}`,
      };
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 5. Build validated line items
    type ValidatedItem = {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      selectedModifiers: SelectedModifier[];
      specialInstructions: string | undefined;
    };

    const validatedItems: ValidatedItem[] = [];
    let subtotal = 0;

    for (const item of input.items) {
      if (item.quantity < 1) {
        return { success: false, error: 'Jumlah item harus minimal 1.' };
      }

      const product = productMap.get(item.productId)!;

      // Effective base price (promo jika masih berlaku)
      let basePrice = product.price;
      if (
        product.promoPrice !== null &&
        product.promoPrice > 0 &&
        (product.promoValidUntil === null || product.promoValidUntil > new Date())
      ) {
        basePrice = product.promoPrice;
      }

      // Validate & sum modifiers
      let modifiersTotal = 0;
      const validatedModifiers: SelectedModifier[] = [];

      const allModifierIds = new Set(
        product.modifierGroups.flatMap((g) => g.modifiers.map((m) => m.id))
      );
      const modifierPriceMap = new Map(
        product.modifierGroups.flatMap((g) =>
          g.modifiers.map((m) => [m.id, { name: m.name, price: m.price }])
        )
      );

      for (const sel of item.selectedModifiers) {
        if (!allModifierIds.has(sel.id)) {
          return {
            success: false,
            error: `Modifier '${sel.name}' tidak valid untuk produk ${product.name}.`,
          };
        }
        const dbMod = modifierPriceMap.get(sel.id)!;
        modifiersTotal += dbMod.price;
        validatedModifiers.push({ id: sel.id, name: dbMod.name, price: dbMod.price });
      }

      // Validate required modifier groups
      for (const group of product.modifierGroups) {
        if (!group.isRequired) continue;
        const selectedInGroup = validatedModifiers.filter((m) =>
          group.modifiers.some((gm) => gm.id === m.id)
        );
        if (selectedInGroup.length < group.minSelect) {
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
        specialInstructions: item.specialInstructions,
      });
    }

    // 6. Kalkulasi final
    const discountAmount = Math.round((subtotal * input.discountPercent) / 100);
    const taxable = subtotal - discountAmount;
    const taxAmount = Math.round((taxable * input.taxPercent) / 100);
    const grandTotal = taxable + taxAmount;

    // 7. Idempotency check (offline sync)
    if (input.offlineId) {
      const existing = await prisma.order.findFirst({
        where: { tenantId, offlineId: input.offlineId },
        select: { id: true, orderNumber: true },
      });
      if (existing) {
        return { success: true, orderId: existing.id, orderNumber: existing.orderNumber };
      }
    }

    // 8. Generate order number & persist
    const orderNumber = await generateOrderNumber(tenantId);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          source: 'CASHIER',
          orderType: input.orderType,
          tableId: input.tableId ?? null,
          tableNumber: resolvedTableLabel,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          subtotal,
          taxTotal: taxAmount,
          discountTotal: discountAmount,
          grandTotal,
          createdById: dbUser.id,
          offlineId: input.offlineId ?? null,
          deviceId: input.deviceId ?? null,
          syncedAt: input.offlineId ? new Date() : null,
          orderItems: {
            create: validatedItems.map((item, idx) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              selectedModifiers: item.selectedModifiers as any,
              specialInstructions: item.specialInstructions ?? null,
              sortOrder: idx,
            })),
          },
        },
        select: { id: true, orderNumber: true },
      });
      return newOrder;
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: unknown) {
    console.error('[CREATE ORDER]', error);
    const msg = error instanceof Error ? error.message : 'Internal server error.';
    return { success: false, error: msg };
  }
}
