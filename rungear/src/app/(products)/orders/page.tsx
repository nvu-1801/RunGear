// =============================
// 1) app/(account)/orders/page.client.tsx
// =============================
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPriceVND } from "@/shared/price";

/* ======================== types & helpers ======================== */
type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

type OrderListItem = {
  id: string;
  order_code: string; // keep string to avoid BigInt/number issues
  total: number;
  status: OrderStatus;
  created_at: string;
  amount: number;
  payment_link_id: string | null;
  paid_at: string | null;
};

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string | string[] | null;
  stock: number;
  status: string;
};

type OrderItem = {
  id: string;
  qty: number;
  price_at_time: number;
  product: ProductLite | null;
};

type OrderDetail = {
  id: string;
  order_code: string;
  created_at: string;
  status: OrderStatus | string;
  total: number;
  amount: number;
  discount_amount: number;
  shipping_address: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address_line?: string | null;
    district?: string | null;
    province?: string | null;
    note?: string | null;
  } | null;
  order_items: OrderItem[];
};

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string; gradient: string }
> = {
  PENDING:   { label: "Chờ xử lý",     color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", gradient: "from-yellow-400 to-orange-400", icon: "⏳" },
  PROCESSING:{ label: "Đang xử lý",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     gradient: "from-blue-400 to-cyan-400",   icon: "🔄" },
  PAID:      { label: "Đã thanh toán",  color: "text-green-700", bg: "bg-green-50 border-green-200",   gradient: "from-green-400 to-emerald-400", icon: "✅" },
  CANCELLED: { label: "Đã hủy",        color: "text-gray-600",   bg: "bg-gray-50 border-gray-200",     gradient: "from-gray-400 to-slate-400",  icon: "❌" },
  FAILED:    { label: "Thất bại",      color: "text-red-700",    bg: "bg-red-50 border-red-200",        gradient: "from-red-400 to-rose-400",    icon: "⚠️" },
};

function StatusBadge({ v }: { v: string }) {
  const value = v.toUpperCase() as OrderStatus;
  const cfg = STATUS_CONFIG[value] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg} border`}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  );
}

function firstImage(p: ProductLite | null) {
  if (!p) return null;
  if (Array.isArray(p.images)) return p.images[0] ?? null;
  return p.images ?? null;
}

/* ======================== component ======================== */
export default function OrdersPage() {
  // NOTE: offload data fetching to API routes to reduce client bundle & move logic server-side.
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal detail state
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const dateFmt = useMemo(
    () => ({ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) as const,
    []
  );

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/orders?limit=50`, { signal: ctrl.signal, credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load");
        setOrders((json.data as OrderListItem[]) ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message ?? "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (!openId) return;
    const ctrl = new AbortController();
    setDetail(null);
    setDetailLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/orders?id=${openId}`, { signal: ctrl.signal, credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load detail");
        setDetail(json.data as OrderDetail);
      } catch (e) {
        console.error(e);
      } finally {
        setDetailLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [openId]);

  /* ======================== screens (loading / error) ======================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
          </svg>
          <p className="text-gray-600 font-medium animate-pulse">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Có lỗi xảy ra</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button onClick={() => location.reload()} className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold">Thử lại</button>
        </div>
      </div>
    );
  }

  /* ======================== main ======================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📦 Đơn hàng của bạn
            </h1>
            <p className="text-gray-600">Quản lý và theo dõi trạng thái đơn hàng</p>
          </div>
          <Link href="/home" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 border border-gray-200">
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 p-12 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Chưa có đơn hàng</h3>
            <Link href="/home" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 text-sm font-semibold">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <li key={order.id}>
                  <div className={`group rounded-3xl border-2 p-6 md:p-8 shadow-lg bg-white/80 ${cfg.bg}`}>
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                          {cfg.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Đơn hàng #{order.order_code}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleString("vi-VN", dateFmt)}
                          </div>
                        </div>
                      </div>
                      <StatusBadge v={order.status} />
                    </div>

                    {/* Details summary */}
                    <div className="border-t-2 border-gray-100 pt-6 grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <span className="text-sm text-gray-700 font-medium">Tổng tiền:</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPriceVND(order.total)}
                        </span>
                      </div>
                      {order.paid_at && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                          <span className="text-sm text-gray-700 font-medium">Thanh toán lúc:</span>
                          <span className="text-sm text-green-700 font-semibold">
                            {new Date(order.paid_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t-2 border-gray-100">
                      <button
                        onClick={() => setOpenId(order.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 border-2 border-gray-200"
                      >
                        Xem chi tiết
                      </button>
                      {order.status === "PENDING" && (
                        <Link
                          href={`/checkout?order=${order.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold"
                        >
                          Thanh toán ngay
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal detail */}
      {openId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b bg-gradient-to-r from-slate-50 to-white px-5 py-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Đơn hàng <span className="font-mono text-blue-700">#{detail?.order_code ?? ""}</span>
                  </h3>
                  {detail && <StatusBadge v={detail.status} />}
                </div>
                {detail && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tạo lúc {new Date(detail.created_at).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
              <button onClick={() => { setOpenId(null); setDetail(null); }} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">
                Đóng
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[72vh] overflow-auto px-5 py-4">
              {detailLoading || !detail ? (
                <div className="animate-pulse text-blue-600">Đang tải chi tiết…</div>
              ) : (
                <>
                  {/* Customer & totals */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Khách hàng</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {detail.shipping_address?.full_name ?? "Khách lẻ"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {detail.shipping_address?.phone} • {detail.shipping_address?.email}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {[
                          detail.shipping_address?.address_line,
                          detail.shipping_address?.district,
                          detail.shipping_address?.province,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-slate-500">Giảm giá</p>
                          <p className="font-semibold text-slate-800">
                            {formatPriceVND(detail.discount_amount)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-slate-500">Tổng thanh toán</p>
                          <p className="font-semibold text-blue-800">
                            {formatPriceVND(detail.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="mt-5 overflow-hidden rounded-xl border shadow-sm">
                    <div className="max-h-[40vh] overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                          <tr className="text-left text-slate-600">
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-right">SL</th>
                            <th className="p-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {detail.order_items.map((it) => (
                            <tr key={it.id} className="border-t">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {firstImage(it.product) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={firstImage(it.product) as string}
                                      alt={it.product?.name ?? ""}
                                      className="size-12 rounded-xl object-cover ring-1 ring-slate-2 00"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  ) : (
                                    <div className="size-12 rounded-xl bg-slate-100 ring-1 ring-slate-200" />
                                  )}
                                  <div>
                                    <p className="font-medium text-slate-800">{it.product?.name}</p>
                                    <p className="text-xs text-slate-500">{it.product?.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right">{formatPriceVND(it.price_at_time)}</td>
                              <td className="p-3 text-right">{it.qty}</td>
                              <td className="p-3 text-right">{formatPriceVND(it.qty * it.price_at_time)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-5 flex flex-col items-end gap-1">
                    <div className="text-sm text-slate-600">
                      Tạm tính:{" "}
                      {formatPriceVND(
                        detail.order_items.reduce((s, it) => s + it.qty * it.price_at_time, 0)
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      Giảm giá: {formatPriceVND(detail.discount_amount)}
                    </div>
                    <div className="text-lg font-bold text-blue-800">
                      Tổng: {formatPriceVND(detail.total)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
