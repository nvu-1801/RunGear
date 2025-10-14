import Link from "next/link";
import { listProducts } from "@/modules/products/controller/product.service";
import { productImageUrl } from "@/modules/products/model/product-public";
import { formatPriceVND } from "../../../shared/price";
import BannerSlider from "../../../components/common/BannerSlider";
import CategoryTabs, { type CatKey } from "@/components/catalog/CategoryTabs";

export const revalidate = 60;

/** --- Helpers: rating ổn định theo id --- */
const nfVI = new Intl.NumberFormat("vi-VN"); // cố định locale

function formatInt(n: number) {
  return nfVI.format(n);
}
function hashTo01(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return ((h >>> 0) % 1000) / 1000;
}
function getRatingFor(id: string) {
  const r = hashTo01(id);
  const rating = Math.round((3.6 + r * 1.4) * 2) / 2;
  const reviews = 15 + Math.floor(r * 465);
  return { rating, reviews };
}
function Star({ filled, half }: { filled?: boolean; half?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      aria-hidden="true"
      role="img"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {half ? (
        <>
          <defs>
            <linearGradient id="halfGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="url(#halfGrad)"
          />
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </>
      ) : (
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      )}
    </svg>
  );
}
function StarRating({ value }: { value: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = value - i;
    stars.push(
      <Star
        key={i}
        filled={diff >= 0}
        half={diff >= -1 && diff < 0 && Math.abs(diff) >= 0 && value % 1 !== 0}
      />
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-amber-500">{stars}</div>
  );
}

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

  let items = await listProducts({ q, cat });
  if (min) items = items.filter((i) => i.price >= Number(min));
  if (max) items = items.filter((i) => i.price <= Number(max));

  const bannerImages = Array.from(
    new Set(
      items
        .map((p) => productImageUrl(p))
        .filter((u): u is string => Boolean(u))
    )
  ).slice(0, 5);

  const pageSize = 8;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = items.slice(start, end);

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
    <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-10">
      {/* Banner: responsive aspect + fallback */}
      <div className="mb-6">
        <BannerSlider
          images={bannerImages.length ? bannerImages : ["/placeholder.png"]}
          className="rounded-2xl overflow-hidden"
          aspect="16/6"
        />
      </div>

      {/* Search & Filter (desktop + compact mobile) */}
      <form
        method="get"
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 mb-6"
        aria-label="Tìm kiếm và lọc"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Cửa hàng
        </h1>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
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

          <input type="hidden" name="cat" value={cat} />

          <div className="flex gap-2 items-center flex-wrap">
            <select
              id="min"
              name="min"
              defaultValue={min || ""}
              className="w-28 lg:w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              aria-label="Giá từ"
            >
              <option value="">Giá từ</option>
              <option value="0">0 ₫</option>
              <option value="100000">100.000 ₫</option>
              <option value="200000">200.000 ₫</option>
              <option value="500000">500.000 ₫</option>
              <option value="1000000">1.000.000 ₫</option>
            </select>

            <select
              id="max"
              name="max"
              defaultValue={max || ""}
              className="w-28 lg:w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              aria-label="Đến giá"
            >
              <option value="">Đến</option>
              <option value="200000">200.000 ₫</option>
              <option value="500000">500.000 ₫</option>
              <option value="1000000">1.000.000 ₫</option>
              <option value="3000000">3.000.000 ₫</option>
              <option value="10000000">10.000.000 ₫</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-full bg-blue-700 text-white px-4 py-2 font-semibold shadow hover:bg-blue-800 transition"
              >
                Lọc
              </button>

              <a
                href={`/home${q ? `?q=${encodeURIComponent(q)}` : ""}${
                  cat && cat !== "all"
                    ? `${q ? "&" : "?"}cat=${encodeURIComponent(cat)}`
                    : ""
                }`}
                className="ml-1 text-sm text-gray-600 hover:text-blue-700 transition"
                aria-label="Xoá lọc giá"
              >
                Xoá
              </a>
            </div>
          </div>
        </div>
      </form>

      {/* Tabs Filter */}
      <div className="mb-6 md:mb-8">
        <CategoryTabs active={cat} q={q} min={min} max={max} pathname="/home" />
      </div>

      {/* Product Grid: responsive columns + card adjustments */}
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-7 mb-10">
        {pageItems.map((p) => {
          const { rating, reviews } = getRatingFor(p.id);
          const href = `/home/${p.id}`;
          return (
            <li key={p.id}>
              <article
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white
                         shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform h-full flex flex-col"
              >
                {/* Ảnh (cover + responsive) */}
                <div className="relative w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-slate-50 to-white overflow-hidden">
                  <img
                    src={productImageUrl(p) ?? "/placeholder.png"}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-slate-200/70 group-hover:ring-blue-200/80 pointer-events-none" />
                  <Link
                    href={href}
                    prefetch={false}
                    aria-label={`Xem ${p.name}`}
                    className="absolute inset-0"
                  />
                </div>

                {/* Nội dung */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <Link
                    href={href}
                    prefetch={false}
                    className="block font-semibold text-[15px] sm:text-base text-slate-900 line-clamp-1 hover:text-blue-700 transition"
                    title={p.name}
                  >
                    {p.name}
                  </Link>

                  <div className="mt-2 flex items-center gap-2 text-slate-500">
                    <StarRating value={rating} />
                    <span className="text-xs sm:text-sm">
                      {rating.toFixed(1)} • {formatInt(reviews)} đánh giá
                    </span>
                  </div>

                  <div className="mt-3 border-t border-slate-100" />

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="inline-flex items-center rounded-xl px-2.5 py-1 text-[13px] font-semibold
                             bg-blue-50 text-blue-700 border border-blue-200/60"
                    >
                      {formatPriceVND(p.price)}
                    </span>

                    <div className="text-sm text-gray-500 hidden sm:block">
                      {p.stock} in stock
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}

        {pageItems.length === 0 && (
          <li className="col-span-full text-center text-slate-400 py-12">
            Không tìm thấy sản phẩm.
          </li>
        )}
      </ul>

      {/* Pagination: responsive wrap */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 text-sm text-gray-600">
        <p>
          Hiển thị{" "}
          <span className="font-medium">
            {total ? start + 1 : 0}-{end}
          </span>{" "}
          / {total}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            aria-disabled={currentPage <= 1}
            href={{
              pathname: "/home",
              query: buildQuery({ p: Math.max(1, currentPage - 1) }),
            }}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            ← Trước
          </Link>
          <span className="font-semibold text-gray-800">
            Trang {currentPage} / {totalPages}
          </span>
          <Link
            aria-disabled={currentPage >= totalPages}
            href={{
              pathname: "/home",
              query: buildQuery({ p: Math.min(totalPages, currentPage + 1) }),
            }}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Tiếp →
          </Link>
        </div>
      </div>

      {/* Blog / Content */}
      <section className="mt-12">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
          Góc tư vấn • Chạy khỏe & mặc đẹp
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              href: "/blog/tips-chon-giay-chay",
              title: "5 tips chọn giày chạy bộ cho người mới",
              desc: "Đệm, độ rơi gót–mũi (heel-to-toe drop), độ ôm…",
              img: "https://antien.vn/files/uploads/kailas/do-on-dinh-cua-giay-chay-trail.png",
            },
            {
              href: "/blog/chon-size-giay",
              title: "Bảng size & cách đo bàn chân chuẩn",
              desc: "Đo chiều dài, chiều rộng, phòng nở chân khi chạy…",
              img: "https://images.pexels.com/photos/8770394/pexels-photo-8770394.jpeg",
            },
            {
              href: "/blog/phoi-outfit-chay",
              title: "Phối outfit: Áo – quần – giày “ăn” màu",
              desc: "3 công thức phối màu nhìn gọn mắt, lên ảnh đẹp…",
              img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
            },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={a.img}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                  {a.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {a.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
