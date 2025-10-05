// app/home/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProductById } from "@/modules/products/controller/product.service";
import ProductDetailClient from "./product-detail.client";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    return <ProductDetailClient product={product} />;
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") return notFound();
    throw e;
  }
}
