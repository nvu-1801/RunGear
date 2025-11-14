import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("[GET /api/orders/[id]] Fetching order:", id);

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[GET /api/orders/[id]] Auth error:", userError);
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // ✅ FIX: Query by ID (uuid), not order_code
    // ✅ FIX: Select correct column names: qty, price_at_time
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_code,
        created_at,
        status,
        total,
        amount,
        discount_amount,
        shipping_address,
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
      `
      )
      .eq("id", id) // ✅ Query by UUID
      .eq("user_id", user.id) // ✅ Security check
      .maybeSingle(); // ✅ Returns null if not found

    if (error) {
      console.error("[GET /api/orders/[id]] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message, data: null },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn("[GET /api/orders/[id]] Order not found:", id);
      return NextResponse.json(
        { success: false, message: "Order not found", data: null },
        { status: 404 }
      );
    }

    // ✅ Ensure order_items is always an array
    const responseData = {
      ...data,
      order_items: Array.isArray(data.order_items) ? data.order_items : [],
    };

    console.log("[GET /api/orders/[id]] Success:", {
      order_id: responseData.id,
      order_code: responseData.order_code,
      items_count: responseData.order_items.length,
    });

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/orders/[id]] Exception:", error);
    return NextResponse.json(
      { success: false, message: errorMessage, data: null },
      { status: 500 }
    );
  }
}

// PUT and DELETE remain the same...
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
      console.error("[PUT /api/orders/[id]] Auth error:", userError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, paid_at } = body;

    console.log("[PUT /api/orders/[id]] Update request:", {
      id,
      status,
      paid_at,
    });

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

    const payload: Record<string, unknown> = {
      status,
    };

    if (status === "PAID" && paid_at) {
      payload.paid_at = paid_at;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/orders/[id]] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("[PUT /api/orders/[id]] Success:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[PUT /api/orders/[id]] Exception:", error);
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
      console.error("[DELETE /api/orders/[id]] Auth error:", userError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log("[DELETE /api/orders/[id]] Delete request:", id);

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[DELETE /api/orders/[id]] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("[DELETE /api/orders/[id]] Success");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[DELETE /api/orders/[id]] Exception:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
