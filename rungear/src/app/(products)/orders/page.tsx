"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { formatPriceVND } from "@/shared/price";
import Link from "next/link";

type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

type Order = {
  id: string;
  order_code: number; // bigint from DB, treated as number in JS
  total: number;
  status: OrderStatus;
  created_at: string;
  amount: number;
  payment_link_id: string | null;
  paid_at: string | null;
  shipping_address: unknown;
};

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string; gradient: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    gradient: "from-yellow-400 to-orange-400",
    icon: "⏳",
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    gradient: "from-blue-400 to-cyan-400",
    icon: "🔄",
  },
  PAID: {
    label: "Đã thanh toán",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    gradient: "from-green-400 to-emerald-400",
    icon: "✅",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    gradient: "from-gray-400 to-slate-400",
    icon: "❌",
  },
  FAILED: {
    label: "Thất bại",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    gradient: "from-red-400 to-rose-400",
    icon: "⚠️",
  },
};

// Helper to normalize order_code for queries (handle bigint safely)
function asOrderCodeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    const n = Number(v.trim());
    // Check safe integer range (JS number can safely represent up to 2^53-1)
    if (n > Number.MAX_SAFE_INTEGER || n < Number.MIN_SAFE_INTEGER) {
      console.warn("order_code exceeds safe integer range:", n);
      return null;
    }
    return n;
  }
  return null;
}

export default function OrdersPage() {
  const sb = supabaseBrowser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await sb.auth.getSession();
        const uid = data?.session?.user?.id ?? null;
        setUserId(uid);

        if (!uid) {
          setLoading(false);
          return;
        }

        const { data: ordersData, error: ordersError } = await sb
          .from("orders")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;
        setOrders((ordersData as Order[]) ?? []);
      } catch (e) {
        console.error("Load orders error:", e);
        setError(e instanceof Error ? e.message : "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
  }, [sb]);

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-700">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600 font-medium animate-pulse">
            Đang tải đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 animate-in zoom-in-95 duration-700 delay-150">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Bạn cần đăng nhập
          </h2>
          <p className="text-sm text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Để xem trạng thái đơn hàng, vui lòng đăng nhập vào tài khoản của
            bạn.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms]"
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Có lỗi xảy ra
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header with animation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📦 Đơn hàng của bạn
            </h1>
            <p className="text-gray-600">
              Quản lý và theo dõi trạng thái đơn hàng
            </p>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 border border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Empty state with animation */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm p-12 text-center shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 animate-in zoom-in-95 duration-700 delay-150">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Chưa có đơn hàng
            </h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Khám phá các sản phẩm tuyệt vời và tạo đơn hàng đầu tiên của bạn
              ngay hôm nay!
            </p>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms]"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {orders.map((order, index) => {
              const config = STATUS_CONFIG[order.status];
              const delay = `${index * 100}ms`;

              return (
                <li
                  key={order.id}
                  className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: delay }}
                >
                  <div
                    className={`group rounded-3xl border-2 p-6 md:p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm ${config.bg}`}
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                            Đơn hàng #{order.order_code}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {new Date(order.created_at).toLocaleString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${config.color} ${config.bg} border-2 shadow-md transition-all duration-300 group-hover:scale-105`}
                      >
                        <span>{config.icon}</span>
                        {config.label}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                          <span className="text-sm text-gray-700 font-medium">
                            Tổng tiền:
                          </span>
                          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPriceVND(order.total)}
                          </span>
                        </div>

                        {order.paid_at && (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                            <span className="text-sm text-gray-700 font-medium">
                              Thanh toán lúc:
                            </span>
                            <span className="text-sm text-green-700 font-semibold">
                              {new Date(order.paid_at).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {order.payment_link_id && (
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                          <span className="text-sm text-gray-600 block mb-2">
                            Mã giao dịch:
                          </span>
                          <code className="text-xs text-gray-800 font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 block break-all">
                            {order.payment_link_id}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t-2 border-gray-100">
                      {order.status === "PENDING" && (
                        <Link
                          href={`/checkout?order=${order.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Thanh toán ngay
                        </Link>
                      )}
                      {order.status === "PAID" && (
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Xem chi tiết
                        </Link>
                      )}
                      {(order.status === "CANCELLED" ||
                        order.status === "FAILED") && (
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                          <svg
                            className="w-4 h-4"
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
                          Đặt lại
                        </button>
                      )}
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 border-2 border-gray-200 transition-all duration-300 hover:border-gray-300 hover:scale-105 active:scale-95"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        Liên hệ hỗ trợ
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
