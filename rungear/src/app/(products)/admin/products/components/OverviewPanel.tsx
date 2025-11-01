import React from "react";

type Props = {
  total: number;
  page: number;
  pageSize: number;
  galleryCount: number;
};

export default function OverviewPanel({
  total,
  page,
  pageSize,
  galleryCount,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="lg:col-span-1 bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-sm text-gray-600 mb-3">Overview</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Total products</div>
          <div className="text-lg font-semibold">{total ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Page</div>
          <div className="text-lg font-semibold">
            {page}/{totalPages}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 mb-2">Storage Images</div>
        <div className="text-lg font-semibold">{galleryCount} files</div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Pro tip: Click Gallery to select images from storage for your products.
      </div>
    </div>
  );
}
