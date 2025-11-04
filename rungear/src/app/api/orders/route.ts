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

    const { data, error } = await supabase
      .from("orders")
      .select("*, user_addresses(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET orders error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.log("GET orders success:", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET orders error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // 1. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await req.json();
    const {
      items,
      discount_code_id,
      shipping_address,
      subtotal,
      discount,
      shipping_fee,
      total,
    } = body;

    console.log("POST /api/orders - Body:", body);

    // 3. Validate
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Giỏ hàng trống" },
        { status: 400 }
      );
    }

    if (
      !shipping_address?.full_name ||
      !shipping_address?.phone ||
      !shipping_address?.email ||
      !shipping_address?.address_line ||
      !shipping_address?.province ||
      !shipping_address?.district
    ) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin giao hàng" },
        { status: 400 }
      );
    }

    // 4. Kiểm tra địa chỉ đã tồn tại trong user_addresses chưa
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("full_name", shipping_address.full_name)
      .eq("phone", shipping_address.phone)
      .eq("address_line", shipping_address.address_line)
      .eq("province", shipping_address.province)
      .eq("district", shipping_address.district)
      .maybeSingle();

    let shippingAddressId: string;

    if (existingAddress) {
      // ✅ Đã có địa chỉ → Dùng luôn
      shippingAddressId = existingAddress.id;
      console.log("Using existing address ID:", shippingAddressId);
    } else {
      // ❌ Chưa có → Insert mới vào user_addresses
      const { data: newAddress, error: addressError } = await supabase
        .from("user_addresses")
        .insert({
          user_id: user.id,
          full_name: shipping_address.full_name,
          phone: shipping_address.phone,
          email: shipping_address.email,
          address_line: shipping_address.address_line,
          province: shipping_address.province,
          district: shipping_address.district,
          ward: shipping_address.ward || null,
          note: shipping_address.note || null,
          is_default: false,
        })
        .select("id")
        .single();

      if (addressError) {
        console.error("Insert user_addresses error:", addressError);
        return NextResponse.json(
          { success: false, message: "Không thể lưu địa chỉ giao hàng" },
          { status: 500 }
        );
      }

      shippingAddressId = newAddress.id;
      console.log("Created new address ID:", shippingAddressId);
    }

    // 5. Tạo order_code unique (timestamp + random)
    const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 6. Insert vào bảng orders
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_code: orderCode,
        status: "PENDING",
        total: total,
        amount: total,
        discount_code_id: discount_code_id || null,
        discount_amount: discount || 0,
        shipping_address: shipping_address, // ← Lưu full JSON vào field jsonb
        shipping_address_id: shippingAddressId, // ← FK đến user_addresses
        payment_link_id: null,
        paid_at: null,
        created_at: new Date().toISOString(),
      })
      .select("id, order_code")
      .single();

    if (orderError) {
      console.error("Insert order error:", orderError);
      return NextResponse.json(
        { success: false, message: "Không thể tạo đơn hàng" },
        { status: 500 }
      );
    }

    console.log("Order created:", orderData);

    // 7. Insert items vào order_items
    const orderItems = items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.id,
      qty: item.qty,
      price_at_time: item.price,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Insert order_items error:", itemsError);
      // Rollback: Xóa order vừa tạo
      await supabase.from("orders").delete().eq("id", orderData.id);
      return NextResponse.json(
        { success: false, message: "Không thể lưu chi tiết đơn hàng" },
        { status: 500 }
      );
    }

    console.log("Order items inserted:", orderItems.length);

    // 8. Return success
    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: orderData.id,
          orderCode: orderData.order_code,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}