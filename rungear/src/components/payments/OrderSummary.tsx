import { formatPriceVND } from "@/shared/price";
import type { CartItem } from "@/components/cart/cart-store";

type Props = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  coupon: string;
  onCouponChange: (v: string) => void;
  isEmpty: boolean;
};

export function OrderSummary({
  items,
  subtotal,
  shippingFee,
  discount,
  total,
  coupon,
  onCouponChange,
  isEmpty,
}: Props) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-2xl border bg-white p-8 shadow-lg">
        <h3 className="text-xl font-semibold mb-5 text-gray-700">
          Đơn hàng của bạn
        </h3>
        <ul className="divide-y">
          {items.map((i) => (
            <li
              key={i.id + (i.variant ?? "")}
              className="py-3 flex items-start justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={i.image ?? "/placeholder.png"}
                  alt={i.name}
                  className="w-12 h-12 object-cover rounded-xl border"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-700 line-clamp-1">
                    {i.name}
                    {i.variant ? ` · ${i.variant}` : ""}
                  </div>
                  <div className="text-gray-500">× {i.qty}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-blue-700 whitespace-nowrap">
                {formatPriceVND(i.qty * i.price)}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-2">
          <input
            value={coupon}
            onChange={(e) => onCouponChange(e.target.value)}
            placeholder="Mã giảm giá"
            className="flex-1 text-gray-700 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          <button
            onClick={() => onCouponChange(coupon.trim())}
            className="rounded-xl text-blue-700 border border-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
          >
            Áp dụng
          </button>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Tạm tính</span>
            <span className="font-medium">{formatPriceVND(subtotal)}</span>
          </div>
          <div className="flex text-gray-700 justify-between">
            <span>Phí vận chuyển</span>
            <span className="font-medium">{formatPriceVND(shippingFee)}</span>
          </div>
          <div className="flex text-gray-700 justify-between">
            <span>Giảm giá</span>
            <span className="font-medium text-emerald-600">
              - {formatPriceVND(discount)}
            </span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-700">Tổng</span>
            <span className="font-semibold text-blue-700">
              {formatPriceVND(total)}
            </span>
          </div>
        </div>

        <button
          disabled={isEmpty}
          className="mt-7 w-full rounded-xl bg-blue-700 text-white py-4 text-base font-semibold shadow-lg hover:bg-blue-800 transition disabled:opacity-50"
          onClick={async () => {
            const orderCode = Date.now();
            const res = await fetch("/api/payments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCode,
                amount: total,
                description: "Thanh toán đơn hàng #" + orderCode,
              }),
            });
            const data = await res.json();

            if (data?.data?.checkoutUrl) {
              window.location.href = data.data.checkoutUrl;
            } else {
              alert("Tạo thanh toán thất bại!");
            }
          }}
        >
          Đặt hàng
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Bằng cách đặt hàng, bạn đồng ý với{" "}
          <span className="underline">Điều khoản & Chính sách</span>.
        </p>
      </div>
    </div>
  );
}
