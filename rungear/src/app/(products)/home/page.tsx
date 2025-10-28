import { listProducts } from "@/modules/products/controller/product.service";
import { productImageUrl } from "@/modules/products/model/product-public";
import { SearchFilterForm } from "@/components/catalog/SearchFilterForm";
import { ProductGridClient } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { BlogSection } from "@/components/common/BlogSection";
import BannerSlider from "@/components/common/BannerSlider";
import CategoryTabs from "@/components/catalog/CategoryTabs";
import type { CatKey } from "@/components/catalog/CategoryTabs";

export const revalidate = 60;

/** --- Helpers: rating ổn định theo id --- */
const nfVI = new Intl.NumberFormat("vi-VN"); // cố định locale

function hashTo01(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return ((h >>> 0) % 1000) / 1000;
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

// Type cho QueryParams khớp với Pagination component
type QueryParams = Record<string, string | number | boolean | null | undefined>;

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

  const buildQuery = (extra: QueryParams = {}): QueryParams => {
    const qx: QueryParams = {};
    if (q) qx.q = q;
    if (cat && cat !== "all") qx.cat = cat;
    if (min) qx.min = min;
    if (max) qx.max = max;
    if (extra.p) qx.p = String(extra.p);
    return qx;
  };

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-10">
      {/* Banner: Fade in + scale animation */}
      <div className="mb-6 animate-in fade-in zoom-in-95 duration-700 slide-in-from-top-4">
        <BannerSlider
          images={bannerImages.length ? bannerImages : ["/placeholder.png"]}
          className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
          aspect="16/6"
        />
      </div>

      {/* Search & Filter: Slide in from left with delay */}
      <div className="animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
        <SearchFilterForm q={q} cat={cat} min={min} max={max} />
      </div>

      {/* Tabs Filter: Slide in from right with delay */}
      <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
        <CategoryTabs active={cat} q={q} min={min} max={max} pathname="/home" />
      </div>

      {/* Product Grid: Fade in + slide up with delay */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[400ms]">
        <ProductGridClient q={q} cat={cat} min={min} max={max} />
      </div>

      {/* Pagination: Fade in with delay */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[600ms]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          start={start}
          end={end}
          total={total}
          buildQuery={buildQuery}
        />
      </div>

      {/* Blog / Content: Fade in last */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[800ms]">
        <BlogSection />
      </div>
    </main>
  );
}
