import Link from "next/link";

export function SearchFilterForm({
  q,
  cat,
  min,
  max,
}: {
  q: string;
  cat: string;
  min: string;
  max: string;
}) {
  return (
    <form
      method="get"
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 mb-6"
      aria-label="Tìm kiếm và lọc"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Cửa hàng</h1>
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-gray-300 px-4 py-2.5 pl-10 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            aria-label="Tìm kiếm sản phẩm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
        </div>
        <input type="hidden" name="cat" value={cat} />
        <div className="flex gap-2 items-center flex-wrap">
          <select
            id="min"
            name="min"
            defaultValue={min || ""}
            className="w-28 lg:w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            aria-label="Giá từ"
          >
            <option value="">Giá từ</option>
            <option value="0">0 ₫</option>
            <option value="100000">100.000 ₫</option>
            <option value="200000">200.000 ₫</option>
            <option value="500000">500.000 ₫</option>
            <option value="1000000">1.000.000 ₫</option>
          </select>
          <select
            id="max"
            name="max"
            defaultValue={max || ""}
            className="w-28 lg:w-32 rounded-full border border-gray-300 px-3 py-2 text-gray-800 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            aria-label="Đến giá"
          >
            <option value="">Đến</option>
            <option value="200000">200.000 ₫</option>
            <option value="500000">500.000 ₫</option>
            <option value="1000000">1.000.000 ₫</option>
            <option value="3000000">3.000.000 ₫</option>
            <option value="10000000">10.000.000 ₫</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-full bg-blue-700 text-white px-4 py-2 font-semibold shadow hover:bg-blue-800 transition"
            >
              Lọc
            </button>
            <a
              href={`/home${q ? `?q=${encodeURIComponent(q)}` : ""}${
                cat && cat !== "all"
                  ? `${q ? "&" : "?"}cat=${encodeURIComponent(cat)}`
                  : ""
              }`}
              className="ml-1 text-sm text-gray-600 hover:text-blue-700 transition"
              aria-label="Xoá lọc giá"
            >
              Xoá
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
