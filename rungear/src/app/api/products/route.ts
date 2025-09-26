// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts } from "@/modules/products/controller/product.service"; // Đảm bảo đường dẫn tới service của bạn
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';  // Lọc theo tên hoặc slug
    const cat = searchParams.get('cat') || 'all'; // Lọc theo category, mặc định là "all"

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
      slug,
      price,
      stock,
      images = null,
      status = "DRAFT",
      categoryId = null,
    } = body;

    // Basic validation
    if (!name || !slug || typeof price !== "number" || typeof stock !== "number") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Map to your DB column names (adjust if your columns differ)
    const payload = {
      name,
      slug,
      price,
      stock,
      images,
      status,
      category_id: categoryId,
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
