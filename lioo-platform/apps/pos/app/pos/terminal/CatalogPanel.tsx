'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CatalogCategory, CatalogProduct } from '../../../lib/types';
import { getEffectivePrice, formatRupiah } from '../../../lib/types';

type Props = {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  onProductTap: (product: CatalogProduct) => void;
};

export default function CatalogPanel({ categories, products, onProductTap }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    return matchCategory && matchSearch;
  });

  return (
    <div className="pos-catalog">

      {/* ── Header ── */}
      <header className="pos-catalog-header">
        <div>
          <span className="pos-catalog-eyebrow">Currently Serving</span>
          <h2 className="pos-catalog-title">Pilih Menu</h2>
        </div>
        <div className="pos-search-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="pos-search-input"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="pos-search-clear"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
            </button>
          ) : (
            <span className="material-symbols-outlined pos-search-icon">search</span>
          )}
        </div>
      </header>

      {/* ── Category chips ── */}
      <div className="pos-category-row no-scrollbar">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`pos-category-chip ${activeCategoryId === null ? 'pos-category-chip--active' : 'pos-category-chip--inactive'}`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`pos-category-chip ${activeCategoryId === cat.id ? 'pos-category-chip--active' : 'pos-category-chip--inactive'}`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Product grid ── */}
      {filtered.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline)', marginBottom: '0.75rem' }}>restaurant_menu</span>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>
            {search ? `Tidak ada menu "${search}"` : 'Belum ada menu di kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="pos-product-grid no-scrollbar">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onTap={onProductTap} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Product card — Living Atelier editorial style
// ─────────────────────────────────────────────

function ProductCard({
  product,
  onTap,
}: {
  product: CatalogProduct;
  onTap: (p: CatalogProduct) => void;
}) {
  const effectivePrice = getEffectivePrice(product);
  const hasPromo = product.promoPrice !== null && effectivePrice < product.price;

  return (
    <button
      onClick={() => onTap(product)}
      disabled={!product.isAvailable}
      className={`pos-product-card ${!product.isAvailable ? 'pos-product-card--unavailable' : ''}`}
    >
      {/* Image */}
      <div className="pos-product-img-wrap">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="pos-product-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="pos-product-no-img">
            <span className="material-symbols-outlined">restaurant_menu</span>
          </div>
        )}

        {/* Promo badge */}
        {hasPromo && (
          <span className="pos-badge pos-badge--left pos-badge--promo">Promo</span>
        )}
        {/* Custom modifier badge */}
        {product.modifierGroups.length > 0 && product.isAvailable && (
          <span className="pos-badge pos-badge--right pos-badge--custom">Custom</span>
        )}
        {/* Sold out overlay */}
        {!product.isAvailable && (
          <div className="pos-badge-full">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-white)', padding: '0.25rem 0.75rem', borderRadius: '9999px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pos-product-info">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="pos-product-name">{product.name}</h3>
          {product.description && (
            <p className="pos-product-desc">{product.description}</p>
          )}
        </div>
        <div className="pos-product-price-wrap">
          <span className="pos-product-price">{formatRupiah(effectivePrice)}</span>
          {hasPromo && (
            <p className="pos-product-price--strike">{formatRupiah(product.price)}</p>
          )}
        </div>
      </div>
    </button>
  );
}
