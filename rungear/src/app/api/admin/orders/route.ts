// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👇 kiểm tra quyền admin (tuỳ cách bạn lưu role)
    const isAdmin =
      (user.app_metadata as any)?.role === "admin" ||
      (user.user_metadata as any)?.is_admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    const { data, error, count } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
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
      `,
        { count: "exact" }
      )
      // ❌ KHÔNG .eq("user_id", user.id) nữa
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase GET admin orders error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET admin orders error:", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
