'use client';

import { useState, useTransition, useEffect } from 'react';
import type {
  CatalogCategory,
  CatalogProduct,
  CartState,
  CartItem,
  TableOption,
  SelectedModifier,
  OrderType,
} from '../../../lib/types';
import {
  calcCartTotals,
  buildCartKey,
  getEffectivePrice,
} from '../../../lib/types';
import { createOrder } from '../../actions/orders';
import { saveOrderToQueue, useCacheMenu, getDeviceId } from '../../../lib/use-offline-order';
import CatalogPanel from './CatalogPanel';
import CartPanel from './CartPanel';
import ModifierSheet from './ModifierSheet';
import OrderSuccessModal from './OrderSuccessModal';
import PaymentModal from './PaymentModal';

type Props = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  tables: TableOption[];
  taxPercent: number;
  tenantId: string;
};

const INITIAL_CART: CartState = {
  items: [],
  orderType: 'DINE_IN',
  tableId: null,
  tableLabel: null,
  taxPercent: 11,
  discountPercent: 0,
};

export default function POSTerminal({ categories, products, tables, taxPercent, tenantId }: Props) {
  const [cart, setCart] = useState<CartState>({ ...INITIAL_CART, taxPercent });
  const [modifierProduct, setModifierProduct] = useState<CatalogProduct | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    orderNumber: string;
    grandTotal: number;
    isOffline?: boolean;
  } | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<{
    id: string;
    orderNumber: string;
    grandTotal: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { saveCache } = useCacheMenu();

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Cache menu snapshot saat pertama load (jika online)
  useEffect(() => {
    if (isOnline && tenantId) {
      saveCache(tenantId, categories, products, tables).catch(console.warn);
    }
  }, [isOnline, tenantId, categories, products, tables, saveCache]);

  // ── Cart helpers ──

  function addToCart(
    product: CatalogProduct,
    selectedModifiers: SelectedModifier[],
    qty: number,
    instructions?: string
  ) {
    const cartKey = buildCartKey(product.id, selectedModifiers);
    const basePrice = getEffectivePrice(product);
    const modifiersTotal = selectedModifiers.reduce((s, m) => s + m.price, 0);
    const unitPrice = basePrice + modifiersTotal;

    setCart((prev) => {
      const existing = prev.items.findIndex((i) => i.cartKey === cartKey);
      if (existing >= 0) {
        const updated = prev.items.map((item, idx) => {
          if (idx !== existing) return item;
          const newQty = item.quantity + qty;
          return { ...item, quantity: newQty, subtotal: item.unitPrice * newQty };
        });
        return { ...prev, items: updated };
      }

      const newItem: CartItem = {
        cartKey,
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
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  }

  function removeFromCart(cartKey: string) {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.cartKey !== cartKey),
    }));
  }

  function updateQty(cartKey: string, delta: number) {
    setCart((prev) => {
      const updated = prev.items
        .map((i) => {
          if (i.cartKey !== cartKey) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          return { ...i, quantity: newQty, subtotal: i.unitPrice * newQty };
        })
        .filter(Boolean) as CartItem[];
      return { ...prev, items: updated };
    });
  }

  function clearCart() {
    setCart({ ...INITIAL_CART, taxPercent });
  }

  function setOrderType(orderType: OrderType) {
    setCart((prev) => ({
      ...prev,
      orderType,
      tableId: orderType === 'TAKEAWAY' ? null : prev.tableId,
      tableLabel: orderType === 'TAKEAWAY' ? null : prev.tableLabel,
    }));
  }

  function setTable(tableId: string, tableLabel: string) {
    setCart((prev) => ({ ...prev, tableId, tableLabel }));
  }

  function setDiscountPercent(v: number) {
    setCart((prev) => ({ ...prev, discountPercent: v }));
  }

  // ── Modifier sheet ──

  function handleProductTap(product: CatalogProduct) {
    if (!product.isAvailable) return;
    if (product.modifierGroups.length > 0) {
      setModifierProduct(product);
    } else {
      addToCart(product, [], 1);
    }
  }

  function handleModifierConfirm(
    product: CatalogProduct,
    selectedModifiers: SelectedModifier[],
    qty: number,
    instructions?: string
  ) {
    addToCart(product, selectedModifiers, qty, instructions);
    setModifierProduct(null);
  }

  // ── Submit order ──

  function handleSubmit() {
    setError(null);

    if (cart.items.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }
    if (cart.orderType === 'DINE_IN' && tables.length > 0 && !cart.tableId) {
      setError('Pilih nomor meja terlebih dahulu.');
      return;
    }

    // Offline mode: simpan ke IndexedDB queue
    if (!isOnline) {
      startTransition(async () => {
        try {
          const offlineId = await saveOrderToQueue({ cart, tenantId });
          setSuccessOrder({
            orderId: offlineId,
            orderNumber: `OFFLINE-${offlineId.slice(0, 8).toUpperCase()}`,
            grandTotal: totals.grandTotal,
            isOffline: true,
          });
          clearCart();
        } catch (e) {
          setError('Gagal menyimpan pesanan lokal. Coba lagi.');
        }
      });
      return;
    }

    // Online mode: kirim langsung ke server
    startTransition(async () => {
      const deviceId = getDeviceId();
      const result = await createOrder({
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers,
          specialInstructions: item.specialInstructions,
        })),
        orderType: cart.orderType,
        tableId: cart.tableId,
        taxPercent: cart.taxPercent,
        discountPercent: cart.discountPercent,
        deviceId,
      });

      if (result.success) {
        setSuccessOrder({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          grandTotal: totals.grandTotal,
          isOffline: false,
        });
        clearCart();
      } else {
        setError(result.error);
      }
    });
  }

  const totals = calcCartTotals(cart);

  return (
    <>
      {/* 2-Panel layout: catalog left, cart right */}
      <div className="flex h-full overflow-hidden">
        {/* Left: catalog */}
        <div className="flex-1 min-w-0 overflow-hidden border-r border-[#EDEEE9]">
          <CatalogPanel
            categories={categories}
            products={products}
            onProductTap={handleProductTap}
          />
        </div>

        {/* Right: cart (fixed width) */}
        <div className="w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col overflow-hidden bg-white">
          <CartPanel
            cart={cart}
            totals={totals}
            tables={tables}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            onSetOrderType={setOrderType}
            onSetTable={setTable}
            onSetDiscount={setDiscountPercent}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
            onClearError={() => setError(null)}
          />
        </div>
      </div>

      {/* Modifier bottom sheet */}
      {modifierProduct && (
        <ModifierSheet
          product={modifierProduct}
          onConfirm={handleModifierConfirm}
          onClose={() => setModifierProduct(null)}
        />
      )}

      {/* Success modal */}
      {successOrder && !paymentOrder && (
        <OrderSuccessModal
          orderNumber={successOrder.orderNumber}
          orderId={successOrder.orderId}
          grandTotal={successOrder.grandTotal}
          isOffline={successOrder.isOffline}
          onClose={() => setSuccessOrder(null)}
          onNewOrder={() => setSuccessOrder(null)}
          onPayNow={() => {
            if (successOrder.isOffline) return;
            setPaymentOrder({
              id: successOrder.orderId,
              orderNumber: successOrder.orderNumber,
              grandTotal: successOrder.grandTotal,
            });
            setSuccessOrder(null);
          }}
        />
      )}

      {/* Payment modal */}
      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onPaid={() => setPaymentOrder(null)}
        />
      )}
    </>
  );
}
