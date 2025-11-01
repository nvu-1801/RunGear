import type { Product } from "@/modules/products/model/product-public";
import type { ProductInput } from "@/modules/products/model/product-public";


const DEFAULT_CATEGORY_ID: ProductInput["categories_id"] = "1d4478e7-c9d2-445e-8520-14dae73aac68";

export function pickCategoryId(
  c: Product["categories_id"]
): ProductInput["categories_id"] {
  if (!c) return DEFAULT_CATEGORY_ID;
  if (typeof c === "string") return c as ProductInput["categories_id"];
  // handle object case that may have id property
  if (typeof c === "object" && c !== null && "id" in c) {
    return ((c as { id?: string }).id as ProductInput["categories_id"]) ?? DEFAULT_CATEGORY_ID;
  }
  return DEFAULT_CATEGORY_ID;
}

export function pickFirstImageAsString(
  images: Product["images"]
): string {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images) && images.length > 0) return images[0] ?? "";
  return "";
}

/** Dùng ở component cha trước khi pass vào <ProductForm initial={...} /> */
export function toFormInitial(p?: Product | null): ProductInput | undefined {
  if (!p) return undefined;
  return {
    name: p.name ?? "",
    price: Number(p.price ?? 0),
    stock: Number(p.stock ?? 0),
    images: pickFirstImageAsString(p.images),     // ép về string
    status: (p.status as ProductInput["status"]) ?? "active",
    categories_id: pickCategoryId(p.categories_id),
  };
}

/** Dùng khi submit form để lưu DB (upsert) */
export function toUpsertPayload(
  values: ProductInput,
  base?: Partial<Product>
): Partial<Product> {
  return {
    ...base, // giữ lại id hoặc field khác nếu cần
    name: values.name.trim(),
    price: Number(values.price || 0),
    stock: Number(values.stock || 0),
    // nếu DB của bạn lưu string: để nguyên
    // nếu DB lưu mảng: đổi thành [values.images].filter(Boolean)
    images: (values.images ?? "").trim(),
    status: values.status,
    categories_id: values.categories_id, // string id
  };
}
