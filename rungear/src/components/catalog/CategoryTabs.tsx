import type { ReactNode } from "react";
import Link from "next/link";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { countProductsByCategory } from "@/modules/categories/category.service";

export type CatKey = "all" | "ao" | "quan" | "giay";

const ICONS: Record<CatKey, ReactNode> = {
  all: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  ),
  ao: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4l4 2 4-2 3 4-3 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10L5 8l3-4z" />
    </svg>
  ),
  quan: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3h10l-2 18H9L7 3zM9 9h6" />
    </svg>
  ),
  giay: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 14s2-1 4-1 4 2 7 2 7-1 7-1v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2z" />
      <path d="M7 13c.5-2 2-5 5-5 2 0 3 1 4 2" />
    </svg>
  ),
};

type Props = {
  /** cat đang active trên UI */
  active?: CatKey;
  /** giữ query khi click tab */
  q?: string;
  min?: string;
  max?: string;
  /** pathname muốn điều hướng (mặc định /home) */
  pathname?: string;
};

export default async function CategoryTabs({ active = "all", q, min, max, pathname = "/home" }: Props) {
  const sb = await supabaseServer();
  const counts = await countProductsByCategory(sb, { q });

  const Tab = (label: string, key: CatKey) => {
    const isActive = active === key || (!active && key === "all");
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (min) query.min = min;
    if (max) query.max = max;
    if (key !== "all") query.cat = key;

    return (
      <Link
        key={key}
        href={{ pathname, query }}
        aria-current={isActive ? "page" : undefined}
        className={[
          "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-200",
          isActive ? "bg-blue-700 text-white border-blue-700 shadow" : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700",
        ].join(" ")}
      >
        <span className={isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}>{ICONS[key]}</span>
        <span>{label}</span>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-white text-blue-700" : "bg-blue-100 text-blue-700"}`}>
          {counts[key]}
        </span>
      </Link>
    );
  };

  return (
    <div className="w-full mb-6 md:mb-8 relative z-10">
      {/* vùng cuộn ngang, không ăn tràn ra ngoài page */}
      <div className="overflow-x-auto scrollbar-hide overscroll-x-contain">
        <div className="flex items-center w-full">
          {/* spacer trái/phải để khỏi dính mép màn hình */}
          <div className="flex-shrink-0 w-3 sm:w-0" />

          <div
            className="
            inline-flex min-w-max flex-nowrap items-center gap-2
            rounded-full border bg-white/80 backdrop-blur
            px-2 py-2 shadow-sm
          "
          style={{ zIndex: 10, position: "relative" }} // Thêm style này nếu cần
        >
          {Tab("Tất cả", "all")}
          {Tab("Áo", "ao")}
          {Tab("Quần", "quan")}
          {Tab("Giày", "giay")}
        </div>

        <div className="flex-shrink-0 w-3 sm:w-0" />
        </div>
      </div>
    </div>
  );
}
