const PLACEHOLDER =
  "https://placehold.co/800/e2e8f0/64748b?text=No+Image";

/** ---- Cấu hình cơ bản ---- */
const BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
const PUBLIC_PREFIX = BASE_URL ? `${BASE_URL}/storage/v1/object/public` : "";
const DEFAULT_BUCKET = "products";

/** ---- Helpers chung ---- */
const ABS_URL_RE = /^(https?:\/\/|data:|blob:)/i;

function normStr(s?: string | null): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length ? t : null;
}

function isAbsoluteUrl(s: string): boolean {
  return ABS_URL_RE.test(s);
}

function ensureBucketPath(path: string, bucket = DEFAULT_BUCKET): string {
  const clean = path.replace(/^\/+/, "");
  return clean.includes("/") ? clean : `${bucket}/${clean}`;
}

function toPublicUrl(path: string): string {
  if (!PUBLIC_PREFIX) return PLACEHOLDER;
  // Nếu đã là public URL của Supabase thì trả nguyên
  if (path.startsWith(PUBLIC_PREFIX)) return path;
  return `${PUBLIC_PREFIX}/${ensureBucketPath(path)}`;
}

function toArray(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  return Array.isArray(images) ? images : [images];
}

/** ---- API chính ---- */

/**
 * Trả về URL ảnh hợp lệ theo ưu tiên: bucket → external/data/blob → placeholder
 */
export function getImageUrl(img?: string | null): string {
  const s = normStr(img);
  if (!s) return PLACEHOLDER;
  if (isAbsoluteUrl(s)) return s; // http(s), data:, blob:
  return toPublicUrl(s); // path trong bucket
}

/**
 * Lấy ảnh đầu tiên; ưu tiên URL thuộc bucket của Supabase
 */
export function getFirstImage(images: string | string[] | null): string {
  const urls = toArray(images)
    .map(getImageUrl)
    .filter((u) => u !== PLACEHOLDER);

  if (urls.length === 0) return PLACEHOLDER;

  const bucketFirst = urls.find((u) => PUBLIC_PREFIX && u.startsWith(PUBLIC_PREFIX));
  return bucketFirst || urls[0];
}

/**
 * Lấy tất cả URL ảnh (đã chuẩn hoá); loại placeholder & loại trùng
 */
export function getAllImageUrls(images: string | string[] | null): string[] {
  const urls = toArray(images)
    .map(getImageUrl)
    .filter((u) => u !== PLACEHOLDER);

  const unique = Array.from(new Set(urls));
  return unique.length ? unique : [PLACEHOLDER];
}
