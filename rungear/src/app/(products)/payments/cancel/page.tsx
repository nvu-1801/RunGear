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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderCode || orderCode === "N/A") {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // 🔁 Dùng by-code, không dùng /api/orders/[id] nữa
        const res = await fetch(
          `/api/orders/by-code?code=${encodeURIComponent(orderCode)}`,
          {
            cache: "no-store",
          }
        );
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
      } finally {
        setLoading(false);
      }
    })();
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-red-100/50 relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
        {/* Icon with modern design */}
        <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-red-500/30 animate-in zoom-in-95 duration-700 delay-150 relative group hover:scale-110 transition-transform duration-300">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-400 animate-ping opacity-20"></div>
          <svg
            className="w-14 h-14 text-white relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 bg-clip-text text-transparent text-center mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Thanh toán đã bị hủy
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-10 text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 max-w-md mx-auto leading-relaxed">
          Giao dịch của bạn đã bị hủy. Bạn có thể thử lại thanh toán hoặc quay
          về trang chủ để tiếp tục mua sắm.
        </p>

        {/* Order Details Card */}
        <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms]">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Mã đơn hàng
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 font-mono bg-white px-4 py-2 rounded-lg shadow-sm">
                #{orderCode}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 rounded-2xl p-5 border-2 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Số tiền
                </span>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {loading ? (
                  <span className="inline-block w-24 h-6 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  formatPriceVND(amount)
                )}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Trạng thái
                </span>
              </div>
              <span className="font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {status === "CANCELLED" || status === "FAILED"
                  ? "Đã hủy"
                  : status === "UNKNOWN"
                  ? "Đang tải..."
                  : "Chưa thanh toán"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link
            href="/home"
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-gray-700 font-bold text-lg hover:bg-gray-50 border-2 border-gray-300 transition-all duration-300 hover:border-gray-400 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về trang chủ
          </Link>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-500 text-center mt-8 pt-6 border-t border-gray-200">
          Cần hỗ trợ?{" "}
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
          >
            Liên hệ với chúng tôi
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
