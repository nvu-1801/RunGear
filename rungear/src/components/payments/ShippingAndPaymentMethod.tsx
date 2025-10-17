import { formatPriceVND } from "@/shared/price";

type Props = {
  shipping: "standard" | "fast";
  onShippingChange: (v: "standard" | "fast") => void;
  shippingFee: number;
};

export function ShippingAndPaymentMethod({
  shipping,
  onShippingChange,
  shippingFee,
}: Props) {
  return (
    <section className="rounded-2xl border bg-white p-8 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Vận chuyển & thanh toán
      </h2>

      <div>
        <p className="text-sm text-gray-600 mb-2 font-medium">
          Phương thức vận chuyển
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onShippingChange("standard")}
            className={`rounded-xl border px-4 py-4 text-left transition font-medium ${
              shipping === "standard"
                ? "ring-2 ring-blue-400 bg-blue-50 border-blue-400 text-blue-700"
                : "hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <div>Tiêu chuẩn</div>
            <div className="text-sm text-gray-500">
              {shippingFee === 0 && shipping === "standard"
                ? "Miễn phí (đơn > 300.000đ)"
                : formatPriceVND(20000)}
              {" • "}2–4 ngày
            </div>
          </button>
          <button
            onClick={() => onShippingChange("fast")}
            className={`rounded-xl border px-4 py-4 text-left transition font-medium ${
              shipping === "fast"
                ? "ring-2 ring-blue-400 bg-blue-50 border-blue-400 text-blue-700"
                : "hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <div>Nhanh</div>
            <div className="text-sm text-gray-500">
              {formatPriceVND(35000)} • 24–48h
            </div>
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2 font-medium">
          Phương thức thanh toán
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
            <input
              name="pm"
              type="radio"
              defaultChecked
              className="accent-blue-600"
            />{" "}
            COD
          </label>
          <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
            <input name="pm" type="radio" className="accent-blue-600" /> Momo/VietQR
          </label>
          <label className="rounded-xl border px-4 py-4 flex items-center gap-2 text-gray-700 cursor-pointer font-medium transition hover:bg-blue-50 hover:border-blue-300">
            <input name="pm" type="radio" className="accent-blue-600" /> Thẻ nội địa
          </label>
        </div>
      </div>
    </section>
  );
}