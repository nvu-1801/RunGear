import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 GET /api/orders/[id]:", id);

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: Normalize orderCode - Thêm prefix "ORD" nếu là number
    let orderCode: string;

    if (/^\d+$/.test(id)) {
      // Case 1: ID là pure number (từ PayOS redirect)
      orderCode = `ORD${id}`;
      console.log("  Normalized to:", orderCode);
    } else if (id.startsWith("ORD")) {
      // Case 2: ID đã có prefix "ORD"
      orderCode = id;
      console.log("  Using orderCode:", orderCode);
    } else {
      // Case 3: ID là UUID
      console.log("  Treating as UUID:", id);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            products(id, name, slug, images)
          ),
          discount_codes(id, code, type, percent_off, amount_off)
        `
        )
        .eq("user_id", user.id)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Query error (UUID):", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }

      console.log("✅ Order found (UUID):", data.id, data.order_code, data.status);
      return NextResponse.json({ success: true, data });
    }

    // ✅ Query by order_code (string with "ORD" prefix)
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(id, name, slug, images)
        ),
        discount_codes(id, code, type, percent_off, amount_off)
      `
      )
      .eq("user_id", user.id)
      .eq("order_code", orderCode)
      .maybeSingle();

    if (error) {
      console.error("Query error (orderCode):", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.log("❌ Order not found for code:", orderCode);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("✅ Order found:", data.id, data.order_code, data.status);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, paid_at } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Thiếu trạng thái đơn hàng" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "PAID",
      "CANCELLED",
      "FAILED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = { status };
    if (status === "PAID" && paid_at) {
      payload.paid_at = paid_at;
    }

    console.log("PUT order payload:", payload);

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT order error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("PUT order success:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("PUT order error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log("DELETE order id:", id);

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase DELETE order error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("DELETE order success");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("DELETE order error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
