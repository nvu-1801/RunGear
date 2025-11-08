import { supabaseServer } from "@/libs/supabase/supabase-server";

interface Category {
  id: string;
  name: string;
  slug: string;
}

let cachedCategories: Category[] | null = null;

/**
 * Load tất cả categories từ database (có cache)
 */
export async function loadCategories(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories;
  
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug");
  
  if (error) {
    console.error("❌ Error loading categories:", error);
    return [];
  }
  
  cachedCategories = data || [];
  console.log("✅ Loaded categories:", cachedCategories.map(c => `${c.name} (${c.slug})`).join(", "));
  return cachedCategories;
}

/**
 * Tìm category ID từ keyword (tên, slug, hoặc từ khóa)
 * Hỗ trợ: "áo", "ao", "shirt", "shirts", "giày", "giay", "shoes"...
 */
export async function resolveCategoryId(keyword?: string): Promise<string | undefined> {
  if (!keyword) return undefined;
  
  const categories = await loadCategories();
  
  // Normalize keyword: lowercase + bỏ dấu
  const normalized = keyword
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
    .trim();
  
  console.log(`🔍 Resolving category from keyword: "${keyword}" → normalized: "${normalized}"`);
  
  // 1. Tìm exact match với slug
  const exactSlug = categories.find(c => c.slug === normalized);
  if (exactSlug) {
    console.log(`✅ Found exact slug match: ${exactSlug.name} (${exactSlug.id})`);
    return exactSlug.id;
  }
  
  // 2. Tìm exact match với name (không dấu)
  const exactName = categories.find(c => {
    const catName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return catName === normalized;
  });
  if (exactName) {
    console.log(`✅ Found exact name match: ${exactName.name} (${exactName.id})`);
    return exactName.id;
  }
  
  // 3. Tìm partial match (keyword chứa name hoặc ngược lại)
  const partialMatch = categories.find(c => {
    const catName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const catSlug = c.slug.toLowerCase();
    
    return (
      normalized.includes(catName) ||
      catName.includes(normalized) ||
      normalized.includes(catSlug) ||
      catSlug.includes(normalized)
    );
  });
  
  if (partialMatch) {
    console.log(`✅ Found partial match: ${partialMatch.name} (${partialMatch.id})`);
    return partialMatch.id;
  }
  
  // 4. Mapping từ tiếng Anh sang tiếng Việt
  const englishMapping: Record<string, string> = {
    "shirt": "ao",
    "shirts": "ao",
    "top": "ao",
    "clothes": "ao",
    
    "shoe": "giay",
    "shoes": "giay",
    "sneaker": "giay",
    "sneakers": "giay",
    "footwear": "giay",
    
    "pant": "quan",
    "pants": "quan",
    "trouser": "quan",
    "trousers": "quan",
    "short": "quan",
    "shorts": "quan",
  };
  
  const mappedSlug = englishMapping[normalized];
  if (mappedSlug) {
    console.log(`🔄 Mapped English keyword "${normalized}" → "${mappedSlug}"`);
    const mapped = categories.find(c => c.slug === mappedSlug);
    if (mapped) {
      console.log(`✅ Found mapped category: ${mapped.name} (${mapped.id})`);
      return mapped.id;
    }
  }
  
  console.log(`❌ No category found for keyword: "${keyword}"`);
  return undefined;
}

/**
 * Lấy tên category từ ID
 */
export async function getCategoryName(id: string): Promise<string> {
  const categories = await loadCategories();
  const category = categories.find(c => c.id === id);
  return category?.name || "Sản phẩm";
}

/**
 * Lấy tất cả categories để hiển thị trong system prompt
 */
export async function getCategoriesForPrompt(): Promise<string> {
  const categories = await loadCategories();
  return categories
    .map(c => `- ${c.name.toUpperCase()} (slug: "${c.slug}")`)
    .join("\n");
}