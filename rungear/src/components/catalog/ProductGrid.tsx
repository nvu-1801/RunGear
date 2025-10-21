"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { productImageUrl } from "@/modules/products/model/product-public";
import { formatPriceVND } from "@/shared/price";

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

export function ProductGridClient({
  q,
  cat,
  min,
  max,
}: {
  q?: string;
  cat?: string;
  min?: string;
  max?: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (cat && cat !== "all") params.append("cat", cat);
    if (min) params.append("min", min);
    if (max) params.append("max", max);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error: " + res.status);
        return res.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        if (!Array.isArray(data.items)) {
          console.error("API trả về không đúng định dạng:", data);
        }
      })
      .catch((err) => {
        console.error("Không lấy được sản phẩm:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [q, cat, min, max]);

  if (loading) {
    return (
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-7 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="animate-pulse bg-gray-100 rounded-2xl h-64" />
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-7 mb-10">
      {items.map((p) => {
        const { rating, reviews } = getRatingFor(p.id);
        const href = `/home/${p.id}`;
        return (
          <li key={p.id}>
            <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform h-full flex flex-col">
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
                    {rating.toFixed(1)} • {reviews} đánh giá
                  </span>
                </div>
                <div className="mt-3 border-t border-slate-100" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-xl px-2.5 py-1 text-[13px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
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
      {items.length === 0 && (
        <li className="col-span-full text-center text-slate-400 py-12">
          Không tìm thấy sản phẩm.
        </li>
      )}
    </ul>
  );
}
