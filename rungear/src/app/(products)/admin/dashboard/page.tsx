"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

type Stats = {
  sold_this_month: number;
  total_stock: number;
  skus_in_stock: number;
};

// helper to extract message from unknown errors
function getMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    try {
      return String((err as { message?: unknown }).message ?? String(err));
    } catch {
      return String(err);
    }
  }
  return String(err);
}

/** ---- Orders typing & mapping ---- */
type OrderRow = {
  id: string;
  order_code: string;
  created_at: string;
  total: string | number; // Supabase numeric thường trả về string
  status: string | null;
  shipping_address: null | {
    full_name?: string | null;
    name?: string | null;
    recipient?: string | null;
    phone?: string | null;
  };
};

type OrderVM = {
  id: string;
  order_code: string;
  created_at: string;
  total: string | number;
  status: string; // normalized
  customer_name: string | null;
};

function toVM(r: OrderRow): OrderVM {
  const sa = r.shipping_address || {};
  const name = (sa.full_name ?? sa.name ?? sa.recipient ?? null) ?? null;
  return {
    id: r.id,
    order_code: r.order_code,
    created_at: r.created_at,
    total: r.total,
    status: (r.status ?? "PENDING").toUpperCase(),
    customer_name: name,
  };
}

function isOrder(v: unknown): v is OrderVM {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    "created_at" in v &&
    "total" in v &&
    "order_code" in v
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // lịch sử đơn hàng gần đây
  const [orders, setOrders] = useState<OrderVM[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // lấy stats
  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb.rpc("get_dashboard_stats");
        if (error) throw error;
        setStats(
          data?.[0] ?? { sold_this_month: 0, total_stock: 0, skus_in_stock: 0 }
        );
      } catch (e: unknown) {
        setErr(getMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lấy đơn hàng gần đây
  useEffect(() => {
    (async () => {
      setOrdersLoading(true);
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb
          .from("orders")
          .select(
            "id, order_code, created_at, total, status, shipping_address"
          )
          .order("created_at", { ascending: false })
          .limit(5);
        if (error) throw error;

        const rows = (data ?? []) as OrderRow[];
        setOrders(rows.map(toVM));
      } catch (e: unknown) {
        console.error(getMessage(e));
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 text-gray-800 min-h-dvh bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-800 flex items-center gap-3">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
          />
        </svg>
        Dashboard
      </h1>

      {loading && (
        <div className="animate-pulse text-blue-600">Đang tải thống kê…</div>
      )}
      {/* {err && <p className="text-red-600">{err}</p>} */}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card
            label="Đã bán tháng này"
            value={stats.sold_this_month}
            icon={
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 17l6-6 4 4 8-8"
                />
              </svg>
            }
          />
          <Card
            label="Tồn kho (số lượng)"
            value={stats.total_stock}
            icon={
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2"
                />
              </svg>
            }
          />
          <Card
            label="Sản phẩm đang bán"
            value={stats.skus_in_stock}
            icon={
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h8M12 8v8"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-2xl shadow border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
          Đơn hàng gần đây
        </h2>

        {ordersLoading ? (
          <div className="animate-pulse text-blue-600">Đang tải đơn hàng…</div>
        ) : orders.filter(isOrder).length === 0 ? (
          <div className="text-gray-500">Chưa có đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Mã đơn
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Khách hàng
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Tổng tiền
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(isOrder).map((o) => {
                  const status = o.status?.toUpperCase?.() ?? "PENDING";
                  const isPaid = status === "PAID";
                  const isCancel = status === "CANCEL" || status === "CANCELLED";
                  return (
                    <tr
                      key={o.id}
                      className="border-t hover:bg-blue-50 transition"
                    >
                      <td className="p-3 font-mono text-blue-700">
                        {o.order_code}
                      </td>
                      <td className="p-3">
                        {o.customer_name || (
                          <span className="text-gray-400">Khách lẻ</span>
                        )}
                      </td>
                      <td className="p-3">
                        {new Date(o.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3 font-semibold text-blue-700">
                        {Number(o.total).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-lg border text-xs font-semibold
                            ${
                              isPaid
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : isCancel
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-yellow-50 border-yellow-200 text-yellow-700"
                            }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow flex flex-col items-center">
      <div>{icon}</div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-blue-800">{value}</p>
    </div>
  );
}
