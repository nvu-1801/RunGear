// src/components/uploader/AdminImageUploader.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export default function AdminImageUploader({
  folder = "products",
  onUploaded,
  onPreview,
}: {
  folder?: string;
  onUploaded?: (file: { path: string; publicUrl: string }) => void;
  onPreview?: (previewUrl: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Kiểm tra user và role khi component mount
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (user) {
          const role = user.user_metadata?.role || null;
          setUserRole(role);
          console.log(
            "User role:",
            role,
            "| User metadata:",
            user.user_metadata
          );
        } else {
          console.warn("User not logged in");
        }
      } catch (e) {
        console.error("Failed to get user:", e);
      }
    })();
  }, []);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Tạo preview ngay lập tức từ file local
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onPreview?.(result);
      }
    };
    reader.readAsDataURL(f);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Kiểm tra lại user trước khi upload
      const {
        data: { user },
        error: userError,
      } = await sb.auth.getUser();

      console.log("Upload attempt - User:", user, "Error:", userError);

      if (userError || !user) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      }

      const role = user.user_metadata?.role;
      console.log("User role from metadata:", role);

      if (role !== "admin") {
        throw new Error(
          `Bạn không có quyền upload. Role hiện tại: "${
            role || "không có"
          }". Cần role "admin".`
        );
      }

      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const filename = `${crypto.randomUUID()}.${ext}`;
      const path = `${folder}/${filename}`;

      console.log("Uploading to path:", path);

      const { error: uploadError } = await sb.storage
        .from("product-images")
        .upload(path, f, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = sb.storage.from("product-images").getPublicUrl(path);
      console.log("Upload success, public URL:", data.publicUrl);

      onUploaded?.({ path, publicUrl: data.publicUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      console.error("Upload failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Hiển thị role hiện tại */}
      {userRole && (
        <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          Role hiện tại: <span className="font-semibold">{userRole}</span>
        </div>
      )}

      {/* Upload button styled */}
      <div className="relative">
        <label
          htmlFor="image-upload"
          className={`
            flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-lg border-2 border-dashed
            cursor-pointer transition-all
            ${
              loading
                ? "bg-gray-50 border-gray-300 cursor-not-allowed"
                : "bg-white border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }
          `}
        >
          <svg
            className={`w-5 h-5 ${loading ? "text-gray-400" : "text-blue-600"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span
            className={`text-sm font-medium ${
              loading ? "text-gray-500" : "text-blue-700"
            }`}
          >
            {loading ? "Đang upload..." : "Chọn ảnh từ máy"}
          </span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={onSelect}
          disabled={loading}
          className="hidden"
        />
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Đang tải ảnh lên...</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Upload thành công!</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-gray-500">
        <p>✓ Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)</p>
        <p>✓ Ảnh sẽ được lưu vào Supabase Storage</p>
        <p>✓ Cần role "admin" để upload</p>
      </div>
    </div>
  );
}
