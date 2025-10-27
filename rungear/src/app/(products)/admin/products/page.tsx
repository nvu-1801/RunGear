"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductForm from "./ProductForm";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string | null;
  status: "draft" | "active" | "hidden";
  categories_id:
    | "1d4478e7-c9d2-445e-8520-14dae73aac68"
    | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d"
    | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
};

type PageResp = {
  items: (Omit<Product, "categories_id"> & {
    categories_id?: Category | null;
  })[];
  total: number;
  page: number;
  pageSize: number;
};

export default function ProductManager() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [data, setData] = useState<PageResp>({
    items: [],
    total: 0,
    page: 1,
    pageSize,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize]
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));

      const r = await fetch(url.toString(), { cache: "no-store" });
      if (!r.ok) throw new Error("Network response was not ok");
      const json = await r.json();
      const pageResp = json as PageResp;
      setData(pageResp);
      setAllPosts(pageResp.items as unknown as Product[]);
      return pageResp;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Fetch failed";
      console.error("Fetch Error:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [q, page, pageSize]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // CRUD Handlers
  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };
  const onEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };
  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      void fetchList();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      console.error("Delete Error:", errorMessage);
    }
  };
  const onSaved = () => {
    setShowForm(false);
    void fetchList();
  };
  const getCategoryName = (categoryId: string): string => {
    const categories: Record<string, string> = {
      "1d4478e7-c9d2-445e-8520-14dae73aac68": "Áo",
      "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d": "Quần",
      "e9819e30-a5dc-4cd1-835d-206bb882fc09": "Giày",
    };
    return categories[categoryId] ?? "Unknown";
  };

  return (
    <div className="space-y-6 px-8 mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-2xl font-extrabold text-gray-900">
            Product Manager
          </div>
          <div className="text-sm text-gray-500">
            Quản lý sản phẩm — tạo, sửa, xóa
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Tìm theo tên hoặc slug..."
              className="w-full md:w-72 rounded-lg border border-gray-200 pl-10 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow hover:scale-[1.02] transform transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Product
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: filters / summary */}
        <div className="lg:col-span-1 bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-3">Overview</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Total products</div>
              <div className="text-lg font-semibold">{data.total ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Page</div>
              <div className="text-lg font-semibold">
                {data.page}/{totalPages}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Pro tip: Click a product to edit it. On mobile the list shows cards
            for easier scanning.
          </div>
        </div>

        {/* Right: list */}
        <div className="lg:col-span-2">
          {/* Desktop table */}
          <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(allPosts) && allPosts.length > 0 ? (
                  allPosts.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={p.images || "https://placehold.co/80x80"}
                            alt={p.name}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {p.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {p.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getCategoryName(p.categories_id)}
                      </td>
                      <td className="p-4">
                        {(p.price / 1).toLocaleString()} ₫
                      </td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === "active"
                              ? "bg-green-100 text-green-800"
                              : p.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => onEdit(p)}
                            className="px-3 py-1 rounded-md border hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="px-3 py-1 rounded-md border hover:bg-gray-50 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {loading ? "Loading..." : "No products found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {Array.isArray(allPosts) && allPosts.length > 0 ? (
              allPosts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border rounded-xl p-4 shadow-sm flex gap-4"
                >
                  <img
                    src={p.images || "https://placehold.co/80x80"}
                    alt={p.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">{p.slug}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {(p.price / 1).toLocaleString()} ₫
                        </div>
                        <div className="text-xs text-gray-500">
                          {getCategoryName(p.categories_id)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="px-3 py-1 rounded-md border text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="px-3 py-1 rounded-md border text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                {loading ? "Loading..." : "No products found."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: {data.total} • Page {page}/{totalPages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg text-gray-700 border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg text-gray-700 border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <ProductForm
          initial={editing ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
