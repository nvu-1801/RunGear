// app/home/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProductById } from "@/modules/products/controller/product.service";
import { formatPriceVND } from "@/shared/price";
import ProductDetailClient from "./product-detail.client";
import { Suspense } from "react";
import type { Product } from "@/modules/products/model/product-public";

export const revalidate = 60; // ISR

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const raw = await getProductById(id);
    const row = raw as Record<string, unknown>;

    const product: Product = {
      id: String(row.id ?? ""),
      slug: typeof row.slug === "string" ? row.slug : String(row.slug ?? ""),
      name: typeof row.name === "string" ? row.name : String(row.name ?? ""),
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      status: (typeof row.status === "string"
        ? row.status
        : "draft") as Product["status"],
      description: typeof row.description === "string" ? row.description : null,
      images: Array.isArray(row.images)
        ? (row.images as unknown[]).map((x) => String(x))
        : typeof row.images === "string"
        ? (row.images as string)
        : null,
      categories_id:
        row.categories_id == null ? null : String(row.categories_id),
    };

    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
           {/* Partial hydration: phần động */}
            <Suspense fallback={<div>Đang tải chức năng...</div>}>
              <ProductDetailClient product={product} />
            </Suspense>
      </main>
    );
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      (e as { message?: unknown }).message === "NOT_FOUND"
    ) {
      return notFound();
    }
    throw e;
  }
}
