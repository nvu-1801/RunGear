"use client";
import { useState } from "react";
import { CartProvider } from "@/components/cart/cart-store";
import CartDrawer from "@/components/cart/CartDrawer";
import ChatbotButton from "@/components/chat/ChatbotButton";
import ChatCenterModal from "@/components/chat/ChatCenterModal";

export default function Providers({ children }: { children: React.ReactNode }) {
   const [open, setOpen] = useState(false);
  return (
    <CartProvider>
      {children}
      <CartDrawer />
       <ChatbotButton onOpen={() => setOpen(true)} />
      <ChatCenterModal open={open} onClose={() => setOpen(false)} />
    </CartProvider>
  );
}
