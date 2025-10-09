"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductForm from "./ProductForm";
import { use } from "react";
import { get } from "http";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string | null;
  status: "draft" | "active" | "hidden";
  categories_id: "1d4478e7-c9d2-445e-8520-14dae73aac68" | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d" | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
};

type PageResp = {
  items: (Product & { categories_id?: Category | null })[];
  total: number;
  page: number;
  pageSize: number;
};

export default function ProductManager({
  posts,
}: {
  posts: Promise<
    {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      images: string | null;
      status: "draft" | "active" | "hidden";
      categories_id: Category;
    }[]
  >;
  }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [data, setData] = useState<PageResp>({
    items: [],
    total: 1,
    page: 1,
    pageSize: 1,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize]
  );
  

    const fetchList = useCallback(async () => {
      setLoading(true);
      const url = new URL("/api/products", window.location.origin);
      console.log("Fetching from URL:", url.toString());

      // Thêm query params nếu có
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
    
      try {
        const r = await fetch(url, { cache: "no-store" });

        // Kiểm tra response
        console.log("Response:", r);
        if (!r.ok) {
          throw new Error("Network response was not ok");
        }
        const json: PageResp = await r.json();
        console.log("Fetched JSON:", json);
        if (Array.isArray(json)) {
          const pageResp: PageResp = {
            items: json,
            total: json.length,
            page: page,
            pageSize: pageSize
          };
        console.log("✅ Converted to PageResp:", pageResp);
        setData(pageResp); // Cập nhật dữ liệu vào state
        setAllPosts(json);
        return pageResp;
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false); // Kết thúc loading
      }
    }, [q, page, pageSize]);
  useEffect(() => {
    fetchList();
  }, [fetchList, posts]);

  //CRUD Handlers
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
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchList();
  };
  const onSaved = () => {
    setShowForm(false);
    fetchList();
  };
  const getCategoryName = (categoryId: string): string => {
  const categories: Record<string, string> = {
    "1d4478e7-c9d2-445e-8520-14dae73aac68": "Áo",
    "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d": "Quần",
    "e9819e30-a5dc-4cd1-835d-206bb882fc09": "Giày"
  };
  return categories[categoryId];
};

  return (
    <div className="space-y-4 mt-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start text-gray-700 md:items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search by name or slug..."
            className="border px-3 text-gray-700 py-2 rounded-md w-72"
          />
          {loading && (
            <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
          )}
        </div>
        <button
          onClick={onCreate}
          className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
        >
          + New Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto text-gray-700 border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(allPosts) && allPosts.length > 0 ? (
              allPosts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images || "https://placehold.co/60x60"}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-gray-500">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{getCategoryName(p.categories_id)}</td>
                  <td className="p-3">{(p.price / 1).toLocaleString()} ₫</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-lg border text-xs">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(p)}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {loading ? "Loading..." : "No products found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
