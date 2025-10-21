import Link from "next/link";
import { formatPriceVND } from "@/shared/price";
import type { CartItem } from "@/components/cart/cart-store";

export function CartItemsList({
  items,
  updateQty,
  remove,
}: {
  items: CartItem[];
  updateQty: (id: string, delta: number, variant: string | null) => void;
  remove: (id: string, variant: string | null) => void;
}) {
  return (
    <ul className="divide-y">
      {items.map((it) => (
        <li
          key={it.id + (it.variant ?? "")}
          className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/60"
        >
          <Link
            href={`/products/${it.slug}`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border bg-white shrink-0 block"
          >
            <img
              src={it.image || "/placeholder.png"}
              alt={it.name}
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/products/${it.slug}`}
                  className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 hover:underline"
                >
                  {it.name}
                </Link>
                {it.variant && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Phân loại: {it.variant}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(it.id, it.variant ?? null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Xoá sản phẩm"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center border rounded-full bg-white shadow-sm">
                <button
                  className="px-2 py-1 rounded-l-full hover:bg-blue-50 text-blue-600 text-lg transition"
                  onClick={() => updateQty(it.id, -1, it.variant ?? null)}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <div className="w-9 text-gray-700 text-center text-sm">
                  {it.qty}
                </div>
                <button
                  className="px-2 py-1 rounded-r-full hover:bg-blue-50 text-blue-600 text-lg transition"
                  onClick={() => updateQty(it.id, +1, it.variant ?? null)}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
              <div className="text-sm sm:text-base font-bold text-blue-700 whitespace-nowrap">
                {formatPriceVND(it.price * it.qty)}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
