import { NextResponse } from "next/server";
import {
  getProductById,
  listProducts,
} from "@/modules/products/controller/product.service";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

// API GET: Lấy thông tin sản phẩm theo ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("/api/products/[id] GET", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// API PUT: Cập nhật thông tin sản phẩm theo ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const sb = await supabaseServer();
    const { data, error } = await sb
      .from("products")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("/api/products/[id] PUT", err);
    return NextResponse.json(
      { error: err?.message ?? "Update failed" },
      { status: 400 }
    );
  }
}

// API DELETE: Xoá sản phẩm theo ID (Soft Delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sb = await supabaseServer();
    const { error } = await sb.from("products").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("/api/products/[id] DELETE", err);
    return NextResponse.json(
      { error: err?.message ?? "Delete failed" },
      { status: 400 }
    );
  }
}
