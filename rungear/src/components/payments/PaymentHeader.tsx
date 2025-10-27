import Link from "next/link";

export function PaymentHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-800">
        Thanh toán
      </h1>
      <Link
        href="/cart"
        className="text-sm text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline font-medium"
      >
        ← Quay lại giỏ hàng
      </Link>
    </div>
  );
}