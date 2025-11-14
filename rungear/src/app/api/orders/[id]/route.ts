import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

function asOrderCodeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    const n = Number(v.trim());
    if (n > Number.MAX_SAFE_INTEGER || n < Number.MIN_SAFE_INTEGER) {
      console.warn("order_code exceeds safe integer range:", n);
      return null;
    }
    return n;
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
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
        { success: false, error: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const codeNum = asOrderCodeNumber(id);
    if (codeNum === null) {
      console.warn("[GET /api/orders/[id]] Invalid order code:", id);
      return NextResponse.json(
        { success: false, error: "Invalid order code", data: null },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            id,
            name,
            image_url
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("order_code", codeNum)
      .single();

    if (error) {
      console.error("[GET /api/orders/[id]] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message, data: null },
        { status: 404 }
      );
    }

    if (!data) {
      console.warn("[GET /api/orders/[id]] Order not found:", codeNum);
      return NextResponse.json(
        { success: false, error: "Order not found", data: null },
        { status: 404 }
      );
    }

    console.log("[GET /api/orders/[id]] Success:", {
      order_id: data.id,
      order_code: data.order_code,
      items_count: data.order_items?.length || 0,
    });

    // ✅ Ensure order_items is always an array
    const responseData = {
      ...data,
      order_items: Array.isArray(data.order_items) ? data.order_items : [],
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/orders/[id]] Exception:", error);
    return NextResponse.json(
      { success: false, error: errorMessage, data: null },
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

    // Get current user
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

    // Validate
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

    // Get current user
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
