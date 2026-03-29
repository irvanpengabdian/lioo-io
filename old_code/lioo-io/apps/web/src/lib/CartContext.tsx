'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: string;
  addItem: (product: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'kedai_cart_items';

export function CartProvider({ children, tableNumber }: { children: React.ReactNode; tableNumber: string }) {
  // Initialize from sessionStorage so cart survives navigation between pages
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage whenever items change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  const addItem = useCallback((product: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        // Replace quantity and notes with the new selection
        return prev.map((i) => i.id === product.id
          ? { ...i, quantity: product.quantity, notes: product.notes, image_url: product.image_url, price: product.price }
          : i
        );
      }
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, notes } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, tableNumber, addItem, removeItem, updateQuantity, updateNotes, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
