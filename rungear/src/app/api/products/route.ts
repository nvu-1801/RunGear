// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import {
  listProducts,
  createProduct,
} from "@/modules/products/controller/product.service";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const cat = (searchParams.get("cat") || "all") as any;
    const products = await listProducts({ q, cat });
    return NextResponse.json(products); // Trả về dữ liệu sản phẩm dưới dạng JSON
  } catch (err) {
    console.error("/api/products GET error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// API POST: Tạo sản phẩm mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body: { name, price, slug, description?, images?, categorySlug }
    const created = await createProduct(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("/api/products POST error", err);
    return NextResponse.json(
      { error: err?.message ?? "Create failed" },
      { status: 400 }
    );
  }
}

// API DELETE: Xoá sản phẩm theo ID
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("DELETE /api/products/:id error:", { id, error });
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (!data)
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/products/:id exception:", e);
    return NextResponse.json(
      { message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
