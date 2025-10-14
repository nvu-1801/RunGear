import Link from "next/link";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import SignOutButton from "@/components/auth/SignOutButton";
import CartButton from "@/components/cart/CartButton";
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
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/home"
              className="flex flex-col leading-tight px-3 py-2 rounded-xl hover:bg-gray-100 transition group"
            >
              <span className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition">
                RunGear
              </span>
              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition">
                Phong cách & cá tính
              </span>
            </Link>

            {/* Right group */}
            <div className="flex items-center justify-center gap-10 text-sm font-medium text-gray-700">
              {/* USER DROPDOWN */}
              <div className="relative">
                <input type="checkbox" id="user-toggle" className="peer hidden" />

                <label
                  htmlFor="user-toggle"
                  className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition select-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="mt-1">Tài khoản</span>
                </label>

                {/* Dropdown */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 hidden peer-checked:flex flex-col bg-white border border-gray-200 rounded-xl shadow-xl w-60 py-2 z-50">
                  {user ? (
                    <>
                      {!isAdmin && (
                        <Link
                          href="/profile"
                          className="px-4 py-2 text-sm hover:bg-blue-50 rounded-t-xl transition"
                        >
                          Hồ sơ của tôi
                        </Link>
                      )}

                      {/* ADMIN */}
                      {isAdmin && (
                        <div className="border-t border-gray-100 mt-1 pt-2 px-4 pb-1">
                          <div className="flex flex-col gap-1 text-sm">
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50"
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/admin/products"
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50"
                            >
                              Manage Products
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* HIDDEN "Đơn hàng của tôi" IF ADMIN */}
                      {!isAdmin && (
                        <Link
                          href="/orders"
                          className="px-4 py-2 text-sm hover:bg-blue-50 transition"
                        >
                          Đơn hàng của tôi
                        </Link>
                      )}

                      <div>
                        <div className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 rounded-b-xl transition">
                          <SignOutButton />
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-2 text-sm hover:bg-blue-50 transition"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>

                {/* Click outside to close */}
                <label
                  htmlFor="user-toggle"
                  className="fixed inset-0 hidden peer-checked:block z-40"
                ></label>
              </div>

              {/* SUPPORT DROPDOWN */}
              <div className="relative">
                <input type="checkbox" id="support-toggle" className="peer hidden" />
                <label
                  htmlFor="support-toggle"
                  className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition select-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12h6m2 4H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
                  </svg>
                  <span className="mt-1">Hỗ trợ</span>
                </label>

                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 hidden peer-checked:flex flex-col bg-white border border-gray-200 rounded-xl shadow-xl w-60 py-2 z-50">
                  <Link
                    href="/orders/track"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    <span>🎯</span> Theo dõi đơn hàng
                  </Link>
                  <Link
                    href="/support/returns"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    <span>🔁</span> Đổi trả & Bảo hành
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50"
                  >
                    <span>💬</span> Liên hệ CSKH
                  </Link>
                </div>

                <label
                  htmlFor="support-toggle"
                  className="fixed inset-0 hidden peer-checked:block z-40"
                ></label>
              </div>

              {/* CART */}
              <div className="flex flex-col items-center hover:text-blue-600 transition">
                <div className="w-6 h-6 flex items-center justify-center">
                  <CartButton />
                </div>
                <span className="mt-1 select-none">Giỏ hàng</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
