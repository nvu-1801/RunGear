// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts } from "@/modules/products/controller/product.service"; // Đảm bảo đường dẫn tới service của bạn
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  console.log("📍 Full URL:", req.url);
  
  // ✅ Log method
  console.log("🔧 Method:", req.method);
  
  // ✅ Log headers
  console.log("📋 Headers:", Object.fromEntries(req.headers));
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
// API PUT: Cập nhật sản phẩm theo ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const {
      id,
      name,
      price,
      stock,
      imageUrl = null,
      status = "draft",
      categories_id,
    } = body;

  
    

    const payload: Record<string, any> = {
      name,
      price: price,
      stock: stock,
      status,
      categories_id,
    };
    // nếu có imageUrl thì map vào cột images (hoặc tên cột bạn dùng)
    if (imageUrl !== null) payload.images = imageUrl;

    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", body.id) // Giả sử body có trường 'id' để xác định sản phẩm cần cập nhật
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Server error" }, { status: 500 });
  }
}

