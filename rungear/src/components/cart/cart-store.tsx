"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as CartAPI from "@/modules/cart/cart.client";
import { supabaseBrowser } from "@/libs/db/supabase/supabase-client";

export type CartItem = {
  id: string;           // product id
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  variant?: string | null; // màu/size (server hiện chưa lưu)
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (it: CartItem) => void;
  updateQty: (id: string, delta: number, variant?: string | null) => void; // ±1
  remove: (id: string, variant?: string | null) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartState | null>(null);
const LS_KEY = "rg_cart_v1";

/** ----- Utils ----- */
function supaMsg(e: any) {
  const err = e?.error ?? e;
  if (!err) return "unknown";
  if (typeof err === "string") return err;
  const parts = [err.code, err.message].filter(Boolean).join(" ");
  const det = err.details ? ` — ${err.details}` : "";
  return parts ? parts + det : JSON.stringify(err);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const sb = supabaseBrowser();
  const syncedOnce = useRef(false);

  /** ----- Local load/persist ----- */
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

  /** ----- Server sync helpers ----- */
  async function loadFromServerReplaceLocal() {
    if (!CartAPI?.list) return;
    const rows = await CartAPI.list();
    const mapped: CartItem[] = rows.map((r) => ({
      id: r.product_id,
      slug: r.slug,
      name: r.name,
      price: r.price_at_time,
      image: r.image ?? undefined,
      variant: null, // server chưa lưu variant
      qty: r.qty,
    }));
    setItems(mapped);
  }

  async function mergeGuestIntoServer(guest: CartItem[]) {
    if (!guest.length || !CartAPI?.add) return;
    // đẩy số lượng của từng item lên server
    await Promise.all(guest.map((g) => CartAPI.add(g.id, g.qty)));
  }

  /** helper: bắt lỗi server & không để reject rò rỉ */
  async function tryServer(task: () => Promise<any>) {
    try {
      await task();
      await loadFromServerReplaceLocal(); // đồng bộ lại từ DB
      return true;
    } catch (e) {
      console.error("cart/server failed:", supaMsg(e));
      return false;
    }
  }

  async function isLoggedIn() {
    const { data: { user } } = await sb.auth.getUser();
    return !!user;
  }

  /** ----- Auth state sync (merge guest -> server một lần) ----- */
  useEffect(() => {
    const sub = sb.auth.onAuthStateChange(async (_evt, sess) => {
      try {
        if (sess?.user) {
          if (!syncedOnce.current) {
            const guest = (() => {
              try {
                const raw = localStorage.getItem(LS_KEY);
                return raw ? (JSON.parse(raw) as CartItem[]) : [];
              } catch {
                return [];
              }
            })();
            try {
              await mergeGuestIntoServer(guest);
            } catch (e) {
              console.warn("merge guest->server failed:", supaMsg(e));
            }
            syncedOnce.current = true;
          }
          try {
            await loadFromServerReplaceLocal();
          } catch (e) {
            console.warn("load server cart failed:", supaMsg(e));
          }
        } else {
          // logout -> quay về local
          try {
            const raw = localStorage.getItem(LS_KEY);
            setItems(raw ? JSON.parse(raw) : []);
          } catch {
            setItems([]);
          }
          syncedOnce.current = false;
        }
      } catch (e) {
        console.warn("onAuthStateChange handler error:", supaMsg(e));
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  /** ----- Local optimistic helpers ----- */
  function upsertLocal(it: CartItem) {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) => p.id === it.id && (p.variant ?? null) === (it.variant ?? null)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + it.qty };
        return copy;
      }
      return [{ ...it }, ...prev];
    });
  }

  function setQtyLocal(id: string, variant: string | null | undefined, next: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && (i.variant ?? null) === (variant ?? null)
          ? { ...i, qty: Math.max(1, next) }
          : i
      )
    );
  }

  function removeLocal(id: string, variant?: string | null) {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && (i.variant ?? null) === (variant ?? null)))
    );
  }

  /** ----- API exposed to UI ----- */
  const api: CartState = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

    return {
      items,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),

      /** LUÔN add local trước (UX mượt), nếu logged-in thì sync server sau, không để promise rò rỉ */
      addItem: (it) => {
        upsertLocal({ ...it, qty: Math.max(1, it.qty) });
        setOpen(true);

        // chạy nền an toàn (nuốt lỗi bên trong tryServer)
        (async () => {
          if (!(await isLoggedIn()) || !CartAPI?.add) return;
          await tryServer(() => CartAPI.add(it.id, it.qty));
        })();
      },

      updateQty: (id, delta, variant) => {
        const cur = items.find(
          (i) => i.id === id && (i.variant ?? null) === (variant ?? null)
        );
        const next = Math.max(1, (cur?.qty ?? 1) + delta);
        setQtyLocal(id, variant, next);

        (async () => {
          if (!(await isLoggedIn()) || !CartAPI?.setQty) return;
          await tryServer(() => CartAPI.setQty(id, next));
        })();
      },

      remove: (id, variant) => {
        removeLocal(id, variant);

        (async () => {
          if (!(await isLoggedIn()) || !CartAPI?.remove) return;
          await tryServer(() => CartAPI.remove(id));
        })();
      },

      clear: () => {
        setItems([]);

        (async () => {
          if (!(await isLoggedIn()) || !CartAPI?.clearAll) return;
          await tryServer(() => CartAPI.clearAll());
        })();
      },

      count,
      subtotal,
    };
  }, [items, isOpen]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
