"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, remove, clear, subtotal } = useCart();

  const gotoCheckout = () => {
    router.push("/payments");
  };

  const isEmpty = items.length === 0;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-blue-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Giỏ hàng
          </h1>
          <Link
            href="/products/home"
            className="text-sm text-blue-700 hover:text-blue-900 underline-offset-4 hover:underline font-medium"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 ring-1 ring-blue-200">
              {/* Cart icon */}
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1"></circle>
                <circle cx="17" cy="20" r="1"></circle>
                <path d="M3 3h2l.4 2M7 13h10l3-8H5.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">Giỏ hàng trống</p>
            <p className="text-gray-500 mt-1">
              Hãy thêm sản phẩm để bắt đầu thanh toán nhé.
            </p>
            <Link
              href="/products/home"
              className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* LEFT: Danh sách item */}
            <section className="md:col-span-2">
              <div className="rounded-2xl border bg-white shadow-lg">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <div className="font-semibold text-gray-800">Sản phẩm đã chọn</div>
                  <button
                    onClick={clear}
                    className="text-sm text-gray-500 hover:text-red-600 transition"
                    title="Xoá tất cả"
                  >
                    Xoá tất cả
                  </button>
                </div>

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          {/* Qty control */}
                          <div className="inline-flex items-center border rounded-full bg-white shadow-sm">
                            <button
                              className="px-2 py-1 rounded-l-full hover:bg-blue-50 text-blue-600 text-lg transition"
                              onClick={() => updateQty(it.id, -1, it.variant ?? null)}
                              aria-label="Giảm số lượng"
                            >
                              −
                            </button>
                            <div className="w-9 text-gray-700 text-center text-sm">{it.qty}</div>
                            <button
                              className="px-2 py-1 rounded-r-full hover:bg-blue-50 text-blue-600 text-lg transition"
                              onClick={() => updateQty(it.id, +1, it.variant ?? null)}
                              aria-label="Tăng số lượng"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-sm sm:text-base font-bold text-blue-700 whitespace-nowrap">
                            {formatPriceVND(it.price * it.qty)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* RIGHT: Tóm tắt */}
            <aside className="md:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border bg-white p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Tóm tắt đơn hàng
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tạm tính</span>
                      <span className="font-semibold">{formatPriceVND(subtotal)}</span>
                    </div>
                    {/* Bạn có thể hiển thị phí ship/dự kiến ở đây nếu muốn */}
                  </div>

                  <button
                    className="mt-6 w-full h-12 rounded-xl bg-blue-700 text-white font-semibold text-base shadow hover:bg-blue-800 transition disabled:opacity-50"
                    onClick={gotoCheckout}
                    disabled={isEmpty}
                  >
                    Thanh toán
                  </button>

                  <div className="mt-3 text-center">
                    <Link
                      href="/payments"
                      className="text-sm text-blue-600 underline hover:text-blue-800 transition"
                    >
                      Đi tới trang thanh toán
                    </Link>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Bạn có thể nhập mã giảm giá và chọn phương thức thanh toán ở bước tiếp theo.
                  </p>
                </div>

                <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
                      {/* Tag icon */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 7h.01M3 11l10 10 8-8-10-10H3v8z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">Mẹo: đơn trên 300.000đ</div>
                      <div className="text-gray-600">Có thể được miễn phí vận chuyển (xem tại trang thanh toán).</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
