"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthTabs() {
  const pathname = usePathname();
  const isSignin = pathname?.includes("/auth/signin");

  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
      <Link
        href="/auth/signin"
        className={`px-6 py-2 rounded-full text-sm font-semibold transition
          ${
            isSignin
              ? "bg-blue-700 text-white shadow"
              : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
          }`}
      >
        Đăng nhập
      </Link>
      <Link
        href="/auth/signup"
        className={`px-6 py-2 rounded-full text-sm font-semibold transition
          ${
            !isSignin
              ? "bg-blue-700 text-white shadow"
              : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
          }`}
      >
        Đăng ký
      </Link>
    </div>
  );
}
