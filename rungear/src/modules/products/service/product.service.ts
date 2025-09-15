import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import type { Product } from "../product-public";

// export type Product = {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   description: string | null;
//   images: string[] | null;
//   category_id?: string;
// };

type CatKey = "all" | "giay" | "quan-ao";

/**
 * Map slug category mà bạn dùng thật sự trong DB.
 * Nếu bạn đặt slug khác (vd: "giay-chay-bo", "trang-phuc-chay-bo")
 * thì sửa 2 dòng dưới cho khớp.
 */
const CAT_SLUGS: Record<Exclude<CatKey, "all">, string> = {
  giay: "giay",
  "quan-ao": "quan-ao",
};

export async function listProducts({
  q = "",
  cat = "all",
}: { q?: string; cat?: CatKey } = {}) {
  const sb = await supabaseServer();

  // Nếu cần filter theo category.slug thì dùng INNER JOIN để filter hoạt động.
  const selectWhenFilter =
    "id,name,slug,price,description,images,category_id,categories:category_id!inner(slug,name)";
  const selectDefault =
    "id,name,slug,price,description,images,category_id,categories:category_id(slug,name)";

  const usingFilter = cat && cat !== "all";
  let query = sb
    .from("products")
    .select(usingFilter ? selectWhenFilter : selectDefault)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (usingFilter) {
    const slug = CAT_SLUGS[cat as Exclude<CatKey, "all">];
    query = query.eq("categories.slug", slug);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listProducts]", error);
    throw new Error(error.message);
  }
  // data có thể kèm trường nested "categories", nhưng Product không cần – cứ trả về mảng Product tối thiểu
  return (data ?? []) as Product[];
}

// export async function getProductBySlug(slug: string) {
//   const sb = await supabaseServer();
//   const { data, error } = await sb
//     .from("products")
//     .select("id,name,slug,price,description,images,category_id")
//     .eq("slug", slug)
//     // Không lọc theo status để tránh lỗi nếu cột chưa tồn tại
//     .single();

//   if (error) {
//     console.error("[getProductBySlug]", error);
//     // Nếu không thấy thì để page xử lý notFound() tuỳ bạn
//     if ((error as any).code === "PGRST116") throw new Error("NOT_FOUND");
//     throw new Error(error.message);
//   }
//   return data as Product;
// }

/** Lấy public URL ảnh đầu tiên từ bucket storage "products" */
export function productImageUrl(p: Product) {
  const path = p.images?.[0];
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(path)}`;
}

export async function getProductBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("id,name,slug,price,description,images,category_id")
    .eq("slug", slug)
    .maybeSingle(); // <-- không throw khi 0 bản ghi

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");
  return data as Product;
}