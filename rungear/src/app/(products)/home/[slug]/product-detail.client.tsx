"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/modules/products/model/product-public";
import {
  productImageUrl,
  imagePathToUrl,
} from "@/modules/products/model/product-public";
import { formatPriceVND } from "@/shared/price";
import { useCart } from "@/modules/cart/cart-store";

export default function ProductDetailClient({ product }: { product: Product }) {
  const images = useMemo(() => product.images ?? [], [product.images]);
  const { addItem, open } = useCart();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | null>(null);

  const mainSrc = images[active]
    ? imagePathToUrl(images[active])
    : productImageUrl(product) ?? "/placeholder.png";

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, q + delta));
  }

  function addToCart() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: images[active]
        ? imagePathToUrl(images[active])
        : productImageUrl(product),
      variant: color,
      qty,
    });
    open();
  }

  function buyNow() {
    addToCart();
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb + Prev/Next giả lập */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="space-x-2">
          <Link href="/home" className="hover:underline">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:underline" onClick={() => history.back()}>
            ← Trước
          </button>
          <button className="hover:underline" onClick={() => history.forward()}>
            Tiếp →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-xl border overflow-hidden bg-white">
            <img
              src={mainSrc}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <ul className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => {
                const src = `${
                  process.env.NEXT_PUBLIC_SUPABASE_URL
                }/storage/v1/object/public/products/${encodeURIComponent(img)}`;
                const activeCls = i === active ? "ring-2 ring-black" : "ring-0";
                return (
                  <li key={i}>
                    <button
                      onClick={() => setActive(i)}
                      className={`block aspect-square rounded-lg overflow-hidden border ${activeCls}`}
                      aria-label={`Ảnh ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {product.name}
          </h1>
          <div className="mt-2 text-gray-500">SKU: 0011</div>

          <div className="mt-4 text-2xl font-bold text-gray-900">
            {formatPriceVND(product.price)}
          </div>

          {/* Màu (demo) */}
          <div className="mt-6">
            <div className="text-sm text-gray-500 font-medium mb-2">Màu *</div>
            <div className="flex items-center gap-3">
              {[
                { key: "pink", className: "bg-pink-500" },
                { key: "mint", className: "bg-green-300" },
                { key: "black", className: "bg-neutral-900" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  aria-label={c.key}
                  className={`w-6 h-6 rounded-full border ${c.className} ${
                    color === c.key ? "ring-2 ring-black" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Số lượng */}
          <div className="mt-6">
            <div className="text-sm text-gray-500 font-medium mb-2">
              Số lượng *
            </div>
            <div className="inline-flex items-center border text-gray-500 rounded-md overflow-hidden">
              <button
                className="px-3 py-1.5 hover:bg-gray-50"
                onClick={() => changeQty(-1)}
                aria-label="Giảm"
              >
                −
              </button>
              <input
                readOnly
                value={qty}
                className="w-12 text-center py-1.5 outline-none"
              />
              <button
                className="px-3 py-1.5 hover:bg-gray-50"
                onClick={() => changeQty(1)}
                aria-label="Tăng"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={addToCart}
              className="h-10 px-5 rounded-md border w-full max-w-xs bg-white text-gray-900 hover:bg-gray-50"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={buyNow}
              className="h-10 px-5 rounded-md bg-black text-white w-full max-w-[160px] hover:bg-gray-900"
            >
              Mua ngay
            </button>
          </div>

          {/* Mô tả */}
          {product.description && (
            <div className="mt-8">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                THÔNG TIN SẢN PHẨM
              </div>
              <p className="text-sm leading-6 text-gray-700">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
