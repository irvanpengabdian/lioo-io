'use client';

import { useState } from 'react';
import type { MenuProduct, SelectedModifier } from '../../lib/types';
import { getEffectivePrice, formatRupiah } from '../../lib/types';

type Props = {
  product: MenuProduct;
  onConfirm: (modifiers: SelectedModifier[], qty: number, instructions?: string) => void;
  onClose: () => void;
};

export default function ModifierSheet({ product, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<SelectedModifier[]>([]);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const basePrice = getEffectivePrice(product);
  const modTotal = selected.reduce((s, m) => s + m.price, 0);
  const unitPrice = basePrice + modTotal;

  function toggleModifier(groupId: string, opt: { id: string; name: string; price: number }) {
    const group = product.modifierGroups.find((g) => g.id === groupId)!;
    setSelected((prev) => {
      const inGroup = prev.filter((m) =>
        group.options.some((o) => o.id === m.id)
      );
      const alreadySelected = inGroup.some((m) => m.id === opt.id);

      if (alreadySelected) {
        return prev.filter((m) => m.id !== opt.id);
      }
      if (group.maxSelect === 1) {
        return [
          ...prev.filter((m) => !group.options.some((o) => o.id === m.id)),
          { id: opt.id, name: opt.name, price: opt.price },
        ];
      }
      if (inGroup.length >= group.maxSelect) return prev;
      return [...prev, { id: opt.id, name: opt.name, price: opt.price }];
    });
    setError(null);
  }

  function handleConfirm() {
    for (const group of product.modifierGroups) {
      if (!group.isRequired) continue;
      const count = selected.filter((m) =>
        group.options.some((o) => o.id === m.id)
      ).length;
      if (count < group.minSelect) {
        setError(`Pilih ${group.name} terlebih dahulu`);
        return;
      }
    }
    onConfirm(selected, qty, instructions.trim() || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D5D9CE] rounded-full" />
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {/* Product info */}
          <div className="flex items-start gap-3 mb-5 pt-2">
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#1A1C19]">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-[#787868] mt-0.5 line-clamp-2">{product.description}</p>
              )}
              <p className="text-sm font-bold text-[#2C4F1B] mt-1">{formatRupiah(unitPrice)}</p>
            </div>
          </div>

          {/* Modifier groups */}
          {product.modifierGroups.map((group) => {
            const selectedInGroup = selected.filter((m) =>
              group.options.some((o) => o.id === m.id)
            );
            return (
              <div key={group.id} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-[#1A1C19]">{group.name}</span>
                  {group.isRequired ? (
                    <span className="text-[10px] bg-[#FDE8E8] text-red-600 font-bold px-2 py-0.5 rounded-full">
                      Wajib
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[#F3F4EF] text-[#787868] px-2 py-0.5 rounded-full">
                      Opsional
                    </span>
                  )}
                  <span className="text-[10px] text-[#787868] ml-auto">
                    {selectedInGroup.length}/{group.maxSelect}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isSelected = selected.some((m) => m.id === opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleModifier(group.id, opt)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-[#2C4F1B] bg-[#F7F9F5]'
                            : 'border-[#E8EBE4] hover:border-[#B5C4AD]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-[#2C4F1B] bg-[#2C4F1B]' : 'border-[#D5D9CE]'
                          }`}>
                            {isSelected && (
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-[#1A1C19]">{opt.name}</span>
                        </div>
                        {opt.price > 0 && (
                          <span className="text-xs text-[#787868]">+{formatRupiah(opt.price)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Catatan */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#43493E] mb-1.5">
              Catatan (opsional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Mis: tanpa sambal, ekstra nasi…"
              rows={2}
              className="w-full px-3 py-2 border border-[#D5D9CE] rounded-xl text-sm text-[#1A1C19] resize-none focus:outline-none focus:border-[#2C4F1B]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-[#EDEEE9]">
          {error && (
            <p className="text-xs text-red-600 mb-2 text-center">{error}</p>
          )}
          <div className="flex items-center gap-3">
            {/* Qty */}
            <div className="flex items-center gap-2 bg-[#F3F4EF] rounded-full px-2 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#2C4F1B] font-bold shadow-sm"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-bold text-[#1A1C19]">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#2C4F1B] font-bold shadow-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-br from-[#7C8B6F] to-[#2C4F1B] text-white rounded-full py-3 text-sm font-bold shadow-md"
            >
              Tambah — {formatRupiah(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
