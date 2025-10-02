"use client";
import { CartProvider } from "@/components/cart/cart-store";
import CartDrawer from "@/components/cart/CartDrawer";
import Chatbot from "@/components/chat/Chatbot";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <Chatbot />
    </CartProvider>
  );
}
