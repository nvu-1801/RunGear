// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts, createProduct } from "@/modules/products/controller/product.service";

// API GET: Lấy danh sách sản phẩm
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "all";
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 12);
  const min = Number(searchParams.get("min") ?? 0);
  const max = Number(searchParams.get("max") ?? 0);

  try {
    let products = await listProducts({ q, cat });

    // Lọc theo giá nếu có
    if (min > 0) products = products.filter((p) => p.price >= min);
    if (max > 0) products = products.filter((p) => p.price <= max);

    const total = products.length;

    // Phân trang
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = products.slice(start, end);

    // Luôn trả về đúng format PageResp
    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message, items: [], total: 0, page: 1, pageSize },
      { status: 500 }
    );
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
