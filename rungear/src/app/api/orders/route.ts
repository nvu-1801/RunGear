

// =============================
// 2) app/api/orders/route.ts
// =============================
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";

// ---- Schemas ----
const ShippingSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  address_line: z.string().min(3),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().optional(),
  note: z.string().optional(),
});

const ItemSchema = z.object({
  id: z.string().uuid(), // product_id
  qty: z.number().int().positive().max(1000),
});

const CreateOrderSchema = z.object({
  items: z.array(ItemSchema).min(1),
  discount_code_id: z.string().uuid().optional().nullable(),
  shipping_address: ShippingSchema,
  shipping_fee: z.number().int().min(0).default(0),
});

// ---- Helpers ----
function json(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

function genOrderCode() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

// ---- GET ----
// ---- GET ----
export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: userRes, error: userError } = await supabase.auth.getUser();
    if (userError || !userRes.user) return json({ success: false, message: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    if (id) {
      // single order detail (giữ nguyên)
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, order_code, created_at, status, total, amount, discount_amount, shipping_address,
          order_items (
            id, qty, price_at_time,
            product:products ( id, name, slug, price, images, stock, status )
          )
        `)
        .eq("id", id)
        .eq("user_id", userRes.user.id)
        .single();
      if (error) return json({ success: false, message: error.message }, 400);
      return json({ success: true, data });
    } else {
      // ✅ thêm shipping_address
      const { data, error, count } = await supabase
        .from("orders")
        .select(
          `id, order_code, created_at, status, total, amount, payment_link_id, paid_at, shipping_address`,
          { count: "exact" }
        )
        .eq("user_id", userRes.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) return json({ success: false, message: error.message }, 400);
      return json({ success: true, data, count });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return json({ success: false, message: msg }, 500);
  }
}

// ---- PATCH ----
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // auth
    const { data: userRes, error: authError } = await supabase.auth.getUser();
    if (authError || !userRes.user) return json({ success: false, message: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const id = String(body?.id ?? "");
    const next = String(body?.status ?? "").toUpperCase();

    const ALLOWED = ["PENDING", "PROCESSING", "PAID", "CANCELLED", "FAILED"];
    if (!id) return json({ success: false, message: "Missing id" }, 400);
    if (!ALLOWED.includes(next)) return json({ success: false, message: "Invalid status" }, 400);

    const patch: Record<string, any> = { status: next };
    patch.paid_at = next === "PAID" ? new Date().toISOString() : null;

    // Ràng buộc: chỉ cho phép sửa đơn của chính user (nếu đây là My Orders)
    // Nếu đây là admin dashboard, tách route admin và dùng service-role (khuyến nghị).
    const { error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userRes.user.id);

    if (error) return json({ success: false, message: error.message }, 400);
    return json({ success: true, data: { id, status: next } });
  } catch (e: any) {
    return json({ success: false, message: e?.message ?? "Internal Server Error" }, 500);
  }
}

