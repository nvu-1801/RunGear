import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { getProductById } from "@/modules/products/controller/product.service";

// API GET: Lấy thông tin sản phẩm theo ID
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const product = await getProductById(id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error("/api/products/[id] GET", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// API PUT: Cập nhật thông tin sản phẩm theo ID
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const sb = await supabaseServer();
    const { data, error } = await sb
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("/api/products/[id] PUT", err);
    const msg =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? String(err))
        : String(err);
    return NextResponse.json(
      { error: msg ?? "Update failed" },
      { status: 400 }
    );
  }
}

// API DELETE: Xoá sản phẩm theo ID (Soft Delete)
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const sb = await supabaseServer();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("/api/products/[id] DELETE", err);
    const msg =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? String(err))
        : String(err);
    return NextResponse.json(
      { error: msg ?? "Delete failed" },
      { status: 400 }
    );
  }
}
