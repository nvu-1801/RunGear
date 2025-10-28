const PLACEHOLDER = "https://placehold.co/800/e2e8f0/64748b?text=No+Image";

/**
 * Xác định xem string có phải là URL external không
 */
function isExternalUrl(str?: string | null): boolean {
  if (!str) return false;
  return /^https?:\/\//i.test(str.trim());
}

/**
 * Convert bucket path thành public URL
 */
function bucketPathToUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return PLACEHOLDER;

  // Remove leading slash nếu có
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}/storage/v1/object/public/product-images/${encodeURIComponent(
    cleanPath
  )}`;
}

/**
 * Lấy URL ảnh ưu tiên: bucket > external > placeholder
 */
export function getImageUrl(img?: string | null): string {
  if (!img) return PLACEHOLDER;

  const trimmed = img.trim();
  if (!trimmed) return PLACEHOLDER;

  // Nếu là URL external → dùng luôn
  if (isExternalUrl(trimmed)) return trimmed;

  // Nếu là path trong bucket → convert sang public URL
  return bucketPathToUrl(trimmed);
}

/**
 * Lấy ảnh đầu tiên từ array/string, ưu tiên ảnh trong bucket
 */
export function getFirstImage(images: string | string[] | null): string {
  if (!images) return PLACEHOLDER;

  // Xử lý string đơn
  if (typeof images === "string") {
    return getImageUrl(images);
  }

  // Xử lý array
  if (Array.isArray(images) && images.length > 0) {
    // Ưu tiên ảnh trong bucket (không phải URL external)
    const bucketImage = images.find((img) => !isExternalUrl(img));
    if (bucketImage) return getImageUrl(bucketImage);

    // Fallback sang ảnh external đầu tiên
    return getImageUrl(images[0]);
  }

  return PLACEHOLDER;
}

/**
 * Lấy tất cả URL ảnh từ product
 */
export function getAllImageUrls(images: string | string[] | null): string[] {
  if (!images) return [PLACEHOLDER];

  const normalized = Array.isArray(images)
    ? images
    : typeof images === "string"
    ? [images]
    : [];

  const urls = normalized
    .map((img) => getImageUrl(img))
    .filter((url) => url !== PLACEHOLDER);

  return urls.length > 0 ? urls : [PLACEHOLDER];
}
