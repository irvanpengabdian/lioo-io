// ─────────────────────────────────────────────
// Domain types for POS terminal (client-side)
// ─────────────────────────────────────────────

export type SelectedModifier = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  /** Unique key per line in the cart (productId + modifier fingerprint) */
  cartKey: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  /** Effective unit price BEFORE modifiers */
  basePrice: number;
  /** Sum of selected modifier prices */
  modifiersTotal: number;
  /** basePrice + modifiersTotal */
  unitPrice: number;
  quantity: number;
  /** (unitPrice) × quantity */
  subtotal: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
};

export type OrderType = 'DINE_IN' | 'TAKEAWAY';

export type CartState = {
  items: CartItem[];
  orderType: OrderType;
  tableId: string | null;
  tableLabel: string | null;
  taxPercent: number;   // e.g. 11 for PPN 11%
  discountPercent: number;
  /** Nama pelanggan (opsional, untuk struk / panggilan) */
  customerName: string;
};

// ─────────────────────────────────────────────
// Catalog types (passed from server → client)
// ─────────────────────────────────────────────

export type ModifierOption = {
  id: string;
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: ModifierOption[];
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promoPrice: number | null;
  promoValidUntil: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string;
  modifierGroups: ModifierGroup[];
};

export type CatalogCategory = {
  id: string;
  name: string;
  icon: string | null;
};

export type TableOption = {
  id: string;
  label: string;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getEffectivePrice(product: CatalogProduct): number {
  if (
    product.promoPrice !== null &&
    product.promoPrice > 0 &&
    (product.promoValidUntil === null || new Date(product.promoValidUntil) > new Date())
  ) {
    return product.promoPrice;
  }
  return product.price;
}

export function buildCartKey(productId: string, modifiers: SelectedModifier[]): string {
  const modKey = modifiers
    .map((m) => m.id)
    .sort()
    .join(',');
  return `${productId}::${modKey}`;
}

export function calcCartTotals(cart: CartState): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  itemCount: number;
} {
  const subtotal = cart.items.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = (subtotal * cart.discountPercent) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * cart.taxPercent) / 100;
  const grandTotal = taxable + taxAmount;
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  return { subtotal, taxAmount, discountAmount, grandTotal, itemCount };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
