"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceVND } from "@/shared/price";

type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

export default function ReturnPage() {
  const sp = useSearchParams();
  const orderCode = sp?.get("orderCode") ?? "N/A";
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "UNKNOWN">("UNKNOWN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderCode || orderCode === "N/A") {
      setLoading(false);
      return;
    }

    let tries = 0;
    let stopped = false;

    const fetchOnce = async () => {
      try {
        const res = await fetch(`/api/orders/order_code/${orderCode}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (json?.success && json?.data) {
          const o = json.data as {
            status?: OrderStatus;
            amount?: number;
            total?: number;
          };

          // Update amount
          if (typeof o.amount === "number") setAmount(o.amount);
          else if (typeof o.total === "number") setAmount(o.total);

          // Update status
          if (o?.status) {
            setStatus(o.status);
            // Stop polling when final status reached
            if (["PAID", "FAILED", "CANCELLED"].includes(o.status)) {
              stopped = true;
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("Fetch order error:", err);
      }
    };

    // Polling logic: retry up to 15 times with 1.5s interval (~22.5s total)
    (async function poll() {
      while (!stopped && tries < 15) {
        await fetchOnce();
        tries++;
        if (stopped) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
      setLoading(false);
    })();

    return () => {
      stopped = true;
    };
  }, [orderCode]);

  // Status config for UI
  const getStatusConfig = (s: OrderStatus | "UNKNOWN") => {
    switch (s) {
      case "PAID":
        return {
          icon: "✅",
          title: "Thanh toán thành công",
          description: "Đơn hàng của bạn đã được xác nhận thanh toán",
          color: "text-green-700",
          bg: "bg-green-50",
          gradient: "from-green-400 to-emerald-400",
        };
      case "PENDING":
      case "PROCESSING":
        return {
          icon: "⏳",
          title: "Đang xử lý thanh toán",
          description: "Vui lòng đợi trong giây lát...",
          color: "text-yellow-700",
          bg: "bg-yellow-50",
          gradient: "from-yellow-400 to-orange-400",
        };
      case "FAILED":
      case "CANCELLED":
        return {
          icon: "❌",
          title: "Thanh toán thất bại",
          description: "Giao dịch đã bị hủy hoặc thất bại",
          color: "text-red-700",
          bg: "bg-red-50",
          gradient: "from-red-400 to-rose-400",
        };
      default:
        return {
          icon: "🔍",
          title: "Đang kiểm tra",
          description: "Đang xác minh trạng thái thanh toán...",
          color: "text-gray-700",
          bg: "bg-gray-50",
          gradient: "from-gray-400 to-slate-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full ${config.bg} border-2 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700`}
      >
        {/* Icon */}
        <div
          className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-5xl mb-6 shadow-lg animate-in zoom-in-95 duration-700 delay-150`}
        >
          {loading ? (
            <svg
              className="animate-spin h-12 w-12 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            config.icon
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-3xl md:text-4xl font-bold ${config.color} text-center mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200`}
        >
          {config.title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {config.description}
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

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <span className="text-sm font-medium text-gray-700">
              Số tiền thanh toán:
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPriceVND(amount)}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Trạng thái:
            </span>
            <span className={`font-semibold ${config.color}`}>
              {status === "UNKNOWN" && loading
                ? "Đang kiểm tra..."
                : config.title}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href="/orders"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Xem đơn hàng
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

        {/* Auto refresh note */}
        {loading && (
          <p className="text-xs text-gray-500 text-center mt-6 animate-pulse">
            Đang tự động kiểm tra trạng thái thanh toán...
          </p>
        )}
      </div>
    </div>
  );
}
