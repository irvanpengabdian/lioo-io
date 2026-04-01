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
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#F9FAF5]">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787868] text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl text-sm text-[#1A1C19] placeholder-[#AAAAA0] focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30 shadow-[0_2px_8px_rgba(44,79,27,0.04)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787868] hover:text-[#1A1C19]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            activeCategoryId === null
              ? 'bg-[#2C4F1B] text-white shadow-sm'
              : 'bg-white text-[#43493E] hover:bg-[#EDEEE9]'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategoryId === cat.id
                ? 'bg-[#2C4F1B] text-white shadow-sm'
                : 'bg-white text-[#43493E] hover:bg-[#EDEEE9]'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm text-[#787868]">
              {search ? 'Menu tidak ditemukan.' : 'Belum ada menu di kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onTap={onProductTap}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Product card
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
  const hasModifiers = product.modifierGroups.length > 0;

  return (
    <button
      onClick={() => onTap(product)}
      disabled={!product.isAvailable}
      className={`relative flex flex-col rounded-2xl overflow-hidden text-left transition-all active:scale-95 group ${
        product.isAvailable
          ? 'bg-white shadow-[0_2px_12px_rgba(44,79,27,0.06)] hover:shadow-[0_4px_20px_rgba(44,79,27,0.12)]'
          : 'bg-[#F3F4EF] opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Product image */}
      <div className="relative w-full aspect-square bg-[#EDEEE9]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl">🍽️</div>
        )}

        {/* Badges */}
        {hasPromo && (
          <span className="absolute top-2 left-2 bg-[#FF5722] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PROMO
          </span>
        )}
        {hasModifiers && product.isAvailable && (
          <span className="absolute top-2 right-2 bg-[#1A1C19]/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            ⚙️
          </span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#787868] bg-white px-2 py-1 rounded-full">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-[#1A1C19] leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-[#2C4F1B]">
            {formatRupiah(effectivePrice)}
          </span>
          {hasPromo && (
            <span className="text-[10px] text-[#787868] line-through">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Add indicator on hover */}
      {product.isAvailable && (
        <div className="absolute bottom-2.5 right-2.5 w-6 h-6 bg-[#2C4F1B] rounded-full flex items-center justify-center text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          +
        </div>
      )}
    </button>
  );
}
