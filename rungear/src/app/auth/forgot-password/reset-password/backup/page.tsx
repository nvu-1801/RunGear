"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";




export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  // Validation token khi component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Lấy access_token từ URL (Supabase redirect về)

        const accessToken = searchParams.get("access_token");
        const type = searchParams.get("type");

        // Kiểm tra có token và type=recovery không
        if (!accessToken || type !== "recovery") {
          setError("Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu reset lại.");
          setValidatingToken(false);
          setTokenValid(false);
          
          // Redirect về trang forgot-password sau 3 giây
          setTimeout(() => {
            router.push("/auth/forgot-password");
          }, 3000);
          return;
        }

        // Verify token với Supabase
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
          setError("Phiên làm việc không hợp lệ. Vui lòng yêu cầu reset lại.");
          setValidatingToken(false);
          setTokenValid(false);
          
          setTimeout(() => {
            router.push("/auth/forgot-password");
          }, 3000);
          return;
        }

        // Token hợp lệ
        setTokenValid(true);
      } catch (err) {
        setError("Có lỗi xảy ra khi xác thực. Vui lòng thử lại.");
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [searchParams, router]);

  // Validation
  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 6 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!passwordsMatch) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      // Gọi Supabase Auth để update password
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
      // Tự động chuyển về trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Loading state khi đang validate token
  if (validatingToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xác thực...</p>
      </div>
    );
  }

  // Token không hợp lệ
  if (!tokenValid) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 font-medium mb-2">⚠️ Truy cập không hợp lệ</p>
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            → Yêu cầu reset mật khẩu mới
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/auth/signin" className="inline-flex items-center text-coral-500 mb-6">
        <span className="text-2xl mr-2">←</span>
        <span className="text-lg font-medium">Đặt lại mật khẩu</span>
      </Link>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coral-500"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${
                confirmPassword && !passwordsMatch
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-coral-500"
              }`}
              placeholder="Nhập lại mật khẩu"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-600 mt-1">
                ⚠ Mật khẩu xác nhận không khớp
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full rounded-lg bg-coral-500 px-4 py-3 text-white font-medium hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : "XÁC NHẬN"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-green-800 font-medium mb-1">
              ✓ Đổi mật khẩu thành công!
            </p>
            <p className="text-sm text-green-700">
              Đang chuyển về trang đăng nhập...
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            → Đăng nhập ngay
          </Link>
        </div>
      )}
    </div>
  );
}
