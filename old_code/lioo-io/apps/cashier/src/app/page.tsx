'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  fetchCategories, fetchOrders, createOrder, updateOrderStatus,
  type Category, type Product, type Order,
} from '@/lib/api';
import { io } from 'socket.io-client';

/* ─────────────────────── Types ─────────────────────── */
interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

type ViewMode = 'pos' | 'orders';
type PayMethod = 'CASH' | 'DEBIT' | 'QRIS';

/* ─────────────────────── Toast ─────────────────────── */
function useToast() {
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }, []);
  return { msg, show };
}

/* ═══════════════════ MAIN DASHBOARD ═══════════════════ */
export default function CashierDashboard() {
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [cart,          setCart]          = useState<CartItem[]>([]);
  const [tableNumber,   setTableNumber]   = useState('');
  const [customerName,  setCustomerName]  = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('QRIS');
  const [orderType,     setOrderType]     = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY');
  const [loading,       setLoading]       = useState(true);
  const [processing,    setProcessing]    = useState(false);
  const [viewMode,      setViewMode]      = useState<ViewMode>('pos');
  const [sidebarNav,    setSidebarNav]    = useState('dashboard');
  const { msg: toast, show: showToast }  = useToast();

  // ── Cash modal state ──
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashReceived,  setCashReceived]  = useState('');
  // Last completed order — for receipt printing
  const [lastOrder, setLastOrder] = useState<{ id: string; tableNumber: string; customerName: string; items: CartItem[]; subtotal: number; tax: number; total: number; paymentMethod: PayMethod; cashReceived?: number; change?: number } | null>(null);

  const branchId = process.env.NEXT_PUBLIC_BRANCH_ID ?? '';
  const searchRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    Promise.all([fetchCategories(), fetchOrders()])
      .then(([cats, ords]) => { setCategories(cats); setOrders(ords); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Websocket / Real-time Integration ──
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(API_URL);

    socket.on('orderCreated', (newOrder: Order) => {
      // Add new order to the top if not exists
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      showToast(`🔔 Pesanan Baru Masuk: #${newOrder.id}`);
    });

    socket.on('orderStatusUpdated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    // Fallback refresh every 30s just to be safe
    const interval = setInterval(() => {
      fetchOrders().then(setOrders).catch(console.error);
    }, 30_000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut "/" to focus search
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Products
  const allProducts = categories.flatMap(c => c.products);
  const filteredProducts = (() => {
    let list = activeCategory === 'all'
      ? allProducts
      : (categories.find(c => c.id === activeCategory)?.products ?? []);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return list;
  })();

  // ── Cart logic ──
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      const nq = i.quantity + delta;
      return nq <= 0 ? i : { ...i, quantity: nq };
    }).filter(i => i.quantity > 0));
  }, []);

  const updateNotes = useCallback((productId: string, notes: string) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      return { ...i, notes };
    }));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]); setTableNumber(''); setCustomerName(''); setOrderType('TAKEAWAY');
  }, []);

  // Totals
  const subtotal = cart.reduce((sum, i) => {
    const ep = i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price;
    return sum + ep * i.quantity;
  }, 0);
  const tax   = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  // Pending/active orders count
  const activeOrderCount = orders.filter(o =>
    ['PENDING', 'PAID', 'COOKING'].includes(o.status)
  ).length;

  // ── Complete Payment ──
  // For CASH: open modal for uang diterima input first
  const handleCompletePayment = () => {
    if (cart.length === 0) return;
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      showToast('⚠️ Nomor meja wajib diisi untuk pesanan Dine-In!', 'error');
      return;
    }
    if (paymentMethod === 'CASH') {
      setCashReceived('');
      setShowCashModal(true);
    } else {
      submitPayment();
    }
  };

  // Actual API call — called from modal (CASH) or directly (DEBIT/QRIS)
  const submitPayment = async (cashAmt?: number) => {
    setProcessing(true);
    const snapCart = [...cart];
    try {
      const res = await createOrder({
        branch_id:      branchId,
        table_number:   orderType === 'DINE_IN' ? (tableNumber || undefined) : undefined,
        customer_name:  customerName || undefined,
        payment_method: paymentMethod,
        status:         'PAID',
        items: snapCart.map(i => ({
          product_id: i.product.id, quantity: i.quantity, notes: i.notes || undefined,
        })),
      });
      setOrders(prev => [res, ...prev]);
      // Save snapshot for receipt
      setLastOrder({
        id: res.id, tableNumber: orderType === 'DINE_IN' ? tableNumber : '', customerName, items: snapCart,
        subtotal, tax, total, paymentMethod,
        cashReceived: cashAmt,
        change: cashAmt != null ? cashAmt - total : undefined,
      });
      clearCart();
      setShowCashModal(false);
      showToast(`✅ Order ${res.id} berhasil — Total Rp ${total.toLocaleString('id-ID')}`);
      
      // Trigger receipt print sequence
      setTimeout(() => {
        window.print();
      }, 300);
    } catch (e: any) {
      showToast(`❌ Gagal: ${e?.response?.data?.message || e.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ── Update Order Status ──
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`✅ Status order ${orderId} diperbarui ke ${newStatus}`);
    } catch (e: any) {
      showToast(`❌ Gagal: ${e?.response?.data?.message || e.message}`, 'error');
    }
  };

  if (loading) return <LoadingSkeleton />;

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <>
      <div className="no-print" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface)' }}>

        {/* ━━━━━━━━━━━━━━━━━━  LEFT SIDEBAR  ━━━━━━━━━━━━━━━━━━ */}
      <aside style={{
        width: 260, display: 'flex', flexDirection: 'column',
        background: 'var(--surface-container-low)',
        borderRight: '1px solid rgba(194,201,187,0.2)',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="font-headline" style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>K</span>
            </div>
            <div>
              <h1 className="font-headline" style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.3px' }}>
                Lioo.io
              </h1>
              <p className="font-label" style={{ fontSize: 10, color: 'var(--on-surface-muted)', letterSpacing: '0.1em' }}>
                Terminal 01
              </p>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: 'dashboard', icon: 'dashboard',    label: 'Dashboard',      mode: 'pos' as ViewMode,    fill: 1 },
            { id: 'orders',    icon: 'receipt_long',  label: 'Pesanan Masuk',  mode: 'orders' as ViewMode, fill: 0, badge: activeOrderCount },
            { id: 'transactions', icon: 'payments',  label: 'Transactions' },
            { id: 'inventory',    icon: 'inventory_2', label: 'Inventory' },
            { id: 'settings',     icon: 'settings',  label: 'Settings' },
          ].map(nav => {
            const isActive = sidebarNav === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => {
                  setSidebarNav(nav.id);
                  if (nav.mode) setViewMode(nav.mode);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--primary-container)' : 'transparent',
                  color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                  fontFamily: 'Manrope', fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                  textAlign: 'left', transition: 'all 0.15s ease',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {nav.icon}
                </span>
                {nav.label}
                {nav.badge != null && nav.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--error)', color: '#fff',
                    fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                    fontFamily: 'Inter',
                  }}>
                    {nav.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Categories sub-nav */}
        {viewMode === 'pos' && (
          <div style={{ padding: '24px 12px 8px' }}>
            <p className="font-label" style={{
              padding: '0 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.15em', color: 'var(--on-surface-variant)', opacity: 0.5, marginBottom: 10,
            }}>
              Categories
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[{ id: 'all', name: 'All Menu' }, ...categories].map((c, idx) => {
                const colors = ['var(--primary)', 'var(--secondary-fixed)', 'var(--tertiary-fixed)', 'var(--primary-fixed)', 'var(--outline-variant)'];
                const dot = c.id === 'all' ? 'var(--primary)' : colors[(idx) % colors.length];
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: isActive ? 'var(--surface-container)' : 'transparent',
                      color: isActive ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                      fontFamily: 'Manrope', fontSize: 13, fontWeight: isActive ? 600 : 400,
                      textAlign: 'left', transition: 'all 0.12s ease',
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: dot, flexShrink: 0 }} />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Info */}
        <div style={{
          padding: 16, borderTop: '1px solid rgba(194,201,187,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-container)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 99,
            background: 'var(--primary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--on-primary)', fontWeight: 700, fontSize: 15,
            fontFamily: 'Plus Jakarta Sans',
          }}>
            K
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Kasir Kedai
            </p>
            <p className="font-label" style={{ fontSize: 10, color: 'var(--on-surface-variant)' }}>
              Shift A • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 20 }}>logout</span>
          </button>
        </div>
      </aside>

      {/* ━━━━━━━━━━━━━━━━━━  CENTER CONTENT  ━━━━━━━━━━━━━━━━━━ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-bright)' }}>

        {/* Top Header */}
        <header style={{
          height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid rgba(194,201,187,0.1)',
          background: 'var(--surface-bright)',
          flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-container)', borderRadius: 99, padding: '8px 18px', gap: 10, flex: '0 0 360px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 18 }}>search</span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search menu items (Shortcut: /)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'Inter', fontSize: 13, color: 'var(--on-surface)',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              width: 38, height: 38, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'var(--surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 20 }}>notifications</span>
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'var(--surface-container)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 20 }}>help</span>
            </button>
            <div style={{ width: 1, height: 24, background: 'var(--outline-variant)', margin: '0 4px' }} />
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              border: 'none', cursor: 'pointer', borderRadius: 8, background: 'none',
              color: 'var(--error)', fontFamily: 'Manrope', fontSize: 13, fontWeight: 500,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Logout
            </button>
          </div>
        </header>

        {/* Category Tabs (only in POS mode) */}
        {viewMode === 'pos' && (
          <div className="hide-scrollbar" style={{
            height: 56, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 32px', overflowX: 'auto',
            background: 'var(--surface-bright)',
            borderBottom: '1px solid rgba(194,201,187,0.08)',
            flexShrink: 0,
          }}>
            {[{ id: 'all', name: 'All Menu' }, ...categories].map(c => (
              <button
                key={c.id}
                className={`cat-pill ${activeCategory === c.id ? 'active' : 'inactive'}`}
                onClick={() => setActiveCategory(c.id)}
                style={activeCategory === c.id ? { borderBottom: '3px solid var(--primary)', borderRadius: '0', paddingBottom: '10px', fontWeight: 800 } : { fontWeight: 600, opacity: 0.7 }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        {viewMode === 'pos' ? (
          /* ── Product Grid ── */
          <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="font-headline" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>
                {activeCategory === 'all' ? 'Menu Favorites' : categories.find(c => c.id === activeCategory)?.name ?? ''}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  padding: '4px 14px', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)',
                  borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  fontFamily: 'Inter',
                }}>
                  {filteredProducts.length} items
                </span>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>search_off</span>
                <p style={{ fontWeight: 600 }}>Produk tidak ditemukan</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: 20,
              }}>
                {filteredProducts.map((p, idx) => {
                  const ep = p.is_promo && p.promo_price ? p.promo_price : p.price;
                  const inCart = cart.find(i => i.product.id === p.id);
                  return (
                    <button
                      key={p.id}
                      className="product-card"
                      onClick={() => addToCart(p)}
                      style={{
                        display: 'flex', flexDirection: 'column', textAlign: 'left',
                        background: 'var(--surface-container-lowest)', borderRadius: 24,
                        overflow: 'hidden', padding: 12,
                        border: inCart ? '2px solid var(--primary)' : '2px solid transparent',
                        position: 'relative',
                        boxShadow: inCart ? '0 0 0 3px rgba(21,66,18,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Image */}
                      <div style={{ aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', marginBottom: 14, position: 'relative', background: 'var(--surface-container)' }}>
                        {p.image_url ? (
                          <img
                            src={p.image_url} alt={p.name} loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🍃</div>
                        )}
                        {/* Shortcut badge */}
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                          padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: 'Inter',
                        }}>
                          F{idx + 1}
                        </div>
                        {/* Cart qty overlay */}
                        {inCart && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(21,66,18,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 99,
                              background: 'var(--primary)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans',
                            }}>
                              {inCart.quantity}
                            </div>
                          </div>
                        )}
                        {/* Promo badge */}
                        {p.is_promo && (
                          <span style={{
                            position: 'absolute', top: 10, left: 10,
                            background: 'var(--secondary)', color: '#fff',
                            fontSize: 8, fontWeight: 700, fontFamily: 'Inter',
                            padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>
                            PROMO
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '0 4px 4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <h3 className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
                            {p.name}
                          </h3>
                          <span className="font-headline" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                            Rp {ep.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {p.description && (
                          <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', lineHeight: 1.4, WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Orders View ── */
          <div className="custom-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="font-headline" style={{ fontSize: 26, fontWeight: 700 }}>Pesanan Masuk</h2>
              <button
                onClick={() => fetchOrders().then(setOrders)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: 'var(--surface-container)', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Manrope', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>receipt_long</span>
                <p style={{ fontWeight: 600 }}>Belum ada pesanan</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ━━━━━━━━━━━━━━━━━━  RIGHT PANEL  ━━━━━━━━━━━━━━━━━━ */}
      {viewMode === 'pos' && (
        <aside style={{
          width: 400, display: 'flex', flexDirection: 'column',
          background: 'var(--surface-container-low)',
          borderLeft: '1px solid rgba(194,201,187,0.2)',
          flexShrink: 0,
        }}>

          {/* Panel Header */}
          <div style={{
            height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', borderBottom: '1px solid rgba(194,201,187,0.1)',
            flexShrink: 0,
          }}>
            <div>
              <h2 className="font-headline" style={{ fontSize: 18, fontWeight: 700 }}>Current Order</h2>
              {cart.length > 0 && (
                <p className="font-label" style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginTop: 1 }}>
                  {cart.reduce((s, i) => s + i.quantity, 0)} item(s) selected
                </p>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  background: 'rgba(186,26,26,0.08)', color: 'var(--error)',
                  border: 'none', cursor: 'pointer', borderRadius: 99,
                  padding: '5px 14px', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter',
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Dine In / Takeaway Toggle */}
          <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8 }}>
             <button
                onClick={() => setOrderType('TAKEAWAY')}
                style={{
                   flex: 1, padding: '10px', borderRadius: 12, border: orderType === 'TAKEAWAY' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                   background: orderType === 'TAKEAWAY' ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                   color: orderType === 'TAKEAWAY' ? 'var(--on-primary-fixed)' : 'var(--on-surface-variant)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                   fontFamily: 'Manrope', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
             >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_bag</span>
                Takeaway
             </button>
             <button
                onClick={() => setOrderType('DINE_IN')}
                style={{
                   flex: 1, padding: '10px', borderRadius: 12, border: orderType === 'DINE_IN' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                   background: orderType === 'DINE_IN' ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                   color: orderType === 'DINE_IN' ? 'var(--on-primary-fixed)' : 'var(--on-surface-variant)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                   fontFamily: 'Manrope', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
                }}
             >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_dining</span>
                Dine-In
             </button>
          </div>

          {/* Table + Customer */}
          <div style={{ padding: '14px 24px', display: 'grid', gridTemplateColumns: orderType === 'DINE_IN' ? '1fr 1fr' : '1fr', gap: 12, flexShrink: 0 }}>
            {orderType === 'DINE_IN' && (
              <div>
                <label className="font-label" style={{ fontSize: 9, color: 'var(--on-surface-variant)', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>
                  Table No. <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '9px 14px', border: (!tableNumber.trim()) ? '1px solid rgba(186,26,26,0.5)' : '1px solid transparent' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)', marginRight: 8 }}>table_restaurant</span>
                  <input
                    type="text" placeholder="--" value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Manrope' }}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="font-label" style={{ fontSize: 9, color: 'var(--on-surface-variant)', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>
                Customer
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-container-lowest)', borderRadius: 12, padding: '9px 14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)', marginRight: 8 }}>person</span>
                <input
                  type="text" placeholder="Nama" value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Manrope' }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 8px' }}>
            {cart.length === 0 ? (
              /* Empty state */
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%',
                border: '2px dashed rgba(194,201,187,0.4)', borderRadius: 16,
                padding: '32px', textAlign: 'center', gap: 12,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)' }}>shopping_cart</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Add Order Notes</p>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>Tap a menu item to add it here...</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cart.map(item => {
                  const ep = item.product.is_promo && item.product.promo_price ? item.product.promo_price : item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px',
                        borderBottom: '1px solid rgba(194,201,187,0.12)',
                      }}
                    >
                      {/* Thumbnail */}
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url} alt={item.product.name}
                          style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                          <h4 className="font-body" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                            {item.product.name}
                          </h4>
                          <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                            Rp {(ep * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Tambahkan catatan..."
                          value={item.notes || ''}
                          onChange={(e) => updateNotes(item.product.id, e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--surface-container-lowest)',
                            border: '1px solid var(--outline-variant)',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 11,
                            color: 'var(--on-surface)',
                            fontFamily: 'Manrope',
                            marginBottom: 6,
                            outline: 'none',
                          }}
                        />
                        {/* Qty stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            style={{ width: 24, height: 24, borderRadius: 99, border: 'none', background: 'var(--surface-container)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>remove</span>
                          </button>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            style={{ width: 24, height: 24, borderRadius: 99, border: 'none', background: 'rgba(21,66,18,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>add</span>
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: 99, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--error)' }}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary + Payment */}
          <div style={{
            padding: 24,
            background: 'rgba(226,227,220,0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px 32px 0 0',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.05)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Subtotal</span>
                <span style={{ fontWeight: 700 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Tax (10%)</span>
                <span style={{ fontWeight: 700 }}>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div style={{
                paddingTop: 12, borderTop: '1px solid rgba(194,201,187,0.25)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span className="font-headline" style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                <span className="font-headline" style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment method buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {([
                { id: 'CASH'  as PayMethod, icon: 'payments',   label: 'Cash' },
                { id: 'DEBIT' as PayMethod, icon: 'credit_card', label: 'Debit' },
                { id: 'QRIS'  as PayMethod, icon: 'qr_code_2',  label: 'QRIS' },
              ]).map(m => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '14px 0', borderRadius: 16, border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                      background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 12px rgba(21,66,18,0.12)' : 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, marginBottom: 4, color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      {m.icon}
                    </span>
                    <span className="font-label" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Charge button */}
            <button
              onClick={handleCompletePayment}
              disabled={cart.length === 0 || processing}
              style={{
                width: '100%', padding: '18px 24px', border: 'none',
                cursor: cart.length === 0 || processing ? 'not-allowed' : 'pointer',
                borderRadius: 18,
                background: cart.length === 0 || processing
                  ? 'var(--surface-container-high)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                color: cart.length === 0 || processing ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                fontFamily: 'Plus Jakarta Sans', fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: cart.length > 0 && !processing ? '0 8px 24px rgba(21,66,18,0.22)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>payments</span>
              {processing ? 'Memproses...' : 'Charge / Pay'}
            </button>
          </div>
        </aside>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ background: toast.type === 'error' ? 'var(--error)' : 'var(--on-surface)' }}>
          {toast.text}
        </div>
      )}

      {/* ── Cash Payment Modal ── */}
      {showCashModal && (
        <CashModal
          total={total}
          cashReceived={cashReceived}
          onChangeCash={setCashReceived}
          processing={processing}
          onConfirm={() => {
            const amt = parseInt(cashReceived.replace(/\D/g, ''), 10);
            if (isNaN(amt) || amt < total) return;
            submitPayment(amt);
          }}
          onCancel={() => setShowCashModal(false)}
        />
      )}
      </div>

      {/* ── Receipt Print Area ── */}
      {lastOrder && (
        <div id="receipt-print-area" className="print-only">
          <div className="rcp-header">
            <div className="rcp-store-name">KEDAI.IO</div>
            <div className="rcp-tagline">Terima kasih telah berkunjung</div>
          </div>
          <div className="rcp-meta">
            <table><tbody>
              <tr><td>No. Order</td><td>{lastOrder.id}</td></tr>
              <tr><td>Tanggal</td><td>{new Date().toLocaleDateString('id-ID')}</td></tr>
              <tr><td>Waktu</td><td>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td></tr>
              {lastOrder.tableNumber && <tr><td>Meja</td><td>{lastOrder.tableNumber}</td></tr>}
              {lastOrder.customerName && <tr><td>Customer</td><td>{lastOrder.customerName}</td></tr>}
            </tbody></table>
          </div>
          <hr className="rcp-divider" />
          <div className="rcp-items">
            <table><tbody>
              {lastOrder.items.map(i => {
                const ep = i.product.is_promo && i.product.promo_price ? i.product.promo_price : i.product.price;
                return (
                  <tr key={i.product.id}>
                    <td className="col-qty">{i.quantity}x</td>
                    <td className="col-name">{i.product.name}{i.notes ? `\n(${i.notes})` : ''}</td>
                    <td className="col-price">Rp {(ep * i.quantity).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody></table>
          </div>
          <hr className="rcp-divider" />
          <div className="rcp-totals">
            <table><tbody>
              <tr><td>Subtotal</td><td>Rp {lastOrder.subtotal.toLocaleString('id-ID')}</td></tr>
              <tr><td>Pajak (10%)</td><td>Rp {lastOrder.tax.toLocaleString('id-ID')}</td></tr>
              <tr className="rcp-total-row"><td>TOTAL</td><td>Rp {lastOrder.total.toLocaleString('id-ID')}</td></tr>
              <tr><td>Metode</td><td>{lastOrder.paymentMethod}</td></tr>
              {lastOrder.cashReceived != null && (
                <tr className="rcp-cash-row"><td>Tunai</td><td>Rp {lastOrder.cashReceived.toLocaleString('id-ID')}</td></tr>
              )}
              {lastOrder.change != null && (
                <tr className="rcp-change-row"><td>Kembalian</td><td>Rp {lastOrder.change.toLocaleString('id-ID')}</td></tr>
              )}
            </tbody></table>
          </div>
          <div className="rcp-footer">
            <div className="rcp-thank-you">★ TERIMA KASIH ★</div>
            <div>Selamat menikmati pesanan Anda!</div>
            <div style={{ marginTop: 4 }}>www.kedai.io</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────── Order Card Component ─────────── */
function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: string) => void }) {
  const NEXT_STATUS: Record<string, string> = {
    PENDING: 'PAID', PAID: 'COOKING', COOKING: 'SERVED', SERVED: 'COMPLETED',
  };
  const NEXT_LABEL: Record<string, string> = {
    PENDING: 'Tandai Lunas', PAID: 'Mulai Masak', COOKING: 'Siap Diambil', SERVED: 'Selesai',
  };

  const next = NEXT_STATUS[order.status];
  const createdAt = new Date(order.created_at);
  const timeAgo = (() => {
    const diff = Math.floor((Date.now() - createdAt.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  })();

  return (
    <div style={{
      background: 'var(--surface-container-lowest)', borderRadius: 18, padding: '18px 20px',
      border: '1px solid rgba(194,201,187,0.15)',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="font-headline" style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
             {order.table?.table_number ? `Table ${order.table.table_number}` : 'Takeaway'}
             {!order.table?.table_number && (
                <span style={{ fontSize: 9, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BAG</span>
             )}
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary)' }}>#{order.id.split('-').pop()}</span> • {order.customer_name || 'Walk-in'} • {timeAgo}
          </p>
        </div>
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {order.order_items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.product?.image_url && (
                  <img src={item.product.image_url} alt={item.product.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                )}
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  <strong style={{ color: 'var(--on-surface)' }}>{item.quantity}×</strong> {item.product?.name}
                </span>
              </div>
              {item.notes && (
                <div style={{
                  marginTop: 4, marginLeft: item.product?.image_url ? 36 : 0, 
                  background: 'var(--surface-container)', padding: '4px 8px', borderRadius: 4,
                  fontSize: 10, color: 'var(--on-surface-variant)', fontStyle: 'italic',
                  display: 'inline-block'
                }}>
                  {item.notes}
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, alignSelf: 'flex-start', paddingTop: 6 }}>
              Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(194,201,187,0.15)', paddingTop: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p className="font-label" style={{ fontSize: 9, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            {order.payment_method ?? 'N/A'}
          </p>
          <span className="font-headline" style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
            Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}
          </span>
        </div>
        {next && (
          <button
            onClick={() => onStatusChange(order.id, next)}
            style={{
              padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--primary)', color: '#fff',
              fontSize: 12, fontWeight: 700, fontFamily: 'Plus Jakarta Sans',
              boxShadow: '0 2px 8px rgba(21,66,18,0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────── Loading Skeleton ─────────── */
function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 260, background: 'var(--surface-container-low)', padding: 24 }}>
        <div className="skeleton" style={{ width: 120, height: 28, marginBottom: 32 }} />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 12 }} />)}
      </div>
      <div style={{ flex: 1, padding: 32, background: 'var(--surface-bright)' }}>
        <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 24 }} />)}
        </div>
      </div>
      <div style={{ width: 400, background: 'var(--surface-container-low)', padding: 24 }}>
        <div className="skeleton" style={{ width: 140, height: 24, marginBottom: 20 }} />
      </div>
    </div>
  );
}

/* ─────────── Cash Payment Modal Component ─────────── */
function CashModal({ total, cashReceived, onChangeCash, onConfirm, onCancel, processing }: {
  total: number; cashReceived: string; onChangeCash: (v: string) => void;
  onConfirm: () => void; onCancel: () => void; processing: boolean;
}) {
  const amt = parseInt(cashReceived.replace(/\D/g, ''), 10) || 0;
  const change = Math.max(0, amt - total);
  const isValid = amt >= total;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--surface-container-lowest)', width: 440,
        borderRadius: 24, padding: 36, boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
      }}>
        <h3 className="font-headline" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Pembayaran Tunai</h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 32 }}>
          Total tagihan: <strong style={{ color: 'var(--on-surface)', fontSize: 18 }}>Rp {total.toLocaleString('id-ID')}</strong>
        </p>

        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: 8, display: 'block' }}>Uang Diterima (Rp)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {/* Quick buttons */}
          {[100000, 50000, total].map(val => (
            <button
              key={val}
              onClick={() => onChangeCash(val.toString())}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--outline-variant)',
                background: 'var(--surface-container)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                color: 'var(--on-surface)'
              }}
            >
              {val === total ? 'UANG PAS' : (val/1000) + 'k'}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={cashReceived}
          onChange={e => onChangeCash(e.target.value)}
          placeholder="0"
          style={{
            width: '100%', padding: '20px 24px', fontSize: 28, fontWeight: 800,
            fontFamily: 'Plus Jakarta Sans', borderRadius: 12, border: '2px solid var(--primary)',
            background: 'var(--surface-container)', color: 'var(--primary)',
            outline: 'none', marginBottom: 28
          }}
          autoFocus
        />

        <div style={{
          background: 'var(--surface-container-high)', padding: '20px 24px', borderRadius: 16, border: '1px solid var(--outline-variant)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kembalian</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: isValid ? 'var(--on-surface)' : 'var(--error)' }}>
            Rp {isValid ? change.toLocaleString('id-ID') : '0'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '18px 0', borderRadius: 12, border: 'none', background: 'var(--surface-container)',
              fontWeight: 800, cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 16
            }}
          >
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || processing}
            style={{
              flex: 1, padding: '18px 0', borderRadius: 12, border: 'none',
              background: isValid && !processing ? 'var(--primary)' : 'var(--surface-dim)',
              color: isValid && !processing ? '#ffffff' : 'var(--on-surface-variant)',
              fontWeight: 800, cursor: isValid && !processing ? 'pointer' : 'not-allowed', fontSize: 16,
              boxShadow: isValid && !processing ? '0 4px 12px rgba(21,66,18,0.2)' : 'none'
            }}
          >
            {processing ? 'MEMPROSES...' : 'SELESAI SIMPAN'}
          </button>
        </div>
      </div>
    </div>
  );
}
