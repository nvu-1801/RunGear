// modules/products/model/product-public.ts
import {
  getImageUrl,
  getFirstImage as getFirstImg,
  getAllImageUrls,
} from "../lib/image-url";

const PLACEHOLDER =
  "https://placehold.co/800/e2e8f0/64748b?text=No+Image";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  status: "draft" | "active" | "hidden";
  description: string | null;
  images?: string[] | string | null;
  categories_id?: string | null;
};

export type ProductInput = {
  name: string;
  price: number;
  stock: number;
  images?: string | null;
  status: "draft" | "active" | "hidden";
  categories_id:
    | "1d4478e7-c9d2-445e-8520-14dae73aac68"
    | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d"
    | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
};

// ─── Fix: helpers gỡ JSON-stringified & làm phẳng ──────────────────────────────

function tryParseJson(value: string): unknown | null {
  const t = value.trim();
  // Chỉ thử parse khi nhìn "có vẻ" là JSON
  if (!(t.startsWith("[") || t.startsWith("{") || t.startsWith('"'))) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function extractUrlsFromUnknown(x: unknown): string[] {
  if (typeof x === "string") return [x];

  if (Array.isArray(x)) {
    // mảng hỗn hợp string | object
    return x
      .flatMap((it) => extractUrlsFromUnknown(it))
      .filter(Boolean);
  }

  if (x && typeof x === "object") {
    // common case: { url: "..." }
    // hoặc các key khác chứa URL
    const o = x as Record<string, unknown>;
    if (typeof o.url === "string") return [o.url];
    // fallback: gom mọi string trong object (an toàn)
    return Object.values(o)
      .flatMap((v) => extractUrlsFromUnknown(v))
      .filter(Boolean);
  }

  return [];
}

function explodePossiblyJsonString(s: string): string[] {
  const parsed = tryParseJson(s);
  if (parsed === null) return [s];
  return extractUrlsFromUnknown(parsed);
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function normalizeImages(
  images: string | string[] | null | undefined
): string[] {
  // 1) về mảng thô
  const rawArr: string[] = Array.isArray(images)
    ? images.map(String)
    : typeof images === "string"
    ? [images]
    : [];

  // 2) làm phẳng các phần tử có thể là JSON-stringified
  const flattened = rawArr.flatMap((item) => explodePossiblyJsonString(item));

  // 3) chuẩn hoá sang URL hợp lệ
  const urls = flattened
    .map((s) => getImageUrl(s))
    .filter((u) => !!u && u !== PLACEHOLDER);

  // 4) loại trùng
  const unique = Array.from(new Set(urls));
  return unique.length ? unique : [PLACEHOLDER];
}

// Ảnh đại diện (ảnh đầu tiên hợp lệ)
export function productImageUrl(p: { images?: string[] | string | null }) {
  return getFirstImg(p.images ?? null);
}

export function imagePathToUrl(url: string) {
  return getImageUrl(url);
}

// Export thêm helper lấy tất cả ảnh
export { getAllImageUrls };
