// src/components/uploader/AdminImageUploader.tsx
"use client";

import { useState, useEffect } from "react";

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }
        const data = (await res.json()) as {
          user?: { role?: string | null } | null;
        };
        setIsAdmin(data?.user?.role === "admin");
      } catch (e) {
        console.error("auth check failed:", e);
        setIsAdmin(false);
      }
    })();
  }, []);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (isAdmin === false) {
      setError("Bạn không có quyền upload.");
      return;
    }
    if (isAdmin === null) {
      setError("Đang kiểm tra quyền, thử lại sau.");
      return;
    }

    // preview local
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") onPreview?.(result);
      };
      reader.readAsDataURL(f);
    } catch {}

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("file", f);
      form.append("folder", folder);

      const r = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const j = await r.json();

      if (!r.ok) {
        throw new Error(j?.error ?? "Upload failed");
      }

      onUploaded?.({ path: j.path, publicUrl: j.publicUrl ?? "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("upload error:", err);
    } finally {
      setLoading(false);
      try {
        const input = document.getElementById(
          "image-upload"
        ) as HTMLInputElement | null;
        if (input) input.value = "";
      } catch {}
    }
  }

  if (isAdmin === null) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
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
          <span className="font-medium">Đang kiểm tra quyền admin...</span>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 text-sm text-orange-700 bg-orange-50 px-4 py-3 rounded-xl border border-orange-200">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-1">Không có quyền upload</p>
            <p className="text-xs text-orange-600">
              Tính năng này chỉ dành cho admin. Vui lòng liên hệ quản trị viên
              hoặc dùng URL thủ công.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <label
          htmlFor="image-upload"
          className={`group flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            loading
              ? "bg-gray-50 border-gray-300 cursor-not-allowed"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-500 hover:from-blue-100 hover:to-indigo-100"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              loading
                ? "bg-gray-200"
                : "bg-white group-hover:bg-blue-500 transition-colors"
            }`}
          >
            <svg
              className={`w-6 h-6 transition-colors ${
                loading
                  ? "text-gray-400"
                  : "text-blue-600 group-hover:text-white"
              }`}
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
          </div>
          <div className="flex flex-col">
            <span
              className={`font-semibold ${
                loading ? "text-gray-500" : "text-gray-800"
              }`}
            >
              {loading ? "Đang upload..." : "Chọn ảnh từ máy"}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {loading ? "Vui lòng đợi..." : "JPG, PNG, GIF hoặc WebP"}
            </span>
          </div>
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

      {loading && (
        <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
          <svg
            className="animate-spin h-5 w-5"
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
          <div className="flex-1">
            <p className="font-medium">Đang tải ảnh lên Supabase Storage...</p>
            <p className="text-xs text-blue-500 mt-0.5">Không đóng trang này</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-1.5 bg-green-500 rounded-full">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Upload thành công!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Ảnh đã được lưu vào storage
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-1">Upload thất bại</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1 space-y-1">
          <p>• Kích thước tối đa: 5MB</p>
          <p>• Định dạng hỗ trợ: JPG, PNG, GIF, WebP</p>
          <p>• Ảnh sẽ được lưu vào Supabase Storage bucket "product-images"</p>
        </div>
      </div>
    </div>
  );
}
