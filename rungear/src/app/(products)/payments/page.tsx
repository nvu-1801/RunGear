"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function PaymentsPage() {
  const { items, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<"standard" | "fast">("standard");

  const shippingFee =
    shipping === "fast" ? 35000 : subtotal > 300000 ? 0 : 20000;
  const discount = useMemo(() => {
    // ví dụ: mã "MCHEF10" -10%
    if (coupon.trim().toUpperCase() === "MCHEF10")
      return Math.round(subtotal * 0.1);
    return 0;
  }, [coupon, subtotal]);

  const total = Math.max(0, subtotal + shippingFee - discount);
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Thanh toán
          </h1>
          <Link
            href="/cart"
            className="text-sm text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline font-medium"
          >
            ← Quay lại giỏ hàng
          </Link>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-700">
              Giỏ hàng trống
            </p>
            <p className="text-gray-500 mt-2">
              Hãy thêm sản phẩm để tiếp tục thanh toán.
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
            {/* LEFT: Form thông tin */}
            <div className="md:col-span-2 space-y-8">
              {/* Thông tin nhận hàng */}
              <section className="rounded-2xl border bg-white p-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-5 text-gray-700">
                  Thông tin nhận hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Họ và tên
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Số điện thoại
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Email (tuỳ chọn)
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Địa chỉ
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Tỉnh/Thành
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Quận/Huyện
                    </label>
                    <input className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Ghi chú
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>
              </section>

              {/* Vận chuyển & Thanh toán */}
              <section className="rounded-2xl border bg-white p-8 shadow-lg space-y-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Vận chuyển & thanh toán
                </h2>

                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Phương thức vận chuyển
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setShipping("standard")}
                      className={`rounded-xl border px-4 py-4 text-left transition font-medium ${
                        shipping === "standard"
                          ? "ring-2 ring-blue-400 bg-blue-50 border-blue-400 text-blue-700"
                          : "hover:bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      <div>Tiêu chuẩn</div>
                      <div className="text-sm text-gray-500">
                        {shippingFee === 0 && shipping === "standard"
                          ? "Miễn phí (đơn > 300.000đ)"
                          : formatPriceVND(20000)}
                        {" • "}2–4 ngày
                      </div>
                    </button>
                    <button
                      onClick={() => setShipping("fast")}
                      className={`rounded-xl border px-4 py-4 text-left transition font-medium ${
                        shipping === "fast"
                          ? "ring-2 ring-blue-400 bg-blue-50 border-blue-400 text-blue-700"
                          : "hover:bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      <div>Nhanh</div>
                      <div className="text-sm text-gray-500">
                        {formatPriceVND(35000)} • 24–48h
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Phương thức thanh toán
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
                      <input
                        name="pm"
                        type="radio"
                        defaultChecked
                        className="accent-blue-600"
                      />{" "}
                      COD
                    </label>
                    <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
                      <input
                        name="pm"
                        type="radio"
                        className="accent-blue-600"
                      />{" "}
                      Momo/VietQR
                    </label>
                    <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
                      <input
                        name="pm"
                        type="radio"
                        className="accent-blue-600"
                      />{" "}
                      Thẻ nội địa
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: Tóm tắt đơn hàng */}
            <aside className="md:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border bg-white p-8 shadow-lg">
                  <h3 className="text-xl font-semibold mb-5 text-gray-700">
                    Đơn hàng của bạn
                  </h3>
                  <ul className="divide-y">
                    {items.map((i) => (
                      <li
                        key={i.id + (i.variant ?? "")}
                        className="py-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={i.image ?? "/placeholder.png"}
                            alt={i.name}
                            className="w-12 h-12 object-cover rounded-xl border"
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 line-clamp-1">
                              {i.name}
                              {i.variant ? ` · ${i.variant}` : ""}
                            </div>
                            <div className="text-gray-500">× {i.qty}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-blue-700 whitespace-nowrap">
                          {formatPriceVND(i.qty * i.price)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Mã giảm giá"
                      className="flex-1 text-gray-700 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                    <button
                      onClick={() => setCoupon(coupon.trim())}
                      className="rounded-xl text-blue-700 border border-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
                    >
                      Áp dụng
                    </button>
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tạm tính</span>
                      <span className="font-medium">
                        {formatPriceVND(subtotal)}
                      </span>
                    </div>
                    <div className="flex text-gray-700 justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium">
                        {formatPriceVND(shippingFee)}
                      </span>
                    </div>
                    <div className="flex text-gray-700 justify-between">
                      <span>Giảm giá</span>
                      <span className="font-medium text-emerald-600">
                        - {formatPriceVND(discount)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-gray-700">Tổng</span>
                      <span className="font-semibold text-blue-700">
                        {formatPriceVND(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isEmpty}
                    className="mt-7 w-full rounded-xl bg-blue-700 text-white py-4 text-base font-semibold shadow-lg hover:bg-blue-800 transition disabled:opacity-50"
                    onClick={async () => {
                      const orderCode = Date.now(); // mã đơn tạm
                      const res = await fetch("/api/payments/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderCode,
                          amount: total,
                          description: "Thanh toán đơn hàng #" + orderCode,
                        }),
                      });
                      const data = await res.json();

                      if (data?.data?.checkoutUrl) {
                        window.location.href = data.data.checkoutUrl; // redirect sang trang thanh toán PayOS
                      } else {
                        alert("Tạo thanh toán thất bại!");
                      }
                    }}
                  >
                    Đặt hàng
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Bằng cách đặt hàng, bạn đồng ý với{" "}
                    <span className="underline">Điều khoản & Chính sách</span>.
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
