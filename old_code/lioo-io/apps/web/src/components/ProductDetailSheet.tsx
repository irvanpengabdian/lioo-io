'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/lib/CartContext';
import type { CategoryType } from '@/lib/api';

// ─── Static addon catalogue per category type ─────────────────────────────────
// In the future this will come from /api/category-addons (back office configurable).
// Each entry: { id, icon (material symbol), label, price }
const ADDON_CATALOGUE: Record<CategoryType, { id: string; icon: string; label: string; price: number }[]> = {
  BEVERAGE: [
    { id: 'extra_shot',    icon: 'coffee',           label: 'Extra Shot',          price: 5000 },
    { id: 'extra_milk',    icon: 'opacity',           label: 'Extra Milk / Oat Milk', price: 8000 },
  ],
  MEAL: [
    { id: 'extra_rice',    icon: 'rice_bowl',         label: 'Extra Nasi',          price: 6000 },
    { id: 'extra_egg',     icon: 'egg',               label: 'Extra Telur',         price: 4000 },
    { id: 'extra_sauce',   icon: 'water_drop',        label: 'Extra Saus',          price: 3000 },
  ],
  SNACK: [
    { id: 'extra_sauce',   icon: 'water_drop',        label: 'Dip / Saus Ekstra',   price: 3000 },
    { id: 'extra_cheese',  icon: 'nutrition',         label: 'Keju Tambahan',       price: 7000 },
  ],
  OTHER: [],
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id:            string;
  name:          string;
  description?:  string;
  price:         number;
  image_url?:    string;
  is_promo?:     boolean;
  promo_price?:  number;
  category_type?: CategoryType;
  category_name?: string;
}

interface Props {
  product: Product | null;
  onClose: () => void;
}

type Temperature = 'hot' | 'iced';
type SugarLevel  = 'none' | 'less' | 'normal' | 'extra';

const SUGAR_LABELS: Record<SugarLevel, string> = {
  none: 'None', less: 'Less', normal: 'Normal', extra: 'Extra',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductDetailSheet({ product, onClose }: Props) {
  const { addItem } = useCart();

  const [qty,            setQty]          = useState(1);
  const [notes,          setNotes]        = useState('');
  const [temp,           setTemp]         = useState<Temperature>('hot');
  const [sugar,          setSugar]        = useState<SugarLevel>('normal');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  // Reset every time a different product opens
  useEffect(() => {
    if (product) {
      setQty(1);
      setNotes('');
      setTemp('hot');
      setSugar('normal');
      setSelectedAddons(new Set());
    }
  }, [product?.id]);

  if (!product) return null;

  const catType = product.category_type ?? 'BEVERAGE';
  const isBeverage = catType === 'BEVERAGE';

  const effectivePrice = product.is_promo && product.promo_price
    ? product.promo_price
    : product.price;

  const availableAddons = ADDON_CATALOGUE[catType] ?? [];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addonTotal = availableAddons
    .filter(a => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const lineTotal = (effectivePrice + addonTotal) * qty;

  const handleAdd = () => {
    const parts: string[] = [];

    if (isBeverage) {
      parts.push(temp === 'hot' ? 'Hot' : 'Iced');
      parts.push(`Sugar: ${SUGAR_LABELS[sugar]}`);
    }
    const addonLabels = availableAddons
      .filter(a => selectedAddons.has(a.id))
      .map(a => a.label);
    if (addonLabels.length) parts.push(addonLabels.join(', '));
    if (notes.trim())       parts.push(`Catatan: ${notes.trim()}`);

    const item: CartItem = {
      id:        product.id,
      name:      product.name,
      price:     effectivePrice + addonTotal,
      quantity:  qty,
      notes:     parts.join(' · '),
      image_url: product.image_url,
    };
    addItem(item);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="bottom-sheet-overlay animate-fadeIn" onClick={onClose} />

      {/* Sheet */}
      <div
        className="bottom-sheet glass-panel animate-slideUp"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--surface-dim)', margin: '14px auto 18px' }} />

        <div style={{ padding: '0 22px 12px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              {/* Category chip */}
              {product.category_name && (
                <span style={{
                  display: 'inline-block',
                  background: 'var(--primary-fixed)',
                  color: 'var(--on-primary-fixed)',
                  fontSize: 9, fontFamily: 'Inter', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 99,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  {product.category_name}
                </span>
              )}
              <h2 className="font-headline" style={{ color: 'var(--on-surface)', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                {product.name}
              </h2>
              {product.description && (
                <p className="font-body" style={{ color: 'var(--on-surface-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>
                  {product.description}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p className="font-headline" style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 800 }}>
                Rp {effectivePrice.toLocaleString('id-ID')}
              </p>
              {product.is_promo && product.promo_price && (
                <p style={{ color: 'var(--on-surface-muted)', fontSize: 11, textDecoration: 'line-through' }}>
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>

          <Divider />

          {/* ── BEVERAGE ONLY: Temperature ── */}
          {isBeverage && (
            <>
              <SectionLabel>Temperature</SectionLabel>
              <div
                className="seg-control"
                style={{ gridTemplateColumns: '1fr 1fr', background: 'var(--surface-container)', marginBottom: 20 }}
              >
                {(['hot', 'iced'] as Temperature[]).map(t => (
                  <button
                    key={t}
                    className="seg-btn"
                    onClick={() => setTemp(t)}
                    style={{
                      background: temp === t ? 'var(--primary)' : 'transparent',
                      color:      temp === t ? '#fff' : 'var(--on-surface-variant)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {t === 'hot' ? 'local_fire_department' : 'ac_unit'}
                    </span>
                    {t === 'hot' ? 'Hot' : 'Iced'}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── BEVERAGE ONLY: Sugar Level ── */}
          {isBeverage && (
            <>
              <SectionLabel>Sugar Level</SectionLabel>
              <div
                className="seg-control"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--surface-container)', marginBottom: 20 }}
              >
                {(Object.keys(SUGAR_LABELS) as SugarLevel[]).map(s => {
                  const active = sugar === s;
                  return (
                    <button
                      key={s}
                      className="seg-btn"
                      onClick={() => setSugar(s)}
                      style={{
                        background:  active ? '#fff' : 'transparent',
                        color:       active ? 'var(--primary)' : 'var(--on-surface-variant)',
                        boxShadow:   active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        outline:     active ? '2px solid rgba(31,74,24,0.2)' : 'none',
                        outlineOffset: '-1px',
                        padding: '10px 4px',
                        fontSize: 12.5,
                      }}
                    >
                      {SUGAR_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── DYNAMIC EXTRAS (varies by category type) ── */}
          {availableAddons.length > 0 && (
            <>
              <SectionLabel>
                {isBeverage ? 'Extras' : catType === 'MEAL' ? 'Pilihan Tambahan' : 'Tambahan'}
              </SectionLabel>
              {availableAddons.map(addon => {
                const checked = selectedAddons.has(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px', borderRadius: 12,
                      background: checked ? 'rgba(188,240,174,0.2)' : 'var(--surface-container-low)',
                      border: checked ? '1.5px solid rgba(21,66,18,0.25)' : '1.5px solid transparent',
                      marginBottom: 8, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>{addon.icon}</span>
                      <span className="font-body" style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 500 }}>{addon.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--secondary)' }}>
                        + Rp {addon.price.toLocaleString('id-ID')}
                      </span>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: checked ? 'var(--primary)' : 'var(--surface-container)',
                        border: checked ? 'none' : '1.5px solid var(--outline-variant)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {checked && <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#fff' }}>check</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
              <div style={{ marginBottom: 12 }} />
            </>
          )}

          <Divider />

          {/* ── Catatan Khusus ── */}
          <SectionLabel>Catatan Khusus</SectionLabel>
          <textarea
            className="font-body"
            placeholder="Misal: tanpa es, extra pedas, alergi kacang..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%', height: 68, resize: 'none',
              border: '1.5px solid var(--outline-variant)',
              borderRadius: 14, outline: 'none',
              padding: '10px 14px', fontSize: 13,
              color: 'var(--on-surface)', background: 'var(--surface-container-low)',
              marginBottom: 20, fontFamily: 'Manrope', lineHeight: 1.5,
            }}
          />

          {/* ── Qty + Add Button ── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Stepper */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 2,
              background: 'var(--surface-container)',
              borderRadius: 14, padding: '4px',
              border: '1px solid var(--outline-variant)',
            }}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  cursor: 'pointer', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: qty === 1 ? 'var(--on-surface-muted)' : 'var(--primary)' }}>
                  remove
                </span>
              </button>
              <span className="font-headline" style={{ minWidth: 28, textAlign: 'center', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  cursor: 'pointer', background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>add</span>
              </button>
            </div>

            {/* Add to Cart */}
            <button
              className="btn-primary"
              onClick={handleAdd}
              style={{ flex: 1, padding: '14px 14px', fontSize: 14, borderRadius: 14 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_shopping_cart</span>
              Add to Cart — Rp {lineTotal.toLocaleString('id-ID')}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: 'var(--outline-variant)', opacity: 0.45, margin: '4px 0 18px' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-label"
      style={{
        color: 'var(--on-surface-variant)', fontSize: 10.5,
        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 10,
      }}
    >
      {children}
    </p>
  );
}
