"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, items, updateQty, remove, subtotal, clear } =
    useCart();

  const gotoCheckout = () => {
    close(); // đóng drawer cho gọn
    router.push("/payments"); // đổi đường dẫn cho khớp trang bạn tạo
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } z-[80]`}
        onClick={close}
      />
      {/* Drawer: cũng cần z cao */}
      <aside
        className={`fixed right-0 top-0 h-full w-[380px] max-w-[95vw] bg-white shadow-2xl border-l transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-[81] rounded-l-2xl`}
        aria-hidden={!isOpen}
      >
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="font-bold text-lg text-gray-800 tracking-tight">
            🛒 Giỏ hàng
          </div>
          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-gray-100 transition"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="h-[calc(100%-56px-180px)] overflow-auto px-3 py-2 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-500 px-1 pt-2">Chưa có sản phẩm.</p>
          )}
          {items.map((it) => (
            <div
              key={it.id + (it.variant ?? "")}
              className="flex gap-3 border rounded-2xl p-3 bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold line-clamp-2 text-gray-800">
                  {it.name}
                </div>
                {it.variant && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Màu: {it.variant}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center border rounded-full bg-white shadow-sm">
                    <button
                      className="px-2 py-1 rounded-l-full hover:bg-blue-50 text-blue-600 text-lg transition"
                      onClick={() => updateQty(it.id, -1, it.variant ?? null)}
                    >
                      −
                    </button>
                    <div className="w-8 text-gray-600 text-center text-sm">
                      {it.qty}
                    </div>
                    <button
                      className="px-2 py-1 rounded-r-full hover:bg-blue-50 text-blue-600 text-lg transition"
                      onClick={() => updateQty(it.id, +1, it.variant ?? null)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-bold text-blue-700">
                    {formatPriceVND(it.price * it.qty)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(it.id, it.variant ?? null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Xoá sản phẩm"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t p-5 space-y-4 bg-white rounded-b-2xl">
          <div className="flex items-center justify-between text-base font-medium">
            <span className="text-gray-700">Tạm tính</span>
            <span className="font-bold text-blue-700">
              {formatPriceVND(subtotal)}
            </span>
          </div>

          <button
            className="w-full h-12 rounded-xl bg-blue-700 text-white font-semibold text-lg shadow hover:bg-blue-800 transition disabled:opacity-50"
            onClick={gotoCheckout}
            disabled={items.length === 0}
          >
            Thanh toán
          </button>

          <div className="flex items-center justify-between">
            <Link
              href="/payments"
              className="text-sm text-blue-600 underline hover:text-blue-800 transition"
            >
              Xem giỏ hàng
            </Link>
            <button
              onClick={clear}
              className="text-sm text-gray-500 hover:text-red-600 transition"
            >
              Xoá tất cả
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
