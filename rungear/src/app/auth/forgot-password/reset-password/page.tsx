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
        console.log("=== BẮT ĐẦU VALIDATE TOKEN ===");

        // ✅ Kiểm tra searchParams trước khi sử dụng
      if (!searchParams) {
        console.log("❌ searchParams is null");
        setError("Không thể đọc thông tin từ URL. Vui lòng thử lại.");
        setValidatingToken(false);
        setTokenValid(false);
        
        setTimeout(() => {
          router.push("/auth/forgot-password");
        }, 3000);
        return;
      }

        // ✅ Đọc query params (?access_token=...)
        const accessToken = searchParams.get("access_token");
        const type = searchParams.get("type");

        // ✅ Đọc hash params (#access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get("access_token");
        const hashType = hashParams.get("type");
        const hashRefreshToken = hashParams.get("refresh_token");

        console.log("🔍 Query params:", { accessToken, type });
        console.log("🔍 Hash params:", { 
          hashAccessToken: hashAccessToken?.substring(0, 20) + "...", 
          hashType 
        });

        // ✅ Ưu tiên hash (Supabase dùng hash)
        const finalAccessToken = hashAccessToken || accessToken;
        const finalType = hashType || type;

        console.log("🔍 Final values:", { 
          finalAccessToken: finalAccessToken?.substring(0, 20) + "...", 
          finalType 
        });

        // Kiểm tra có token và type=recovery không
        if (!finalAccessToken || finalType !== "recovery") {
          console.log("❌ Validation failed:", { 
            hasToken: !!finalAccessToken, 
            typeMatch: finalType === "recovery" 
          });
          setError("Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu reset lại.");
          setValidatingToken(false);
          setTokenValid(false);
          
          setTimeout(() => {
            router.push("/auth/forgot-password");
          }, 3000);
          return;
        }

        console.log("✅ Token và type hợp lệ, đang set session...");

        // Verify token với Supabase
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // ✅ Set session với token từ hash
        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token: finalAccessToken,
          refresh_token: hashRefreshToken || "",
        });

        console.log("🔐 Set session result:", {
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.session?.user,
          error: setSessionError
        });

        if (setSessionError || !sessionData.session) {
          console.log("❌ Session error:", setSessionError);
          setError("Phiên làm việc không hợp lệ. Vui lòng yêu cầu reset lại.");
          setValidatingToken(false);
          setTokenValid(false);
          
          setTimeout(() => {
            router.push("/auth/forgot-password");
          }, 3000);
          return;
        }

        console.log("✅ Token hợp lệ!");
        setTokenValid(true);
      } catch (err) {
        console.error("💥 Exception:", err);
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
  const isValid = password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
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
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
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

          <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading || !isValid}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            {loading ? "Đang xử lý..." : "Send"}
          </button>
          </div>
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
