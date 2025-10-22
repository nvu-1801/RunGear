import Link from "next/link";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export function Pagination({
  currentPage,
  totalPages,
  start,
  end,
  total,
  buildQuery,
}: {
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  buildQuery: (extra: QueryParams) => QueryParams;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 text-sm text-gray-600">
      <p>
        Hiển thị{" "}
        <span className="font-medium">
          {total ? start + 1 : 0}-{end}
        </span>{" "}
        / {total}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          aria-disabled={currentPage <= 1}
          href={{
            pathname: "/home",
            query: buildQuery({ p: Math.max(1, currentPage - 1) }),
          }}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            currentPage <= 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          ← Trước
        </Link>
        <span className="font-semibold text-gray-800">
          Trang {currentPage} / {totalPages}
        </span>
        <Link
          aria-disabled={currentPage >= totalPages}
          href={{
            pathname: "/home",
            query: buildQuery({ p: Math.min(totalPages, currentPage + 1) }),
          }}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            currentPage >= totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Tiếp →
        </Link>
      </div>
    </div>
  );
}
