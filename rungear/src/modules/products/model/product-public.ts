// modules/products/model/product-public.ts
export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string | null;
  images?: string[] | string | null; // lưu URL tuyệt đối
  category_id?: string | null;
};

const isHttpUrl = (s?: string | null) => !!s && /^https?:\/\//i.test(s!.trim());

export function normalizeImages(imgs: string[] | string | null | undefined): string[] {
  if (Array.isArray(imgs)) return imgs.filter(isHttpUrl);
  if (typeof imgs === "string") {
    // hỗ trợ cả chuỗi đơn hoặc chuỗi có dấu phẩy / xuống dòng
    return imgs
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(isHttpUrl);
  }
  return [];
}

// Ảnh đại diện (ảnh đầu tiên hợp lệ)
export function productImageUrl(p: { images?: string[] | string | null }) {
  const arr = normalizeImages(p.images);
  return arr[0] ?? null;
}

// Không còn dùng “imagePathToUrl” để chắp domain nữa.
// Nếu code cũ còn import, ta cho alias identity:
export function imagePathToUrl(url: string) {
  return url; // url đã là https://...
}
