"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, items, updateQty, remove, subtotal, clear } = useCart();

  const gotoCheckout = () => {
    close();
    router.push("/payments");
  };

  const gotoCart = () => {
    close();
    router.push("/cart");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } z-[80]`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-[380px] max-w-[95vw] bg-white shadow-2xl border-l transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-[179] rounded-l-2xl flex flex-col`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="font-bold text-lg text-gray-800 tracking-tight">🛒 Giỏ hàng</div>
          <button onClick={close} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Đóng">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-500 px-1 pt-2">Chưa có sản phẩm.</p>
          )}

          {items.map((it) => (
            <div
              key={it.id + (it.variant ?? "")}
              className="flex gap-3 border rounded-2xl p-3 bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold line-clamp-2 text-gray-800">{it.name}</div>

                {it.variant && (
                  <div className="text-xs text-gray-500 mt-0.5">Phân loại: {it.variant}</div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center border rounded-full bg-white shadow-sm">
                    <button
                      className="px-2 py-1 rounded-l-full hover:bg-blue-50 text-blue-600 text-lg transition"
                      onClick={() => updateQty(it.id, -1, it.variant ?? null)}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <div className="w-8 text-gray-600 text-center text-sm">{it.qty}</div>
                    <button
                      className="px-2 py-1 rounded-r-full hover:bg-blue-50 text-blue-600 text-lg transition"
                      onClick={() => updateQty(it.id, +1, it.variant ?? null)}
                      aria-label="Tăng số lượng"
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
                aria-label="Xoá sản phẩm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-5 space-y-4 bg-white rounded-b-2xl">
          <div className="flex items-center justify-between text-base font-medium">
            <span className="text-gray-700">Tạm tính</span>
            <span className="font-bold text-blue-700">{formatPriceVND(subtotal)}</span>
          </div>

          {/* Primary actions */}
          <div className="flex flex-col gap-3">
            <button
              className="w-full h-12 rounded-xl bg-blue-700 text-white font-semibold text-lg shadow hover:bg-blue-800 transition disabled:opacity-50"
              onClick={gotoCheckout}
              disabled={items.length === 0}
            >
              Thanh toán
            </button>

            {/* Nút xanh lá có icon: Xem giỏ hàng */}
            <button
              onClick={gotoCart}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-semibold shadow hover:bg-green-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5l1.5 9h12l1.5-6H6.75M9 21a.75.75 0 100-1.5.75.75 0 000 1.5zm9 0a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              Xem giỏ hàng
            </button>
          </div>

          {/* Secondary row */}
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="text-sm text-blue-600 underline hover:text-blue-800 transition"
            >
              Tiếp tục mua sắm
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
