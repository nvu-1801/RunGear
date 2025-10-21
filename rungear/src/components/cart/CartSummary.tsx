import Link from "next/link";
import { formatPriceVND } from "@/shared/price";

export function CartSummary({
  subtotal,
  clear,
  isEmpty,
  gotoCheckout,
}: {
  subtotal: number;
  clear: () => void;
  isEmpty: boolean;
  gotoCheckout: () => void;
}) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-2xl border bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tóm tắt đơn hàng
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Tạm tính</span>
            <span className="font-semibold">{formatPriceVND(subtotal)}</span>
          </div>
        </div>
        <button
          className="mt-6 w-full h-12 rounded-xl bg-blue-700 text-white font-semibold text-base shadow hover:bg-blue-800 transition disabled:opacity-50"
          onClick={gotoCheckout}
          disabled={isEmpty}
        >
          Thanh toán
        </button>
        <div className="mt-3 text-center">
          <Link
            href="/payments"
            className="text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            Đi tới trang thanh toán
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Bạn có thể nhập mã giảm giá và chọn phương thức thanh toán ở bước tiếp
          theo.
        </p>
      </div>
      <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-indigo-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M7 7h.01M3 11l10 10 8-8-10-10H3v8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="text-sm">
            <div className="font-semibold text-gray-800">
              Mẹo: đơn trên 300.000đ
            </div>
            <div className="text-gray-600">
              Có thể được miễn phí vận chuyển (xem tại trang thanh toán).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
