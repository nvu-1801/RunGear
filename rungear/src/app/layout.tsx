import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { GlobalLoading } from "@/components/common/GlobalLoading";
export const metadata: Metadata = {
  title: "Shop",
  description: "Next.js + Supabase storefront",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children} <GlobalLoading />
        </Providers>
      </body>
    </html>
  );
}
