"use client";
import { CartProvider } from "@/components/cart/cart-store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
