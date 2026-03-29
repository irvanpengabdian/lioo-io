'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories, searchProducts, type Category, type Product } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import ProductDetailSheet from '@/components/ProductDetailSheet';
import CartDrawer from '@/components/CartDrawer';

// ─── skeleton loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 90, height: 26, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 99 }} />
      </div>
      {/* search */}
      <div className="px-5 mb-5"><div className="skeleton" style={{ height: 48, borderRadius: 99 }} /></div>
      {/* categories */}
      <div className="flex gap-2 px-5 mb-5">
        {[80, 100, 72, 90].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 38, borderRadius: 99 }} />)}
      </div>
      {/* hero */}
      <div className="px-5 mb-5"><div className="skeleton" style={{ height: 180, borderRadius: 20 }} /></div>
      {/* grid */}
      <div className="px-5 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'var(--surface-card)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
            <div className="p-3 space-y-2">
              <div className="skeleton" style={{ height: 14, width: '75%' }} />
              <div className="skeleton" style={{ height: 11, width: '55%' }} />
              <div className="skeleton" style={{ height: 16, width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main content ─────────────────────────────────────────────────────────────
function MenuPageContent({ tableNumber }: { tableNumber: string }) {
  const router = useRouter();
  const { totalItems, totalPrice } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [gridKey, setGridKey] = useState(0); // forces re-animation on category change
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevTotalRef = useRef(0);

  // Load all categories once
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Debounce: wait 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Server-side search whenever debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const catId = activeCategory !== 'all' ? activeCategory : undefined;
    searchProducts(debouncedQuery, catId)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery, activeCategory]);

  // Show indicator while user is still typing (before debounce fires)
  const isTyping = searchQuery !== debouncedQuery;

  // Badge pop on cart add
  useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setBadgePop(true);
      const t = setTimeout(() => setBadgePop(false), 350);
      prevTotalRef.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems]);

  // Trigger grid re-animation when category changes
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id);
    setGridKey(k => k + 1);
    // If there's an active search, re-run it with new category
    if (debouncedQuery.trim()) setDebouncedQuery(prev => prev + ' ');
  }, [debouncedQuery]);

  if (loading) return <SkeletonLoader />;

  const allProducts: Product[] = categories.flatMap(c => c.products);
  const featuredProducts = allProducts.filter(p => !!p.image_url).slice(0, 5);
  if (featuredProducts.length === 0 && allProducts.length > 0) {
    featuredProducts.push(allProducts[0]);
  }

  // When searching: use server results. Otherwise: filter client-side by category.
  const filteredProducts: Product[] = debouncedQuery.trim()
    ? searchResults
    : activeCategory === 'all'
      ? allProducts
      : (categories.find(c => c.id === activeCategory)?.products ?? []);

  const isShowHero = !searchQuery && activeCategory === 'all' && featuredProducts.length > 0;
  const activeCategoryName = activeCategory === 'all' ? 'Semua' : (categories.find(c => c.id === activeCategory)?.name ?? '');

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: totalItems > 0 ? 96 : 32 }}>

      {/* ━━━━━━━━━━━━━━━━  TOP APP BAR  ━━━━━━━━━━━━━━━━ */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(235,235,223,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(198,200,192,0.4)',
        }}
      >
        <div className="flex items-center justify-between px-5" style={{ height: 60 }}>
          {/* Hamburger */}
          <button
            className="flex items-center justify-center"
            style={{ width: 36, height: 36 }}
            aria-label="Menu navigasi"
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)', fontSize: 22 }}>menu</span>
          </button>

          {/* Brand */}
          <h1
            className="font-headline"
            style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.4px' }}
          >
            Lioo.io
          </h1>

          {/* Right side: table badge + cart */}
          <div className="flex items-center gap-3">
            {/* Table Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1"
              style={{
                background: 'var(--secondary-container)',
                borderRadius: 99,
              }}
            >
              <span
                className="font-label"
                style={{ fontSize: 9, fontWeight: 700, color: 'var(--on-secondary-container)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >TABLE</span>
              <span
                className="font-headline"
                style={{ fontSize: 16, fontWeight: 800, color: 'var(--on-secondary-container)', lineHeight: 1 }}
              >
                {tableNumber.padStart(2, '0')}
              </span>
            </div>

            {/* Cart icon */}
            <button
              onClick={() => setShowCart(true)}
              style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Keranjang pesanan"
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)', fontSize: 24, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                shopping_cart
              </span>
              {totalItems > 0 && (
                <span
                  className={badgePop ? 'badge-pop' : ''}
                  style={{
                    position: 'absolute', top: -2, right: -4,
                    background: 'var(--secondary)', color: 'var(--on-secondary)',
                    fontSize: 9, fontWeight: 700, fontFamily: 'Inter',
                    width: 18, height: 18, borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--background)',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="px-5">

        {/* ━━━━━━━━━━━━━━━━  SEARCH BAR  ━━━━━━━━━━━━━━━━ */}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div
            className="flex items-center gap-2.5"
            style={{
              background: 'var(--surface-card)',
              borderRadius: 99,
              padding: '11px 18px',
              boxShadow: searchQuery
                ? '0 0 0 2px var(--primary), 0 2px 8px rgba(21,66,18,0.15)'
                : '0 1px 4px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(198,200,192,0.6)',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            {/* Icon: spinner when searching, magnifier otherwise */}
            {(isSearching || isTyping) && searchQuery ? (
              <span
                className="material-symbols-outlined"
                style={{
                  color: 'var(--primary)', fontSize: 19,
                  animation: 'spin 0.8s linear infinite',
                }}
              >
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined" style={{ color: searchQuery ? 'var(--primary)' : 'var(--on-surface-muted)', fontSize: 19 }}>search</span>
            )}
            <input
              id="menu-search-input"
              type="search"
              placeholder="Cari menu favorit kamu..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'Manrope', fontSize: 14, color: 'var(--on-surface)',
              }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setDebouncedQuery(''); setSearchResults([]); }}
                style={{ display: 'flex', padding: '2px' }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-muted)', fontSize: 18 }}>close</span>
              </button>
            )}
          </div>
          {/* Search chips: show active category scope when searching */}
          {searchQuery && activeCategory !== 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingLeft: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--on-surface-muted)', fontFamily: 'Manrope' }}>Filter aktif:</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                background: 'var(--primary-fixed)', borderRadius: 99, padding: '3px 10px',
              }}>
                {activeCategoryName}
                <button
                  onClick={() => handleCategoryChange('all')}
                  style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--primary)' }}>close</span>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━  CATEGORY PILLS  ━━━━━━━━━━━━━━━━ */}
        <div className="no-scrollbar" style={{ overflowX: 'auto', marginBottom: 20 }}>
          <div className="flex gap-2.5" style={{ width: 'max-content' }}>
            {[
              { id: 'all', name: 'Semua', count: allProducts.length },
              ...categories.map(c => ({ id: c.id, name: c.name, count: c.products.length })),
            ].map(c => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className="pill-btn"
                  style={{
                    padding: '9px 16px 9px 20px',
                    background: isActive ? 'var(--primary)' : 'var(--surface-container)',
                    color: isActive ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: isActive ? '0 2px 10px rgba(31,74,24,0.25)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {c.name}
                  {/* Product count badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: 'Inter',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--outline-variant)',
                    color: isActive ? '#fff' : 'var(--on-surface-muted)',
                    padding: '1px 6px', borderRadius: 99,
                    minWidth: 20, textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━  HERO SECTION (CAROUSEL) ━━━━━━━━━━━━━━━━ */}
        {isShowHero && (
          <div className="no-scrollbar" style={{ 
            display: 'flex', overflowX: 'auto', gap: 16,
            margin: '0 -20px 24px', padding: '0 20px',
            scrollSnapType: 'x mandatory',
          }}>
            {featuredProducts.map((fp) => (
              <div
                key={fp.id}
                style={{
                  flex: '0 0 calc(100vw - 40px)',
                  maxWidth: 390,
                  scrollSnapAlign: 'center',
                  position: 'relative', height: 188, borderRadius: 20, overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedProduct(fp)}
              >
                {fp.image_url ? (
                  <img
                    src={fp.image_url}
                    alt={fp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>☕</div>
                )}
                {/* gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(15,30,12,0.85) 0%, rgba(15,30,12,0.2) 55%, transparent 100%)',
                }} />
                {/* content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '0 20px 18px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <div>
                       <span
                         className="font-label"
                         style={{
                           background: 'var(--secondary)', color: '#fff',
                           fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                           padding: '3px 10px', borderRadius: 99,
                           display: 'inline-block', marginBottom: 8,
                         }}
                       >
                         Chef&apos;s Choice
                       </span>
                       <h2
                         className="font-headline"
                         style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                       >
                         {fp.name}
                       </h2>
                     </div>
                     <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '6px 10px', borderRadius: 12 }}>
                        <p className="font-headline" style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>
                           Rp {(fp.is_promo && fp.promo_price ? fp.promo_price : fp.price).toLocaleString('id-ID')}
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━  PRODUCT GRID  ━━━━━━━━━━━━━━━━ */}
        <section>
          {/* Result info bar */}
          {debouncedQuery.trim() && !isSearching && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 12.5, fontFamily: 'Manrope' }}>
                {filteredProducts.length > 0
                  ? <>Ditemukan <strong style={{ color: 'var(--on-surface)' }}>{filteredProducts.length}</strong> menu untuk &ldquo;<strong style={{ color: 'var(--primary)' }}>{debouncedQuery}</strong>&rdquo;</>
                  : <>Tidak ada hasil untuk &ldquo;<strong style={{ color: 'var(--primary)' }}>{debouncedQuery}</strong>&rdquo;</>}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setDebouncedQuery(''); setSearchResults([]); }}
                style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                  background: 'var(--primary-fixed)', border: 'none', cursor: 'pointer',
                  borderRadius: 99, padding: '4px 10px', fontFamily: 'Manrope',
                }}
              >
                Reset
              </button>
            </div>
          )}

          {/* Searching skeleton */}
          {(isSearching || (isTyping && searchQuery)) ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: 'var(--surface-card)', borderRadius: 16, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 136, borderRadius: 0 }} />
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 13, width: '70%' }} />
                    <div className="skeleton" style={{ height: 10, width: '50%' }} />
                    <div className="skeleton" style={{ height: 15, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0 32px', gap: 12 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 99,
                background: 'var(--surface-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-muted)', fontSize: 36 }}>
                  {searchQuery ? 'search_off' : 'restaurant_menu'}
                </span>
              </div>
              <p className="font-headline" style={{ color: 'var(--on-surface-variant)', fontWeight: 600, fontSize: 16 }}>
                {searchQuery ? 'Menu tidak ditemukan' : 'Belum ada menu'}
              </p>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: 13, textAlign: 'center', maxWidth: 220 }}>
                {searchQuery ? 'Coba kata kunci lain atau hapus filter kategori' : 'Menu sedang dipersiapkan'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setDebouncedQuery(''); setSearchResults([]); handleCategoryChange('all'); }}
                  style={{
                    marginTop: 4, padding: '10px 20px',
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', cursor: 'pointer', borderRadius: 99,
                    fontSize: 13, fontWeight: 700, fontFamily: 'Plus Jakarta Sans',
                  }}
                >
                  Lihat Semua Menu
                </button>
              )}
            </div>
          ) : (
            <div key={gridKey} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animation: 'fadeSlideUp 0.3s ease both' }}>
              {filteredProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  delay={idx * 0.035}
                  showCategory={!!debouncedQuery.trim()}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ━━━━━━━━━━━━━━━━  FLOATING CART BAR  ━━━━━━━━━━━━━━━━ */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          padding: '10px 16px 16px',
          background: 'linear-gradient(to top, var(--surface) 60%, transparent)',
          zIndex: 30,
        }}>
          <button
            onClick={() => setShowCart(true)}
            className="cart-shadow"
            style={{
              width: '100%', padding: '14px 18px',
              background: 'var(--primary)', borderRadius: 18,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--primary-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>shopping_basket</span>
                <span
                  className={badgePop ? 'badge-pop' : ''}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--secondary)', color: '#fff',
                    fontSize: 9, fontWeight: 700, fontFamily: 'Inter',
                    width: 18, height: 18, borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {totalItems}
                </span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {totalItems} item di keranjang
                </p>
                <p className="font-headline" style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Lihat Pesanan</p>
              </div>
            </div>
            <p className="font-headline" style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>
              Rp {totalPrice.toLocaleString('id-ID')}
            </p>
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━  MODALS  ━━━━━━━━━━━━━━━━ */}
      {selectedProduct && (
        <ProductDetailSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {showCart && (
        <CartDrawer
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            router.push(`/checkout?table=${tableNumber}`);
          }}
        />
      )}
    </div>
  );
}

// ─── product card ─────────────────────────────────────────────────────────────
function ProductCard({ product: p, delay, showCategory, onClick }: { product: Product; delay: number; showCategory?: boolean; onClick: () => void }) {
  const effectivePrice = p.is_promo && p.promo_price ? p.promo_price : p.price;

  return (
    <div
      className="product-card animate-slideUp"
      style={{
        background: 'var(--surface-card)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        animationDelay: `${delay}s`,
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div style={{
        position: 'relative', height: 136,
        background: 'var(--surface-container)',
        overflow: 'hidden',
      }}>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🍃</div>
        )}
        {p.is_promo && (
          <span
            className="font-label"
            style={{
              position: 'absolute', top: 8, left: 8,
              background: 'var(--secondary)', color: '#fff',
              fontSize: 9, fontWeight: 700, padding: '2px 8px',
              borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            PROMO
          </span>
        )}
        {/* Category badge — shown during search */}
        {showCategory && p.category_name && (
          <span
            className="font-label"
            style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(0,0,0,0.55)', color: '#fff',
              fontSize: 9, fontWeight: 600, padding: '2px 8px',
              borderRadius: 99, backdropFilter: 'blur(4px)',
            }}
          >
            {p.category_name}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        <h3
          className="font-headline"
          style={{
            color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 700,
            lineHeight: 1.3, marginBottom: 4,
          }}
        >
          {p.name}
        </h3>
        {p.description && (
          <p
            className="line-clamp-2 font-body"
            style={{ color: 'var(--on-surface-variant)', fontSize: 11, lineHeight: 1.45, marginBottom: 10 }}
          >
            {p.description}
          </p>
        )}

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="font-headline" style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 800 }}>
              Rp {effectivePrice.toLocaleString('id-ID')}
            </p>
            {p.is_promo && p.promo_price && (
              <p style={{ color: 'var(--on-surface-muted)', fontSize: 10.5, textDecoration: 'line-through' }}>
                Rp {p.price.toLocaleString('id-ID')}
              </p>
            )}
          </div>
          <div
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'var(--primary-fixed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 18 }}>add</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── page wrapper ─────────────────────────────────────────────────────────────
// NOTE: CartProvider is provided globally by layout.tsx (ClientProviders).
// Do NOT add another CartProvider here — it would shadow the global one and
// cart state would be lost on navigation to /checkout or /payment.
export default function MenuPage() {
  const tableNumber = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('table') ?? '4')
    : '4';

  return <MenuPageContent tableNumber={tableNumber} />;
}
