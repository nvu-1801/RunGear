"use client";
import { CartProvider } from "@/components/cart/cart-store";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer /> {/* đảm bảo Drawer dùng đúng context */}
    </CartProvider>
  );
}
