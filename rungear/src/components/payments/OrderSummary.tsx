import { useState, useEffect } from "react";
import { formatPriceVND } from "@/shared/price";
import type { CartItem } from "@/components/cart/cart-store";

type DiscountCode = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  percent_off: number | null;
  amount_off: number | null;
  start_at: string;
  end_at: string | null;
  enabled: boolean;
  max_uses: number | null;
  uses_count: number;
  per_user_limit: number;
  min_order_amount: number;
};

type Props = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: string;
  onCouponChange: (v: string) => void;
  isEmpty: boolean;
  shippingAddress?: {
    full_name: string;
    phone: string;
    email: string;
    address_line: string;
    province: string;
    district: string;
    note?: string;
  } | null;

  existingOrderCode?: string | null;
};

const DEFAULT_SHIPPING_FEE = 20000; // 20k
const FREE_SHIPPING_THRESHOLD = 300000; // 300k

export function OrderSummary({
  items,
  subtotal,
  discount,
  total,
  coupon,
  onCouponChange,
  isEmpty,
  shippingAddress, // ← NHẬN prop
  existingOrderCode,
}: Props) {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [appliedCode, setAppliedCode] = useState<DiscountCode | null>(null);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  console.log("Shipping Address in OrderSummaryoidoioi:", shippingAddress);

  // Load discount codes on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/discount-codes");
        const json = await res.json();
        if (json.success) {
          setDiscountCodes(json.data ?? []);
        }
      } catch (e) {
        console.error("Load discount codes error:", e);
      }
    })();
  }, []);

  // Filter valid discount codes
  const validCodes = discountCodes.filter((dc) => {
    if (!dc.enabled) return false;
    const now = new Date();
    const start = new Date(dc.start_at);
    const end = dc.end_at ? new Date(dc.end_at) : null;
    if (now < start || (end && now > end)) return false;
    if (subtotal < dc.min_order_amount) return false;
    if (dc.max_uses !== null && dc.uses_count >= dc.max_uses) return false;
    return true;
  });

  // Calculate shipping fee
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

  // Calculate discount when applied code changes
  const calculatedDiscount = appliedCode
    ? appliedCode.type === "percent"
      ? Math.round(subtotal * ((appliedCode.percent_off ?? 0) / 100))
      : appliedCode.amount_off ?? 0
    : 0;

  const finalTotal = Math.max(0, subtotal + shippingFee - calculatedDiscount);

  // ← THÊM hàm xử lý đặt hàng
 const handlePlaceOrder = async () => {
  // 1. Validate shipping address
  if (!shippingAddress) {
    alert("Vui lòng điền thông tin giao hàng!");
    return;
  }

  if (
    !shippingAddress.full_name ||
    !shippingAddress.phone ||
    !shippingAddress.email ||
    !shippingAddress.address_line ||
    !shippingAddress.province ||
    !shippingAddress.district
  ) {
    alert("Vui lòng điền đầy đủ thông tin giao hàng!");
    return;
  }

  setIsProcessing(true);

  try {
    let currentOrderCode = existingOrderCode ?? null;

    // 🔹 Nếu KHÔNG có existingOrderCode => checkout bình thường (tạo đơn mới)
    if (!currentOrderCode) {
      const orderPayload = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          variant: item.variant ?? null,
          qty: item.qty,
          price: item.price,
        })),
        discount_code_id: appliedCode?.id ?? null,
        shipping_address: {
          full_name: shippingAddress.full_name,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          address_line: shippingAddress.address_line,
          province: shippingAddress.province,
          district: shippingAddress.district,
          note: shippingAddress.note || null,
        },
        subtotal: subtotal,
        discount: calculatedDiscount,
        shipping_fee: shippingFee,
        total: finalTotal,
      };

      console.log("Creating order with payload:", orderPayload);

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await orderRes.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Tạo đơn hàng thất bại");
      }

      const { orderId, orderCode } = orderResult.data;
      console.log("Order created::::", { orderId, orderCode });
      currentOrderCode = orderCode;
    } else {
      console.log("🔁 Retry thanh toán cho order:", currentOrderCode);
    }

    // 2. Gọi API tạo payment link với currentOrderCode
    const paymentRes = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderCode: currentOrderCode,
        amount: finalTotal,
        description: `Thanh toán đơn hàng`,
        discountCodeId: appliedCode?.id ?? null,
      }),
    });

    const paymentResult = await paymentRes.json();
    const checkoutUrl = paymentResult?.data?.checkoutUrl;

    if (!checkoutUrl) {
      throw new Error(
        paymentResult?.desc ||
          paymentResult?.message ||
          "Tạo link thanh toán thất bại"
      );
    }

    console.log("Payment link created:", checkoutUrl);

    // 3. Redirect đến PayOS
    window.location.href = checkoutUrl;
  } catch (error: any) {
    console.error("Place order error:", error);
    alert(error.message || "Có lỗi xảy ra khi đặt hàng!");
    setIsProcessing(false);
  }
};


  const handleApplyCoupon = () => {
    setMessage("");
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setMessage("Vui lòng nhập mã giảm giá");
      setAppliedCode(null);
      return;
    }

    const found = discountCodes.find(
      (dc) => dc.code.toUpperCase() === code && dc.enabled
    );

    if (!found) {
      setMessage("❌ Mã giảm giá không tồn tại hoặc đã ngừng hoạt động");
      setAppliedCode(null);
      return;
    }

    // Check date validity
    const now = new Date();
    const start = new Date(found.start_at);
    const end = found.end_at ? new Date(found.end_at) : null;
    if (now < start) {
      setMessage("❌ Mã giảm giá chưa có hiệu lực");
      setAppliedCode(null);
      return;
    }
    if (end && now > end) {
      setMessage("❌ Mã giảm giá đã hết hạn");
      setAppliedCode(null);
      return;
    }

    // Check min order amount
    if (subtotal < found.min_order_amount) {
      setMessage(
        `❌ Đơn hàng tối thiểu ${formatPriceVND(found.min_order_amount)}`
      );
      setAppliedCode(null);
      return;
    }

    // Check max uses
    if (found.max_uses !== null && found.uses_count >= found.max_uses) {
      setMessage("❌ Mã giảm giá đã hết lượt sử dụng");
      setAppliedCode(null);
      return;
    }

    // Success
    setAppliedCode(found);
    const discountAmount =
      found.type === "percent"
        ? Math.round(subtotal * ((found.percent_off ?? 0) / 100))
        : found.amount_off ?? 0;
    setMessage(`✅ Áp dụng thành công! Giảm ${formatPriceVND(discountAmount)}`);
  };

  const handleSelectCode = (codeId: string) => {
    if (!codeId) {
      setAppliedCode(null);
      setMessage("");
      onCouponChange("");
      return;
    }

    const found = discountCodes.find((dc) => dc.id === codeId);
    if (found) {
      setAppliedCode(found);
      onCouponChange(found.code);
      const discountAmount =
        found.type === "percent"
          ? Math.round(subtotal * ((found.percent_off ?? 0) / 100))
          : found.amount_off ?? 0;
      setMessage(
        `✅ Áp dụng thành công! Giảm ${formatPriceVND(discountAmount)}`
      );
    }
  };

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

        <div className="mt-5 space-y-3">
          {/* Select dropdown cho mã giảm giá có sẵn */}
          {validCodes.length > 0 && (
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                Chọn mã giảm giá có sẵn
              </label>
              <select
                value={appliedCode?.id ?? ""}
                onChange={(e) => handleSelectCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5
             text-sm shadow-sm outline-none transition
             focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">-- Chọn mã giảm giá --</option>
                {validCodes.map((dc) => {
                  const discountDisplay =
                    dc.type === "percent"
                      ? `${dc.percent_off}%`
                      : formatPriceVND(dc.amount_off ?? 0);
                  const minOrderDisplay =
                    dc.min_order_amount > 0
                      ? ` (Đơn tối thiểu ${formatPriceVND(
                          dc.min_order_amount
                        )})`
                      : "";
                  return (
                    <option key={dc.id} value={dc.id}>
                      {dc.code} - Giảm {discountDisplay}
                      {minOrderDisplay}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Input nhập thủ công */}
          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-medium">
              Hoặc nhập mã giảm giá
            </label>
            <div className="flex items-center gap-2">
              <input
                value={coupon}
                onChange={(e) => onCouponChange(e.target.value)}
                placeholder="Mã giảm giá"
                className="flex-1 text-gray-700 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
              <button
                onClick={handleApplyCoupon}
                className="rounded-xl text-blue-700 border border-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
          {appliedCode && (
            <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="font-semibold text-blue-700">
                🎟️ {appliedCode.code}
              </span>
              <button
                onClick={() => {
                  setAppliedCode(null);
                  setMessage("");
                  onCouponChange("");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Tạm tính</span>
            <span className="font-medium">{formatPriceVND(subtotal)}</span>
          </div>
          <div className="flex text-gray-700 justify-between">
            <span>Phí vận chuyển</span>
            <span className="font-medium">
              {shippingFee === 0 ? (
                <span className="text-green-600 font-semibold">
                  Miễn phí ✨
                </span>
              ) : (
                formatPriceVND(shippingFee)
              )}
            </span>
          </div>
          {shippingFee > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              💡 Mua thêm{" "}
              <span className="font-semibold">
                {formatPriceVND(FREE_SHIPPING_THRESHOLD - subtotal)}
              </span>{" "}
              để được miễn phí ship!
            </div>
          )}
          <div className="flex text-gray-700 justify-between">
            <span>Giảm giá</span>
            <span className="font-medium text-emerald-600">
              - {formatPriceVND(calculatedDiscount)}
            </span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-700">Tổng</span>
            <span className="font-semibold text-blue-700">
              {formatPriceVND(finalTotal)}
            </span>
          </div>
        </div>

        <button
          disabled={isEmpty || isProcessing}
          className="mt-7 w-full rounded-xl bg-blue-700 text-white py-4 text-base font-semibold shadow-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePlaceOrder}
        >
          {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Bằng cách đặt hàng, bạn đồng ý với{" "}
          <span className="underline">Điều khoản & Chính sách</span>.
        </p>
      </div>
    </div>
  );
}
