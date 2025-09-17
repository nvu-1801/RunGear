"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;           // product id
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  variant?: string | null; // màu/size...
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (it: CartItem) => void;
  updateQty: (id: string, delta: number) => void; // ±1
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartState | null>(null);
const LS_KEY = "rg_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  // load/persist
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api: CartState = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return {
      items,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      addItem: (it) => {
        setItems((prev) => {
          const idx = prev.findIndex(
            p => p.id === it.id && p.variant === it.variant
          );
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], qty: copy[idx].qty + it.qty };
            return copy;
          }
          return [{ ...it }, ...prev];
        });
        setOpen(true);
      },
      updateQty: (id, delta) => {
        setItems((prev) => prev
          .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        );
      },
      remove: (id) => setItems((prev) => prev.filter(i => i.id !== id)),
      clear: () => setItems([]),
      count, subtotal,
    };
  }, [items, isOpen]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
