import type { ReactNode } from "react";
import Link from "next/link";
import { listProducts } from "@/modules/products/controller/product.service";
import { productImageUrl } from "@/modules/products/model/product-public";
import { formatPriceVND } from "../../../shared/price";
import BannerSlider from "../../../components/common/BannerSlider";
import CategoryTabs, { type CatKey } from "@/components/catalog/CategoryTabs";

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: CatKey; // dùng type từ CategoryTabs
    p?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const {
    q = "",
    cat = "all",
    p = "1",
    min = "",
    max = "",
  } = await searchParams;

  const page = Math.max(1, Number(p) || 1);

  // Lọc sản phẩm theo giá nếu có min/max
  let items = await listProducts({ q, cat });
  if (min) items = items.filter((i) => i.price >= Number(min));
  if (max) items = items.filter((i) => i.price <= Number(max));

  // Banner: lấy 5 ảnh từ products
  const bannerImages = Array.from(
    new Set(
      items
        .map((p) => productImageUrl(p))
        .filter((u): u is string => Boolean(u))
    )
  ).slice(0, 5);

  // Phân trang: 2 hàng / trang -> chọn 8 items (4 cột x 2 hàng ở lg)
  const pageSize = 8;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = items.slice(start, end);

  // Build query helper
  const buildQuery = (
    extra: Record<string, string | number | undefined> = {}
  ) => {
    const qx: Record<string, string> = {};
    if (q) qx.q = q;
    if (cat && cat !== "all") qx.cat = cat;
    if (min) qx.min = min;
    if (max) qx.max = max;
    if (extra.p) qx.p = String(extra.p);
    return qx;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Banner */}
      <BannerSlider
        images={bannerImages.length ? bannerImages : ["/placeholder.png"]}
      />

      {/* Search & filter */}
      <form
        method="get"
        className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
        aria-label="Tìm kiếm và lọc"
      >
        <h1 className="text-2xl font-bold text-gray-900">Cửa hàng</h1>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="relative w-full md:w-72">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 pl-10 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              aria-label="Tìm kiếm sản phẩm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
          </div>

          {/* giữ cat để không mất tab khi submit */}
          <input type="hidden" name="cat" value={cat} />

          {/* Lọc theo giá */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <label className="sr-only" htmlFor="min">Giá từ</label>
              <select
                id="min"
                name="min"
                defaultValue={min || ""}
                className="w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                aria-label="Giá từ"
              >
                <option value="">Giá từ</option>
                <option value="0">0 ₫</option>
                <option value="100000">100.000 ₫</option>
                <option value="200000">200.000 ₫</option>
                <option value="500000">500.000 ₫</option>
                <option value="1000000">1.000.000 ₫</option>
              </select>
            </div>

            <div className="relative">
              <label className="sr-only" htmlFor="max">Đến</label>
              <select
                id="max"
                name="max"
                defaultValue={max || ""}
                className="w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                aria-label="Đến giá"
              >
                <option value="">Đến</option>
                <option value="200000">200.000 ₫</option>
                <option value="500000">500.000 ₫</option>
                <option value="1000000">1.000.000 ₫</option>
                <option value="3000000">3.000.000 ₫</option>
                <option value="10000000">10.000.000 ₫</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-full bg-blue-700 text-white px-5 py-2 font-semibold shadow hover:bg-blue-800 transition"
            >
              Lọc
            </button>

            <a
              href={`/home${q ? `?q=${encodeURIComponent(q)}` : ""}${
                cat && cat !== "all"
                  ? `${q ? "&" : "?"}cat=${encodeURIComponent(cat)}`
                  : ""
              }`}
              className="ml-2 text-sm text-gray-600 hover:text-blue-700 transition"
              aria-label="Xoá lọc giá"
            >
              Xoá
            </a>
          </div>
        </div>
      </form>

      {/* Tabs filter (đã tách thành component) */}
      <div className="mb-8">
        <CategoryTabs active={cat} q={q} min={min} max={max} pathname="/home" />
      </div>

      {/* Grid: chỉ hiển thị 2 hàng (8 items) / trang */}
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mb-8">
        {pageItems.map((p) => (
          <li key={p.id} className="group relative">
            <Link href={`/home/${p.id}`} className="block h-full">
              <div className="aspect-square overflow-hidden rounded-2xl border bg-white shadow-md group-hover:shadow-2xl transition-all duration-200">
                <img
                  src={productImageUrl(p) ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 px-1">
                <p className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-blue-700 transition">
                  {p.name}
                </p>
                <p className="mt-1 font-bold text-lg text-blue-700">
                  {formatPriceVND(p.price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {pageItems.length === 0 && (
          <li className="col-span-full text-center text-gray-400 py-12">
            Không tìm thấy sản phẩm.
          </li>
        )}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-medium">
            {total ? start + 1 : 0}-{end}
          </span>{" "}
          / {total}
        </p>
        <div className="flex items-center text-gray-600 gap-2">
          <Link
            aria-disabled={currentPage <= 1}
            href={{
              pathname: "/home",
              query: buildQuery({ p: Math.max(1, currentPage - 1) }),
            }}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition
              ${
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-blue-50 hover:border-blue-400"
              }`}
          >
            ← Trước
          </Link>
          <span className="text-sm text-gray-700 font-semibold">
            Trang {currentPage} / {totalPages}
          </span>
          <Link
            aria-disabled={currentPage >= totalPages}
            href={{
              pathname: "/home",
              query: buildQuery({ p: Math.min(totalPages, currentPage + 1) }),
            }}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition
              ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-blue-50 hover:border-blue-400"
              }`}
          >
            Tiếp →
          </Link>
        </div>
      </div>
    </main>
  );
}
