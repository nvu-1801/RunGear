"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/modules/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function PaymentsPage() {
  const { items, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<"standard" | "fast">("standard");

  const shippingFee = shipping === "fast" ? 35000 : (subtotal > 300000 ? 0 : 20000);
  const discount = useMemo(() => {
    // ví dụ: mã "MCHEF10" -10%
    if (coupon.trim().toUpperCase() === "MCHEF10") return Math.round(subtotal * 0.1);
    return 0;
  }, [coupon, subtotal]);

  const total = Math.max(0, subtotal + shippingFee - discount);
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-600">Thanh toán</h1>
          <Link href="/cart" className="text-sm text-gray-600 hover:text-black underline-offset-4 hover:underline">
            ← Quay lại giỏ hàng
          </Link>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-lg font-medium">Giỏ hàng trống</p>
            <p className="text-gray-600 mt-2">Hãy thêm sản phẩm để tiếp tục thanh toán.</p>
            <Link
              href="/products/home"
              className="inline-flex mt-6 rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* LEFT: Form thông tin */}
            <div className="md:col-span-2 space-y-6">
              {/* Thông tin nhận hàng */}
              <section className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-600">Thông tin nhận hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Email (tuỳ chọn)</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tỉnh/Thành</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quận/Huyện</label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>
              </section>

              {/* Vận chuyển & Thanh toán */}
              <section className="rounded-2xl border bg-white p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-600">Vận chuyển & thanh toán</h2>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Phương thức vận chuyển</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setShipping("standard")}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        shipping === "standard" ? "ring-2 ring-black/5 bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">Tiêu chuẩn</div>
                      <div className="text-sm text-gray-600">
                        {shippingFee === 0 && shipping === "standard"
                          ? "Miễn phí (đơn > 300.000đ)"
                          : formatPriceVND(20000)}
                        {" • "}2–4 ngày
                      </div>
                    </button>
                    <button
                      onClick={() => setShipping("fast")}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        shipping === "fast" ? "ring-2 ring-black/5 bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">Nhanh</div>
                      <div className="text-sm text-gray-600">{formatPriceVND(35000)} • 24–48h</div>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Phương thức thanh toán</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="rounded-xl border px-3 py-3 flex items-center gap-2 text-gray-700 cursor-pointer hover:bg-gray-50">
                      <input name="pm" type="radio" defaultChecked className="accent-black text-gray-700" /> COD
                    </label>
                    <label className="rounded-xl border px-3 py-3 flex items-center gap-2 text-gray-700 cursor-pointer hover:bg-gray-50">
                      <input name="pm" type="radio" className="accent-black" /> Momo/VietQR
                    </label>
                    <label className="rounded-xl border px-3 py-3 flex items-center text-gray-700 gap-2 cursor-pointer hover:bg-gray-50">
                      <input name="pm" type="radio" className="accent-black" /> Thẻ nội địa
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: Tóm tắt đơn hàng */}
            <aside className="md:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border bg-white p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-600">Đơn hàng của bạn</h3>

                  <ul className="divide-y">
                    {items.map((i) => (
                      <li key={i.id + (i.variant ?? "")} className="py-3 flex items-start justify-between gap-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">
                            {i.name}
                            {i.variant ? ` · ${i.variant}` : ""}
                          </div>
                          <div className="text-gray-600">× {i.qty}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {formatPriceVND(i.qty * i.price)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Mã giảm giá"
                      className="flex-1 text-gray-700 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <button
                      onClick={() => setCoupon(coupon.trim())}
                      className="rounded-xl text-gray-700 border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                      Áp dụng
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tạm tính</span>
                      <span className="font-medium">{formatPriceVND(subtotal)}</span>
                    </div>
                    <div className="flex text-gray-700 justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium">{formatPriceVND(shippingFee)}</span>
                    </div>
                    <div className="flex text-gray-700 justify-between">
                      <span>Giảm giá</span>
                      <span className="font-medium text-gray-700 text-emerald-600">- {formatPriceVND(discount)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-gray-700">Tổng</span>
                      <span className="font-semibold text-gray-700">{formatPriceVND(total)}</span>
                    </div>
                  </div>

                  <button
                    disabled={isEmpty}
                    className="mt-6 w-full rounded-xl bg-black text-white py-3.5 text-sm font-medium disabled:opacity-50"
                    onClick={() => {
                      // TODO: gọi API /payments/checkout
                      alert("Thanh toán demo: " + formatPriceVND(total) + (note ? `\nGhi chú: ${note}` : ""));
                    }}
                  >
                    Đặt hàng
                  </button>

                  <p className="mt-3 text-xs text-gray-500">
                    Bằng cách đặt hàng, bạn đồng ý với Điều khoản & Chính sách.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
