import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { normalizeImages, type Product } from "../model/product-public";

type CatKey = "all" | "giay" | "quan-ao";

export async function listProducts({
  q = "",
  cat = "all",
}: { q?: string; cat?: CatKey } = {}) {
  const sb = await supabaseServer();

  // đảm bảo cat hợp lệ
  const catSafe: CatKey =
    cat === "giay" || cat === "quan-ao" || cat === "all" ? cat : "all";

  // Nếu có cat (không phải "all") -> lấy id theo slug (không throw khi 0 dòng)
  let catId: string | null = null;
  if (catSafe !== "all") {
    const { data: c, error: e1 } = await sb
      .from("categories")
      .select("id")
      .eq("slug", catSafe)
      .maybeSingle();

    // Nếu có lỗi thực (không phải 'không có dòng'), ném ra để bắt đúng bug (ví dụ RLS)
    if (e1 && e1.code !== "PGRST116") {
      // gợi ý: log thêm để debug
      console.error("[listProducts] categories query error", e1);
      throw e1;
    }

    // Không tìm thấy slug -> không có sản phẩm nào thuộc cat này
    if (!c?.id) return [];
    catId = c.id;
  }

  // Truy vấn products
  let qy = sb
    .from("products")
    .select("id,name,slug,price,description,images,created_at,categories_id")
    .order("created_at", { ascending: false });

  if (q) qy = qy.ilike("name", `%${q}%`);
  if (catId) qy = qy.eq("categories_id", catId);

  const { data, error } = await qy;
  if (error) {
    console.error("[listProducts] products query error", error);
    throw error;
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: r.price,
    description: r.description,
    images: normalizeImages(r.images),
    categories_id: r.categories_id,
  })) as Product[];
}

export async function getProductBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("*, product_images(url, position)")
    .eq("slug", slug)
    .single();
  if (error) throw error;

  const fromCol = normalizeImages(data.images); // products.images có thể là text hoặc text[]
  const fromChild = (data.product_images ?? [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((x: any) => x.url)
    .filter((u: string) => /^https?:\/\//i.test(u));

  return { ...data, images: [...fromCol, ...fromChild] };
}
