// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts } from "@/modules/products/controller/product.service"; // Đảm bảo đường dẫn tới service của bạn

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
