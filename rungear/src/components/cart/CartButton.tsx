"use client";

import { useCart } from "@/components/cart/cart-store";

export default function CartButton() {
  const { open, count } = useCart();
  return (
    <button
      onClick={open}
      aria-label="Giỏ hàng"
      className="relative p-2 rounded-md text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[11px] leading-[18px] text-center">
          {count}
        </span>
      )}
    </button>
  );
}
