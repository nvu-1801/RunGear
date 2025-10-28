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

export function normalizeImages(images?: string[] | string | null): string[] {
  if (!images) return [];
  return Array.isArray(images) ? images : [images];
}
