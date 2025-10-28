import { supabaseServer } from "@/libs/supabase/supabase-server";
import { normalizeImages } from "@/types/product";
import type { Product } from "@/types/product";
import { searchProductsSchema, getProductDetailsSchema } from "./schemas";

export async function searchProductsTool(args: unknown) {
  const input = searchProductsSchema.parse(args);
  const { q, categoryId, priceMin, priceMax, limit } = input;

  // Base query: chỉ show "active"
  const supabase = await supabaseServer();
  let query = supabase.from("products").select(`
      id, slug, name, price, stock, status, description, images, categories_id
    `)
    .eq("status", "active")
    .limit(limit ?? 3);

  if (q && q.length > 0) {
    // tuỳ khả năng FTS của bạn; ví dụ like đơn giản:
    query = query.ilike("name", `%${q}%`);
  }
  if (categoryId) query = query.eq("categories_id", categoryId);
  if (priceMin !== undefined) query = query.gte("price", priceMin);
  if (priceMax !== undefined) query = query.lte("price", priceMax);

  const { data, error } = await query;
  if (error) throw error;

  // Map kết quả tối ưu cho chatbot (3 lựa chọn + lý do ngắn + link)
  const items = (data ?? []).map((p: Product) => {
    const imgs = normalizeImages(p.images);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      inStock: p.stock > 0,
      image: imgs[0] ?? null,
      link: `/products/${p.slug}`,
      // Lý do gợi ý: có thể tinh chỉnh theo thuộc tính; để mặc định ngắn gọn
      reason: [
        p.stock > 0 ? "Còn hàng" : "Hết hàng sắp về",
        p.price ? `Giá tốt trong tầm ngân sách` : undefined,
        p.description ? "Mô tả rõ ràng, phù hợp nhu cầu" : undefined,
      ].filter(Boolean).join(". ")
    };
  });

  return { items };
}
export async function getProductDetailsTool(args: unknown) {
  const input = getProductDetailsSchema.parse(args);
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select(`id, slug, name, price, stock, status, description, images, categories_id`)
    .eq("id", input.id)
    .single();

  if (error) throw error;
  const p = data as Product;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    inStock: p.stock > 0,
    description: p.description,
    images: normalizeImages(p.images),
    link: `/products/${p.slug}`
  };
}
