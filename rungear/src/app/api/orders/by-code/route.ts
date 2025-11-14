// app/api/orders/by-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

// Regex check chuỗi có phải UUID không
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Missing code", data: null },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const isUuid = UUID_REGEX.test(code);

    const selectCols = `
      id,
      order_code,
      created_at,
      status,
      total,
      amount,
      discount_amount,
      shipping_address,
      shipping_address_id,
      order_items (
        id,
        qty,
        price_at_time,
        product:products (
          id,
          name,
          slug,
          price,
          images,
          stock,
          status
        )
      )
    `;

    // base query
    let q = supabase.from("orders").select(selectCols).eq("user_id", user.id);

    // Nếu code là UUID → tìm theo id
    // Ngược lại → tìm theo order_code (ví dụ ORD1763044572051796)
    if (isUuid) {
      q = q.eq("id", code);
    } else {
      q = q.eq("order_code", code);
    }

    const { data, error } = await q.maybeSingle();

    if (error) {
      console.error("[GET /api/orders/by-code] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message, data: null },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { ...data, order_items: data.order_items ?? [] } },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/orders/by-code] Exception:", err);
    return NextResponse.json(
      { success: false, message: msg, data: null },
      { status: 500 }
    );
  }
}
