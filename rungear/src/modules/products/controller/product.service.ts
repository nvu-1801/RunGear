import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { normalizeImages, type Product } from "../model/product-public";
import { getCategoryIdBySlug, type CatKey } from "@/modules/categories/category.service";

/** Cho phép UI truyền 'all' ngoài 3 slug thực tế */
type CatKeyAll = "all" | CatKey;

/** Tạo sản phẩm theo slug category chuẩn (ao|quan|giay) */
export async function createProduct(cmd: {
  name: string;
  price: number;
  slug: string;
  description?: string;
  images?: string[];
  categorySlug: CatKey; // <- chỉ chấp nhận 'ao' | 'quan' | 'giay'
}) {
  const sb = await supabaseServer();
  const catId = await getCategoryIdBySlug(sb, cmd.categorySlug);
  if (!catId) throw new Error("INVALID_CATEGORY");

  const { data, error } = await sb
    .from("products")
    .insert({
      name: cmd.name,
      price: cmd.price,
      slug: cmd.slug,
      description: cmd.description ?? null,
      images: cmd.images ?? [],
      categories_id: catId,
    })
    .select("id, slug")
    .single();

  if (error) throw error;
  return data;
}

/** Liệt kê sản phẩm, có filter q + category (hỗ trợ 'all') */
export async function listProducts({
  q = "",
  cat = "all",
}: { q?: string; cat?: CatKeyAll } = {}) {
  const sb = await supabaseServer();

  // chỉ nhận 1 trong 4 key; sai -> "all"
  const validCatsAll: CatKeyAll[] = ["all", "ao", "quan", "giay"];
  const catSafe: CatKeyAll = validCatsAll.includes(cat) ? cat : "all";

  // lấy id category theo slug khi cần
  let catId: string | null = null;
  if (catSafe !== "all") {
    const { data: c, error: e1 } = await sb
      .from("categories")
      .select("id")
      .eq("slug", catSafe) // slug: "ao" | "quan" | "giay"
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

/** Lấy chi tiết theo ID (UUID) và merge ảnh từ cột + bảng con */
export async function getProductById(id: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("*, product_images(url, position)")
    .eq("id", id)
    .single();

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
