import Link from "next/link";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { AuthProvider } from "@/components/auth/AuthContext";
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
    <AuthProvider value={{ user, isAdmin }}>
      <div className="min-h-dvh flex flex-col bg-white">
        {/* HEADER - Slide down animation */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm animate-in slide-in-from-top duration-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-16 sm:h-20 flex items-center justify-between">
              {/* Logo - Fade in + scale */}
              <Link
                href="/home"
                className="flex flex-col leading-tight px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group animate-in fade-in zoom-in-95 duration-700 delay-100"
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-105">
                  RunGear
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-blue-500 transition">
                  Phong cách & cá tính
                </span>
              </Link>

              {/* DESKTOP RIGHT GROUP - Stagger animation */}
              <div className="hidden md:flex items-center justify-center gap-8 lg:gap-10 text-sm font-medium text-gray-700">
                {/* USER DROPDOWN - Hover */}
                <div className="relative group animate-in fade-in slide-in-from-top duration-700 delay-200">
                  {/* Trigger */}
                  <button
                    type="button"
                    className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition-all duration-300 hover:scale-110 active:scale-95 select-none focus:outline-none"
                    aria-haspopup="menu"
                    aria-expanded="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="mt-1">Tài khoản</span>
                  </button>

                  {/* Dropdown content - show on hover */}
                  <div
                    className="
                      absolute left-1/2 -translate-x-1/2 top-full mt-3
                      hidden group-hover:flex
                      flex-col bg-white border border-gray-200 rounded-xl shadow-xl w-60 py-2 z-50
                      animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200
                    "
                    role="menu"
                  >
                    {user ? (
                      <>
                        {!isAdmin && (
                          <Link
                            href="/profile"
                            className="px-4 py-2 text-sm hover:bg-blue-50 rounded-t-xl transition-all duration-200 hover:translate-x-1"
                            role="menuitem"
                          >
                            Hồ sơ của tôi
                          </Link>
                        )}

                        {isAdmin && (
                          <div className="border-t border-gray-100 mt-1 pt-2 px-4 pb-1">
                            <div className="flex flex-col gap-1 text-sm">
                              <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                                role="menuitem"
                              >
                                Dashboard
                              </Link>
                              <Link
                                href="/admin/products"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                                role="menuitem"
                              >
                                Manage Products
                              </Link>
                              <Link
                                href="/admin/discount-codes"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                                role="menuitem"
                              >
                                Mã giảm giá
                              </Link>
                              <Link
                                href="/admin/support"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                                role="menuitem"
                              >
                                Support Chat
                              </Link>
                            </div>
                          </div>
                        )}

                        {!isAdmin && (
                          <Link
                            href="/orders"
                            className="px-4 py-2 text-sm hover:bg-blue-50 transition-all duration-200 hover:translate-x-1"
                            role="menuitem"
                          >
                            Đơn hàng của tôi
                          </Link>
                        )}

                        <div className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 rounded-b-xl transition-all duration-200 hover:translate-x-1">
                          <SignOutButton />
                        </div>
                      </>
                    ) : (
                      <Link
                        href="/auth/signin"
                        className="block px-4 py-2 text-sm hover:bg-blue-50 transition-all duration-200 hover:translate-x-1"
                        role="menuitem"
                      >
                        Đăng nhập
                      </Link>
                    )}
                  </div>
                </div>

                {/* SUPPORT DROPDOWN - Hover */}
                <div className="relative group animate-in fade-in slide-in-from-top duration-700 delay-300">
                  {/* Trigger */}
                  <button
                    type="button"
                    className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition-all duration-300 hover:scale-110 active:scale-95 select-none focus:outline-none"
                    aria-haspopup="menu"
                    aria-expanded="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12h6m2 4H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
                    </svg>
                    <span className="mt-1">Hỗ trợ</span>
                  </button>

                  <div
                    className="
                      absolute left-1/2 -translate-x-1/2 top-full mt-3
                      hidden group-hover:flex
                      flex-col bg-white border border-gray-200 rounded-xl shadow-xl w-60 py-2 z-50
                      animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200
                    "
                    role="menu"
                  >
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                      role="menuitem"
                    >
                      <span className="text-lg">🎯</span> Theo dõi đơn hàng
                    </Link>
                    <Link
                      href="/support/returns"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                      role="menuitem"
                    >
                      <span className="text-lg">🔁</span> Đổi trả & Bảo hành
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:translate-x-1"
                      role="menuitem"
                    >
                      <span className="text-lg">💬</span> Liên hệ CSKH
                    </Link>
                  </div>
                </div>

                {/* CART */}
                <div className="flex flex-col items-center hover:text-blue-600 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-top duration-700 delay-[400ms]">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <CartButton />
                  </div>
                  <span className="mt-1 select-none">Giỏ hàng</span>
                </div>
              </div>

              {/* MOBILE MENU BUTTON - Delay 500ms */}
              <label
                htmlFor="mobile-menu-toggle"
                className="md:hidden flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95 animate-in fade-in slide-in-from-right duration-700 delay-500"
              >
                <CartButton />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-gray-700 transition-transform duration-300 hover:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
            </div>
          </div>

          {/* MOBILE MENU - Smooth expand */}
          <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />
          <div
            className="
              md:hidden 
              bg-white border-t border-gray-200 shadow-inner 
              max-h-0 overflow-hidden peer-checked:max-h-[600px] 
              transition-all duration-500 ease-in-out
              peer-checked:animate-in peer-checked:slide-in-from-top peer-checked:fade-in
            "
          >
            <div className="flex flex-col px-6 py-3 space-y-2 text-gray-700 text-sm font-medium">
              {user ? (
                <>
                  {/* ADMIN */}
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500 delay-75"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        className="py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500 delay-100"
                      >
                        Manage Products
                      </Link>
                      <hr className="my-2 border-gray-200 animate-in fade-in duration-500" />
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500 delay-75"
                      >
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        href="/orders"
                        className="py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500 delay-100"
                      >
                        Đơn hàng của tôi
                      </Link>
                      <hr className="my-2 border-gray-200 animate-in fade-in duration-500" />
                    </>
                  )}

                  {/* SUPPORT */}
                  <span className="uppercase text-xs text-gray-400 tracking-wide animate-in fade-in slide-in-from-left duration-500">
                    Hỗ trợ
                  </span>
                  <Link
                    href="/orders/track"
                    className="flex items-center gap-2 py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500"
                  >
                    🎯 <span>Theo dõi đơn hàng</span>
                  </Link>
                  <Link
                    href="/support/returns"
                    className="flex items-center gap-2 py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500"
                  >
                    🔁 <span>Đổi trả & Bảo hành</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500"
                  >
                    💬 <span>Liên hệ CSKH</span>
                  </Link>
                  <hr className="my-3 border-gray-200 animate-in fade-in duration-500" />
                  <div className="animate-in fade-in slide-in-from-left duration-500">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="py-2 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 animate-in fade-in slide-in-from-left duration-500"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* BODY - Fade in + slide up */}
        <main className="flex-1 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          {children}
        </main>

        {/* FOOTER - Slide up animation */}
        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}
