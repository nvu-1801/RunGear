import "server-only";
import { supabaseServer } from "../../../libs/db/supabase/supabase-server";

export type Product = {
  id: string; name: string; slug: string;
  price: number; description: string | null; images: string[] | null;
};

export async function listProducts(opts?: { q?: string; categorySlug?: string }) {
  const sb = await supabaseServer();

  let query = sb
    .from("products")
    .select("id,name,slug,price,description,images, categories:category_id(slug)")
    // nếu bảng chưa có cột status thì bỏ dòng dưới (hoặc xem mục D)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (opts?.q) query = query.ilike("name", `%${opts.q}%`);
  if (opts?.categorySlug) query = query.eq("categories.slug", opts.categorySlug);

  const { data, error } = await query;

  if (error) {
    // GHI LOG server và ném Error chuẩn
    console.error("[listProducts]", error);
    throw new Error(error.message); // <- quan trọng
  }
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published") // xem mục D nếu thiếu cột
    .single();

  if (error) {
    console.error("[getProductBySlug]", error);
    // nếu không tìm thấy thì để page dùng notFound()
    if (error.code === "PGRST116") throw new Error("NOT_FOUND");
    throw new Error(error.message);
  }
  return data as Product;
}

export function productImageUrl(p: Product) {
  const path = p.images?.[0];
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${encodeURIComponent(path)}`;
}



// import "server-only";
// import { supabaseServer } from "../../../libs/db/supabase/supabase-server";

// export type Product = {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   description: string | null;
//   images: string[] | null;
// };

// export async function listProducts(opts?: { q?: string; categorySlug?: string }) {
//   const sb = supabaseServer();

//   let query = sb
//     .from("products")
//     .select("id,name,slug,price,description,images, categories:category_id(slug)")
//     .eq("status","published")
//     .order("created_at", { ascending: false });

//   if (opts?.q) query = query.ilike("name", `%${opts.q}%`);
//   if (opts?.categorySlug) query = query.eq("categories.slug", opts.categorySlug);

//   const { data, error } = await query;
//   if (error) throw error;
//   return data as any as Product[];
// }

// export async function getProductBySlug(slug: string) {
//   const sb = supabaseServer();
//   const { data, error } = await sb
//     .from("products")
//     .select("*")
//     .eq("slug", slug)
//     .eq("status","published")
//     .single();

//   if (error) throw error;
//   return data as Product;
// }

// /** Lấy public URL ảnh đầu tiên từ storage/products */
// export function productImageUrl(p: Product) {
//   const path = p.images?.[0];
//   if (!path) return null;
//   const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   // public bucket => /storage/v1/object/public/<bucket>/<path>
//   return `${base}/storage/v1/object/public/products/${encodeURIComponent(path)}`;
// }
