"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

type Stats = { sold_this_month: number; total_stock: number; skus_in_stock: number };

// ---------------- helpers ----------------
function getMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    try { return String((err as { message?: unknown }).message ?? String(err)); } catch { return String(err); }
  }
  return String(err);
}

// ---------------- list types ----------------
type OrderRow = {
  id: string;
  order_code: string;
  created_at: string;
  total: string | number;
  status: string | null;
  shipping_address: null | { full_name?: string | null; name?: string | null; recipient?: string | null; phone?: string | null };
};

type OrderVM = {
  id: string;
  order_code: string;
  created_at: string;
  total: string | number;
  status: string;
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
  return typeof v === "object" && v !== null && "id" in v && "created_at" in v && "total" in v && "order_code" in v;
}

// --- helpers nhỏ ---
function Money({ v }: { v: number }) {
  return <span>{Number(v || 0).toLocaleString("vi-VN")} ₫</span>;
}

function StatusBadge({ value }: { value: string }) {
  const v = value.toUpperCase();
  const cls =
    v === "PAID"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : v === "CANCELLED" || v === "FAILED"
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : v === "PROCESSING"
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${cls}`}>
      <span className="size-1.5 rounded-full bg-current/40" />
      {v}
    </span>
  );
}

const STATUS_OPTIONS = [
  { v: "PENDING", label: "Pending", icon: "⏳" },
  { v: "PROCESSING", label: "Processing", icon: "🔄" },
  { v: "PAID", label: "Paid", icon: "✅" },
  { v: "CANCELLED", label: "Cancelled", icon: "🛑" },
  { v: "FAILED", label: "Failed", icon: "⚠️" },
] as const;

function ChevronDownIcon() {
  return (
    <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}


// ---------------- detail types ----------------
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
  status: string;
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

// ---------------- component ----------------
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderVM[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // modal state
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // stats
  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb.rpc("get_dashboard_stats");
        if (error) throw error;
        setStats(data?.[0] ?? { sold_this_month: 0, total_stock: 0, skus_in_stock: 0 });
      } catch (e: unknown) {
        setErr(getMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // recent orders (lightweight)
  useEffect(() => {
    (async () => {
      setOrdersLoading(true);
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb
          .from("orders")
          .select("id, order_code, created_at, total, status, shipping_address")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        setOrders((data ?? []).map(toVM));
      } catch (e: unknown) {
        console.error(getMessage(e));
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, []);

  // fetch detail when openId changes
  useEffect(() => {
    if (!openId) return;
    (async () => {
      setDetail(null);
      setDetailLoading(true);
      try {
        const sb = supabaseBrowser();
        const { data, error } = await sb
          .from("orders")
          .select(`
            id,
            order_code,
            created_at,
            status,
            total,
            amount,
            discount_amount,
            shipping_address,
            order_items (
              id,
              qty,
              price_at_time,
              product:products (
                id, name, slug, price, images, stock, status
              )
            )
          `)
          .eq("id", openId)
          .single();
        if (error) throw error;
        const normalized: OrderDetail = {
          id: data.id,
          order_code: data.order_code,
          created_at: data.created_at,
          status: (data.status ?? "PENDING").toUpperCase(),
          total: Number(data.total),
          amount: Number(data.amount),
          discount_amount: Number(data.discount_amount ?? 0),
          shipping_address: data.shipping_address ?? null,
          order_items: (data.order_items ?? []).map((it: any) => {
            // supabase may return the related product as an array (e.g. product: [ ... ]) or as an object; normalize to a single ProductLite | null
            const rawProduct = (it.product ?? null) as any;
            const product: ProductLite | null = !rawProduct
              ? null
              : Array.isArray(rawProduct)
              ? (rawProduct[0] ?? null)
              : rawProduct;
            return {
              id: it.id,
              qty: Number(it.qty),
              price_at_time: Number(it.price_at_time ?? 0),
              product,
            };
          }),
        };
        setDetail(normalized);
      } catch (e: unknown) {
        console.error("Load order detail error:", getMessage(e));
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [openId]);

  return (
    <div className="p-6 text-gray-800 min-h-dvh bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-800 flex items-center gap-3">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        </svg>
        Dashboard
      </h1>

      {loading && <div className="animate-pulse text-blue-600">Đang tải thống kê…</div>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card label="Đã bán tháng này" value={stats.sold_this_month} icon={<CheckIcon />} />
          <Card label="Tồn kho (số lượng)" value={stats.total_stock} icon={<BoxIcon />} />
          <Card label="Sản phẩm đang bán" value={stats.skus_in_stock} icon={<CirclePlusIcon />} />
        </div>
      )}

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-2xl shadow border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <ListIcon /> Đơn hàng gần đây
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
                  <th className="p-3 text-left font-semibold text-gray-700">Mã đơn</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Khách hàng</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Ngày tạo</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Tổng tiền</th>
                  <th className="p-3 text-left font-semibold text-gray-700">Trạng thái</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(isOrder).map((o) => {
                  const status = o.status?.toUpperCase?.() ?? "PENDING";
                  const isPaid = status === "PAID";
                  const isCancel = status === "CANCEL" || status === "CANCELLED";
                  return (
                    <tr key={o.id} className="border-t hover:bg-blue-50 transition">
                      <td className="p-3 font-mono">
                        <button
                          className="text-blue-700 hover:underline"
                          onClick={() => setOpenId(o.id)}
                          aria-label={`Xem chi tiết ${o.order_code}`}
                        >
                          {o.order_code}
                        </button>
                      </td>
                      <td className="p-3">{o.customer_name || <span className="text-gray-400">Khách lẻ</span>}</td>
                      <td className="p-3">{new Date(o.created_at).toLocaleString("vi-VN")}</td>
                      <td className="p-3 font-semibold text-blue-700">{Number(o.total).toLocaleString("vi-VN")} ₫</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
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
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setOpenId(o.id)}
                          className="px-2 py-1 rounded-md border hover:bg-blue-50 text-blue-700"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {openId && (
        <OrderDetailModal
          open
          onClose={() => { setOpenId(null); setDetail(null); }}
          loading={detailLoading}
          detail={detail}
        />
      )}
    </div>
  );
}

// ---------------- small icons ----------------
function CheckIcon() {
  return (
    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" />
    </svg>
  );
}
function CirclePlusIcon() {
  return (
    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

// ---------------- presentational ----------------
function Card({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow flex flex-col items-center">
      <div>{icon}</div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-blue-800">{value}</p>
    </div>
  );
}

function OrderDetailModal({
  open,
  onClose,
  loading,
  detail,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  detail: OrderDetail | null;
}) {
  if (!open) return null;

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  type Allowed = (typeof STATUS_OPTIONS)[number]["v"];

  async function updateStatus(next: Allowed) {
    if (!detail || saving) return;
    setSaving(true);
    setErrMsg(null);
    const prev = detail.status;
    const prevPaidAt = (detail as any).paid_at ?? null;

    try {
      (detail as any).status = next; // optimistic
      const sb = supabaseBrowser();
      const patch: Record<string, any> = { status: next };
      if (next === "PAID") patch.paid_at = new Date().toISOString();
      else if (prev === "PAID") patch.paid_at = null;

      const { error } = await sb.from("orders").update(patch).eq("id", detail.id);
      if (error) {
        (detail as any).status = prev;
        (detail as any).paid_at = prevPaidAt;
        throw error;
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? "Không thể cập nhật trạng thái");
    } finally {
      setSaving(false);
    }
  }

  const totalLine = (i: OrderItem) => i.qty * (i.price_at_time ?? 0);
  const imagesOf = (p: ProductLite | null) => {
    if (!p) return null;
    if (Array.isArray(p.images)) return p.images[0] ?? null;
    return p.images ?? null;
  };

  // tính tạm subtotal từ items (nếu muốn hiển thị)
  const computedSubtotal =
    detail?.order_items?.reduce((s, it) => s + totalLine(it), 0) ?? 0;

  // dropdown đẹp hơn (custom select)
  function StatusSelect({ value, onChange, disabled }: { value: string; onChange: (v: Allowed) => void; disabled?: boolean; }) {
    return (
      <div className="relative">
        <select
          className="peer w-full appearance-none rounded-xl border bg-white/80 px-3 py-2.5 pr-8 text-sm text-gray-800 shadow-sm outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-300 disabled:opacity-70"
          value={value}
          disabled={!!disabled}
          onChange={(e) => onChange(e.target.value as Allowed)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <ChevronDownIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b bg-gradient-to-r from-slate-50 to-white px-5 py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-800">
                Đơn hàng
                {" "}
                <span className="font-mono text-blue-700">{detail?.order_code ?? ""}</span>
              </h3>
              {detail && <StatusBadge value={detail.status} />}
            </div>
            {detail && (
              <p className="mt-0.5 text-xs text-slate-500">
                Tạo lúc {new Date(detail.created_at).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {detail?.order_code && (
              <button
                onClick={() => navigator.clipboard.writeText(detail.order_code)}
                className="rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                title="Sao chép mã đơn"
              >
                Sao chép mã
              </button>
            )}
            <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">
              Đóng
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[72vh] overflow-auto px-5 py-4">
          {loading || !detail ? (
            <div className="animate-pulse text-blue-600">Đang tải chi tiết…</div>
          ) : (
            <>
              {errMsg && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {errMsg}
                </div>
              )}

              {/* Top info cards */}
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Trạng thái</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusSelect
                      value={detail.status}
                      onChange={updateStatus}
                      disabled={saving}
                    />
                    {saving && <span className="text-xs text-blue-600">Đang lưu…</span>}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-slate-500">Giảm giá</p>
                      <p className="font-semibold text-slate-800">
                        <Money v={detail.discount_amount} />
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-slate-500">Tổng thanh toán</p>
                      <p className="font-semibold text-blue-800">
                        <Money v={detail.total} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products table */}
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
                              {imagesOf(it.product) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imagesOf(it.product) as string}
                                  alt={it.product?.name ?? ""}
                                  className="size-12 rounded-xl object-cover ring-1 ring-slate-200"
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
                          <td className="p-3 text-right"><Money v={it.price_at_time} /></td>
                          <td className="p-3 text-right">{it.qty}</td>
                          <td className="p-3 text-right"><Money v={totalLine(it)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-5 flex flex-col items-end gap-1">
                <div className="text-sm text-slate-600">
                  Tạm tính: <Money v={computedSubtotal} />
                </div>
                <div className="text-sm text-slate-600">
                  Giảm giá: <Money v={detail.discount_amount} />
                </div>
                <div className="text-lg font-bold text-blue-800">
                  Tổng: <Money v={detail.total} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
