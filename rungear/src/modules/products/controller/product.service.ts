import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { normalizeImages, type Product } from "../model/product-public";
import {
  getCategoryIdBySlug,
  type CatKey,
} from "@/modules/categories/category.service";

type ChildImage = {
  id: string;
  url: string;
  position: number;
};

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

  const insertData: Record<string, any> = {
    name: cmd.name,
    price: cmd.price,
    slug: cmd.slug,
    description: cmd.description ?? null,
    images: imagesArr,
  };
  if (catId) insertData.categories_id = catId;

  const { data, error } = await sb
    .from("products")
    .insert(insertData)
    .select("id, slug")
    .single();

  if (error) throw error;
  return data;
}

/** Liệt kê sản phẩm, có filter q + category (hỗ trợ 'all') + trả thêm product_images */
export async function listProducts({
  q = "",
  cat = "all",
}: { q?: string; cat?: string } = {}) {
  const sb = await supabaseServer();

  const slugMap: Record<string, CatKey> = {
    giay: "giay",
    "quan-ao": "quan",
    quan: "quan",
    ao: "ao",
  };
  const catSafe: "all" | CatKey = cat === "all" ? "all" : slugMap[cat] ?? "all";

  let catId: string | null = null;
  if (catSafe !== "all") {
    const { data: c, error: e1 } = await sb
      .from("categories")
      .select("id")
      .eq("slug", catSafe)
      .maybeSingle();
    if (e1 && (e1 as { code?: unknown }).code !== "PGRST116") throw e1;
    if (!c?.id) return [];
    catId = c.id;
  }

  // 👇 Select thêm quan hệ product_images
  let qy = sb
    .from("products")
    .select(
      `
      id, name, slug, price, stock, description, images, created_at, categories_id, status,
      product_images ( id, url, position )
    `
    )
    .order("created_at", { ascending: false })
    .eq("is_deleted", false)
    .order("position", { foreignTable: "product_images", ascending: true });

  if (q) qy = qy.ilike("name", `%${q}%`);
  if (catId) qy = qy.eq("categories_id", catId);

  const { data, error } = await qy;
  if (error) throw error;

  return (data ?? []).map((r: any) => {
    // 1) Ảnh từ cột `images` (string | string[] | null) → chuẩn hoá thành URL[]
    const fromCol = normalizeImages(
      r.images as string[] | string | null | undefined
    );

    // 2) Ảnh từ bảng con (đã order theo position)
    const child: ChildImage[] = Array.isArray(r.product_images)
      ? r.product_images
          .map((x: any) => ({
            id: String(x?.id ?? ""),
            url: typeof x?.url === "string" ? x.url : String(x?.url ?? ""),
            position: Number(x?.position ?? 0),
          }))
          .filter((ci: ChildImage) => /^https?:\/\//i.test(ci.url))
      : [];

    const fromChild = child.map((ci) => ci.url);

    // 3) Merge + uniq để trả vào `images`
    const merged = Array.from(new Set([...fromCol, ...fromChild]));

    const p: Product = {
      id: String(r.id ?? ""),
      name: typeof r.name === "string" ? r.name : String(r.name ?? ""),
      slug: typeof r.slug === "string" ? r.slug : String(r.slug ?? ""),
      price: Number(r.price ?? 0),
      status: (["draft", "active", "hidden"] as const).includes(r.status)
        ? (r.status as Product["status"])
        : "draft",
      stock: Number(r.stock ?? 0),
      description: typeof r.description === "string" ? r.description : null,
      images: merged, // ✅ merged cho UI dùng nhanh
      child_images: child, // ✅ dữ liệu gốc từ bảng con (nếu cần)
      categories_id: r.categories_id == null ? null : String(r.categories_id),
    };
    return p;
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
