import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload: Record<string, unknown> = {
      code: String(code).trim().toUpperCase(),
      type,
      start_at: start_at || new Date().toISOString(),
      end_at: end_at || null,
      enabled: enabled ?? true,
      max_uses: max_uses ?? null,
      per_user_limit: per_user_limit ?? 1,
      min_order_amount: min_order_amount ?? 0,
      notes: notes ?? null,
      created_by: user?.id ?? null,
      percent_off: type === "percent" ? percent_off : null,
      amount_off: type === "fixed" ? amount_off : null,
    };

    const { data, error } = await supabase
      .from("discount_codes")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
