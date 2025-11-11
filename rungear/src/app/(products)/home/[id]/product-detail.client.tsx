"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import {
  normalizeImages,
  productImageUrl,
  imagePathToUrl,
  type Product,
} from "@/modules/products/model/product-public";
import { formatPriceVND } from "@/shared/price";
import { useCart } from "@/components/cart/cart-store";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { getAllImageUrls, getImageUrl } from "@/modules/products/lib/image-url";
import {
  getCategoryRows,
  type CatKey,
} from "@/modules/categories/category.service";
import SupabaseClient from "@supabase/supabase-js/dist/module/SupabaseClient";

function useProductCatSlug(sb: SupabaseClient, product: Product) {
  const [cat, setCat] = useState<CatKey | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getCategoryRows(sb);
        const map = new Map(rows.map((r) => [r.id, r.slug]));
        const slug = map.get((product as any).categories_id) ?? null;
        if (alive) setCat(slug ?? null);
      } catch {
        if (alive) setCat(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sb, product]);

  return cat;
}

function SizeChart({ cat }: { cat: CatKey }) {
  if (cat === "ao") {
    const rows = [
      {
        size: "S",
        chest: "86–90",
        shoulder: "38–40",
        length: "64",
        weight: "45–55",
      },
      {
        size: "M",
        chest: "90–94",
        shoulder: "40–42",
        length: "66",
        weight: "55–62",
      },
      {
        size: "L",
        chest: "94–100",
        shoulder: "42–44",
        length: "68",
        weight: "62–70",
      },
      {
        size: "XL",
        chest: "100–108",
        shoulder: "44–46",
        length: "70",
        weight: "70–80",
      },
    ];
    return (
      <div className="mt-6 border rounded-xl p-4 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          Bảng kích cỡ áo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border px-3 py-2">Size</th>
                <th className="border px-3 py-2">Ngực (cm)</th>
                <th className="border px-3 py-2">Vai (cm)</th>
                <th className="border px-3 py-2">Dài áo (cm)</th>
                <th className="border px-3 py-2">Cân nặng (kg)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.size}>
                  <td className="border px-3 py-2 font-semibold">{r.size}</td>
                  <td className="border px-3 py-2">{r.chest}</td>
                  <td className="border px-3 py-2">{r.shoulder}</td>
                  <td className="border px-3 py-2">{r.length}</td>
                  <td className="border px-3 py-2">{r.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">
          * Tham khảo, lệch ±1–2 cm tùy sản phẩm.
        </p>
      </div>
    );
  }

  if (cat === "quan") {
    const rows = [
      {
        size: "S",
        waist: "66–72",
        hip: "88–94",
        outseam: "96",
        weight: "45–55",
      },
      {
        size: "M",
        waist: "72–78",
        hip: "94–100",
        outseam: "98",
        weight: "55–62",
      },
      {
        size: "L",
        waist: "78–86",
        hip: "100–108",
        outseam: "100",
        weight: "62–70",
      },
      {
        size: "XL",
        waist: "86–94",
        hip: "108–116",
        outseam: "102",
        weight: "70–80",
      },
    ];
    return (
      <div className="mt-6 border rounded-xl p-4 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          Bảng kích cỡ quần
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border px-3 py-2">Size</th>
                <th className="border px-3 py-2">Eo (cm)</th>
                <th className="border px-3 py-2">Mông (cm)</th>
                <th className="border px-3 py-2">Dài quần (cm)</th>
                <th className="border px-3 py-2">Cân nặng (kg)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.size}>
                  <td className="border px-3 py-2 font-semibold">{r.size}</td>
                  <td className="border px-3 py-2">{r.waist}</td>
                  <td className="border px-3 py-2">{r.hip}</td>
                  <td className="border px-3 py-2">{r.outseam}</td>
                  <td className="border px-3 py-2">{r.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">
          * Tham khảo, lệch ±1–2 cm tùy sản phẩm.
        </p>
      </div>
    );
  }

  // giày
  const rows = [
    { eu: 38, us: 6, jp: 24.0, foot: 24.0 },
    { eu: 39, us: 7, jp: 24.5, foot: 24.5 },
    { eu: 40, us: 7.5, jp: 25.0, foot: 25.0 },
    { eu: 41, us: 8, jp: 25.5, foot: 25.5 },
    { eu: 42, us: 9, jp: 26.0, foot: 26.0 },
    { eu: 43, us: 10, jp: 27.0, foot: 27.0 },
  ];
  return (
    <div className="mt-6 border rounded-xl p-4 bg-gray-50">
      <h3 className="text-base font-semibold text-gray-700 mb-3">
        Bảng kích cỡ giày
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="border px-3 py-2">EU</th>
              <th className="border px-3 py-2">US</th>
              <th className="border px-3 py-2">JP (cm)</th>
              <th className="border px-3 py-2">Dài chân (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.eu}>
                <td className="border px-3 py-2 font-semibold">{r.eu}</td>
                <td className="border px-3 py-2">{r.us}</td>
                <td className="border px-3 py-2">{r.jp}</td>
                <td className="border px-3 py-2">{r.foot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        * Đo chiều dài bàn chân (gót → ngón dài nhất), chọn size gần nhất; có
        thể lệch ±0.5 cm.
      </p>
    </div>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const images = useMemo(
    () => getAllImageUrls(product.images ?? null),
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

  const { user, isAdmin } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(user));
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const cat = useProductCatSlug(sb, product); // "ao" | "quan" | "giay" | null

  // Gợi ý size options theo cate (không bắt buộc)
  const sizeOptions = useMemo(() => {
    if (cat === "giay") return ["38", "39", "40", "41", "42", "43"];
    // áo/quần dùng chữ
    return ["S", "M", "L", "XL"];
  }, [cat]);

  useEffect(() => {
    setIsLoggedIn(Boolean(user));
  }, [user]);

  const mainSrc = images[active] ?? getImageUrl(null);

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, q + delta));
  }
  async function addToCart() {
    if (!color) {
      setColorError("Vui lòng chọn màu trước khi thêm vào giỏ.");
      return;
    }
    if (!size) {
      setSizeError("Vui lòng chọn size trước khi thêm vào giỏ.");
      return;
    }

    setColorError(null);
    setSizeError(null);

    if (adding) return;
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setAdding(true);

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: images[active]
        ? imagePathToUrl(images[active])
        : productImageUrl(product),
      variant: `${color.toUpperCase()} - Size ${size}`, // ✅ thêm size vào variant
      qty,
    });

    open();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    setAdding(false);
  }

  function buyNow() {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    addToCart();
    // Nếu muốn chuyển sang trang thanh toán sau khi thêm:
    // router.push("/payments");
  }

  function handleLoginRedirect() {
    setShowLoginModal(false);
    router.push("/auth/signin");
  }

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb + Prev/Next */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="space-x-2">
            <Link
              href="/home"
              className="hover:underline text-blue-600 font-medium"
            >
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold line-clamp-1">
              {product.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="hover:underline hover:text-blue-600 transition"
              onClick={() => history.back()}
            >
              ← Trước
            </button>
            <button
              className="hover:underline hover:text-blue-600 transition"
              onClick={() => history.forward()}
            >
              Tiếp →
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left: Gallery */}
          <div>
            <div
              ref={imgRef}
              className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 cursor-zoom-in"
              onMouseMove={(e) => {
                if (!imgRef.current) return;
                const rect = imgRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPos({ x, y });
              }}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <img
                src={mainSrc}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getImageUrl(null);
                }}
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
                        <img
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              getImageUrl(null);
                          }}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="text-gray-400 mb-4">SKU: 0011</div>

            <div className="text-2xl font-extrabold text-blue-700 mb-6">
              {formatPriceVND(product.price)}
            </div>

            {/* Màu */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 font-medium mb-2">
                Màu *
              </div>
              <div className="flex items-center gap-4">
                {[
                  {
                    key: "pink",
                    className: "bg-pink-500",
                  },
                  {
                    key: "mint",
                    className: "bg-green-300",
                  },
                  {
                    key: "black",
                    className: "bg-neutral-900",
                  },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      setColor(c.key);
                      setColorError(null);
                    }}
                    aria-label={c.key}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      c.className
                    } ${
                      color === c.key
                        ? "ring-2 ring-blue-600 border-blue-600 scale-110"
                        : "border-gray-300 hover:ring-2 hover:ring-blue-300"
                    }`}
                  >
                    {color === c.key && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {colorError && (
                <p className="mt-2 text-sm text-red-600">{colorError}</p>
              )}
            </div>

            {/* Số lượng */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 font-medium mb-2">
                Số lượng *
              </div>
              <div className="inline-flex items-center border text-gray-700 rounded-lg overflow-hidden bg-gray-50">
                <button
                  className="px-4 py-2 hover:bg-gray-200 text-lg"
                  onClick={() => changeQty(-1)}
                  aria-label="Giảm"
                >
                  −
                </button>
                <input
                  readOnly
                  value={qty}
                  className="w-12 text-center py-2 bg-transparent outline-none font-semibold"
                />
                <button
                  className="px-4 py-2 hover:bg-gray-200 text-lg"
                  onClick={() => changeQty(1)}
                  aria-label="Tăng"
                >
                  +
                </button>
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 font-medium mb-2">
                Size *
              </div>

              <div className="flex items-center gap-3">
                {sizeOptions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setSizeError(null);
                    }}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${
                      size === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                    }`}
                    aria-label={`Chọn size ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {sizeError && (
                <p className="mt-2 text-sm text-red-600">{sizeError}</p>
              )}
            </div>

            {/* ⬇️ Chèn SizeChart tương ứng cate (khi đã xác định được) */}
            {cat && <SizeChart cat={cat} />}

            {/* Buttons */}
            <div className="flex items-center gap-4 mt-4 mb-8">
              <button
                onClick={addToCart}
                disabled={adding}
                className={`h-11 px-6 rounded-lg border w-full max-w-xs bg-white text-gray-900 transition font-semibold shadow
                  ${
                    adding
                      ? "opacity-60 pointer-events-none"
                      : "hover:bg-blue-50 hover:border-blue-600"
                  }`}
                aria-live="polite"
              >
                {added ? "Đã thêm ✓" : "Thêm vào giỏ hàng"}
              </button>

              <button
                onClick={buyNow}
                className="h-11 px-6 rounded-lg bg-blue-700 text-white w-full max-w-[160px] hover:bg-blue-800 transition font-semibold shadow flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13"
                  />
                </svg>
                Mua ngay
              </button>
            </div>

            {/* Mô tả */}
            {product.description && (
              <div className="mt-8">
                <div className="text-base font-semibold text-gray-700 mb-2">
                  THÔNG TIN SẢN PHẨM
                </div>
                <p className="text-sm leading-6 text-gray-700 bg-gray-50 rounded-lg p-4">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Bạn cần đăng nhập
              </h3>
              <p className="text-sm text-gray-600">
                Để sử dụng tính năng "Mua ngay", vui lòng đăng nhập vào tài
                khoản của bạn.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleLoginRedirect}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition font-medium"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
