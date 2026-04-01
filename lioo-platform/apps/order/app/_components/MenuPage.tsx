'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  MenuCategory, MenuProduct, CartItem, SelectedModifier, OrderMode,
} from '../../lib/types';
import {
  buildCartKey, getEffectivePrice, calcTotals, formatRupiah,
} from '../../lib/types';
import { createCustomerOrder } from '../actions/orders';
import ModifierSheet from './ModifierSheet';
import CartDrawer from './CartDrawer';
import Image from 'next/image';

type Props = {
  tenantId: string;
  tableId?: string;
  tableLabel?: string;
  tenantSlug: string;
  mode: 'dine-in' | 'takeaway';
  categories: MenuCategory[];
  products: MenuProduct[];
  guestSessionId: string;
};

// ─── Product Card ─────────────────────────────────────────────────────────

function ProductCard({
  product,
  onTap,
}: {
  product: MenuProduct;
  onTap: (p: MenuProduct) => void;
}) {
  const price = getEffectivePrice(product);
  const hasPromo = product.promoPrice != null && product.promoPrice !== product.price;

  return (
    <button
      onClick={() => product.isAvailable && onTap(product)}
      disabled={!product.isAvailable}
      className={`flex gap-3 w-full text-left py-3 border-b border-[#F0F1EC] last:border-0 ${
        !product.isAvailable ? 'opacity-40' : 'active:bg-[#F7F9F5]'
      }`}
    >
      {product.imageUrl ? (
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F1EC]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-[#E8EBE4] flex-shrink-0 flex items-center justify-center text-2xl">
          🍽️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1C19] leading-snug">{product.name}</p>
        {product.description && (
          <p className="text-xs text-[#787868] mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-[#2C4F1B]">{formatRupiah(price)}</span>
          {hasPromo && (
            <span className="text-xs text-[#787868] line-through">{formatRupiah(product.price)}</span>
          )}
        </div>
      </div>
      {product.isAvailable && (
        <div className="flex-shrink-0 self-center w-7 h-7 rounded-full bg-[#2C4F1B] flex items-center justify-center text-white text-lg font-light">
          +
        </div>
      )}
    </button>
  );
}

// ─── Main MenuPage ─────────────────────────────────────────────────────────

export default function MenuPage({
  tenantId, tableId, tableLabel, tenantSlug, mode,
  categories, products, guestSessionId,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modifierProduct, setModifierProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filter produk ──
  const displayedProducts = useMemo(() => {
    let filtered = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    } else if (activeCategory) {
      filtered = filtered.filter((p) => p.categoryId === activeCategory);
    }
    return filtered;
  }, [products, search, activeCategory]);

  // ── Cart helpers ──
  const addToCart = useCallback((
    product: MenuProduct,
    selectedModifiers: SelectedModifier[],
    qty: number,
    instructions?: string
  ) => {
    const key = buildCartKey(product.id, selectedModifiers);
    const basePrice = getEffectivePrice(product);
    const modifiersTotal = selectedModifiers.reduce((s, m) => s + m.price, 0);
    const unitPrice = basePrice + modifiersTotal;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.cartKey === key);
      if (idx >= 0) {
        return prev.map((i, j) =>
          j !== idx ? i : { ...i, quantity: i.quantity + qty, subtotal: i.unitPrice * (i.quantity + qty) }
        );
      }
      return [
        ...prev,
        {
          cartKey: key,
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          basePrice,
          modifiersTotal,
          unitPrice,
          quantity: qty,
          subtotal: unitPrice * qty,
          selectedModifiers,
          specialInstructions: instructions,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.cartKey !== key ? i : {
          ...i,
          quantity: i.quantity + delta,
          subtotal: i.unitPrice * (i.quantity + delta),
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  function handleProductTap(product: MenuProduct) {
    if (product.modifierGroups.length > 0) {
      setModifierProduct(product);
    } else {
      addToCart(product, [], 1);
    }
  }

  // ── Submit order ──
  async function handleSubmitOrder(payload: {
    orderMode: OrderMode;
    customerName?: string;
    customerPhone?: string;
    deliveryType?: 'TAKEAWAY' | 'DELIVERY';
    deliveryAddress?: string;
  }) {
    setIsPending(true);
    setError(null);
    try {
      const result = await createCustomerOrder({
        tenantId,
        tableId: tableId ?? null,
        guestSessionId,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedModifiers: i.selectedModifiers,
          specialInstructions: i.specialInstructions,
        })),
        orderMode: payload.orderMode,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        deliveryType: payload.deliveryType,
        deliveryAddress: payload.deliveryAddress,
      });

      if (result.success) {
        const base = tableId
          ? `/t/${encodeURIComponent(result.tableToken ?? '')}`
          : `/o/${tenantSlug}`;

        if (payload.orderMode === 'PAY_NOW') {
          // Redirect ke halaman polling QRIS
          window.location.href = `${base}/paying?orderId=${result.orderId}`;
        } else {
          // PAY_AT_COUNTER: langsung ke konfirmasi dengan kode
          const qs = new URLSearchParams({
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            mode: payload.orderMode,
            ...(result.publicOrderCode ? { code: result.publicOrderCode } : {}),
            grandTotal: String(result.grandTotal),
          }).toString();
          window.location.href = `${base}/confirmation?${qs}`;
        }
      } else {
        setError(result.error);
      }
    } finally {
      setIsPending(false);
    }
  }

  const totals = calcTotals(cart);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F9FAF5] pb-28">
      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-[#EDEEE9]">
        <div className="relative max-w-lg mx-auto">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787868]"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Cari menu…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setActiveCategory(''); }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#F3F4EF] rounded-xl text-sm text-[#1A1C19] placeholder:text-[#787868] focus:outline-none focus:ring-2 focus:ring-[#2C4F1B]/20"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && categories.length > 0 && (
        <div className="bg-white border-b border-[#EDEEE9] overflow-x-auto">
          <div className="flex gap-1 px-4 py-2 max-w-lg mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#2C4F1B] text-white'
                    : 'bg-[#F3F4EF] text-[#43493E] hover:bg-[#EDEEE9]'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="max-w-lg mx-auto px-4 pt-2">
        {displayedProducts.length === 0 ? (
          <div className="text-center py-16 text-[#787868]">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Tidak ada menu yang cocok</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm px-4 divide-y-0">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onTap={handleProductTap} />
            ))}
          </div>
        )}
      </div>

      {/* Modifier sheet */}
      {modifierProduct && (
        <ModifierSheet
          product={modifierProduct}
          onConfirm={(mods, qty, instructions) => {
            addToCart(modifierProduct, mods, qty, instructions);
            setModifierProduct(null);
          }}
          onClose={() => setModifierProduct(null)}
        />
      )}

      {/* Floating cart bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-30">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-[0_8px_24px_rgba(44,79,27,0.25)]"
            >
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {itemCount}
              </span>
              <span className="font-bold text-sm">Lihat Keranjang</span>
              <span className="font-bold text-sm">{formatRupiah(totals.grandTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          totals={totals}
          mode={mode}
          tableLabel={tableLabel}
          onUpdateQty={updateQty}
          onClose={() => setCartOpen(false)}
          onSubmit={(payload) => handleSubmitOrder(payload)}
          isPending={isPending}
          error={error}
        />
      )}
    </div>
  );
}
