import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { getProductById } from "@/modules/products/controller/product.service";

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim())
  );
}
function cleanseUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const o: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.trim() === "undefined") continue;
    o[k] = v;
  }
  return o as Partial<T>;
}

// Nếu bạn đang ở Next 15 và `params` là Promise: giữ như bạn làm.
// Nếu không, dùng { params }: { params: { id: string } } trực tiếp.

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "INVALID_UUID" }, { status: 400 });
  }
  try {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error("/api/products/[id] GET", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "INVALID_UUID" }, { status: 400 });
  }
  try {
    const raw = await req.json();
    const body = cleanseUndefined(raw);

    // Không cho update id
    delete (body as any).id;

    // categories_id nếu gửi lên là "undefined" => loại ở cleanseUndefined rồi.
    if ("categories_id" in body && body.categories_id != null && !isUuid(body.categories_id)) {
      return NextResponse.json({ error: "INVALID_CATEGORY_UUID" }, { status: 400 });
    }

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
    return NextResponse.json({ error: msg ?? "Update failed" }, { status: 400 });
  }
}

// 🔁 Soft delete để không vướng FK cart_items
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "INVALID_UUID" }, { status: 400 });
  }
  try {
    const sb = await supabaseServer();
    const { error } = await sb
      .from("products")
      .update({ is_deleted: true, status: "hidden" })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("/api/products/[id] DELETE", err);
    const msg =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? String(err))
        : String(err);
    return NextResponse.json({ error: msg ?? "Delete failed" }, { status: 400 });
  }
}
