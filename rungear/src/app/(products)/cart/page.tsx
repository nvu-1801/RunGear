"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-store";
import { formatPriceVND } from "@/shared/price";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

type Order = {
  id: string;
  order_code: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  amount: number;
  payment_link_id: string | null;
  paid_at: string | null;
  shipping_address: any;
};

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: "⏳",
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: "🔄",
  },
  PAID: {
    label: "Đã thanh toán",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: "✅",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: "❌",
  },
  FAILED: {
    label: "Thất bại",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: "⚠️",
  },
};

export default function CartPage() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const { items, updateQty, remove, clear, subtotal } = useCart();

  const [tab, setTab] = useState<"cart" | "orders">("cart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const gotoCheckout = () => {
    router.push("/payments");
  };

  const isEmpty = items.length === 0;

  // Load user session + orders khi chuyển tab orders
  useEffect(() => {
    if (tab !== "orders") return;
    let mounted = true;

    (async () => {
      setLoadingOrders(true);
      try {
        const { data } = await sb.auth.getSession();
        const uid = data?.session?.user?.id ?? null;
        if (!mounted) return;
        setUserId(uid);

        if (!uid) {
          setLoadingOrders(false);
          return;
        }

        const { data: ordersData, error } = await sb
          .from("orders")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false });

        if (!mounted) return;
        if (error) throw error;
        setOrders((ordersData as Order[]) ?? []);
      } catch (e) {
        console.error("Load orders error:", e);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tab, sb]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-blue-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {tab === "cart" ? "Giỏ hàng" : "📦 Đơn hàng của bạn"}
          </h1>
          <Link
            href="/products/home"
            className="text-sm text-blue-700 hover:text-blue-900 underline-offset-4 hover:underline font-medium"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex items-center gap-2 border-b">
          <button
            onClick={() => setTab("cart")}
            className={`px-4 py-2.5 font-semibold text-sm transition border-b-2 ${
              tab === "cart"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            🛒 Giỏ hàng
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2.5 font-semibold text-sm transition border-b-2 ${
              tab === "orders"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📦 Đơn hàng
          </button>
        </div>

        {/* Content */}
        {tab === "cart" ? (
          // ========== TAB GIỎ HÀNG ==========
          isEmpty ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 ring-1 ring-blue-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="20" r="1"></circle>
                  <circle cx="17" cy="20" r="1"></circle>
                  <path
                    d="M3 3h2l.4 2M7 13h10l3-8H5.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700">
                Giỏ hàng trống
              </p>
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
                    <div className="font-semibold text-gray-800">
                      Sản phẩm đã chọn
                    </div>
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
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center border rounded-full bg-white shadow-sm">
                              <button
                                className="px-2 py-1 rounded-l-full hover:bg-blue-50 text-blue-600 text-lg transition"
                                onClick={() =>
                                  updateQty(it.id, -1, it.variant ?? null)
                                }
                                aria-label="Giảm số lượng"
                              >
                                −
                              </button>
                              <div className="w-9 text-gray-700 text-center text-sm">
                                {it.qty}
                              </div>
                              <button
                                className="px-2 py-1 rounded-r-full hover:bg-blue-50 text-blue-600 text-lg transition"
                                onClick={() =>
                                  updateQty(it.id, +1, it.variant ?? null)
                                }
                                aria-label="Tăng số lượng"
                              >
                                +
                              </button>
                            </div>

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
                        <span className="font-semibold">
                          {formatPriceVND(subtotal)}
                        </span>
                      </div>
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
                      Bạn có thể nhập mã giảm giá và chọn phương thức thanh toán
                      ở bước tiếp theo.
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 text-indigo-700"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M7 7h.01M3 11l10 10 8-8-10-10H3v8z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">
                          Mẹo: đơn trên 300.000đ
                        </div>
                        <div className="text-gray-600">
                          Có thể được miễn phí vận chuyển (xem tại trang thanh
                          toán).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )
        ) : (
          // ========== TAB ĐƠN HÀNG ==========
          <>
            {loadingOrders ? (
              <div className="text-center py-12 text-gray-500">
                Đang tải đơn hàng...
              </div>
            ) : !userId ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-lg max-w-md mx-auto">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-700"
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
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Bạn cần đăng nhập
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Để xem trạng thái đơn hàng, vui lòng đăng nhập.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-lg max-w-md mx-auto">
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  Chưa có đơn hàng
                </p>
                <p className="text-gray-500 mt-2">
                  Hãy mua sắm để tạo đơn hàng đầu tiên!
                </p>
                <Link
                  href="/products/home"
                  className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <ul className="space-y-4 max-w-4xl mx-auto">
                {orders.map((order) => {
                  const config = STATUS_CONFIG[order.status];
                  return (
                    <li
                      key={order.id}
                      className={`rounded-2xl border p-6 shadow-lg transition hover:shadow-xl ${config.bg}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{config.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Đơn hàng #{order.order_code}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleString("vi-VN")}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${config.color} ${config.bg} border`}
                        >
                          {config.label}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-bold text-blue-700">
                            {formatPriceVND(order.total)}
                          </span>
                        </div>
                        {order.paid_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Đã thanh toán lúc:
                            </span>
                            <span className="text-gray-700">
                              {new Date(order.paid_at).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        )}
                        {order.payment_link_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Mã thanh toán:
                            </span>
                            <span className="text-gray-700 font-mono text-xs">
                              {order.payment_link_id}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        {order.status === "PENDING" && (
                          <button className="text-sm text-blue-700 font-semibold hover:underline">
                            Thanh toán ngay
                          </button>
                        )}
                        {order.status === "PAID" && (
                          <button className="text-sm text-green-700 font-semibold hover:underline">
                            Xem chi tiết
                          </button>
                        )}
                        {(order.status === "CANCELLED" ||
                          order.status === "FAILED") && (
                          <button className="text-sm text-gray-600 font-semibold hover:underline">
                            Đặt lại
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
