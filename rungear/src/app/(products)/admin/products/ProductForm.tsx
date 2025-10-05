"use client";

import { useEffect, useState } from "react";

type ProductInput = {
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  status: "draft" | "active" | "hidden";
  categories_idId?: "1d4478e7-c9d2-445e-8520-14dae73aac68" | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d" | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
};

type Product = ProductInput & { id: string };

type Props = {
  initial?: Product;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductForm({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<ProductInput>({
    name: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    status: "active",
    categories_idId: "1d4478e7-c9d2-445e-8520-14dae73aac68",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      const { id, ...rest } = initial;
      setForm({ ...rest });
    }
  }, [initial]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    const endpoint = isEdit
      ? `/api/products/${(initial as Product).id}`
      : "/api/products";
    const method = isEdit ? "PUT" : "POST";
    console.log("Submitting form:", form);
    const r = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.message || "Save failed");
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Category</label>
            <select
              value={form.categories_idId}
              onChange={(e) => setForm({ ...form, categories_idId: e.target.value as ProductInput["categories_idId"] })}
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="e9819e30-a5dc-4cd1-835d-206bb882fc09">quần</option>
              <option value="1d4478e7-c9d2-445e-8520-14dae73aac68">áo</option>
              <option value="3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d">giày</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Price (VND)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Image URL</label>
            <input
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as any })
              }
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="DRAFT">draft</option>
              <option value="ACTIVE">active</option>
              <option value="HIDDEN">hidden</option>
            </select>
          </div>

          
        </div>

        {error && <div className="px-4 pb-2 text-red-600 text-sm">{error}</div>}

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
