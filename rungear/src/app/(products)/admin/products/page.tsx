"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductForm from "./components/ProductForm";
import AdminHeader from "./components/AdminHeader";
import OverviewPanel from "./components/OverviewPanel";
import ProductListTable from "./components/ProductListTable";
import ProductCardList from "./components/ProductCardList";
import GalleryModal, { StorageFileItem } from "./components/GalleryModal";
import PaginationControls from "./components/PaginationControls";
import type { Product } from "@/modules/products/model/product-public";
import { toFormInitial, toUpsertPayload } from "@/utils/product-form";

type Category = { id: string; name: string; slug: string };

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
  const initialForm = useMemo(() => toFormInitial(editing), [editing]);
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

      // Normalize categories_id to be a string | undefined to match local Product type
      const normalizedItems = pageResp.items.map((it) => ({
        ...it,
        categories_id:
          it.categories_id && typeof it.categories_id === "object"
            ? it.categories_id.id
            : typeof it.categories_id === "string"
            ? it.categories_id
            : undefined,
      }));

      setAllPosts(normalizedItems as unknown as Product[]);
      return pageResp;
    } catch (error: unknown) {
      console.error(
        "Fetch Error:",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  }, [q, page, pageSize]);

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
        const json = await r.json();
        setGalleryImages(json.files ?? []);
      } catch (e) {
        setGalleryError(e instanceof Error ? e.message : String(e));
      } finally {
        setGalleryLoading(false);
      }
    },
    []
  );

  // explicit handler to avoid confusion with state setter naming
  const handleSearch = (v: string) => {
    setPage(1);
    setQ(v);
  };

  // fetch list when q or page changes (explicit deps)
  useEffect(() => {
    void fetchList();
  }, [q, page, fetchList]);

  useEffect(() => {
    void fetchGalleryImages();
  }, [fetchGalleryImages]);

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
      console.error(
        "Delete Error:",
        error instanceof Error ? error.message : String(error)
      );
    }
  };
  const onSaved = () => {
    setShowForm(false);
    void fetchList();
    void fetchGalleryImages();
  };

  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      "1d4478e7-c9d2-445e-8520-14dae73aac68": "Áo",
      "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d": "Quần",
      "e9819e30-a5dc-4cd1-835d-206bb882fc09": "Giày",
    };
    return categories[categoryId] ?? "Unknown";
  };

  return (
    <div className="space-y-6 px-8 mt-6">
      <AdminHeader
        q={q}
        setQ={handleSearch}
        onOpenGallery={() => {
          setShowGallery(true);
          void fetchGalleryImages();
        }}
        onCreate={onCreate}
        pageSize={pageSize}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewPanel
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          galleryCount={galleryImages.length}
        />

        <div className="lg:col-span-2">
          <ProductListTable
            items={allPosts}
            onEdit={onEdit}
            onDelete={onDelete}
            getCategoryName={getCategoryName}
          />
          <ProductCardList
            items={allPosts}
            onEdit={onEdit}
            onDelete={onDelete}
            getCategoryName={getCategoryName}
          />

          <div className="mt-6">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          initial={initialForm}
          productId={editing?.id}
          onClose={() => setShowForm(false)}
          onSaved={async (_saved) => {
            setShowForm(false);
            await fetchList();
            await fetchGalleryImages();
          }}
        />
      )}

      <GalleryModal
        open={showGallery}
        images={galleryImages}
        loading={galleryLoading}
        error={galleryError}
        onClose={() => setShowGallery(false)}
      />
    </div>
  );
}
