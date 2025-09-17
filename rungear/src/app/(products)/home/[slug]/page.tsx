import { notFound } from "next/navigation";
import { getProductBySlug } from "@/modules/products/service/product.service";
import ProductDetailClient from "./product-detail.client";

type Props = { params: { slug: string } }; 

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params; 

  try {
    const product = await getProductBySlug(slug);
    return <ProductDetailClient product={product} />;
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") return notFound();
    throw e;
  }
}
