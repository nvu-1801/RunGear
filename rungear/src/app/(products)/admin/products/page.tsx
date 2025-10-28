"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductForm from "./ProductForm";
import { getFirstImage as getFirstImageUrl } from "@/modules/products/lib/image-url";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string | string[] | null; // Support both string and array
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

// API response shape cho storage
export type StorageFileItem = {
  name: string;
  path: string;
  publicUrl: string;
  createdAt?: string;
  size: number;
};

export type ListFilesResp = {
  files: StorageFileItem[];
  count: number;
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

  // State cho image gallery
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<StorageFileItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

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

  // Fetch gallery images
  const fetchGalleryImages = useCallback(
    async (folder = "products", limit = 100) => {
      setGalleryLoading(true);
      setGalleryError(null);
      try {
        const url = new URL("/api/upload", window.location.origin);
        url.searchParams.set("folder", folder);
        url.searchParams.set("limit", String(limit));

        const r = await fetch(url.toString(), { cache: "no-store" });
        if (!r.ok) {
          const msg = await r.text();
          throw new Error(msg || `HTTP ${r.status}`);
        }
        const json: ListFilesResp = await r.json();
        setGalleryImages(json.files ?? []);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setGalleryError(errorMsg);
        console.error("List images failed:", e);
      } finally {
        setGalleryLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // Fetch gallery images on mount
  useEffect(() => {
    void fetchGalleryImages();
  }, [fetchGalleryImages]);

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
    void fetchGalleryImages();
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
            onClick={() => {
              setShowGallery(true);
              void fetchGalleryImages();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow hover:scale-[1.02] transform transition"
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Gallery
          </button>

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
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500 mb-2">Storage Images</div>
            <div className="text-lg font-semibold">
              {galleryImages.length} files
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Pro tip: Click Gallery to select images from storage for your
            products.
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
                            src={getFirstImageUrl(p.images)}
                            alt={p.name}
                            className="w-14 h-14 rounded-lg object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/80x80";
                            }}
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
                    src={getFirstImageUrl(p.images)}
                    alt={p.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/80x80";
                    }}
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
          initial={
            editing
              ? {
                  ...editing,
                  images:
                    typeof editing.images === "string"
                      ? editing.images
                      : Array.isArray(editing.images) &&
                        editing.images.length > 0
                      ? editing.images[0]
                      : null,
                }
              : undefined
          }
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Image Gallery
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {galleryImages.length} images in storage • Click to copy URL
                </p>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : galleryError ? (
                <div className="text-center py-12 text-red-600">
                  {galleryError}
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No images in storage yet. Upload some images first!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryImages.map((img) => (
                    <div
                      key={img.path}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition cursor-pointer"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(img.publicUrl);
                          alert("✓ URL copied to clipboard!");
                        } catch {
                          prompt("Copy this URL:", img.publicUrl);
                        }
                      }}
                    >
                      <img
                        src={img.publicUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                        <button className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100">
                          📋 Copy URL
                        </button>
                        <a
                          href={img.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 Open
                        </a>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white text-xs truncate">
                          {img.name}
                        </p>
                        <p className="text-white/70 text-[10px]">
                          {(img.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
