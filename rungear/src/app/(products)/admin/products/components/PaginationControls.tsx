import React from "react";

type Props = {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
};

export default function PaginationControls({
  page,
  totalPages,
  setPage,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Page {page}/{totalPages}
      </div>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
          className="px-3 py-1 rounded-lg text-gray-700 border disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          className="px-3 py-1 rounded-lg text-gray-700 border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
