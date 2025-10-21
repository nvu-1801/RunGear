"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPriceVND } from "@/shared/price";
import { useCart } from "@/components/cart/cart-store";

export default function PaymentReturnPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear(); // Xoá giỏ hàng khi vào trang này
  }, [clear]);

  const sp = useSearchParams();
  const orderCode = sp.get("orderCode") ?? sp.get("order_id") ?? "N/A";
  // State để lưu amount từ API
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // Gọi API lấy chi tiết đơn hàng theo orderCode
    if (!orderCode || orderCode === "N/A") return;
    (async () => {
      try {
        const res = await fetch(`/api/orders?order_code=${orderCode}`);
        const data = await res.json();
        // Tìm đơn hàng đúng mã
        let order = null;
        if (Array.isArray(data.data)) {
          order = data.data.find(
            (o: any) => String(o.order_code) === String(orderCode)
          );
        }
        if (order && typeof order.amount === "number") {
          setAmount(order.amount);
        } else if (order && typeof order.total === "number") {
          setAmount(order.total);
        }
      } catch {
        // fallback: không lấy được thì giữ 0
        setAmount(0);
      }
    })();
  }, [orderCode]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Thanh toán thành công
          </h1>
          <Link
            href="/"
            className="text-sm text-emerald-700 hover:text-emerald-900 underline-offset-4 hover:underline font-medium"
          >
            Về trang chủ
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-8">
          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 ring-1 ring-emerald-200">
              {/* CheckCircle Icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 12l2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Cảm ơn bạn!
              </h2>
              <p className="text-gray-600">
                Đơn hàng đã được xác nhận. Chúng tôi sẽ xử lý và giao sớm nhất
                có thể.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Mã đơn
              </div>
              <div className="mt-1 font-semibold text-gray-900">
                {orderCode}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Trạng thái
              </div>
              <div className="mt-1 font-semibold text-emerald-700">
                Thanh toán thành công
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Tổng thanh toán
              </div>
              <div className="mt-1 font-semibold text-gray-900">
                {formatPriceVND
                  ? formatPriceVND(amount)
                  : new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(amount)}
              </div>
            </div>
          </div>

          {/* Next Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/cart?tab=orders"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white px-5 py-3 font-semibold shadow hover:bg-emerald-700 transition"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/products/home"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-600 text-emerald-700 px-5 py-3 font-semibold hover:bg-emerald-50 transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Note */}
          <p className="mt-6 text-xs text-gray-500">
            Nếu cần hỗ trợ, vui lòng liên hệ{" "}
            <span className="font-medium">hỗ trợ khách hàng</span> của chúng
            tôi.
          </p>
        </div>
      </div>
    </main>
  );
}
