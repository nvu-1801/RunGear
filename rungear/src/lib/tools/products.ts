import { supabaseServer } from "@/libs/supabase/supabase-server";
import { normalizeImages } from "@/types/product";
import type { Product } from "@/types/product";
import { searchProductsSchema, getProductDetailsSchema } from "./schemas";
import { resolveCategoryId, getCategoryName } from "./categories"; // ← IMPORT


export async function searchProductsTool(args: unknown) {
  const input = searchProductsSchema.parse(args);
  const { q, categoryId, priceMin, priceMax, limit } = input;

  console.log("\n🔍 [searchProductsTool] Input:", JSON.stringify(input, null, 2));

  const supabase = await supabaseServer();
  
  // ← AUTO-RESOLVE CATEGORY (hỗ trợ cả tiếng Anh)
  let resolvedCategoryId = categoryId;
  
  // Nếu categoryId được truyền vào (có thể là "shirts", "áo", "ao", hoặc UUID)
  if (categoryId && !categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    // Không phải UUID → Resolve
    resolvedCategoryId = await resolveCategoryId(categoryId);
  }
  
  // Nếu vẫn chưa có category → Thử extract từ keyword
  if (!resolvedCategoryId && q) {
    resolvedCategoryId = await resolveCategoryId(q);
  }

  if (resolvedCategoryId) {
    const catName = await getCategoryName(resolvedCategoryId);
    console.log(`✅ Using category: ${catName} (${resolvedCategoryId})`);
  }

  let query = supabase.from("products").select(`
      id,name,slug,price,stock,status,description,images,categories_id
    `)
    .eq("status", "active")
    .limit(limit ?? 3);

  if (q && q.length > 0) {
    query = query.ilike("name", `%${q}%`);
  }
  if (resolvedCategoryId) {
    query = query.eq("categories_id", resolvedCategoryId);
  }
  if (priceMin !== undefined) query = query.gte("price", priceMin);
  if (priceMax !== undefined) query = query.lte("price", priceMax);

  const { data, error } = await query;
  if (error) throw error;

  console.log(`📦 Found ${data?.length || 0} products`);

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
