'use client';

import { useState } from 'react';
import Image from 'next/image';
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
        // Radio behavior
        next.set(group.id, alreadySelected ? [] : [{ id: modifier.id, name: modifier.name, price: modifier.price }]);
      } else {
        // Checkbox behavior
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1C19]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col shadow-[0_-8px_40px_rgba(44,79,27,0.15)]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#EDEEE9] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-4 pb-3 border-b border-[#EDEEE9]">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#EDEEE9] flex-shrink-0">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-2xl">🍽️</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1A1C19] leading-tight">{product.name}</h3>
            <p className="text-sm text-[#2C4F1B] font-semibold mt-0.5">{formatRupiah(basePrice)}</p>
            {product.description && (
              <p className="text-xs text-[#787868] mt-0.5 line-clamp-2">{product.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F3F4EF] transition-colors flex-shrink-0">
            <span className="text-[#787868] text-lg">✕</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {product.modifierGroups.map((group) => {
            const currentSelections = selections.get(group.id) ?? [];
            const isRadio = group.maxSelect === 1;

            return (
              <div key={group.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-bold text-[#1A1C19]">{group.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    group.isRequired ? 'bg-[#FDE8E8] text-[#B91C1C]' : 'bg-[#F3F4EF] text-[#787868]'
                  }`}>
                    {group.isRequired ? 'Wajib' : 'Opsional'}
                    {group.maxSelect > 1 && ` · maks ${group.maxSelect}`}
                  </span>
                </div>

                {errors[group.id] && (
                  <p className="text-xs text-[#B91C1C] mb-2">{errors[group.id]}</p>
                )}

                <div className="space-y-2">
                  {group.modifiers.map((mod) => {
                    const isSelected = currentSelections.some((m) => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleModifier(group, mod)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left ${
                          isSelected
                            ? 'border-[#7C8B6F] bg-[#E8F5E2]'
                            : 'border-[#EDEEE9] bg-[#F9FAF5] hover:bg-[#EDEEE9]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isRadio ? (
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#2C4F1B]' : 'border-[#C3C9BA]'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#2C4F1B]" />}
                            </div>
                          ) : (
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#2C4F1B] bg-[#2C4F1B]' : 'border-[#C3C9BA]'}`}>
                              {isSelected && <span className="text-white text-[10px]">✓</span>}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[#1A1C19]">{mod.name}</span>
                        </div>
                        {mod.price > 0 && (
                          <span className="text-xs text-[#787868] font-medium">+{formatRupiah(mod.price)}</span>
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
            <p className="text-sm font-bold text-[#1A1C19] mb-2">Catatan (opsional)</p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Contoh: tanpa bawang, tidak pedas..."
              rows={2}
              className="w-full bg-[#F3F4EF] rounded-2xl px-4 py-3 text-sm text-[#1A1C19] placeholder-[#AAAAA0] focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]/30 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer: qty + confirm */}
        <div className="px-5 pb-5 pt-3 border-t border-[#EDEEE9]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 bg-[#F3F4EF] rounded-2xl p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg font-bold text-[#1A1C19] shadow-sm active:scale-90 transition-transform"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-[#1A1C19]">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg font-bold text-[#1A1C19] shadow-sm active:scale-90 transition-transform"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#787868]">Total</p>
              <p className="text-lg font-bold text-[#1A1C19]">{formatRupiah(totalPrice)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white py-3.5 rounded-full font-bold text-sm shadow-md active:scale-98 transition-transform"
          >
            Tambah ke Keranjang · {formatRupiah(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
