"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-store";
import { PaymentHeader } from "../../../components/payments/PaymentHeader";
import { ShippingInfoForm } from "../../../components/payments/ShippingInfoForm";
import { ShippingAndPaymentMethod } from "../../../components/payments/ShippingAndPaymentMethod";
import { OrderSummary } from "../../../components/payments/OrderSummary";
import { SavedAddresses, type Address } from "../../../components/payments/SavedAddresses";


  // ← THÊM type cho shipping data
type ShippingData = {
  full_name: string;
  phone: string;
  email: string;
  address_line: string;
  province: string;
  district: string;
  note?: string;
};

export default function PaymentsPage() {
  const { items, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<"standard" | "fast">("standard");

  // ← THÊM state để lưu shipping data
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  // Quản lý địa chỉ đã lưu (demo: dùng state local, thực tế nên lưu DB)
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

  // ← THÊM callback để nhận data từ ShippingInfoForm
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
              href="/products/home"
              className="inline-flex mt-6 rounded-xl border border-blue-600 text-blue-700 px-6 py-2.5 text-sm font-semibold hover:bg-blue-50 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Địa chỉ đã lưu */}
              <SavedAddresses
                addresses={addresses}
                onSelectAddress={handleSelectAddress}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
              />


              {/* Form thông tin nhận hàng */}
              <ShippingInfoForm
                note={note}
                onNoteChange={setNote}
                selectedAddress={selectedAddress}
                onShippingChange={handleShippingChange}
                onChange={handleShippingChange} 
              />

              {/* Vận chuyển & thanh toán */}
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
                // shippingFee={shippingFee}
                discount={discount}
                total={total}
                coupon={coupon}
                onCouponChange={setCoupon}
                isEmpty={isEmpty}
                shippingAddress={shippingData}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
