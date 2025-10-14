// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts } from "@/modules/products/controller/product.service"; // Đảm bảo đường dẫn tới service của bạn
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const catParam = searchParams.get("cat") || "all";

    // Đảm bảo cat đúng kiểu CatKey
    const validCats = ["all", "giay", "quan-ao"] as const;
    const cat = validCats.includes(catParam as any)
      ? (catParam as (typeof validCats)[number])
      : "all";

    const products = await listProducts({ q, cat });
    return NextResponse.json(products); // Trả về dữ liệu sản phẩm dưới dạng JSON
  } catch (error) {
    return NextResponse.error(); // Trả về lỗi nếu có
  }
}
// API POST: Tạo sản phẩm mới
export async function POST(req: Request) {


  try {
    const body = await req.json();
    const {
      name,
      price,
      stock,
      imageUrl = null,
      status = "draft",
      categories_id ="1d4478e7-c9d2-445e-8520-14dae73aac68",
    } = body;

    // Basic validation
    if (!name || typeof price !== "number" || typeof stock !== "number") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Map to your DB column names (adjust if your columns differ)
    const payload = {
      name,
      price,
      stock,
      images: imageUrl,
      status,
      categories_id: categories_id,
    };

    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Server error" }, { status: 500 });
  }
}

// API DELETE: Xoá sản phẩm theo ID
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
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
    if (!data) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/products/:id exception:", e);
    return NextResponse.json({ message: e?.message ?? "Server error" }, { status: 500 });
  }
}
