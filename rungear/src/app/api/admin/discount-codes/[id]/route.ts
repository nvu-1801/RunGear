import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await supabaseServer();

    const id = params.id;
    const body = await req.json();
    const {
      code,
      type,
      percent_off,
      amount_off,
      start_at,
      end_at,
      enabled,
      max_uses,
      per_user_limit,
      min_order_amount,
      notes,
    } = body;

    // Validate
    if (!code || !type) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã giảm giá hoặc loại" },
        { status: 400 }
      );
    }

    if (
      type === "percent" &&
      (!percent_off || percent_off <= 0 || percent_off > 100)
    ) {
      return NextResponse.json(
        { success: false, error: "percent_off phải từ 0–100 khi type=percent" },
        { status: 400 }
      );
    }
    if (type === "fixed" && (!amount_off || amount_off <= 0)) {
      return NextResponse.json(
        { success: false, error: "amount_off phải > 0 khi type=fixed" },
        { status: 400 }
      );
    }

    const payload: any = {
      code: code.trim().toUpperCase(),
      type,
      start_at: start_at || new Date().toISOString(),
      end_at: end_at || null,
      enabled: enabled ?? true,
      max_uses: max_uses || null,
      per_user_limit: per_user_limit || 1,
      min_order_amount: min_order_amount || 0,
      notes: notes || null,
    };

    if (type === "percent") {
      payload.percent_off = percent_off;
      payload.amount_off = null;
    } else {
      payload.amount_off = amount_off;
      payload.percent_off = null;
    }

    console.log("PUT payload:", payload);

    const { data, error } = await supabase
      .from("discount_codes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("PUT discount_codes success:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("PUT discount_codes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
     const supabase = await supabaseServer();

    const id = params.id;

    console.log("DELETE id:", id);

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("DELETE discount_codes success");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE discount_codes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
