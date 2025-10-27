"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPriceVND } from "@/shared/price";

type OrderData = {
  order_code: string;
  amount?: number;
  total?: number;
};

type ApiResponse = {
  data?: unknown;
};

export default function PaymentCancelPage() {
  const sp = useSearchParams();
  const orderCode = sp.get("orderCode") ?? sp.get("order_id") ?? "N/A";
  const reason =
    sp.get("reason") ??
    sp.get("message") ??
    "Giao dịch đã bị huỷ hoặc thất bại.";
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // Gọi API lấy chi tiết đơn hàng theo orderCode
    if (!orderCode || orderCode === "N/A") return;
    (async () => {
      try {
        const res = await fetch(`/api/orders?order_code=${orderCode}`);
        const data: ApiResponse = await res.json();

        // Type guard để kiểm tra data.data là array
        if (!Array.isArray(data.data)) {
          setAmount(0);
          return;
        }

        // Tìm đơn hàng đúng mã
        const order = data.data.find((item: unknown): item is OrderData => {
          if (!item || typeof item !== "object") return false;
          const o = item as Record<string, unknown>;
          return (
            typeof o.order_code === "string" &&
            String(o.order_code) === String(orderCode)
          );
        });

        if (!order) {
          setAmount(0);
          return;
        }

        // Lấy amount hoặc total
        if (typeof order.amount === "number") {
          setAmount(order.amount);
        } else if (typeof order.total === "number") {
          setAmount(order.total);
        } else {
          setAmount(0);
        }
      } catch (error: unknown) {
        console.error("Failed to fetch order:", error);
        setAmount(0);
      }
    })();
  }, [orderCode]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Thanh toán không thành công
          </h1>
          <Link
            href="/"
            className="text-sm text-rose-700 hover:text-rose-900 underline-offset-4 hover:underline font-medium"
          >
            Về trang chủ
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-8">
          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 ring-1 ring-rose-200">
              {/* XCircle Icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-rose-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Rất tiếc!
              </h2>
              <p className="text-gray-600">{reason}</p>
            </div>
          </div>

          {/* Order Info */}
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
              <div className="mt-1 font-semibold text-rose-700">
                Đã huỷ / Thất bại
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Số tiền
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

          {/* Suggestions */}
          <ul className="mt-6 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Kiểm tra lại kết nối internet hoặc số dư/ hạn mức thẻ.</li>
            <li>
              Nếu bạn dùng VietQR/ ví điện tử, hãy thử lại trong 5–10 phút.
            </li>
            <li>Liên hệ ngân hàng/ ví để biết lý do giao dịch bị từ chối.</li>
          </ul>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/payments"
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-5 py-3 font-semibold shadow hover:bg-rose-700 transition"
            >
              Thử thanh toán lại
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center justify-center rounded-xl border border-rose-600 text-rose-700 px-5 py-3 font-semibold hover:bg-rose-50 transition"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50 transition"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>

          {/* Note */}
          <p className="mt-6 text-xs text-gray-500">
            Nếu số tiền đã bị trừ nhưng trạng thái vẫn thất bại, vui lòng liên
            hệ hỗ trợ để được kiểm tra và hoàn tiền (nếu có).
          </p>
        </div>
      </div>
    </main>
  );
}
