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
import { calcCartTotals, buildCartKey, getEffectivePrice } from '../../../lib/types';
import { createOrder } from '../../actions/orders';
import { saveOrderToQueue, useCacheMenu, getDeviceId } from '../../../lib/use-offline-order';
import CatalogPanel from './CatalogPanel';
import CartPanel from './CartPanel';
import ModifierSheet from './ModifierSheet';
import OrderSuccessModal from './OrderSuccessModal';
import type { PaymentOrderSummary } from './PaymentFlow';

type Props = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  tables: TableOption[];
  taxPercent: number;
  tenantId: string;
};

const baseInitialCart = (tax: number): CartState => ({
  items: [],
  orderType: 'DINE_IN',
  tableId: null,
  tableLabel: null,
  taxPercent: tax,
  discountPercent: 0,
  customerName: '',
});

export default function POSTerminal({ categories, products, tables, taxPercent, tenantId }: Props) {
  const [menuCategories, setMenuCategories] = useState(categories);
  const [menuProducts, setMenuProducts] = useState(products);
  const [menuTables, setMenuTables] = useState(tables);

  const [cart, setCart] = useState<CartState>(() => baseInitialCart(taxPercent));
  const [modifierProduct, setModifierProduct] = useState<CatalogProduct | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: string } | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { saveCache, loadFromCache } = useCacheMenu();

  useEffect(() => {
    setMenuCategories(categories);
    setMenuProducts(products);
    setMenuTables(tables);
  }, [categories, products, tables]);

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

  useEffect(() => {
    if (isOnline && tenantId) {
      saveCache(tenantId, categories, products, tables).catch(console.warn);
    }
  }, [isOnline, tenantId, categories, products, tables, saveCache]);

  useEffect(() => {
    if (isOnline || typeof window === 'undefined') return;
    loadFromCache(tenantId).then((snap) => {
      if (!snap) return;
      setMenuCategories(
        snap.categories.map(({ tenantId: _t, sortOrder: _s, ...c }) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
        }))
      );
      setMenuProducts(
        snap.products.map(({ tenantId: _t, cachedAt: _c, ...p }) => p as CatalogProduct)
      );
      setMenuTables(snap.tables.map(({ tenantId: _t, ...t }) => t));
    });
  }, [isOnline, tenantId, loadFromCache]);

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
    setCart(baseInitialCart(taxPercent));
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

  function handleSubmit() {
    setError(null);

    if (cart.items.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }

    if (!isOnline) {
      startTransition(async () => {
        try {
          const offlineId = await saveOrderToQueue({ cart, tenantId });
          setSuccessOrder({
            orderNumber: `OFFLINE-${offlineId.slice(0, 8).toUpperCase()}`,
          });
          clearCart();
        } catch {
          setError('Gagal menyimpan pesanan lokal. Coba lagi.');
        }
      });
      return;
    }

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
        customerName: cart.customerName.trim() || null,
        deviceId,
      });

      if (result.success) {
        const totals = calcCartTotals(cart);
        const cust = cart.customerName.trim() || null;
        clearCart();
        setPaymentOrder({
          id: result.orderId,
          orderNumber: result.orderNumber,
          grandTotal: totals.grandTotal,
          customerName: cust,
        });
      } else {
        setError(result.error);
      }
    });
  }

  const totals = calcCartTotals(cart);

  return (
    <>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <CatalogPanel categories={menuCategories} products={menuProducts} onProductTap={handleProductTap} />
        </div>

        <div
          style={{
            width: '24rem',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid var(--color-surface-container, #E0E4DA)',
          }}
        >
          <CartPanel
            cart={cart}
            totals={totals}
            tables={menuTables}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            onSetOrderType={setOrderType}
            onSetTable={setTable}
            onSetDiscount={setDiscountPercent}
            onCustomerNameChange={(v) => setCart((c) => ({ ...c, customerName: v }))}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
            onClearError={() => setError(null)}
            paymentOrder={paymentOrder}
            onPaymentClose={() => setPaymentOrder(null)}
            onPaymentDone={() => setPaymentOrder(null)}
          />
        </div>
      </div>

      {modifierProduct && (
        <ModifierSheet
          product={modifierProduct}
          onConfirm={handleModifierConfirm}
          onClose={() => setModifierProduct(null)}
        />
      )}

      {successOrder && (
        <OrderSuccessModal
          orderNumber={successOrder.orderNumber}
          onClose={() => setSuccessOrder(null)}
          onNewOrder={() => setSuccessOrder(null)}
        />
      )}
    </>
  );
}
