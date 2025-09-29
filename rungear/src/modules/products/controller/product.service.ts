import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { normalizeImages, type Product } from "../model/product-public";

type CatKey = "all" | "giay" | "quan-ao";

export async function listProducts({
  q = "",
  cat = "all",
}: { q?: string; cat?: CatKey } = {}) {
  const sb = await supabaseServer();
  const catSafe: CatKey = cat === "giay" || cat === "quan-ao" ? cat : "all";

  // lấy id category theo slug khi cần
  let catId: string | null = null;
  if (catSafe !== "all") {
    const { data: c, error: e1 } = await sb
      .from("categories")
      .select("id")
      .eq("slug", catSafe)
      .maybeSingle();

    if (e1 && e1.code !== "PGRST116") throw e1;
    if (!c?.id) return []; // slug không tồn tại
    catId = c.id;
  }

  let qy = sb
    .from("products")
    .select("id,name,slug,price,description,images,created_at,categories_id")
    .order("created_at", { ascending: false });

  if (q) qy = qy.ilike("name", `%${q}%`);
  if (catId) qy = qy.eq("categories_id", catId);

  const { data, error } = await qy;
  if (error) throw error;

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


export async function getProductById(id: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("*, product_images(url, position)")
    .eq("id", id)            // <-- lấy theo ID
    .single();

  // Map 404 -> "NOT_FOUND" để page.tsx xử lý
  if (error) {
    if (error.code === "PGRST116") throw new Error("NOT_FOUND");
    throw error;
  }

  const fromCol = normalizeImages(data.images);
  const fromChild = (data.product_images ?? [])
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((x: any) => x.url)
    .filter((u: string) => /^https?:\/\//i.test(u));

  return { ...data, images: [...fromCol, ...fromChild] };
}
