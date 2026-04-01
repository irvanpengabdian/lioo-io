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
    <div className="flex flex-col h-full bg-[#F9FAF5]">

      {/* ── Header ── */}
      <header className="flex justify-between items-end px-8 pt-8 pb-5 shrink-0">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#43493E]/60">
            Menu
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2C4F1B]">
            Pilih Menu
          </h2>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="bg-white border-none rounded-full pl-5 pr-12 py-3 w-56 lg:w-72 focus:outline-none focus:ring-2 focus:ring-[#2C4F1B]/20 text-sm placeholder:text-stone-400 shadow-[0_2px_12px_rgba(44,79,27,0.06)]"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A1C19] transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          ) : (
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
              search
            </span>
          )}
        </div>
      </header>

      {/* ── Category chips ── */}
      <div className="flex gap-3 px-8 pb-5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeCategoryId === null
              ? 'bg-[#2C4F1B] text-white shadow-sm'
              : 'bg-[#E7E9E4] text-[#43493E] hover:bg-[#EDEEE9]'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCategoryId === cat.id
                ? 'bg-[#2C4F1B] text-white shadow-sm'
                : 'bg-[#E7E9E4] text-[#43493E] hover:bg-[#EDEEE9]'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Product grid ── */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <span className="material-symbols-outlined text-5xl text-stone-300 mb-3">restaurant_menu</span>
            <p className="text-sm font-medium text-[#787868]">
              {search ? `Tidak ada menu "${search}"` : 'Belum ada menu di kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onTap={onProductTap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Product card — editorial style
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
      className={`group bg-white rounded-[1rem] p-5 flex flex-col text-left transition-all duration-300 ${
        product.isAvailable
          ? 'hover:shadow-[0_12px_40px_rgba(67,73,62,0.1)] cursor-pointer active:scale-[0.98]'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] rounded-[0.75rem] overflow-hidden mb-4 bg-[#F3F4EF]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined text-5xl text-stone-300">restaurant_menu</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {hasPromo && (
            <span className="bg-[#FFBF00] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Promo
            </span>
          )}
        </div>
        {product.modifierGroups.length > 0 && product.isAvailable && (
          <span className="absolute top-3 right-3 bg-[#BBEDA6] text-[#2C4F1B] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Custom
          </span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-[0.75rem]">
            <span className="text-xs font-bold text-[#787868] bg-white px-3 py-1.5 rounded-full shadow-sm">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-[0.9375rem] text-[#1A1C19] leading-snug line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-[#43493E] mt-1 line-clamp-1">{product.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="font-bold text-[#2C4F1B] text-sm">
            {formatRupiah(effectivePrice)}
          </span>
          {hasPromo && (
            <p className="text-[10px] text-[#787868] line-through">
              {formatRupiah(product.price)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
