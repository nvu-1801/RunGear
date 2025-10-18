import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Get current user
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

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET orders error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("GET orders success:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Get current user
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

    const body = await req.json();
    const {
      order_code,
      total,
      amount,
      shipping_address,
      payment_link_id,
      discount_code_id,
    } = body;

    // Validate
    if (!order_code || !total || !amount) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin đơn hàng" },
        { status: 400 }
      );
    }

    const payload: any = {
      user_id: user.id,
      order_code,
      total,
      amount,
      status: "PENDING",
      shipping_address: shipping_address || null,
      payment_link_id: payment_link_id || null,
      discount_code_id: discount_code_id || null,
    };

    console.log("POST order payload:", payload);

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase POST order error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log("POST order success:", data);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error("POST order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}