"use client";

import { useEffect, useState } from "react";

type DiscountType = "percent" | "fixed";

type DiscountCode = {
  id: string;
  code: string;
  type: DiscountType;
  percent_off: number | null;
  amount_off: number | null;
  start_at: string;
  end_at: string | null;
  enabled: boolean;
  max_uses: number | null;
  uses_count: number;
  per_user_limit: number;
  min_order_amount: number;
  notes: string | null;
  created_at: string;
};

export default function AdminDiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percent");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [maxUses, setMaxUses] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [notes, setNotes] = useState("");

  // Load discount codes
  useEffect(() => {
    loadCodes();
  }, []);

  async function loadCodes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discount-codes");
      const json = await res.json();
      if (json.success) {
        setCodes(json.data ?? []);
      }
    } catch (e) {
      console.error("Load discount codes error:", e);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCode("");
    setType("percent");
    setPercentOff("");
    setAmountOff("");
    setStartAt("");
    setEndAt("");
    setEnabled(true);
    setMaxUses("");
    setPerUserLimit("1");
    setMinOrderAmount("0");
    setNotes("");
    setEditing(null);
    setShowForm(false);
  }

  function handleOpenAdd() {
    resetForm();
    setShowForm(true);
  }

  function handleOpenEdit(item: DiscountCode) {
    setEditing(item);
    setCode(item.code);
    setType(item.type);
    setPercentOff(item.percent_off ? String(item.percent_off) : "");
    setAmountOff(item.amount_off ? String(item.amount_off) : "");
    setStartAt(item.start_at.split("T")[0]);
    setEndAt(item.end_at ? item.end_at.split("T")[0] : "");
    setEnabled(item.enabled);
    setMaxUses(item.max_uses ? String(item.max_uses) : "");
    setPerUserLimit(String(item.per_user_limit));
    setMinOrderAmount(String(item.min_order_amount));
    setNotes(item.notes ?? "");
    setShowForm(true);
  }

  async function handleSave() {
    try {
      const payload: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        type,
        start_at: startAt
          ? new Date(startAt).toISOString()
          : new Date().toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : null,
        enabled,
        max_uses: maxUses ? parseInt(maxUses) : null,
        per_user_limit: parseInt(perUserLimit),
        min_order_amount: parseFloat(minOrderAmount),
        notes: notes.trim() || null,
      };

      if (type === "percent") {
        payload.percent_off = parseFloat(percentOff);
        payload.amount_off = null;
      } else {
        payload.amount_off = parseFloat(amountOff);
        payload.percent_off = null;
      }

      if (editing) {
        const res = await fetch(`/api/admin/discount-codes/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
      } else {
        const res = await fetch("/api/admin/discount-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
      }

      await loadCodes();
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Không thể lưu";
      console.error("Save discount code error:", e);
      alert("Lỗi: " + errorMessage);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa mã giảm giá này?")) return;
    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await loadCodes();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Không thể xóa";
      console.error("Delete discount code error:", e);
      alert("Lỗi: " + errorMessage);
    }
  }

  async function toggleEnabled(id: string, newEnabled: boolean) {
    try {
      const item = codes.find((c) => c.id === id);
      if (!item) return;

      const payload: Record<string, unknown> = {
        code: item.code,
        type: item.type,
        start_at: item.start_at,
        end_at: item.end_at,
        enabled: newEnabled,
        max_uses: item.max_uses,
        per_user_limit: item.per_user_limit,
        min_order_amount: item.min_order_amount,
        notes: item.notes,
      };

      if (item.type === "percent") {
        payload.percent_off = item.percent_off;
        payload.amount_off = null;
      } else {
        payload.amount_off = item.amount_off;
        payload.percent_off = null;
      }

      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await loadCodes();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Không thể cập nhật";
      console.error("Toggle enabled error:", e);
      alert("Lỗi: " + errorMessage);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            🎟️ Quản lý mã giảm giá
          </h1>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition shadow"
          >
            + Thêm mã mới
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : codes.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-700">
              Chưa có mã giảm giá nào
            </p>
            <p className="text-gray-500 mt-2">
              Hãy thêm mã giảm giá để khách hàng có thể sử dụng.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
            >
              + Thêm mã đầu tiên
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white shadow-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Mã giảm giá
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Loại
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Giảm
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Đơn tối thiểu
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Ngày bắt đầu
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Ngày kết thúc
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Lượt dùng
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {codes.map((item) => {
                  const now = new Date();
                  const start = new Date(item.start_at);
                  const end = item.end_at ? new Date(item.end_at) : null;
                  const isValid =
                    now >= start && (!end || now <= end) && item.enabled;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-blue-700">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">
                        {item.type === "percent" ? "%" : "₫"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.type === "percent"
                          ? `${item.percent_off}%`
                          : `${item.amount_off?.toLocaleString()}₫`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.min_order_amount.toLocaleString()}₫
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(item.start_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.end_at
                          ? new Date(item.end_at).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            ✅ Đang hoạt động
                          </span>
                        ) : item.enabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                            ⏳ Chưa bắt đầu/Hết hạn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                            ❌ Ngừng hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.uses_count}
                        {item.max_uses && ` / ${item.max_uses}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() =>
                              toggleEnabled(item.id, !item.enabled)
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              item.enabled
                                ? "text-gray-600 hover:bg-gray-100"
                                : "text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {item.enabled ? "Tắt" : "Bật"}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-xs text-blue-700 font-semibold hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs text-red-600 font-semibold hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal form */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {editing ? "Sửa mã giảm giá" : "Thêm mã giảm giá mới"}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Mã giảm giá *
                    </label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="VD: SUMMER2025"
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Loại *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as DiscountType)}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (₫)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {type === "percent" ? (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 font-medium">
                        Phần trăm giảm (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={percentOff}
                        onChange={(e) => setPercentOff(e.target.value)}
                        placeholder="VD: 10"
                        className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 font-medium">
                        Số tiền giảm (₫) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={amountOff}
                        onChange={(e) => setAmountOff(e.target.value)}
                        placeholder="VD: 50000"
                        className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Đơn hàng tối thiểu (₫)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Số lượt tối đa
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      placeholder="Để trống = không giới hạn"
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-medium">
                      Giới hạn mỗi người
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1 font-medium">
                    Ghi chú
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-medium">Kích hoạt ngay</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 justify-end">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
