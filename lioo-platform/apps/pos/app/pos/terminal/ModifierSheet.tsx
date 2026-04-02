'use client';

import { useState } from 'react';
import type { CatalogProduct, ModifierGroup, SelectedModifier } from '../../../lib/types';
import { getEffectivePrice, formatRupiah } from '../../../lib/types';

type Props = {
  product: CatalogProduct;
  onConfirm: (
    product: CatalogProduct,
    selectedModifiers: SelectedModifier[],
    qty: number,
    instructions?: string
  ) => void;
  onClose: () => void;
};

export default function ModifierSheet({ product, onConfirm, onClose }: Props) {
  const [selections, setSelections] = useState<Map<string, SelectedModifier[]>>(new Map());
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const basePrice = getEffectivePrice(product);
  const modifiersTotal = Array.from(selections.values())
    .flat()
    .reduce((s, m) => s + m.price, 0);
  const totalUnitPrice = basePrice + modifiersTotal;
  const totalPrice = totalUnitPrice * qty;

  function toggleModifier(group: ModifierGroup, modifier: { id: string; name: string; price: number }) {
    setErrors((prev) => ({ ...prev, [group.id]: '' }));
    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(group.id) ?? [];
      const alreadySelected = current.find((m) => m.id === modifier.id);

      if (group.maxSelect === 1) {
        next.set(group.id, alreadySelected ? [] : [{ id: modifier.id, name: modifier.name, price: modifier.price }]);
      } else {
        if (alreadySelected) {
          next.set(group.id, current.filter((m) => m.id !== modifier.id));
        } else if (current.length < group.maxSelect) {
          next.set(group.id, [...current, { id: modifier.id, name: modifier.name, price: modifier.price }]);
        }
      }
      return next;
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const group of product.modifierGroups) {
      if (!group.isRequired) continue;
      const selected = selections.get(group.id) ?? [];
      if (selected.length < group.minSelect) {
        newErrors[group.id] = `Pilih minimal ${group.minSelect} opsi dari "${group.name}".`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    const allSelected = Array.from(selections.values()).flat();
    onConfirm(product, allSelected, qty, instructions.trim() || undefined);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="pos-modifier-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="pos-modifier-sheet">
        {/* Handle (mobile only) */}
        <div className="pos-modifier-handle">
          <div className="pos-modifier-handle-bar" />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '1rem 1.25rem 0.875rem',
          borderBottom: '1px solid var(--color-surface-container)',
        }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '0.875rem',
            overflow: 'hidden', background: 'var(--color-surface-container)',
            flexShrink: 0, position: 'relative',
          }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>🍽️</div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>{formatRupiah(basePrice)}</p>
            {product.description && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginTop: '0.25rem' }}>{product.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.375rem', borderRadius: '0.625rem',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-outline)', flexShrink: 0,
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-low)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {product.modifierGroups.map((group) => {
            const currentSelections = selections.get(group.id) ?? [];
            const isRadio = group.maxSelect === 1;

            return (
              <div key={group.id}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>{group.name}</p>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    background: group.isRequired ? '#FEE2E2' : 'var(--color-surface-low)',
                    color: group.isRequired ? '#B91C1C' : 'var(--color-outline)',
                  }}>
                    {group.isRequired ? 'Wajib' : 'Opsional'}
                    {group.maxSelect > 1 && ` · maks ${group.maxSelect}`}
                  </span>
                </div>

                {errors[group.id] && (
                  <p style={{ fontSize: '0.75rem', color: '#B91C1C', marginBottom: '0.5rem' }}>{errors[group.id]}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.modifiers.map((mod) => {
                    const isSelected = currentSelections.some((m) => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleModifier(group, mod)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', padding: '0.75rem 1rem',
                          borderRadius: '0.875rem', textAlign: 'left', cursor: 'pointer',
                          fontFamily: 'inherit', transition: 'all 150ms ease',
                          border: isSelected
                            ? '1.5px solid #7C8B6F'
                            : '1.5px solid var(--color-surface-container)',
                          background: isSelected
                            ? '#EDF7E8'
                            : 'var(--color-background)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {isRadio ? (
                            <div style={{
                              width: '1rem', height: '1rem', borderRadius: '9999px',
                              border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              {isSelected && <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: 'var(--color-primary)' }} />}
                            </div>
                          ) : (
                            <div style={{
                              width: '1rem', height: '1rem', borderRadius: '0.25rem',
                              border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                              background: isSelected ? 'var(--color-primary)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              {isSelected && <span style={{ color: '#fff', fontSize: '0.625rem' }}>✓</span>}
                            </div>
                          )}
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-on-surface)' }}>{mod.name}</span>
                        </div>
                        {mod.price > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 500 }}>+{formatRupiah(mod.price)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special instructions */}
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>Catatan (opsional)</p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Contoh: tanpa bawang, tidak pedas..."
              rows={2}
              style={{
                width: '100%', background: 'var(--color-surface-low)',
                borderRadius: '0.875rem', padding: '0.75rem 1rem',
                fontSize: '0.875rem', color: 'var(--color-on-surface)',
                border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'inherit', transition: 'background-color 150ms ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.background = 'var(--color-surface-white)')}
              onBlur={(e) => (e.currentTarget.style.background = 'var(--color-surface-low)')}
            />
          </div>
        </div>

        {/* Footer: qty + confirm */}
        <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid var(--color-surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {/* Qty stepper */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--color-surface-low)', borderRadius: '0.875rem', padding: '0.25rem',
            }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem',
                  background: 'var(--color-surface-white)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)',
                  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'transform 100ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                −
              </button>
              <span style={{ width: '2rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-on-surface)' }}>{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem',
                  background: 'var(--color-surface-white)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)',
                  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'transform 100ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                +
              </button>
            </div>
            {/* Price */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', margin: 0 }}>Total</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>{formatRupiah(totalPrice)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="pos-cta-btn sage-gradient"
            style={{ marginTop: 0, padding: '0.875rem', fontSize: '0.9375rem' }}
          >
            Tambah ke Keranjang · {formatRupiah(totalPrice)}
          </button>
        </div>
      </div>
    </>
  );
}
