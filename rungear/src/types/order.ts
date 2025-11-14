// src/types/order.ts
export type OrderStatus = "PENDING" | "PROCESSING" | "PAID" | "CANCELLED" | "FAILED";

export type ProductLite = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string | string[] | null;
  stock: number;
  status: string;
};

export type OrderItem = {
  id: string;
  qty: number;
  price_at_time: number;
  product: ProductLite | null;
};

export type ShippingAddress = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line?: string | null;
  district?: string | null;
  province?: string | null;
  note?: string | null;
} | null;

export type OrderDetail = {
  id: string;
  order_code: string;
  created_at: string;
  status: OrderStatus;          // 👈 dùng enum chuẩn luôn
  total: number;
  amount: number;
  discount_amount: number;
  shipping_address: ShippingAddress;
  order_items: OrderItem[];
};
