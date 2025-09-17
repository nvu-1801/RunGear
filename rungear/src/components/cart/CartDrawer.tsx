"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/modules/cart/cart-store";
import { formatPriceVND } from "@/shared/price";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, items, updateQty, remove, subtotal, clear } =
    useCart();

  const gotoCheckout = () => {
    close(); // đóng drawer cho gọn
    router.push("/payments"); // đổi đường dẫn cho khớp trang bạn tạo
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } z-[80]`}
        onClick={close}
      />
      {/* Drawer: cũng cần z cao */}
      <aside
        className={`fixed right-0 top-0 h-full w-[360px] max-w-[90vw] bg-white shadow-2xl border-l transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-[81]`}
        aria-hidden={!isOpen}
      >
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="font-semibold text-gray-700">Giỏ hàng</div>
          <button onClick={close} className="p-2 rounded hover:bg-gray-50">
            ✕
          </button>
        </div>

        <div className="h-[calc(100%-56px-160px)] overflow-auto px-3 py-2 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-500 px-1 pt-2">Chưa có sản phẩm.</p>
          )}
          {items.map((it) => (
            <div
              key={it.id + (it.variant ?? "")}
              className="flex gap-3 border text-gray-700 rounded-lg p-2"
            >
              <div className="w-16 h-16 text-gray-700 rounded overflow-hidden border bg-gray-50 shrink-0">
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium line-clamp-2">
                  {it.name}
                </div>
                {it.variant && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Màu: {it.variant}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center border rounded">
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQty(it.id, -1)}
                    >
                      -
                    </button>
                    <div className="w-8 text-center text-sm">{it.qty}</div>
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQty(it.id, +1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPriceVND(it.price * it.qty)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(it.id)}
                className="p-1 text-gray-500 hover:text-black"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-semibold text-gray-700">
              {formatPriceVND(subtotal)}
            </span>
          </div>

          <button
            className="w-full h-10 rounded-md bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            onClick={gotoCheckout}
            disabled={items.length === 0}
          >
            Thanh toán
          </button>

          <div className="flex items-center justify-between">
            <Link href="/payments" className="text-sm text-gray-500 underline">
              Xem giỏ hàng
            </Link>
            <button
              onClick={clear}
              className="text-sm text-gray-500 hover:text-black"
            >
              Xoá tất cả
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
