import {
  getProductBySlug,
  productImageUrl,
} from "@/modules/products/controller/product.service";
import { formatPriceVND } from "@/shared/price";
import { AddToCart } from "@/components/common/AddToCart";

export default async function ProductDetail({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getProductBySlug(params.slug);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="aspect-square rounded-2xl overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImageUrl(p) ?? "/placeholder.png"}
            alt={p.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* (nếu có nhiều ảnh thì map ra thumbnails ở đây) */}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="mt-2 text-xl font-bold">{formatPriceVND(p.price)}</p>

        <div className="h-4" />
        <AddToCart product={p} />

        <div className="h-6" />
        <section>
          <h2 className="font-medium mb-2">Thông tin sản phẩm</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {p.description ?? "Đang cập nhật…"}
          </p>
        </section>
      </div>
    </main>
  );
}
