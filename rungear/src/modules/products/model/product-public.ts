// modules/products/model/product-public.ts
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

const isHttpUrl = (s?: string | null) => !!s && /^https?:\/\//i.test(s!.trim());

export function normalizeImages(
  imgs: string[] | string | null | undefined
): string[] {
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
  return getFirstImg(p.images ?? null);
}

export function imagePathToUrl(url: string) {
  return getImageUrl(url);
}

// Export thêm helper lấy tất cả ảnh
export { getAllImageUrls };

import {
  getImageUrl,
  getFirstImage as getFirstImg,
  getAllImageUrls,
} from "../lib/image-url";
