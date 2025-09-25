import Link from "next/link";
import { listProducts } from "@/modules/products/controller/product.service";
import { productImageUrl } from "@/modules/products/model/product-public";
import { formatPriceVND } from "../../../shared/price";
import BannerSlider from "../../../components/common/BannerSlider";

export const revalidate = 60;

type CatKey = "all" | "giay" | "quan-ao";

export default async function ProductsPage({
  searchParams,
}: {
  // ✅ Next 15: searchParams là Promise
  searchParams: Promise<{ q?: string; cat?: CatKey; p?: string }>;
}) {
  const { q = "", cat = "all", p = "1" } = await searchParams; // ✅
  const page = Math.max(1, Number(p) || 1);

  const items = await listProducts({ q, cat });

  // ---- Banner: lấy 5 ảnh từ products
  const bannerImages = Array.from(
    new Set(items.map((p) => productImageUrl(p)).filter((u): u is string => Boolean(u)))
  ).slice(0, 5);

  // ---- Phân trang: 2 hàng / trang -> chọn 8 items (4 cột x 2 hàng ở lg)
  const pageSize = 8;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = items.slice(start, end);

  const buildQuery = (extra: Record<string, string | number | undefined> = {}) => {
    const qx: Record<string, string> = {};
    if (q) qx.q = q;
    if (cat && cat !== "all") qx.cat = cat;
    if (extra.p) qx.p = String(extra.p);
    return qx;
  };

  const Tab = (label: string, key: CatKey) => {
    const isActive = cat === key || (!cat && key === "all");
    const query = buildQuery({ p: 1, ...(key !== "all" ? { cat: key } : {}) });

    return (
      <Link
        key={key}
        href={{ pathname: "/home", query }}
        className={`px-3 py-1.5 rounded-full text-sm border transition
          ${isActive ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Banner */}
      <BannerSlider images={bannerImages.length ? bannerImages : ["/placeholder.png"]} />

      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cửa hàng</h1>
      </div>

      {/* Tabs filter */}
      <div className="flex items-center gap-2 mb-6">
        {Tab("Tất cả", "all")}
        {Tab("Giày", "giay")}
        {Tab("Trang phục", "quan-ao")}
      </div>

      {/* Grid: chỉ hiển thị 2 hàng (8 items) / trang */}
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {pageItems.map((p) => (
          <li key={p.id} className="group">
            <Link href={`/home/${p.slug}`} className="block">
              <div className="aspect-square overflow-hidden rounded-2xl border">
                <img
                  src={productImageUrl(p) ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="mt-3">
                <p className="font-medium line-clamp-1 text-gray-900">{p.name}</p>
                <p className="mt-1 font-semibold text-gray-900">{formatPriceVND(p.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-medium">{total ? start + 1 : 0}-{end}</span> / {total}
        </p>

        <div className="flex items-center text-gray-600 gap-2">
          <Link
            aria-disabled={currentPage <= 1}
            href={{ pathname: "/home", query: buildQuery({ p: Math.max(1, currentPage - 1) }) }}
            className={`px-3 py-1.5 rounded-md border text-sm transition
              ${currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
          >
            Prev
          </Link>
          <span className="text-sm text-gray-600">
            Trang <span className="font-medium">{currentPage}</span> / {totalPages}
          </span>
          <Link
            aria-disabled={currentPage >= totalPages}
            href={{ pathname: "/home", query: buildQuery({ p: Math.min(totalPages, currentPage + 1) }) }}
            className={`px-3 py-1.5 rounded-md border text-sm transition
              ${currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
