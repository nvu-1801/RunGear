import "server-only";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import  {
  normalizeImages,
  productImageUrl,
  imagePathToUrl,
  type Product,
} from "../model/product-public";

type CatKey = "all" | "giay" | "quan-ao";

const CAT_SLUGS: Record<Exclude<CatKey, "all">, string> = {
  giay: "giay",
  "quan-ao": "quan-ao",
};

// export async function listProducts({
//   q = "",
//   cat = "all",
// }: { q?: string; cat?: CatKey } = {}) {
//   const sb = await supabaseServer();

//   // Nếu cần filter theo category.slug thì dùng INNER JOIN để filter hoạt động.
//   const selectWhenFilter =
//     "id,name,slug,price,description,images,category_id,categories:category_id!inner(slug,name)";
//   const selectDefault =
//     "id,name,slug,price,description,images,category_id,categories:category_id(slug,name)";

//   const usingFilter = cat && cat !== "all";
//   let query = sb
//     .from("products")
//     .select(usingFilter ? selectWhenFilter : selectDefault)
//     .order("created_at", { ascending: false });

//   if (q) query = query.ilike("name", `%${q}%`);
//   if (usingFilter) {
//     const slug = CAT_SLUGS[cat as Exclude<CatKey, "all">];
//     query = query.eq("categories.slug", slug);
//   }

//   const { data, error } = await query;
//   if (error) {
//     console.error("[listProducts]", error);
//     throw new Error(error.message);
//   }
//   // data có thể kèm trường nested "categories", nhưng Product không cần – cứ trả về mảng Product tối thiểu
//   return (data ?? []) as Product[];
// }

export async function listProducts({ q, cat }: { q?: string; cat?: string }) {
  const sb = await supabaseServer();
  let qy = sb.from("products").select("*").order("created_at", { ascending: false });
  if (q) qy = qy.ilike("name", `%${q}%`);
  if (cat && cat !== "all") qy = qy.eq("category_slug", cat);
  const { data, error } = await qy;
  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    ...r,
    images: normalizeImages(r.images), // chuẩn hoá thành mảng URL tuyệt đối
  }));
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
