'use client';

import React from 'react';
import { useCart } from '@/lib/CartContext';
import Image from 'next/image';

interface Props {
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ onClose, onCheckout }: Props) {
  const { items, updateQuantity, updateNotes, removeItem, totalPrice, totalItems } = useCart();

  const ppn   = Math.round(totalPrice * 0.11);
  const total = totalPrice + ppn;

  return (
    <>
      {/* Overlay */}
      <div className="bottom-sheet-overlay animate-fadeIn" onClick={onClose} />

      {/* Full-page drawer */}
      <div
        className="animate-slideUp"
        style={{
          position: 'fixed', inset: 0,
          left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: 'var(--surface)',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* ── Top App Bar ── */}
        <header
          style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: 'rgba(249,250,242,0.88)',
            backdropFilter: 'blur(16px)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(194,201,187,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                width: 40, height: 40, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: 'var(--surface-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)', fontSize: 22 }}>arrow_back</span>
            </button>
            <h1 className="font-headline" style={{ color: 'var(--on-surface)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
              Lioo.io
            </h1>
          </div>
          <button
            style={{
              width: 40, height: 40, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'var(--surface-container-low)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 22 }}>shopping_cart</span>
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, borderRadius: 99,
                  background: 'var(--primary)',
                }}
              />
            )}
          </button>
        </header>

        <main
          style={{
            flex: 1, padding: '24px 16px',
            display: 'flex', flexDirection: 'column', gap: 32,
          }}
        >
          {/* ── Cart Items ── */}
          <section>
            <h2 className="font-headline" style={{ fontSize: 24, fontWeight: 800, color: 'var(--on-surface)', marginBottom: 16, paddingLeft: 4 }}>
              Your Order
            </h2>

            {items.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 16, padding: '48px 0',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 99,
                  background: 'var(--surface-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-muted)', fontSize: 40 }}>shopping_cart</span>
                </div>
                <p className="font-headline" style={{ color: 'var(--on-surface-variant)', fontSize: 16, fontWeight: 600 }}>Keranjang Masih Kosong</p>
                <button
                  onClick={onClose}
                  className="btn-primary"
                  style={{ padding: '11px 28px', fontSize: 14 }}
                >
                  Jelajahi Menu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    className="animate-slideUp"
                    style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      border: '1px solid rgba(194,201,187,0.2)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      padding: '14px 14px',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: 76, height: 76, borderRadius: 12, flexShrink: 0,
                      overflow: 'hidden', background: 'var(--surface-container)',
                    }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍃</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="font-headline" style={{ color: 'var(--on-surface)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: 'var(--on-surface-variant)', padding: '2px', flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                        </button>
                      </div>

                      {/* Editable Notes field */}
                      <div style={{ position: 'relative', marginBottom: 12, marginTop: 4 }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--on-surface-variant)', opacity: 0.7 }}>edit_note</span>
                        <input
                          type="text"
                          placeholder="Catatan tambahan (opsional)..."
                          value={item.notes || ''}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(194,201,187,0.1)',
                            border: '1px dashed rgba(194,201,187,0.8)',
                            borderRadius: 8,
                            padding: '8px 10px 8px 30px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--on-surface)',
                            fontFamily: 'Manrope',
                            outline: 'none',
                            transition: 'all 0.2s',
                          }}
                          onFocus={(e) => { e.target.style.border = '1px solid var(--primary)'; e.target.style.background = '#ffffff' }}
                          onBlur={(e) => { e.target.style.border = '1px dashed rgba(194,201,187,0.8)'; e.target.style.background = 'rgba(194,201,187,0.1)' }}
                        />
                      </div>

                      {/* Price + Stepper */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="font-headline" style={{ color: 'var(--on-surface)', fontSize: 14, fontWeight: 700 }}>
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'var(--surface-container-low)',
                            borderRadius: 99, padding: '4px 6px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              width: 24, height: 24, borderRadius: 99, border: 'none',
                              cursor: 'pointer', background: 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: item.quantity === 1 ? '#ba1a1a' : 'var(--on-surface)' }}>
                              {item.quantity === 1 ? 'delete' : 'remove'}
                            </span>
                          </button>
                          <span className="font-label" style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center', color: 'var(--on-surface)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: 24, height: 24, borderRadius: 99, border: 'none',
                              cursor: 'pointer', background: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── KedaiPay Option ── */}
          {items.length > 0 && (
            <section
              style={{
                background: 'rgba(188,240,174,0.15)',
                border: '2px dashed rgba(45,90,39,0.25)',
                borderRadius: 16, padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--primary-container)',
                    fontSize: 24,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  account_balance_wallet
                </span>
                <span className="font-body" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                  Pay with KedaiPay
                </span>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 22 }}>chevron_right</span>
            </section>
          )}

          {/* ── Price Summary ── */}
          {items.length > 0 && (
            <section
              style={{
                background: 'var(--surface-container)',
                borderRadius: 16, padding: '22px 20px',
                display: 'flex', flexDirection: 'column', gap: 12,
                marginBottom: 80,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Subtotal</span>
                <span className="font-headline" style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 14 }}>
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Tax 11%</span>
                <span className="font-headline" style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 14 }}>
                  Rp {ppn.toLocaleString('id-ID')}
                </span>
              </div>

              <div style={{
                borderTop: '1px solid rgba(194,201,187,0.4)',
                paddingTop: 14, marginTop: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              }}>
                <div>
                  <p
                    className="font-label"
                    style={{ color: 'var(--on-surface-muted)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}
                  >
                    Total Amount
                  </p>
                  <p className="font-headline" style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
                    Rp {total.toLocaleString('id-ID')}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: '#a1d494', fontSize: 36, fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </section>
          )}
        </main>

        {/* ── Fixed Checkout Button ── */}
        {items.length > 0 && (
          <div style={{
            position: 'sticky', bottom: 0,
            padding: '12px 16px 20px',
            background: 'rgba(249,250,242,0.92)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(194,201,187,0.2)',
          }}>
            <button
              onClick={onCheckout}
              style={{
                width: '100%', padding: '16px 24px',
                background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(21,66,18,0.25)',
              }}
            >
              <span className="font-headline" style={{ fontSize: 17, fontWeight: 700 }}>Checkout</span>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
