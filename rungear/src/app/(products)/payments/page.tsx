"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-store";
import { PaymentHeader } from "../../../components/payments/PaymentHeader";
import { ShippingInfoForm } from "../../../components/payments/ShippingInfoForm";
import { ShippingAndPaymentMethod } from "../../../components/payments/ShippingAndPaymentMethod";
import { OrderSummary } from "../../../components/payments/OrderSummary";
import {
  SavedAddresses,
  type Address,
} from "../../../components/payments/SavedAddresses";

type ShippingData = {
  full_name: string;
  phone: string;
  email: string;
  address_line: string;
  province: string;
  district: string;
  note?: string;
};

// kiểu order khi retry (tuỳ DB bạn chỉnh cho đúng)
type RetryOrder = {
  order_code: string;
  total: number;
  discount_amount: number;
  shipping_address: {
    full_name: string;
    phone: string;
    email: string;
    address_line: string;
    province: string;
    district: string;
    note?: string | null;
  } | null;
  order_items: Array<{
    id: string;
    qty: number;
    price_at_time: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[] | string | null;
    } | null;
  }>;
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const orderCodeFromQuery = searchParams.get("order"); // ?order=...
  const isRetry = !!orderCodeFromQuery;

  const { items, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<"standard" | "fast">("standard");

  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  // Địa chỉ demo
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "Nhà riêng",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "a@example.com",
      address: "123 Đường ABC",
      province: "TP.HCM",
      district: "Quận 1",
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const shippingFee =
    shipping === "fast" ? 35000 : subtotal > 300000 ? 0 : 20000;
  const discount = useMemo(() => {
    if (coupon.trim().toUpperCase() === "MCHEF10")
      return Math.round(subtotal * 0.1);
    return 0;
  }, [coupon, subtotal]);

  const total = Math.max(0, subtotal + shippingFee - discount);
  const isEmpty = items.length === 0;

  const handleShippingChange = (data: ShippingData) => {
    setShippingData(data);
  };

  const handleAddAddress = (addr: Omit<Address, "id">) => {
    const newAddr: Address = { ...addr, id: Date.now().toString() };
    setAddresses((prev) => [...prev, newAddr]);
  };

  const handleEditAddress = (id: string, addr: Omit<Address, "id">) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...addr, id } : a))
    );
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddress?.id === id) setSelectedAddress(null);
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
  };

  /* ================== FLOW RETRY: load order theo orderCode ================== */
  const [retryOrder, setRetryOrder] = useState<RetryOrder | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    if (!isRetry || !orderCodeFromQuery) return;

    setRetryLoading(true);
    (async () => {
      try {
        // bạn tự tạo API này: GET /api/orders/by-code?code=...
        const res = await fetch(
          `/api/orders/by-code?code=${encodeURIComponent(orderCodeFromQuery)}`
        );
        const json = await res.json();
        if (!json.success || !json.data) {
          console.error("Không tìm thấy đơn khi retry", json);
          setRetryOrder(null);
        } else {
          setRetryOrder(json.data as RetryOrder);
        }
      } catch (e) {
        console.error("Lỗi load order khi retry:", e);
        setRetryOrder(null);
      } finally {
        setRetryLoading(false);
      }
    })();
  }, [isRetry, orderCodeFromQuery]);

  /* ================== RENDER ================== */

  // Nếu đang retry
  if (isRetry) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <PaymentHeader />

          {retryLoading ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
              <p className="text-lg font-semibold text-gray-700">
                Đang tải đơn hàng...
              </p>
            </div>
          ) : !retryOrder ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
              <p className="text-lg font-semibold text-gray-700">
                Không tìm thấy đơn hàng cần thanh toán lại
              </p>
              <Link
                href="/home"
                className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
              >
                Quay lại mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Có thể show info đơn / shipping address ở đây nếu muốn */}
                <div className="rounded-2xl border bg-white p-6 shadow">
                  <p className="text-sm text-gray-600">
                    Thanh toán lại cho đơn{" "}
                    <span className="font-mono font-semibold text-blue-700">
                      {retryOrder.order_code}
                    </span>
                  </p>
                </div>
              </div>

              <aside className="md:col-span-1">
                {(() => {
                  const itemsFromOrder = retryOrder.order_items.map((it) => ({
                    id: it.product?.id ?? it.id,
                    slug: it.product?.slug ?? String(it.product?.id ?? it.id),
                    name: it.product?.name ?? "Sản phẩm",
                    variant: null,
                    qty: it.qty,
                    price: it.price_at_time,
                    image: Array.isArray(it.product?.images)
                      ? it.product?.images?.[0]
                      : it.product?.images ?? undefined,
                  }));

                  const subtotalFromOrder = itemsFromOrder.reduce(
                    (s, i) => s + i.qty * i.price,
                    0
                  );

                  const addr = retryOrder.shipping_address;

                  const shippingAddress: ShippingData | null = addr
                    ? {
                        full_name: addr.full_name,
                        phone: addr.phone,
                        email: addr.email,
                        address_line: addr.address_line,
                        province: addr.province,
                        district: addr.district,
                        note: addr.note ?? undefined,
                      }
                    : null;

                  return (
                    <OrderSummary
                      items={itemsFromOrder}
                      subtotal={subtotalFromOrder}
                      discount={retryOrder.discount_amount ?? 0}
                      total={retryOrder.total}
                      coupon={coupon}
                      onCouponChange={setCoupon}
                      isEmpty={itemsFromOrder.length === 0}
                      shippingAddress={shippingAddress}
                      existingOrderCode={retryOrder.order_code} // 👈 CHỖ NÀY
                    />
                  );
                })()}
              </aside>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Flow checkout bình thường (dùng giỏ hàng)
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <PaymentHeader />

        {isEmpty ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-700">
              Giỏ hàng trống
            </p>
            <p className="text-gray-500 mt-2">
              Hãy thêm sản phẩm để tiếp tục thanh toán.
            </p>
            <Link
              href="/home"
              className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <SavedAddresses
                addresses={addresses}
                onSelectAddress={handleSelectAddress}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
              />

              <ShippingInfoForm
                note={note}
                onNoteChange={setNote}
                selectedAddress={selectedAddress}
                onShippingChange={handleShippingChange}
                onChange={handleShippingChange}
              />

              <ShippingAndPaymentMethod
                shipping={shipping}
                onShippingChange={setShipping}
                shippingFee={shippingFee}
              />
            </div>

            <aside className="md:col-span-1">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                discount={discount}
                total={total}
                coupon={coupon}
                onCouponChange={setCoupon}
                isEmpty={isEmpty}
                shippingAddress={shippingData}
                // ❌ KHÔNG truyền existingOrderCode ở flow tạo đơn mới
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
