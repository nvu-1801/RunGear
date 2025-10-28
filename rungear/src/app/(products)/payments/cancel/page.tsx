"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceVND } from "@/shared/price";

type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

export default function CancelPage() {
  const sp = useSearchParams();
  const orderCode = sp?.get("orderCode") ?? "N/A";
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "UNKNOWN">("UNKNOWN");

  useEffect(() => {
    if (!orderCode || orderCode === "N/A") return;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderCode}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (json?.success && json?.data) {
          const o = json.data as {
            status?: OrderStatus;
            amount?: number;
            total?: number;
          };

          if (typeof o.amount === "number") setAmount(o.amount);
          else if (typeof o.total === "number") setAmount(o.total);

          if (o?.status) setStatus(o.status);
        }
      } catch (err) {
        console.error("Fetch order error:", err);
      }
    })();
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full bg-red-50 border-2 border-red-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center text-5xl mb-6 shadow-lg animate-in zoom-in-95 duration-700 delay-150">
          ❌
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-red-700 text-center mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Thanh toán đã bị hủy
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Giao dịch của bạn đã bị hủy. Bạn có thể thử lại hoặc quay về trang
          chủ.
        </p>

        {/* Order Details */}
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms]">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Mã đơn hàng:
            </span>
            <span className="text-lg font-bold text-gray-900">
              #{orderCode}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
            <span className="text-sm font-medium text-gray-700">Số tiền:</span>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {formatPriceVND(amount)}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Trạng thái:
            </span>
            <span className="font-semibold text-red-700">
              {status === "CANCELLED" || status === "FAILED"
                ? "Đã hủy"
                : "Chưa thanh toán"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href={`/checkout?order=${orderCode}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Thử lại thanh toán
          </Link>

          <Link
            href="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 border-2 border-gray-200 transition-all duration-300 hover:border-gray-300 hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về trang chủ
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Cần hỗ trợ?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Liên hệ với chúng tôi
          </Link>
        </p>
      </div>
    </div>
  );
}
