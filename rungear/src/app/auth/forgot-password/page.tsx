"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

// Validate email format
  const validateEmail = (email: string): boolean => {
    // Regex kiểm tra email format cơ bản + đuôi @gmail.com
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    return emailRegex.test(email.trim());
  };

  const handleSend = async () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email phải có định dạng hợp lệ và kết thúc bằng @gmail.com");
      return;
    }

    setLoading(true);
    setError("");

    console.log("Sending password reset request for email:", email);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gửi yêu cầu thất bại");
        return;
      }

      setSent(true);
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/auth/signin" className="inline-flex items-center text-coral-500 mb-6">
        <span className="text-2xl mr-2">←</span>
        <span className="text-lg font-medium">Đặt lại mật khẩu</span>
      </Link>

      {!sent ? (
        <div className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coral-500"
              placeholder="Email/Số Điện thoại"
            />
          </div>

          {/* Nút Send riêng */}
          <button
            onClick={handleSend}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? "Đang gửi..." : "Send"}
          </button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="w-full rounded-lg bg-coral-500 px-4 py-3 text-white font-medium hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang gửi..." : "TIẾP THEO"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            ✓ Đã gửi link đặt lại mật khẩu đến email của bạn.
          </div>
          <Link 
            href="/auth/signin" 
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      )}
    </div>
  );
}