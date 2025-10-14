// modules/cart/cart.client.ts
"use client";
import { supabaseBrowser } from "@/libs/db/supabase/supabase-client";

function throwIf(error: unknown, where: string) {
  if (!error) return;
  const e = error as { code?: unknown; message?: unknown; details?: unknown };
  const msg = [e.code, e.message].filter(Boolean).join(" ") || "Unknown";
  const err = new Error(`${where}: ${msg}`);
  // attach metadata safely (cast to unknown -> record)
  (err as unknown as Record<string, unknown>)["code"] = e.code;
  (err as unknown as Record<string, unknown>)["details"] = e.details;
  throw err;
}

async function ensureOpenCart(sb = supabaseBrowser()) {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("AUTH_REQUIRED");

  const { data: existing, error: e0 } = await sb
    .from("carts")
    .select("id,status")
    .eq("user_id", user.id)
    .eq("status", "open")
    .maybeSingle();
  throwIf(e0, "carts.select");

  if (existing?.id) return existing.id;

  const { data, error: e1 } = await sb
    .from("carts")
    .insert({ user_id: user.id, status: "open" })
    .select("id")
    .single();
  throwIf(e1, "carts.insert");

  return String((data as { id?: unknown } | null)?.id);
}

export async function list() {
  const sb = supabaseBrowser();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data: cart, error: e0 } = await sb
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "open")
    .maybeSingle();
  throwIf(e0, "carts.select");
  if (!cart?.id) return [];

  const { data, error: e1 } = await sb
    .from("cart_items")
    .select(
      `
    product_id,
    qty,
    price_at_time,
    product:products!cart_items_product_id_fkey ( id, name, slug, images )
  `
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false }); // 👈 thêm order
  throwIf(e1, "cart_items.select");

  return (data ?? []).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const product = r["product"] as Record<string, unknown> | null | undefined;
    const images = product?.["images"];
    const image = Array.isArray(images)
      ? (images[0] as string | null) ?? null
      : typeof images === "string"
      ? images
      : null;

    return {
      product_id: String(r["product_id"] ?? ""),
      qty: Number(r["qty"] ?? 0),
      price_at_time: Number(r["price_at_time"] ?? 0),
      name:
        typeof product?.["name"] === "string"
          ? (product!["name"] as string)
          : "",
      slug:
        typeof product?.["slug"] === "string"
          ? (product!["slug"] as string)
          : "",
      image,
    };
  });
}

export async function add(productId: string, qty = 1) {
  const sb = supabaseBrowser();
  const cartId = await ensureOpenCart(sb);
  const { error } = await sb.rpc("add_to_cart", {
    p_cart_id: cartId,
    p_product_id: productId,
    p_qty: qty,
  });
  throwIf(error, "rpc.add_to_cart");
}

export async function setQty(productId: string, qty: number) {
  const sb = supabaseBrowser();
  const cartId = await ensureOpenCart(sb);

  const { data: exist, error: e1 } = await sb
    .from("cart_items")
    .select("id")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();
  throwIf(e1, "cart_items.select_for_update");

  if (exist?.id) {
    const { error: e2 } = await sb
      .from("cart_items")
      .update({ qty: Math.max(1, qty) })
      .eq("id", exist.id);
    throwIf(e2, "cart_items.update_qty");
  }
}

export async function remove(productId: string) {
  const sb = supabaseBrowser();
  const cartId = await ensureOpenCart(sb);
  const { error } = await sb
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  throwIf(error, "cart_items.delete");
}

export async function clearAll() {
  const sb = supabaseBrowser();
  const cartId = await ensureOpenCart(sb);
  const { error } = await sb.from("cart_items").delete().eq("cart_id", cartId);
  throwIf(error, "cart_items.clear");
}
