import type { ReactNode } from "react";
import Link from "next/link";
import { listProducts } from "@/modules/products/controller/product.service";
import { productImageUrl } from "@/modules/products/model/product-public";
import { formatPriceVND } from "../../../shared/price";
import BannerSlider from "../../../components/common/BannerSlider";

export const revalidate = 60;

type CatKey = "all" | "giay" | "quan-ao";

const ICONS: Record<CatKey, ReactNode> = {
  all: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  ),
  giay: (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 14s2-1 4-1 4 2 7 2 7-1 7-1v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2z" />
      <path d="M7 13c.5-2 2-5 5-5 2 0 3 1 4 2" />
    </svg>
  ),
  "quan-ao": (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 4l4 2 4-2 3 4-3 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10L5 8l3-4z" />
    </svg>
  ),
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: CatKey;
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

  // Đếm số lượng từng loại cho badge tab
  const catCounts: Record<CatKey, number> = {
    all: (await listProducts({ q })).length,
    giay: (await listProducts({ q, cat: "giay" })).length,
    "quan-ao": (await listProducts({ q, cat: "quan-ao" })).length,
  };

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

  // Tab component với badge số lượng
  const Tab = (label: string, key: CatKey) => {
    const isActive = cat === key || (!cat && key === "all");
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (min) query.min = min;
    if (max) query.max = max;
    if (key !== "all") query.cat = key;

    return (
      <Link
        key={key}
        href={{ pathname: "/home", query }}
        aria-current={isActive ? "page" : undefined}
        className={[
          "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-200",
          isActive
            ? "bg-blue-700 text-white border-blue-700 shadow"
            : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700",
        ].join(" ")}
      >
        <span
          className={
            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
          }
        >
          {ICONS[key]}
        </span>
        <span>{label}</span>
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
            isActive ? "bg-white text-blue-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {catCounts[key]}
        </span>
      </Link>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Banner */}
      <BannerSlider
        images={bannerImages.length ? bannerImages : ["/placeholder.png"]}
      />

      {/* Search & filter */}
      <form className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cửa hàng</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 pl-10 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
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
          {/* Lọc theo giá */}
          <input
            type="number"
            name="min"
            min={0}
            placeholder="Giá từ"
            defaultValue={min}
            className="w-24 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          <input
            type="number"
            name="max"
            min={0}
            placeholder="Đến"
            defaultValue={max}
            className="w-24 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-700 text-white px-5 py-2 font-semibold shadow hover:bg-blue-800 transition"
          >
            Lọc
          </button>
        </div>
      </form>

      {/* Tabs filter */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 backdrop-blur px-2 py-2 shadow-sm">
          {Tab("Tất cả", "all")}
          {Tab("Giày", "giay")}
          {Tab("Trang phục", "quan-ao")}
        </div>
      </div>

      {/* Grid: chỉ hiển thị 2 hàng (8 items) / trang */}
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mb-8">
        {pageItems.map((p) => (
          <li key={p.id} className="group relative">
            <Link href={`/home/${p.slug}`} className="block h-full">
              <div className="aspect-square overflow-hidden rounded-2xl border bg-white shadow-md group-hover:shadow-2xl transition-all duration-200">
                <img
                  src={productImageUrl(p) ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Badge mới hoặc sale */}
                {/* {p.isNew && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    Mới
                  </span>
                )}
                {p.isSale && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    Sale
                  </span>
                )} */}
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
