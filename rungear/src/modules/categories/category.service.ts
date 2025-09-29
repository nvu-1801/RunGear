import { SupabaseClient } from "@supabase/supabase-js";

export type CatKey = "ao" | "quan" | "giay";
export const CAT_SLUGS: CatKey[] = ["ao", "quan", "giay"];

export type CategoryRow = { id: string; slug: CatKey };

export async function getCategoryRows(sb: SupabaseClient): Promise<CategoryRow[]> {
  const { data, error } = await sb
    .from("categories")
    .select("id, slug")
    .in("slug", CAT_SLUGS);
  if (error) throw error;
  // ép kiểu an toàn
  return (data ?? []).filter((c): c is CategoryRow => CAT_SLUGS.includes(c.slug as CatKey));
}

/**
 * Đếm số product theo từng category (kèm filter q nếu có).
 * Trả về { all, ao, quan, giay }
 */
export async function countProductsByCategory(sb: SupabaseClient, opts: { q?: string } = {}) {
  const rows = await getCategoryRows(sb);
  const idAo   = rows.find(r => r.slug === "ao")?.id ?? null;
  const idQuan = rows.find(r => r.slug === "quan")?.id ?? null;
  const idGiay = rows.find(r => r.slug === "giay")?.id ?? null;

  const base = () => {
    let b = sb.from("products").select("id", { head: true, count: "exact" });
    if (opts.q) b = b.ilike("name", `%${opts.q}%`);
    return b;
  };

  const [{ count: all }, aoRes, quanRes, giayRes] = await Promise.all([
    base(),
    idAo   ? base().eq("categories_id", idAo)   : Promise.resolve({ count: 0 }),
    idQuan ? base().eq("categories_id", idQuan) : Promise.resolve({ count: 0 }),
    idGiay ? base().eq("categories_id", idGiay) : Promise.resolve({ count: 0 }),
  ]);

  return {
    all: all ?? 0,
    ao: aoRes?.count ?? 0,
    quan: quanRes?.count ?? 0,
    giay: giayRes?.count ?? 0,
  };
}

/** Helper: đổi slug -> category_id (UUID) */
export async function getCategoryIdBySlug(sb: SupabaseClient, slug: CatKey): Promise<string | null> {
  const { data, error } = await sb.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data?.id ?? null;
}
