import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import type { Product } from "../model/product-public";

type CatKey = "all" | "giay" | "quan-ao";

const CAT_SLUGS: Record<Exclude<CatKey, "all">, string> = {
  giay: "giay",
  "quan-ao": "quan-ao",
};

export async function listProducts({ q = "", cat = "all" }: { q?: string; cat?: string }) {
  const sb = await supabaseServer();

  // Tạo query cơ bản
  let query = sb.from("products").select("*").order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`); // Lọc theo tên sản phẩm nếu có
  if (cat !== "all") query = query.eq("category", cat); // Lọc theo category nếu có

  const { data, error } = await query;

  if (error) {
    console.error("[listProducts]", error);
    throw new Error(error.message); // Xử lý lỗi nếu có
  }

  return data ?? []; // Trả về danh sách sản phẩm hoặc mảng rỗng nếu không có sản phẩm
}
/** Lấy public URL ảnh đầu tiên từ bucket storage "products" */
export function productImageUrl(p: Product) {
  const path = p.images?.[0];
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public//${encodeURIComponent(path)}`;
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
