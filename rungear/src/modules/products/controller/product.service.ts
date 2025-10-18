import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { normalizeImages, type Product } from "../model/product-public";
import {
  getCategoryIdBySlug,
  type CatKey,
} from "@/modules/categories/category.service";

/** Cho phép UI truyền 'all' ngoài 3 slug thực tế */

/** Tạo sản phẩm theo slug category chuẩn (ao|quan|giay) hoặc categories_id trực tiếp */
export async function createProduct(cmd: {
  name: string;
  price: number;
  slug: string;
  description?: string;
  images?: string[] | string;
  // accept either categorySlug OR categories_id (UUID)
  categorySlug?: CatKey;
  categories_id?: string;
}) {
  const sb = await supabaseServer();

  // resolve category id: prefer explicit categories_id if provided
  let catId: string | null = null;
  if (cmd.categories_id) {
    // verify category exists
    const { data: c, error: e } = await sb
      .from("categories")
      .select("id")
      .eq("id", cmd.categories_id)
      .maybeSingle();
    if (e) throw e;
    if (!c?.id) throw new Error("INVALID_CATEGORY");
    catId = c.id;
  } else if (cmd.categorySlug) {
    const resolved = await getCategoryIdBySlug(sb, cmd.categorySlug);
    if (!resolved) throw new Error("INVALID_CATEGORY");
    catId = resolved;
  } else {
    // no category provided
    throw new Error("INVALID_CATEGORY");
  }

  const imagesArr = Array.isArray(cmd.images)
    ? cmd.images
    : typeof cmd.images === "string"
    ? [cmd.images]
    : [];

  const { data, error } = await sb
    .from("products")
    .insert({
      name: cmd.name,
      price: cmd.price,
      slug: cmd.slug,
      description: cmd.description ?? null,
      images: imagesArr,
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
}: { q?: string; cat?: string } = {}) {
  const sb = await supabaseServer();

  // Normalize incoming category slugs (support "quan-ao" from UI -> "quan" in DB)
  const slugMap: Record<string, CatKey> = {
    giay: "giay",
    "quan-ao": "quan",
    quan: "quan",
    ao: "ao",
  };

  const catSafe: "all" | CatKey = cat === "all" ? "all" : slugMap[cat] ?? "all";

  // lấy id category theo slug khi cần
  let catId: string | null = null;
  if (catSafe !== "all") {
    const { data: c, error: e1 } = await sb
      .from("categories")
      .select("id")
      .eq("slug", catSafe) // slug: "ao" | "quan" | "giay"
      .maybeSingle();

    if (e1 && (e1 as { code?: unknown }).code !== "PGRST116") throw e1;
    if (!c?.id) return []; // slug không tồn tại
    catId = c.id;
  }

  let qy = sb
    .from("products")
    .select(
      "id,name,slug,price,stock,description,images,created_at,categories_id,status"
    )
    .order("created_at", { ascending: false })
    .eq("is_deleted", false); // lọc soft-deleted

  if (q) qy = qy.ilike("name", `%${q}%`);
  if (catId) qy = qy.eq("categories_id", catId);

  const { data, error } = await qy;
  if (error) throw error;
  console.log("📦 Raw data from Supabase:", (data as unknown[])?.[0]);

  return (data ?? []).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      name: typeof row.name === "string" ? row.name : String(row.name ?? ""),
      slug: typeof row.slug === "string" ? row.slug : String(row.slug ?? ""),
      price: Number(row.price ?? 0),
      status: typeof row.status === "string" ? row.status : "draft",
      stock: Number(row.stock ?? 0),
      description: typeof row.description === "string" ? row.description : null,
      images: normalizeImages(
        row.images as unknown as string[] | string | null | undefined
      ),
      categories_id:
        row.categories_id == null ? null : String(row.categories_id),
    } as Product;
  }) as Product[];
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
    if ((error as { code?: unknown }).code === "PGRST116")
      throw new Error("NOT_FOUND");
    throw error;
  }

  const base = data as Record<string, unknown>;
  const fromCol = normalizeImages(
    base.images as unknown as string[] | string | null | undefined
  );

  const childArr = Array.isArray(base.product_images)
    ? (base.product_images as unknown[])
    : [];
  const fromChild = childArr
    .slice()
    .sort((a: unknown, b: unknown) => {
      const aa = a as Record<string, unknown>;
      const bb = b as Record<string, unknown>;
      return Number(aa.position ?? 0) - Number(bb.position ?? 0);
    })
    .map((x: unknown) => {
      const xx = x as Record<string, unknown>;
      const u = xx.url;
      return typeof u === "string" ? u : String(u ?? "");
    })
    .filter((u: string) => typeof u === "string" && /^https?:\/\//i.test(u));

  return {
    ...base,
    images: [...fromCol, ...fromChild],
  } as Record<string, unknown>;
}
