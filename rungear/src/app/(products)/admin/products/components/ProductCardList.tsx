import React from "react";
import { getFirstImage as getFirstImageUrl } from "@/modules/products/lib/image-url";
import type { Product } from "@/modules/products/model/product-public";

type Props = {
  items: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  getCategoryName: (id: string) => string;
};

export default function ProductCardList({
  items,
  onEdit,
  onDelete,
  getCategoryName,
}: Props) {
  return (
    <div className="md:hidden space-y-4">
      {items.length > 0 ? (
        items.map((p) => (
          <div
            key={p.id}
            className="bg-white border rounded-xl p-4 shadow-sm flex gap-4"
          >
            <img
              src={getFirstImageUrl(p.images ?? null)}
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
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.slug}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {(p.price / 1).toLocaleString()} ₫
                  </div>
                  <div className="text-xs text-gray-500">
                    {getCategoryName(p.categories_id ?? "")}
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
        <div className="p-6 text-center text-gray-500">No products found.</div>
      )}
    </div>
  );
}
