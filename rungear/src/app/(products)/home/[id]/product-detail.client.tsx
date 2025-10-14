"use client";

import Link from "next/link";
import { useMemo, useState, useRef } from "react";
import {
  normalizeImages,
  productImageUrl,
  imagePathToUrl,
  type Product,
} from "@/modules/products/model/product-public";
import { formatPriceVND } from "@/shared/price";
import { useCart } from "@/components/cart/cart-store";

export default function ProductDetailClient({ product }: { product: Product }) {
  const images = useMemo(
    () => normalizeImages(product.images),
    [product.images]
  );
  const { addItem, open } = useCart();

  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const mainSrc =
    images[active] ? imagePathToUrl(images[active]) : productImageUrl(product) ?? "/placeholder.png";

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, q + delta));
  }

  async function addToCart() {
    // bắt buộc chọn màu
    if (!color) {
      setColorError("Vui lòng chọn màu trước khi thêm vào giỏ.");
      return;
    }
    setColorError(null);
    if (adding) return;

    setAdding(true);
    // store sẽ tự quyết: nếu đã đăng nhập -> ghi Supabase; chưa thì lưu local
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: images[active] ? imagePathToUrl(images[active]) : productImageUrl(product),
      variant: color,
      qty,
    });

    // UX: mở giỏ + báo “đã thêm”
    open();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    setAdding(false);
  }

  function buyNow() {
    // có thể điều hướng đến trang thanh toán sau khi add
    addToCart();
    // router.push("/payments"); // nếu muốn “Mua ngay” chuyển trang, mở dòng này
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb + Prev/Next */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <div className="space-x-2">
          <Link href="/home" className="hover:underline text-blue-600 font-medium">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-semibold line-clamp-1">{product.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:underline hover:text-blue-600 transition" onClick={() => history.back()}>
            ← Trước
          </button>
          <button className="hover:underline hover:text-blue-600 transition" onClick={() => history.forward()}>
            Tiếp →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square rounded-2xl border overflow-hidden bg-white shadow-xl"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              if (!imgRef.current) return;
              const rect = imgRef.current.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomPos({ x, y });
            }}
          >
            <img
              ref={imgRef}
              src={mainSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              draggable={false}
            />
            {zoom && (
              <div
                className="absolute pointer-events-none z-20"
                style={{
                  left: `calc(${zoomPos.x}% - 130px)`,
                  top: `calc(${zoomPos.y}% - 130px)`,
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  boxShadow: "0 4px 32px 0 rgba(0,0,0,0.22)",
                  border: "3px solid #3b82f6",
                  backgroundImage: `url(${mainSrc})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "300% 300%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: "background-position 0.1s",
                }}
              />
            )}
          </div>

          {images.length > 1 && (
            <ul className="mt-4 grid grid-cols-5 gap-3">
              {images.map((img, i) => {
                const src = imagePathToUrl(img);
                const activeCls =
                  i === active
                    ? "ring-2 ring-blue-600 scale-105"
                    : "ring-0 opacity-80 hover:ring-2 hover:ring-blue-300";
                return (
                  <li key={i}>
                    <button
                      onClick={() => setActive(i)}
                      className={`block aspect-square rounded-xl overflow-hidden border transition-all duration-200 ${activeCls}`}
                      aria-label={`Ảnh ${i + 1}`}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-gray-400 mb-4">SKU: 0011</div>

          <div className="text-2xl font-extrabold text-blue-700 mb-6">
            {formatPriceVND(product.price)}
          </div>

          {/* Màu */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 font-medium mb-2">Màu *</div>
            <div className="flex items-center gap-4">
              {[
                { key: "pink", className: "bg-pink-500" },
                { key: "mint", className: "bg-green-300" },
                { key: "black", className: "bg-neutral-900" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setColor(c.key);
                    setColorError(null);
                  }}
                  aria-label={c.key}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${c.className} ${
                    color === c.key
                      ? "ring-2 ring-blue-600 border-blue-600 scale-110"
                      : "border-gray-300 hover:ring-2 hover:ring-blue-300"
                  }`}
                >
                  {color === c.key && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {colorError && <p className="mt-2 text-sm text-red-600">{colorError}</p>}
          </div>

          {/* Số lượng */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 font-medium mb-2">Số lượng *</div>
            <div className="inline-flex items-center border text-gray-700 rounded-lg overflow-hidden bg-gray-50">
              <button className="px-4 py-2 hover:bg-gray-200 text-lg" onClick={() => changeQty(-1)} aria-label="Giảm">
                −
              </button>
              <input readOnly value={qty} className="w-12 text-center py-2 bg-transparent outline-none font-semibold" />
              <button className="px-4 py-2 hover:bg-gray-200 text-lg" onClick={() => changeQty(1)} aria-label="Tăng">
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={addToCart}
              disabled={adding}
              className={`h-11 px-6 rounded-lg border w-full max-w-xs bg-white text-gray-900 transition font-semibold shadow
                ${adding ? "opacity-60 pointer-events-none" : "hover:bg-blue-50 hover:border-blue-600"}`}
              aria-live="polite"
            >
              {added ? "Đã thêm ✓" : "Thêm vào giỏ hàng"}
            </button>

            <button
              onClick={buyNow}
              className="h-11 px-6 rounded-lg bg-blue-700 text-white w-full max-w-[160px] hover:bg-blue-800 transition font-semibold shadow flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13" />
              </svg>
              Mua ngay
            </button>
          </div>

          {/* Mô tả */}
          {product.description && (
            <div className="mt-8">
              <div className="text-base font-semibold text-gray-700 mb-2">THÔNG TIN SẢN PHẨM</div>
              <p className="text-sm leading-6 text-gray-700 bg-gray-50 rounded-lg p-4">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
