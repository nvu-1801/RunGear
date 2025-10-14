"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as CartAPI from "@/modules/cart/cart.client";
import { safeGetUser, isTransientNetworkError } from "@/utils/auth-safe";
import { supabaseBrowser } from "@/libs/db/supabase/supabase-client";

export type CartItem = {
  id: string; // product id
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
function supaMsg(e: unknown) {
  const maybeErr =
    typeof e === "object" && e !== null && "error" in e
      ? (e as { error?: unknown }).error
      : e;
  if (!maybeErr) return "unknown";
  if (typeof maybeErr === "string") return maybeErr;
  const code = (maybeErr as { code?: unknown }).code;
  const message = (maybeErr as { message?: unknown }).message;
  const details = (maybeErr as { details?: unknown }).details;
  const parts = [code, message].filter(Boolean).join(" ");
  const det = details ? ` — ${String(details)}` : "";
  return parts ? parts + det : JSON.stringify(maybeErr);
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
    const mapped: CartItem[] = rows.map((r: unknown) => {
      const row = r as {
        product_id: string;
        slug: string;
        name: string;
        price_at_time: number;
        image?: string | null;
        qty: number;
      };
      return {
        id: row.product_id,
        slug: row.slug,
        name: row.name,
        price: row.price_at_time,
        image: row.image ?? undefined,
        variant: null, // server chưa lưu variant
        qty: row.qty,
      };
    });
    setItems(mapped);
  }

  /** helper: bắt lỗi server & không để reject rò rỉ */
  async function tryServer(task: () => Promise<unknown>) {
    try {
      await task();
      await loadFromServerReplaceLocal(); // đồng bộ lại từ DB
      return true;
    } catch (e: unknown) {
      console.error("cart/server failed:", supaMsg(e));
      return false;
    }
  }

  async function isLoggedIn() {
    const {
      data: { user },
    } = await sb.auth.getUser();
    return !!user;
  }

  /** ----- Auth state sync (merge guest -> server một lần) ----- */
  useEffect(() => {
    const { data: sub } = sb.auth.onAuthStateChange(async (evt, sess) => {
      const online = typeof navigator === "undefined" ? true : navigator.onLine;

      try {
        if (evt === "INITIAL_SESSION") {
          if (sess?.user && online) {
            await loadFromServerReplaceLocal();
            syncedOnce.current = true;
          } else {
            syncedOnce.current = false; // giữ local khi offline
          }
          return;
        }

        if (evt === "SIGNED_IN" && sess?.user) {
          if (!online) return; // chờ online để merge

          const mergedFor = localStorage.getItem("rg_cart_merged_for");
          if (mergedFor !== sess.user.id) {
            const guest = (() => {
              try {
                const raw = localStorage.getItem(LS_KEY);
                return raw ? (JSON.parse(raw) as CartItem[]) : [];
              } catch {
                return [];
              }
            })();

            try {
              await mergeGuestIntoServerSafe(guest); // bản safe (max qty) từ hướng dẫn trước
            } catch (e) {
              if (!isTransientNetworkError(e))
                console.warn("merge failed:", supaMsg(e));
            }
            localStorage.setItem("rg_cart_merged_for", sess.user.id);
            localStorage.removeItem(LS_KEY);
          }
          await loadFromServerReplaceLocal();
          syncedOnce.current = true;
          return;
        }

        if (evt === "SIGNED_OUT") {
          try {
            const raw = localStorage.getItem(LS_KEY);
            setItems(raw ? JSON.parse(raw) : []);
          } catch {
            setItems([]);
          }
          syncedOnce.current = false;
          localStorage.removeItem("rg_cart_merged_for");
          return;
        }
      } catch (e) {
        // đừng để reject rơi ra ngoài
        console.warn("auth state handler:", supaMsg(e));
      }
    });

    // khi online lại → đồng bộ cart từ server
    const onOnline = async () => {
      try {
        const user = await safeGetUser(sb);
        if (user) await loadFromServerReplaceLocal();
      } catch {}
    };
    window.addEventListener("online", onOnline);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("online", onOnline);
    };
  }, []);

  async function mergeGuestIntoServerSafe(guest: CartItem[]) {
    if (!guest.length || !CartAPI?.list) return;

    // Lấy giỏ hiện tại trên server
    const serverRows = await CartAPI.list();
    const serverMap = new Map<string, number>(
      serverRows.map((r: unknown) => {
        const row = r as { product_id: string; qty: number };
        return [row.product_id, row.qty] as [string, number];
      })
    );

    for (const g of guest) {
      const existing = serverMap.get(g.id) ?? 0;
      const target = Math.max(existing, g.qty);

      if (existing === 0) {
        // chưa có -> add đúng số lượng guest
        if (CartAPI?.add) await CartAPI.add(g.id, g.qty);
      } else if (target !== existing) {
        // đã có -> setQty về max (không cộng dồn)
        if (CartAPI?.setQty) await CartAPI.setQty(g.id, target);
      }
    }
  }

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

  function setQtyLocal(
    id: string,
    variant: string | null | undefined,
    next: number
  ) {
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
      prev.filter(
        (i) => !(i.id === id && (i.variant ?? null) === (variant ?? null))
      )
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
