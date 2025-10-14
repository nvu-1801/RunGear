// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import {
  listProducts,
  createProduct,
} from "@/modules/products/controller/product.service";

// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const cat = (searchParams.get("cat") || "all") as string;
    const products = await listProducts({ q, cat });
    return NextResponse.json(products); // Trả về dữ liệu sản phẩm dưới dạng JSON
  } catch (err: unknown) {
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
  } catch (err: unknown) {
    console.error("/api/products POST error", err);
    const msg =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? String(err))
        : String(err);
    return NextResponse.json(
      { error: msg ?? "Create failed" },
      { status: 400 }
    );
  }
}
