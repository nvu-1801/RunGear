// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

// 👉 helper check admin: bạn có thể chỉnh lại cho khớp profile.role = 'admin'
async function assertAdmin() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, isAdmin: false, error: "Unauthorized" as const };
  }

  // TODO: nếu bạn dùng profile.role = 'admin' thì có thể query thêm bảng profiles ở đây
  const isAdmin =
    (user.app_metadata as any)?.role === "admin" ||
    (user.user_metadata as any)?.is_admin === true;

  return { supabase, user, isAdmin, error: null };
}

/* ============ GET /api/admin/orders/[id] ============ */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[GET /api/admin/orders/[id]] Fetching order:", id);

    const { supabase, isAdmin, error } = await assertAdmin();

    if (error === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden", data: null },
        { status: 403 }
      );
    }

    const { data, error: dbError } = await supabase
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
      `
      )
      .eq("id", id) // 👉 admin: không filter user_id
      .maybeSingle();

    if (dbError) {
      console.error("[GET /api/admin/orders/[id]] Supabase error:", dbError);
      return NextResponse.json(
        { success: false, message: dbError.message, data: null },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn("[GET /api/admin/orders/[id]] Order not found:", id);
      return NextResponse.json(
        { success: false, message: "Order not found", data: null },
        { status: 404 }
      );
    }

    const responseData = {
      ...data,
      order_items: Array.isArray(data.order_items) ? data.order_items : [],
    };

    console.log("[GET /api/admin/orders/[id]] Success:", {
      order_id: responseData.id,
      order_code: responseData.order_code,
      items_count: responseData.order_items.length,
    });

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/admin/orders/[id]] Exception:", err);
    return NextResponse.json(
      { success: false, message: errorMessage, data: null },
      { status: 500 }
    );
  }
}

/* ============ PUT /api/admin/orders/[id] ============ */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // không cần Promise cũng được
) {
  try {
    const { id } = params;
    const { supabase, isAdmin, error } = await assertAdmin();

    if (error === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, paid_at } = body as {
      status?: string;
      paid_at?: string | null;
    };

    console.log("[PUT /api/admin/orders/[id]] Update request:", {
      id,
      status,
      paid_at,
    });

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Thiếu trạng thái đơn hàng" },
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
        { success: false, message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = { status };

    if (status === "PAID" && paid_at) {
      payload.paid_at = paid_at;
    }

    // ❗ Quan trọng: KHÔNG select / single nữa
    const { error: dbError } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id);

    if (dbError) {
      console.error("[PUT /api/admin/orders/[id]] Supabase error:", dbError);
      return NextResponse.json(
        { success: false, message: dbError.message },
        { status: 400 }
      );
    }

    console.log("[PUT /api/admin/orders/[id]] Success");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[PUT /api/admin/orders/[id]] Exception:", err);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/* ============ DELETE /api/admin/orders/[id] ============ */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, isAdmin, error } = await assertAdmin();

    if (error === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    console.log("[DELETE /api/admin/orders/[id]] Delete request:", id);

    const { error: dbError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id); // 👉 admin: không filter user_id

    if (dbError) {
      console.error("[DELETE /api/admin/orders/[id]] Supabase error:", dbError);
      return NextResponse.json(
        { success: false, message: dbError.message },
        { status: 400 }
      );
    }

    console.log("[DELETE /api/admin/orders/[id]] Success");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("[DELETE /api/admin/orders/[id]] Exception:", err);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
