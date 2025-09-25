import Link from "next/link";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import SignOutButton from "@/components/auth/SignOutButton";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { GlobalLoading } from "@/components/common/GlobalLoading";
import AdminDropdown from "@/components/common/AdminDropdown";
import Footer from "@/components/common/Footer";

export default async function ProductsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // đọc role từ profiles
  let isAdmin = false;
  if (user) {
    const { data: prof } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = prof?.role === "admin";
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <GlobalLoading />
      <header className="sticky top-4 z-50 mx-4 md:mx-6 bg-white/90 backdrop-blur border rounded-2xl shadow-lg transition-all">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-24 flex flex-row items-center gap-8">
            {/* Brand */}
            <Link
              href="/home"
              className="leading-tight shrink-0 px-3 py-2 rounded-xl hover:bg-gray-100 transition group"
            >
              <div className="text-4xl font-extrabold text-gray-900 tracking-tight group-hover:text-blue-700 transition">
                Run Gear
              </div>
              <div className="text-xs text-gray-500 group-hover:text-blue-500 transition">
                Phong cách & cá tính
              </div>
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex md:flex-row flex-1 justify-center items-center gap-4 text-[15px] text-gray-700 font-medium">
              <Link
                href="/home"
                className="px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
              >
                Cửa hàng
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
              >
                Giới thiệu
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
              >
                Hỏi đáp
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
              >
                Liên hệ
              </Link>
            </nav>

            {/* Right */}
            <div className="flex flex-row items-center gap-3 shrink-0">
              <AdminDropdown isAdmin={isAdmin} />

              {/* Search */}
              {/* <form className="relative hidden sm:block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input
                  name="q"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-200 text-gray-900 bg-white transition"
                />
              </form> */}

              {/* Auth */}
              {user ? (
                <SignOutButton />
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              )}

              <CartButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <CartDrawer />
      <Footer />
    </div>
  );
}
