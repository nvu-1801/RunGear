import React from "react";
import {
  getImageUrl,
  getFirstImage as getFirstImageUrl,
} from "@/modules/products/lib/image-url";
import type { Product } from "@/modules/products/model/product-public";

type Props = {
  items: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  getCategoryName: (id: string) => string;
};

export default function ProductListTable({
  items,
  onEdit,
  onDelete,
  getCategoryName,
}: Props) {
  // helper: prefer getImageUrl, fallback to getFirstImage
  const resolveImage = (p: Product) => {
    if (!p) return getImageUrl(null);
    if (typeof p.images === "string" && p.images) {
      return getImageUrl(p.images);
    }
    if (Array.isArray(p.images) && p.images.length > 0) {
      return getImageUrl(p.images[0]);
    }
    return getFirstImageUrl(p.images ?? null);
  };

  return (
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
          {items.length > 0 ? (
            items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={resolveImage(p)}
                      alt={p.name}
                      className="w-14 h-14 rounded-lg object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/80x80";
                      }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-gray-500 text-xs">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {getCategoryName(
                    typeof p.categories_id === "string"
                      ? p.categories_id
                      : (p.categories_id as any)?.id ?? ""
                  )}
                </td>
                <td className="p-4">{(p.price / 1).toLocaleString()} ₫</td>
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
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
