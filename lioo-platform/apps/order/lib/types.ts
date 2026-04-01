// ─── Catalog types (server → client) ──────────────────────────────────────

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
  options: ModifierOption[];
};

export type MenuProduct = {
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

export type MenuCategory = {
  id: string;
  name: string;
  icon: string | null;
};

// ─── Cart types ────────────────────────────────────────────────────────────

export type SelectedModifier = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  cartKey: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  basePrice: number;
  modifiersTotal: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
};

export type OrderMode = 'PAY_NOW' | 'PAY_AT_COUNTER';

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getEffectivePrice(p: MenuProduct): number {
  if (p.promoPrice != null && p.promoPrice > 0) {
    if (!p.promoValidUntil || new Date(p.promoValidUntil) > new Date()) {
      return p.promoPrice;
    }
  }
  return p.price;
}

export function buildCartKey(productId: string, modifiers: SelectedModifier[]): string {
  return `${productId}::${modifiers.map((m) => m.id).sort().join(',')}`;
}

export function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const tax = Math.round((subtotal * 11) / 100); // PPN 11%
  return { subtotal, tax, grandTotal: subtotal + tax };
}

export function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}
