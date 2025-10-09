import { NextResponse } from "next/server";
import { listProducts } from "@/modules/products/controller/product.service"; // Đảm bảo đường dẫn tới service của bạn
import { supabaseServer } from "@/libs/db/supabase/supabase-server";


// API GET: Lấy thông tin sản phẩm theo ID
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // ⬅️ bắt buộc await ở Next mới

  try {
    const body = await req.json();
    const { name, price, stock, images, status, categories_id } = body;

    // Build payload chỉ với cột TỒN TẠI trong bảng
    const payload: Record<string, any> = {};
    if (name !== undefined) payload.name = name;
    if (price !== undefined) payload.price = Number(price);
    if (stock !== undefined) payload.stock = Number(stock);
    if (status !== undefined) payload.status = status;
    if (categories_id !== undefined) payload.categories_id = categories_id;
    if (images !== undefined) payload.images = images ?? null; // ⬅️ dùng đúng tên cột
    console.log("PUT /products/:id", { id, payload });


    const sb = await supabaseServer();
    const { data, error } = await sb
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      // log để debug nhanh tại server
      console.error("PUT /api/products/:id error:", { id, payload, error });
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("PUT /api/products/:id exception:", e);
    return NextResponse.json({ message: e?.message ?? "Server error" }, { status: 500 });
  }
}